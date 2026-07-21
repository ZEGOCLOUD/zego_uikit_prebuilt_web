import React from "react";
import { ZegoCloudUser } from "../../../modules/tools/UserListManager";
import ShowManageContext, {
	ShowManageType,
} from "../../pages/context/showManage";
// @ts-ignore
import flvjs from "flv.js/dist/flv.min.js";
import { isSafari, isPc, isIOS } from "../../../util";
import ZegoVideoCss from "./index.module.scss";
import ZegoLocalStream from "zego-express-engine-webrtc/sdk/code/zh/ZegoLocalStream.web";
import { ZegoCloudRTCCore } from "../../../modules";
import { SpanEvent } from "../../../model/tracer";
import { ZegoLogger } from '../../../modules/tools/ZegoLogger';

const zgLogger = ZegoLogger.getLogger('ZegoMedia');

flvjs.LoggingControl.enableAll = false;

export default class ZegoVideo extends React.PureComponent<{
	core: ZegoCloudRTCCore
	muted: boolean
	classList: string
	userInfo: ZegoCloudUser
	onPause?: Function
	onCanPlay?: Function
	videoRefs?: (el: HTMLVideoElement | HTMLDivElement) => void
	isMixing?: boolean
	isPureAudio?: boolean
	isPureVideo?: boolean
	cameraStatus?: string
	micStatus?: string
	media?: ZegoLocalStream | MediaStream | undefined
}> {
	static contextType?: React.Context<ShowManageType> = ShowManageContext
	context!: React.ContextType<typeof ShowManageContext>
	videoRef: HTMLVideoElement | HTMLDivElement | null = null
	flvPlayer: flvjs.Player | null = null
	timer: NodeJS.Timer | null = null
	loadTimer: NodeJS.Timer | null = null
	lastDecodedFrame = 0
	retryTime = 0
	retryTimer: NodeJS.Timer | null = null
	reloadTimer: NodeJS.Timer | null = null
	pauseTimer: NodeJS.Timer | null = null
	state: {
		isPaused: boolean
	} = {
			isPaused: false,
		}
	hasVideo: undefined | boolean = undefined
	hasAudio: undefined | boolean = undefined
	playPureAudioFlv: null | Function = null
	playRetryCount = 0;
	playRetryTimer: NodeJS.Timeout | null = null;
	lastPlayAttemptTime = 0;
	lastFrameChangeTime = 0;
	audioConfirmed: boolean = false;
	flvUrl = "";

	componentDidMount() {
		this.initVideo(this.videoRef!)
		window.addEventListener('ZegoVideoGlobalResume', this.handleGlobalResume);
	}
	handleGlobalResume = () => {
		if (this.state.isPaused) {
			zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] Global resume event received, resuming player');
			this.tryPlay();
			this.setState({ isPaused: false });
		}
	}
	tryLoad() {
		this.clearPauseTimer();
		if (this.flvPlayer) {
			zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] tryLoad (flvPlayer)');
			try {
				this.flvPlayer.unload();
			} catch (e) {
				zgLogger.error(SpanEvent.MediaVideoEvent, '[ZegoVideo] flvPlayer unload error', e);
			}
			this.flvPlayer.load();
		} else if (this.videoRef instanceof HTMLVideoElement) {
			zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] tryLoad (videoElement)');
			this.videoRef.load();
		}
	}
	clearPauseTimer() {
		if (this.pauseTimer) {
			clearTimeout(this.pauseTimer);
			this.pauseTimer = null;
		}
	}
	tryPlay() {
		this.clearRetryTimers();
		this.clearPauseTimer();
		// 增加防抖：500ms 内不重复发起 play 指令
		const now = Date.now();
		if (now - this.lastPlayAttemptTime < 500) return;
		this.lastPlayAttemptTime = now;

		if (this.flvPlayer) {
			// 只有挂载成功后才播放
			if ((this.flvPlayer as any)._mediaElement) {
				this.flvPlayer.play()
					?.then(() => {
						// 仅在首次成功或重试后打印，减少冗余日志
						if (this.playRetryCount > 0 || this.state.isPaused) {
							zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] play successful (flvPlayer)');
						}
						this.setState({ isPaused: false });
						this.playRetryCount = 0;
					})
					.catch((error: any) => {
						zgLogger.error(SpanEvent.MediaVideoEvent, '[ZegoVideo] play failed (flvPlayer)', error);
						this.handlePlayError();
					});
			} else {
				zgLogger.log(SpanEvent.MediaVideoEvent, '[ZegoVideo] flvPlayer pending attach, skipping play');
			}
		} else if (this.videoRef instanceof HTMLVideoElement) {
			this.videoRef.play()
				?.then(() => {
					zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] play successful (videoElement)');
					this.setState({ isPaused: false });
					this.playRetryCount = 0;
				})
				.catch((error: any) => {
					zgLogger.error(SpanEvent.MediaVideoEvent, '[ZegoVideo] play failed (videoElement)', error);
					this.handlePlayError();
				});
		}
	}
	handlePlayError() {
		// 只有在非暂停状态下才进行自动重试，避免跟用户手动操作冲突
		if (this.playRetryCount < 1) {
			this.playRetryCount++;
			zgLogger.warn(SpanEvent.MediaVideoEvent, `[ZegoVideo] play failed, scheduled retry ${this.playRetryCount}/1 in 2s...`);
			this.clearRetryTimers();
			this.playRetryTimer = setTimeout(() => {
				zgLogger.warn(SpanEvent.MediaVideoEvent, `[ZegoVideo] executing retry ${this.playRetryCount}`);
				this.tryLoad();
				// tryLoad 会触发 canplay 事件，进而通过事件链路再次触发 tryPlay
			}, 2000);
		} else {
			zgLogger.error(SpanEvent.MediaVideoEvent, '[ZegoVideo] max retries reached, showing resume dialog');
			this.setState({ isPaused: true });
		}
	}
	componentDidUpdate(preProps: any) {
		const { userInfo, muted, cameraStatus, micStatus, media } = this.props;
		const { userInfo: preUserInfo, muted: preMuted, cameraStatus: preCameraStatus, micStatus: preMicStatus, media: preMedia, } = preProps;
		// 只有关键属性变化时才触发初始化逻辑
		if (
			userInfo?.userID !== preUserInfo?.userID ||
			userInfo?.streamList?.[0] !== preUserInfo?.streamList?.[0] ||
			userInfo?.streamList?.[0]?.streamID !== preUserInfo?.streamList?.[0]?.streamID ||
			userInfo?.streamList?.[0]?.media !== preUserInfo?.streamList?.[0]?.media ||
			userInfo?.streamList?.[0]?.urlsHttpsFLV !== preUserInfo?.streamList?.[0]?.urlsHttpsFLV ||
			muted !== preMuted ||
			// 增加 cameraStatus/micStatus 变化时的处理，cdn拉流时仅依赖flv的状态会出现不重新拉视频流的情况
			cameraStatus !== preCameraStatus ||
			micStatus !== preMicStatus ||
			// 增加 media 变化时的处理，cdn拉流且有屏幕共享流模式下连麦用户改为非连麦时，需要重新初始化视频流，userInfo?.streamList?.[0]?.media这个参数的变化不生效
			media !== preMedia
		) {
			this.initVideo(this.videoRef!)
		}
	}
	onloadedmetadata = () => {
		this.loadTimer = setTimeout(() => {
			zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] onloadedmetadata timeout TRIGGERED, reloading video element');
			this.tryLoad();
		}, 5000)
	}
	clearRetryTimers() {
		if (this.playRetryTimer) {
			clearTimeout(this.playRetryTimer);
			this.playRetryTimer = null;
		}
	}
	initHLSPlayer(el: HTMLVideoElement, url: string) {
		zgLogger.info(SpanEvent.videoMode, {
			mode: 'hls',
			which: 'peer',
		});
		zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] initHLSPlayer: URL =', url, this.props.muted);
		el.srcObject = null;
		el.muted = this.props.muted;
		el.onloadedmetadata = this.onloadedmetadata;
		el.src = url;
		this.tryLoad();
		this.tryPlay();
	}
	async initVideo(el: HTMLElement | HTMLVideoElement) {
		if (el) {
			this.videoRef = el as HTMLVideoElement;
			if (this.props.userInfo?.streamList?.[0]?.media?.id && this.props.userInfo?.streamList?.[0]?.media?.active) {
				const streamID = this.props.userInfo?.streamList?.[0]?.streamID;
				const videoDom = document.getElementById(`${streamID}`);
				const isRender = videoDom?.children.length ? true : false;
				if (isRender) return;
				const isScreenSharing = this.props.userInfo.streamList[0]?.streamID.includes('_screensharing') ? true : false;
				const videoObjectFit = !isScreenSharing ? this.props.core._config.videoScreenConfig?.objectFit : 'contain';
				if (this.props.muted) {
					// 本地预览流
					zgLogger.warn(SpanEvent.MediaVideoEvent, '[video] initVideo localStream', this.props.userInfo);
					zgLogger.info(SpanEvent.videoMode, {
						mode: 'rtc',
						which: 'local',
					});
					const media = this.props.userInfo.streamList[0]?.media as ZegoLocalStream;
					media.playVideo(this.videoRef, { mirror: !isScreenSharing ? this.props.core._config.videoScreenConfig?.localMirror : false, objectFit: videoObjectFit })
					if (media.videoCaptureStream && this.props.userInfo.streamList[0]?.cameraStatus === 'MUTE') {
						this.props.core.enableVideoCaptureDevice(media, false);
					}
				} else {
					zgLogger.info(SpanEvent.videoMode, {
						mode: 'rtc',
						which: 'peer',
					});
					// 连麦观众下麦，停止拉主播流又马上重新开始拉时，拉流还未成功时 createRemoteStreamView 会报错，拉流成功后还会继续渲染，暂不处理报错
					zgLogger.warn(SpanEvent.MediaVideoEvent, '[video]initVideo remoteStream', this.props.core._config.videoScreenConfig);
					try {
						const remoteView = this.props.core.createRemoteStreamView(this.props.userInfo.streamList[0].media as MediaStream);
						remoteView.play(this.videoRef, { mirror: !isScreenSharing ? this.props.core._config.videoScreenConfig?.pullStreamMirror : false, objectFit: videoObjectFit });
						// 首页切换扬声器之后进房渲染view需要切换
						this.props.core.status?.speakerDeviceID && remoteView.useAudioOutputDevice(this.props.core.status.speakerDeviceID || 'default');
						// 存储 zegoStreamView
						this.props.core.remoteStreamMap[this.props.userInfo.streamList[0].streamID].view = remoteView;
					} catch (error) {
						zgLogger.log(SpanEvent.MediaVideoEvent, 'createRemoteStreamView error', error);
					}
				}
				// if (el.srcObject !== this.props.userInfo?.streamList?.[0]?.media) {
				// 	el.src = ""
				// 	el.srcObject = this.props.userInfo?.streamList?.[0]?.media! as any
				// 	el.setAttribute("cameraOpen", this.props.userInfo?.streamList?.[0]?.cameraStatus)
				// 	this.safariAutoPlayTimer()
				// } else {
				// 	this.safariVideoMutedInvalidWhenOpenCamera(el)
				// }
				this.destroyFlvPlayer()
			} else if (this.props.userInfo?.streamList?.[0]?.urlsHttpsFLV) {
				(el as HTMLVideoElement).muted !== this.props.muted && ((el as HTMLVideoElement).muted = this.props.muted)
				if ((el as any)?.sinkId !== this.context?.speakerId) {
					(el as any)?.setSinkId?.(this.context?.speakerId || "")
				}
				if (!flvjs.isSupported()) {
					if (this.props.userInfo.streamList?.[0]?.urlsHttpsHLS) {
						this.initHLSPlayer(el as HTMLVideoElement, this.props.userInfo.streamList?.[0]?.urlsHttpsHLS!);
					}
				} else {
					this.initFLVPlayer(el as HTMLVideoElement, this.props.userInfo.streamList?.[0]?.urlsHttpsFLV)
				}
			}
		}
	}
	initFLVPlayer(videoElement: HTMLVideoElement, url: string) {
		this.flvUrl = url;
		zgLogger.info(SpanEvent.videoMode, {
			mode: 'flv',
			which: 'peer',
		});
		zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] initFLVPlayer: URL =', url, this.props.userInfo.streamList?.[0]);
		this.destroyFlvPlayer(); // 确保环境干净
		// if (!flvjs.isSupported()) return
		videoElement.srcObject = null
		let hasVideo, hasAudio
		// if (this.props.isMixing) {
		//   hasAudio = !this.props.isPureVideo;
		//   hasVideo = !this.props.isPureAudio;
		// } else {
		hasVideo = this.props.userInfo.streamList?.[0]?.cameraStatus === "OPEN" ? true : false
		// this.props.userInfo.streamList?.[0]?.hasVideo === undefined
		// 	? this.props.userInfo.streamList?.[0]?.cameraStatus === "OPEN"
		// 	: this.props.userInfo.streamList?.[0]?.hasVideo
		hasAudio = this.props.userInfo.streamList?.[0]?.micStatus === "OPEN" ? true : false
		// this.props.userInfo.streamList?.[0]?.hasAudio === undefined
		// 	? this.props.userInfo.streamList?.[0]?.micStatus === "OPEN"
		// 	: this.props.userInfo.streamList?.[0]?.hasAudio
		// }
		zgLogger.log(SpanEvent.MediaVideoEvent, '[ZegoVideo] initFLVPlayer: hasAudio ,hasVideo', hasAudio, hasVideo);
		this.flvPlayer = flvjs.createPlayer({
			type: "flv",
			isLive: true,
			url: url,
			cors: true,
			hasAudio: hasAudio, //是否需要音频
			hasVideo: hasVideo, //是否需要视频
		})
		this.flvPlayer.on(flvjs.Events.LOADING_COMPLETE, () => {
			zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] FLV Player: Loading complete, starting playback');
			this.tryPlay();
		})
		this.flvPlayer.on(flvjs.Events.ERROR, (errorType: string, errorDetail: string, errorInfo: any) => {
			zgLogger.error(SpanEvent.MediaVideoEvent, `[ZegoVideo] FLV Player Error: type = ${errorType}, detail = ${errorDetail}`, errorInfo);
			if (errorType === "NetworkError") {
				zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] FLV Player: Network error detected, retrying in 3s...');
				setTimeout(() => {
					if (this.flvPlayer) {
						this.destroyFlvPlayer()
						this.initFLVPlayer(videoElement, url)
					}
				}, 3000)
			}
		})
		this.flvPlayer.on(flvjs.Events.METADATA_ARRIVED, (metadata: any) => {
			zgLogger.log(SpanEvent.MediaVideoEvent, 'onMetaData 流已开始，数据正常', metadata);
			// 屏幕共享窗口时由于创建flv参数hasAudio为true，但是实际没有音频，导致画面一直在等待音频而长时间黑屏，需要兜底改创建参数
			if (this.props.userInfo.streamList?.[0]?.streamID.includes('_screensharing')) {
				setTimeout(() => {
					if (!this.audioConfirmed) {
						zgLogger.warn(SpanEvent.MediaVideoEvent, '3秒未检测到音频 → 切换纯视频模式');
						this.restartWithNoAudio();
					}
				}, 3000);
			}
		});
		this.flvPlayer.on(flvjs.Events.MEDIA_INFO, (info: any) => {
			// 判断是否有音频轨道（注意：有些流 hasAudio=true 但实际无数据）
			const hasAudioTrack =
				info.hasAudio === true ||
				(info.audioCodec && info.audioCodec.length > 0) ||
				(info.audioSampleRate && info.audioSampleRate > 0);

			if (hasAudioTrack && !this.audioConfirmed) {
				this.confirmAudio("✅ MEDIA_INFO 确认有音频");
			}
		});

		this.flvPlayer.on(flvjs.Events.AUDIO_SPECIFIC_CONFIG, () => {
			if (!this.audioConfirmed) {
				this.confirmAudio("✅ AudioSpecificConfig 到达");
			}
		});

		this.flvPlayer.on(flvjs.Events.AUDIO_GOP_DECODED, () => {
			zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] AUDIO_GOP_DECODED');
			if (!this.audioConfirmed) {
				this.confirmAudio("✅ 音频帧解码成功");
			}
		});

		this.flvPlayer.on("statistics_info", (res: any) => {
			const currentFrames = res.decodedFrames;
			const isPaused = (this.videoRef as HTMLVideoElement)?.paused;

			if (!this.audioConfirmed && res.receivedAudioBytes > 0) {
				this.confirmAudio("✅ 统计信息收到音频数据");
			}

			// 初次启动或重启后，等到有第一帧数据再开始统计
			if (this.lastDecodedFrame === 0) {
				if (currentFrames > 0) {
					zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] statistics_info: First frame received', currentFrames);
					this.lastDecodedFrame = currentFrames;
					this.retryTime = 0;
				}
				return;
			}

			// 如果当前是暂停状态（或者播放还没真正开始），不进行卡死计数
			if (isPaused) {
				this.retryTime = 0;
				if (this.retryTimer) {
					clearTimeout(this.retryTimer);
					this.retryTimer = null;
				}
				return;
			}

			if (this.lastDecodedFrame !== currentFrames) {
				// 画面正常：更新帧数并清除重试计时器
				this.lastDecodedFrame = currentFrames;
				this.lastFrameChangeTime = Date.now(); // 记录帧数变化的时间点
				this.retryTime = 0;
				if (this.retryTimer) {
					clearTimeout(this.retryTimer);
					this.retryTimer = null;
				}
			} else {
				// 帧数无变化15s以内不去重新初始化，避免切换推流端摄像头时重复初始化和短时间掉帧重复初始化
				if (Date.now() - this.lastFrameChangeTime < 15000) {
					return;
				}
				// 画面冻结：增加统计计数
				this.retryTime += 1;

				// 1. 设置 5 秒兜底定时器
				if (!this.retryTimer) {
					zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] FLV Player: Setting 5s timeout timer');
					this.retryTimer = setTimeout(() => {
						this.handlePlayerStuck("timeout");
					}, 5000);
				}

				// 2. 连续多次（约 20 次统计周期）画面未更新，立即触发重启
				if (this.retryTime >= 20) {
					this.handlePlayerStuck("counter");
				}
			}
		});
		zgLogger.warn(SpanEvent.MediaVideoEvent, `[ZegoVideo] FLV Player: Initialized with hasVideo=${hasVideo}, hasAudio=${hasAudio}`);
		this.flvPlayer.attachMediaElement(videoElement)
		this.tryLoad();
	}

	detectFlvHasAudio(url: string) {
		return new Promise((resolve) => {
			const xhr = new XMLHttpRequest();
			xhr.open('GET', url, true);
			xhr.responseType = 'arraybuffer';
			xhr.setRequestHeader('Range', 'bytes=0-500'); // 只拉前500字节
			xhr.onload = () => {
				try {
					const data = new Uint8Array(xhr.response);
					// FLV 头部格式：
					// 0-2: 'FLV'
					// 3: 0x01
					// 4: Flags (0x04=有音频, 0x01=有视频, 0x05=音视频都有)
					const flag = data[4];
					const hasAudio = (flag & 4) !== 0; // 第3位=音频
					resolve(hasAudio);
				} catch (e) {
					resolve(false);
				}
			};
			xhr.onerror = () => resolve(false);
			xhr.send();
		});
	}

	confirmAudio(reason: string) {
		if (!this.props.userInfo.streamList?.[0]?.streamID.includes('_screensharing')) return;
		if (this.audioConfirmed) return;
		this.audioConfirmed = true;
		//   video.muted = false;
	}

	restartWithNoAudio() {
		try {
			this.flvPlayer.destroy();
		} catch (e) { }

		this.flvPlayer = flvjs.createPlayer({
			type: 'flv',
			url: this.flvUrl,
			isLive: true,
			hasAudio: false,
			hasVideo: true
		}, {
			enableStashBuffer: false,
			lazyLoad: false
		});

		this.flvPlayer.attachMediaElement(this.videoRef);
		this.flvPlayer.load();
		this.flvPlayer.play();
	}

	componentWillUnmount() {
		if (this.flvPlayer) {
			this.destroyFlvPlayer()
		} else {
			// this.videoRef?.srcObject && (this.videoRef.srcObject = null)
			// this.videoRef?.src && (this.videoRef.src = "")
		}
		this.timer && clearInterval(this.timer)
		if (this.loadTimer) {
			this.videoRef!.onloadedmetadata = null
			clearTimeout(this.loadTimer)
			this.loadTimer = null
		}
		this.reloadTimer && clearTimeout(this.reloadTimer)
		this.clearRetryTimers();
		window.removeEventListener('ZegoVideoGlobalResume', this.handleGlobalResume);
	}
	destroyFlvPlayer() {
		if (this.retryTimer) {
			clearTimeout(this.retryTimer);
			this.retryTimer = null;
		}
		if (this.flvPlayer) {
			try {
				this.flvPlayer.pause()
				this.flvPlayer.unload()
				this.flvPlayer.detachMediaElement()
				this.flvPlayer.destroy()
			} catch (e) {
				zgLogger.error(SpanEvent.MediaVideoEvent, '[ZegoVideo] destroyFlvPlayer error', e);
			}
			this.flvPlayer = null
		}
	}
	handlePlayerStuck(reason: string) {
		if (this.flvPlayer) {
			zgLogger.warn(SpanEvent.MediaVideoEvent, `[ZegoVideo] Video stuck detected (${reason}), restarting player...`);
			zgLogger.info(SpanEvent.CDNStuck, { reason });
			this.lastDecodedFrame = 0;
			this.retryTime = 0;
			this.clearRetryTimers();
			if (this.retryTimer) {
				clearTimeout(this.retryTimer);
				this.retryTimer = null;
			}
			this.destroyFlvPlayer();
			this.initVideo(this.videoRef!);
		}
	}
	reload() {
		const currentTime = (this.videoRef as HTMLVideoElement)?.currentTime
		this.reloadTimer = setTimeout(() => {
			if (currentTime === (this.videoRef as HTMLVideoElement)?.currentTime) {
				zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] reload: Video currentTime not advancing, reloading element');
				this.tryLoad();
				this.safariAutoPlayTimer()
			}
		}, 2000)
	}
	safariAutoPlayTimer() {
		// 修复浏览器听不到拉流声音的问题 Safari15.3，chrome拒绝权限的时候
		if (!(this.videoRef as HTMLVideoElement)?.muted) {
			if (!(this.videoRef as HTMLVideoElement)?.paused && this.context.enableVideoMixing) {
				this.reload()
				return
			}
			if ((this.videoRef as HTMLVideoElement)?.paused) {
				this.reload()
			}
		}
	}
	//修复Safari15.3，关闭摄像头进房后，再打开摄像头，会听到自己的声音
	safariVideoMutedInvalidWhenOpenCamera(el: HTMLVideoElement) {
		if (!isSafari()) return
		if (el.getAttribute("cameraOpen") !== this.props.userInfo?.streamList?.[0]?.cameraStatus) {
			el.setAttribute("cameraOpen", this.props.userInfo?.streamList?.[0]?.cameraStatus)
			this.tryLoad();
		}
	}
	render(): React.ReactNode {
		const { formatMessage } = this.props.core.intl;
		return (
			(!this.props.userInfo?.streamList?.[0]?.media && this.props.userInfo?.streamList?.[0]?.urlsHttpsFLV) ?
				<>
					<video
						autoPlay
						className={`${ZegoVideoCss.video}  ${this.props.userInfo.streamList?.[0]?.streamID?.includes("_main")
							? ZegoVideoCss.mirror
							: ""
							} ${this.props.classList}`}
						playsInline={true}
						ref={(el: HTMLVideoElement) => {
							el && this.props.videoRefs?.(el);
							this.videoRef = el;
						}}
						onPause={() => {
							zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] Video element: pause event triggered');
							if (this.state.isPaused || this.flvPlayer || (isIOS() && this.props.userInfo?.streamList?.[0]?.urlsHttpsFLV)) return;
							this.clearPauseTimer();
							this.pauseTimer = setTimeout(() => {
								zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] onPause Timer: reload video element');
								this.tryLoad();
								this.tryPlay();
							}, 2000);
							this.setState({
								isPaused: true,
							});
							this.props.onPause && this.props.onPause();
						}}
						onCanPlay={() => {
							zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] Video element: canplay event triggered');
							if (this.loadTimer) {
								this.videoRef!.onloadedmetadata = null;
								clearTimeout(this.loadTimer);
								this.loadTimer = null;
							}
							this.tryPlay();
							this.props.onCanPlay && this.props.onCanPlay();
						}}
						onError={() => {
							zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] HLS/FLV error event, retrying in 2s...');
							setTimeout(() => {
								this.clearRetryTimers();
								this.tryLoad();
							}, 2000);
						}}
						onPlaying={() => {
							zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] Video element: playing event triggered');
							this.setState({
								isPaused: false,
							});
						}}></video>
					{this.state.isPaused && (
						// <div
						// 	className={`${ZegoVideoCss.videoPlayBtn} ${isPc() ? "" : ZegoVideoCss.mobile}`}
						// 	onClick={() => {
						// 		(this.videoRef as HTMLVideoElement)?.load();
						// 		(this.videoRef as HTMLVideoElement)?.play();
						// 		this.setState({
						// 			isPaused: false,
						// 		});
						// 	}}></div>
						<div id="ZegoVideoResumeDialog" className={`${ZegoVideoCss.Mask}`}>
							<div className={`${ZegoVideoCss.videoDialog}`}>
								{formatMessage({ id: "room.resumePlayTips" })}
								<button className={`${ZegoVideoCss.button}`}
									onClick={() => {
										zgLogger.warn(SpanEvent.MediaVideoEvent, '[ZegoVideo] User clicked resume play button, dispatching global event');
										window.dispatchEvent(new CustomEvent('ZegoVideoGlobalResume'));
									}}>{formatMessage({ id: "room.resumePlay" })}</button>
							</div>
						</div>
					)}
				</> :
				<div
					id={this.props.userInfo.streamList?.[0]?.streamID}
					className={this.props.classList}
					ref={(el: HTMLDivElement) => {
						el && this.props.videoRefs?.(el);
						this.videoRef = el;
						// 对端屏幕共享流画面依赖该方法结束loading
						this.props.onCanPlay && this.props.onCanPlay();
					}}></div>
		);
	}
}
