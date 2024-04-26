import React from "react";
import { ZegoCloudUser } from "../../../modules/tools/UserListManager";
import ShowManageContext, {
  ShowManageType,
} from "../../pages/context/showManage";
// @ts-ignore
import flvjs from "flv.js/dist/flv.min.js";
import { isSafari, isPc, isIOS } from "../../../util";
import ZegoVideoCss from "./index.module.scss";

export default class ZegoVideo extends React.PureComponent<{
	muted: boolean
	classList: string
	userInfo: ZegoCloudUser
	onPause?: Function
	onCanPlay?: Function
	videoRefs?: (el: HTMLVideoElement) => void
	isMixing?: boolean
	isPureAudio?: boolean
	isPureVideo?: boolean
}> {
	static contextType?: React.Context<ShowManageType> = ShowManageContext
	context!: React.ContextType<typeof ShowManageContext>
	videoRef: HTMLVideoElement | null = null
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
			this.videoRef?.load()
		}, 5000)
	}
	initVideo(el: HTMLVideoElement) {
		if (el) {
			!this.videoRef && (this.videoRef = el)
			el.muted !== this.props.muted && (el.muted = this.props.muted)
			if ((el as any)?.sinkId !== this.context?.speakerId) {
				;(el as any)?.setSinkId?.(this.context?.speakerId || "")
			}
			if (this.props.userInfo?.streamList?.[0]?.media?.id) {
				if (el.srcObject !== this.props.userInfo?.streamList?.[0]?.media) {
					el.src = ""
					el.srcObject = this.props.userInfo?.streamList?.[0]?.media!
					el.setAttribute("cameraOpen", this.props.userInfo?.streamList?.[0]?.cameraStatus)
					this.safariAutoPlayTimer()
				} else {
					this.safariVideoMutedInvalidWhenOpenCamera(el)
				}
				this.destroyFlvPlayer()
			} else if (this.props.userInfo?.streamList?.[0]?.urlsHttpsFLV) {
				if (isSafari()) {
					if (el.src !== this.props.userInfo?.streamList?.[0]?.urlsHttpsHLS) {
						el.srcObject = null
						el.onloadedmetadata = this.onloadedmetadata
						el.src = this.props.userInfo?.streamList?.[0]?.urlsHttpsHLS!
						el.load()
						const promise = el.play()
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
					this.initFLVPlayer(el, this.props.userInfo.streamList?.[0]?.urlsHttpsFLV)
				}
			}
		}
	}
	initFLVPlayer(videoElement: HTMLVideoElement, url: string) {
		if (this.flvPlayer) return
		if (!flvjs.isSupported()) return
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
			this.flvPlayer?.play()
		})
		this.flvPlayer.on(flvjs.Events.ERROR, (error: any) => {
			console.error(flvjs.Events.ERROR, error)
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
			this.videoRef?.srcObject && (this.videoRef.srcObject = null)
			this.videoRef?.src && (this.videoRef.src = "")
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
		const currentTime = this.videoRef?.currentTime
		this.reloadTimer = setTimeout(() => {
			if (currentTime === this.videoRef?.currentTime) {
				this.videoRef?.load()
				this.safariAutoPlayTimer()
			}
		}, 2000)
	}
	safariAutoPlayTimer() {
		// 修复浏览器听不到拉流声音的问题 Safari15.3，chrome拒绝权限的时候
		if (!this.videoRef?.muted) {
			if (!this.videoRef?.paused && this.context.enableVideoMixing) {
				this.reload()
				return
			}
			if (this.videoRef?.paused) {
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
		return (
			<>
				<video
					autoPlay
					className={`${ZegoVideoCss.video}  ${
						this.context.userInfo.userID === this.props.userInfo.userID &&
						this.props.userInfo.streamList?.[0]?.streamID?.includes("_main")
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
							this.videoRef?.load();
							this.videoRef?.play();
						}, 2000);
						this.props.onPause && this.props.onPause();
					}}
					onCanPlay={() => {
						if (this.loadTimer) {
							this.videoRef!.onloadedmetadata = null;
							clearTimeout(this.loadTimer);
							this.loadTimer = null;
						}
						this.videoRef
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
				{this.state.isPaused && (isSafari() || isIOS()) && (
					<div
						className={`${ZegoVideoCss.videoPlayBtn} ${isPc() ? "" : ZegoVideoCss.mobile}`}
						onClick={() => {
							this.videoRef?.load();
							this.videoRef?.play();
							this.setState({
								isPaused: false,
							});
						}}></div>
				)}
			</>
		);
	}
}
