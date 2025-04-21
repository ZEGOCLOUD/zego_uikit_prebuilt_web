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
	state: {
		isPaused: boolean
	} = {
			isPaused: false,
		}
	hasVideo: undefined | boolean = undefined
	hasAudio: undefined | boolean = undefined
	playPureAudioFlv: null | Function = null
	componentDidMount() {
		this.initVideo(this.videoRef!)
	}
	componentDidUpdate(preProps: any) {
		this.initVideo(this.videoRef!)
		// if (
		//   this.props.isPureAudio !== preProps.isPureAudio ||
		//   this.props.isPureVideo !== preProps.isPureVideo
		// ) {
		//   this.playPureAudioFlv?.();
		// }
	}
	onloadedmetadata = () => {
		this.loadTimer = setTimeout(() => {
			(this.videoRef as HTMLVideoElement)?.load()
		}, 5000)
	}
	initVideo(el: HTMLElement | HTMLVideoElement) {
		if (el) {
			!this.videoRef && (this.videoRef = el as HTMLVideoElement);
			if (this.props.userInfo?.streamList?.[0]?.media?.id && this.props.userInfo?.streamList?.[0]?.media?.active) {
				const streamID = this.props.userInfo?.streamList?.[0]?.streamID;
				const videoDom = document.getElementById(`${streamID}`);
				const isRender = videoDom?.children.length ? true : false;
				if (isRender) return;
				const isScreenSharing = this.props.userInfo.streamList[0]?.streamID.includes('_screensharing') ? true : false;
				const videoObjectFit = !isScreenSharing ? this.props.core._config.videoScreenConfig?.objectFit : 'contain';
				if (this.props.muted) {
					// 本地预览流
					console.warn('[video]initVideo 渲染本地流', this.props.userInfo);
					(this.props.userInfo.streamList[0]?.media as ZegoLocalStream).playVideo(this.videoRef, { mirror: !isScreenSharing, objectFit: videoObjectFit })
				} else {
					// 连麦观众下麦，停止拉主播流又马上重新开始拉时，拉流还未成功时 createRemoteStreamView 会报错，拉流成功后还会继续渲染，暂不处理报错
					console.warn('[video]initVideo 渲染对端流', this.props.userInfo);
					try {
						const remoteView = this.props.core.createRemoteStreamView(this.props.userInfo.streamList[0].media as MediaStream);
						remoteView.play(this.videoRef, { mirror: !isScreenSharing, objectFit: videoObjectFit });
						// 首页切换扬声器之后进房渲染view需要切换
						remoteView.useAudioOutputDevice(this.props.core.status.speakerDeviceID || 'default');
						// 存储 zegoStreamView
						this.props.core.remoteStreamMap[this.props.userInfo.streamList[0].streamID].view = remoteView;
					} catch (error) {
						console.log('createRemoteStreamView error', error);
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
					//不支持播放 flv
					if ((el as HTMLVideoElement).src !== this.props.userInfo?.streamList?.[0]?.urlsHttpsHLS) {
						(el as HTMLVideoElement).srcObject = null;
						el.onloadedmetadata = this.onloadedmetadata;
						(el as HTMLVideoElement).src = this.props.userInfo?.streamList?.[0]?.urlsHttpsHLS!;
						(el as HTMLVideoElement).load();
						const promise = (el as HTMLVideoElement).play();
						if (promise !== undefined) {
							promise
								.catch((error) => {
									// Auto-play was prevented
									// Show a UI element to let the user manually start playback
									this.setState({
										isPaused: true,
									})
								})
								.then(() => {
									// Auto-play started
									this.setState({
										isPaused: false,
									})
								})
						}
					}
				} else {
					console.warn('===init flv');
					this.initFLVPlayer(el as HTMLVideoElement, this.props.userInfo.streamList?.[0]?.urlsHttpsFLV)
				}
			}
		}
	}
	initFLVPlayer(videoElement: HTMLVideoElement, url: string) {
		if (this.flvPlayer) return
		// if (!flvjs.isSupported()) return
		videoElement.srcObject = null
		let hasVideo, hasAudio
		// if (this.props.isMixing) {
		//   hasAudio = !this.props.isPureVideo;
		//   hasVideo = !this.props.isPureAudio;
		// } else {
		hasVideo =
			this.props.userInfo.streamList?.[0]?.hasVideo === undefined
				? this.props.userInfo.streamList?.[0]?.cameraStatus === "OPEN"
				: this.props.userInfo.streamList?.[0]?.hasVideo
		hasAudio =
			this.props.userInfo.streamList?.[0]?.hasAudio === undefined
				? this.props.userInfo.streamList?.[0]?.micStatus === "OPEN"
				: this.props.userInfo.streamList?.[0]?.hasAudio
		// }

		this.flvPlayer = flvjs.createPlayer({
			type: "flv",
			isLive: true,
			url: url,
			cors: true,
			hasAudio: hasAudio, //是否需要音频
			hasVideo: hasVideo, //是否需要视频
		})
		this.flvPlayer.on(flvjs.Events.LOADING_COMPLETE, () => {
			this.flvPlayer?.play();
		})
		this.flvPlayer.on(flvjs.Events.ERROR, (error: any) => {
			if (error === "NetworkError") {
				setTimeout(() => {
					if (this.flvPlayer) {
						this.destroyFlvPlayer()
						this.initFLVPlayer(videoElement, url)
					}
				}, 3000)
			}
		})
		this.flvPlayer.on("statistics_info", (res: any) => {
			if (this.lastDecodedFrame === 0) {
				this.lastDecodedFrame = res.decodedFrames
				this.retryTime = 0
				return
			}
			if (this.lastDecodedFrame !== res.decodedFrames) {
				this.lastDecodedFrame = res.decodedFrames
				this.retryTime = 0
			} else {
				this.retryTime += 1
				// 保证在没有回调的情况下也会执行一次重试
				if (!this.retryTimer) {
					this.retryTimer = setTimeout(() => {
						this.lastDecodedFrame = 0
						if (this.flvPlayer) {
							//   if (this.props.isMixing) {
							//     this.playPureAudioFlv?.();
							//   } else {
							this.flvPlayer.unload()
							this.flvPlayer.load()
							//   }
						}
					}, 5000)
				}
				if (this.retryTime % 20 === 0) {
					this.lastDecodedFrame = 0
					if (this.flvPlayer) {
						// if (this.props.isMixing) {
						//   this.playPureAudioFlv?.();
						// } else {
						this.flvPlayer.unload()
						this.flvPlayer.load()
						// }
						clearTimeout(this.retryTimer)
						this.retryTimer = null
					}
				}
			}
		})
		// if (this.props.isMixing) {
		//   this.playPureAudioFlv = () => {
		//     this.destroyFlvPlayer();
		//     this.initFLVPlayer(videoElement, url);
		//   };
		// }
		this.flvPlayer.attachMediaElement(videoElement)
		this.flvPlayer.load()
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
	}
	destroyFlvPlayer() {
		if (this.flvPlayer) {
			this.flvPlayer.pause()
			this.flvPlayer.unload()
			this.flvPlayer.detachMediaElement()
			this.flvPlayer.destroy()
			this.flvPlayer = null
		}
	}
	reload() {
		const currentTime = (this.videoRef as HTMLVideoElement)?.currentTime
		this.reloadTimer = setTimeout(() => {
			if (currentTime === (this.videoRef as HTMLVideoElement)?.currentTime) {
				(this.videoRef as HTMLVideoElement)?.load()
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
			el.load()
		}
	}
	render(): React.ReactNode {
		const { formatMessage } = this.props.core.intl;
		return (
			this.props.userInfo?.streamList?.[0]?.urlsHttpsFLV ?
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
							!this.videoRef && (this.videoRef = el);
						}}
						onPause={() => {
							this.setState({
								isPaused: true,
							});
							setTimeout(() => {
								(this.videoRef as HTMLVideoElement)?.load();
								(this.videoRef as HTMLVideoElement)?.play();
							}, 2000);
							this.props.onPause && this.props.onPause();
						}}
						onCanPlay={() => {
							console.warn('===onCanPlay');
							if (this.loadTimer) {
								this.videoRef!.onloadedmetadata = null;
								clearTimeout(this.loadTimer);
								this.loadTimer = null;
							}
							(this.videoRef as HTMLVideoElement)
								?.play()
								.then((res) => {
									this.setState({
										isPaused: false,
									});
								})
								.catch((error) => {
									this.setState({
										isPaused: true,
									});
								});
							this.props.onCanPlay && this.props.onCanPlay();
						}}
						onPlaying={() => {
							this.setState({
								isPaused: false,
							});
						}}></video>
					{this.state.isPaused && (isSafari() || isIOS()) && !document.getElementById('ZegoVideoResumeDialog') && (
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
										(this.videoRef as HTMLVideoElement)?.load();
										(this.videoRef as HTMLVideoElement)?.play();
										this.setState({
											isPaused: false,
										});
									}}>{formatMessage({ id: "room.resumePlay" })}</button>
							</div>
						</div>
					)}
				</> :
				<div
					id={this.props.userInfo.streamList[0]?.streamID}
					className={this.props.classList}
					ref={(el: HTMLDivElement) => {
						el && this.props.videoRefs?.(el);
						!this.videoRef && (this.videoRef = el);
						// 对端屏幕共享流画面依赖该方法结束loading
						this.props.onCanPlay && this.props.onCanPlay();
					}}></div>
		);
	}
}
