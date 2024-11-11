import React, { ChangeEvent, RefObject } from "react";
import ZegoBrowserCheckCss from "./index.module.scss";
import { copy } from "../../../modules/tools/util";
import { ZegoBrowserCheckProp } from "../../../model";
import { ZegoToast } from "../../components/mobile/zegoToast";
import { ZegoConfirm } from "../../components/mobile/zegoConfirm";
import { ZegoLoading } from "./components/ZegoLoading";
import { isAndroid, isIOS } from "../../../util";
import { FormattedMessage } from "react-intl";
import ZegoLocalStream from "zego-express-engine-webrtc/sdk/code/zh/ZegoLocalStream.web"
export class ZegoBrowserCheckMobile extends React.Component<ZegoBrowserCheckProp> {
	state = {
		localStream: undefined,
		// localVideoStream: undefined,
		// localAudioStream: undefined,
		userName: "xxx",
		videoOpen: true,
		audioOpen: true,
		copied: false,
		isVideoOpening: true,
		isJoining: false,
		sharedLinks: this.props.core._config.sharedLinks?.map((link) => {
			return {
				name: link.name,
				url: link.url,
				copied: false,
			};
		}),
		isScreenPortrait: false,
	};
	localVideoRef: RefObject<HTMLDivElement> = React.createRef();
	videoRef: RefObject<HTMLVideoElement> = React.createRef();
	inviteRef: RefObject<HTMLInputElement> = React.createRef();
	nameInputRef: RefObject<HTMLInputElement> = React.createRef();
	audioRefuse = this.props.core.status.audioRefuse;
	videoRefuse = this.props.core.status.videoRefuse;
	isAndroid = isAndroid();
	isIOS = isIOS();
	clientHeight = 0;
	setViewportMetaTimer: NodeJS.Timer | null = null;
	viewportHeight = 0;
	async componentDidMount() {
		window.addEventListener("orientationchange", this.onOrientationChange.bind(this), false);
		this.onOrientationChange();
		this.setState({
			userName: this.props.core._expressConfig.userName,
		});
		const videoOpen = !!this.props.core._config.turnOnCameraWhenJoining;
		const audioOpen = !!this.props.core._config.turnOnMicrophoneWhenJoining;
		if (videoOpen || audioOpen) {
			await this.createStream(videoOpen, audioOpen);
		} else {
			this.setState({
				audioOpen: audioOpen,
				videoOpen: videoOpen,
				isVideoOpening: false,
			});
		}
		this.clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
		this.isAndroid && window.addEventListener("resize", this.onResize, { passive: false });
	}
	componentWillUnmount() {
		window.removeEventListener("orientationchange", this.onOrientationChange.bind(this), false);
		this.state.localStream && this.props.core.destroyStream(this.state.localStream);
		// this.state.localAudioStream && this.props.core.destroyStream(this.state.localAudioStream);
		window.removeEventListener("resize", this.onResize);
	}
	async createStream(videoOpen: boolean, audioOpen: boolean): Promise<ZegoLocalStream | undefined> {
		let localStream: ZegoLocalStream | undefined;
		try {
			if (videoOpen) {
				this.setState({
					isVideoOpening: true,
				});
			}
			localStream = await this.props.core.createStream({
				camera: {
					video: {
						facingMode: this.props.core._config.useFrontFacingCamera ? "user" : "environment",
					},
					audio: true,
					// videoQuality: 4,
					// width: 640,
					// height: 360,
					// bitrate: 400,
					// frameRate: 15,
				},
			});
		} catch (error) {
			this.videoRefuse = true;
			this.audioRefuse = true;
			this.setState({
				isVideoOpening: false,
			});
			console.error("【ZEGOCLOUD】toggleStream/createStream failed !!", JSON.stringify(error));
		}

		this.setState(
			{
				localStream,
				audioOpen: audioOpen && !this.audioRefuse,
				videoOpen: videoOpen && !this.videoRefuse,
				isVideoOpening: false,
			},
			() => {
				if (this.localVideoRef.current && localStream) {
					if (videoOpen) {
						localStream.playVideo(this.localVideoRef.current, { objectFit: 'cover' });
					}
					if (audioOpen) {
						localStream.playAudio();
					}
				}
			}
		);

		return localStream;
	}

	async toggleStream(type: "video" | "audio") {
		if (type === "video") {
			if (this.videoRefuse) {
				ZegoConfirm({
					title: "Equipment authorization",
					content:
						"We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
					confirm: "Okay",
				});
				return;
			}
			const videoOpen = !this.state.videoOpen;
			if (!this.state.localStream) {
				await this.createStream(videoOpen, this.state.audioOpen);
			} else {
				if (videoOpen && this.localVideoRef.current) {
					(this.state.localStream as ZegoLocalStream).playVideo(this.localVideoRef.current, { objectFit: 'cover' });
				} else {
					(this.state.localStream as ZegoLocalStream).stopVideo();
				}
				// this.props.core.destroyStream(this.state.localStream);
				// this.setState({ localStream: undefined });
			}
			this.setState({ videoOpen });
		} else if (type === "audio") {
			if (this.audioRefuse) {
				ZegoConfirm({
					title: "Equipment authorization",
					content:
						"We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
					confirm: "Okay",
				});
				return;
			}
			const audioOpen = !this.state.audioOpen;
			if (!this.state.localStream) {
				await this.createStream(this.state.videoOpen, audioOpen);
			} else {
				if (audioOpen) {
					(this.state.localStream as ZegoLocalStream).playAudio();
				} else {
					console.warn('===stop audio', this.state.localStream);
					(this.state.localStream as ZegoLocalStream).stopAudio();
				}
				// this.props.core.muteMicrophone(audioOpen);
			}
			this.setState({ audioOpen });
		}
	}

	async toggleStream1(type: "video" | "audio") {
		if (type === "video" && this.state.localStream) {
			const videoOpen = !this.state.videoOpen;
			const videoStream: MediaStream = this.state.localStream;
			videoStream.getVideoTracks().forEach((track) => {
				track.enabled = videoOpen;
			});
			this.setState({ videoOpen });
		} else if (type === "audio" && this.state.localStream) {
			const audioOpen = !this.state.audioOpen;
			const audioStream: MediaStream = this.state.localStream;
			audioStream.getAudioTracks().forEach((track) => {
				track.enabled = audioOpen;
			});

			this.setState({ audioOpen });
		}
	}

	// async toggleStream(type: "video" | "audio") {
	// 	if (
	// 		this.state.videoOpen &&
	// 		this.state.audioOpen &&
	// 		this.state.localStream &&
	// 		!this.state.localAudioStream &&
	// 		!this.state.localVideoStream
	// 	) {
	// 		this.toggleStream1(type);
	// 	} else {
	// 		this.toggleStream2(type);
	// 	}
	// }

	async joinRoom() {
		if (!this.state.userName.length) return;
		if (this.state.isJoining) return;

		this.setState(
			{
				isJoining: true,
			},
			async () => {
				this.props.core._expressConfig.userName = this.state.userName.trim().substring(0, 255);
				this.props.core._config.turnOnMicrophoneWhenJoining = this.state.audioOpen && !this.audioRefuse;
				this.props.core._config.turnOnCameraWhenJoining = this.state.videoOpen && !this.videoRefuse;
				this.props.core.status.audioRefuse = this.audioRefuse;
				this.props.core.status.videoRefuse = this.videoRefuse;

				const loginRsp = await this.props.core.enterRoom();
				let massage = "";
				if (loginRsp === 0) {
					this.state.localStream && this.props.core.destroyStream(this.state.localStream);
					this.props.joinRoom && this.props.joinRoom();
				} else if (loginRsp === 1002034) {
					// 登录房间的用户数超过该房间配置的最大用户数量限制（测试环境下默认房间最大用户数为 50，正式环境无限制）。
					massage =
						"Failed to join the room, the number of people in the room has reached the maximum.(2 people)";
				} else if ([1002031, 1002053].includes(loginRsp)) {
					//登录房间超时，可能是由于网络原因导致。
					massage = "There's something wrong with your network. Please check it and try again.";
				} else if ([1102018, 1102016, 1102020].includes(loginRsp)) {
					// 登录 token 错误，
					massage = "Failed to join the room, token authentication error.";
				} else if (1002056 === loginRsp) {
					// 用户重复进行登录。
					massage = "You are on a call in another room, please leave that room first.";
				} else {
					massage = "Failed to join the room, please try again.(error code:" + loginRsp + ")";
				}
				this.setState(
					{
						isJoining: false,
					},
					() => {
						massage && ZegoToast({ content: massage });
					}
				);
			}
		);
	}

	handleChange(event: ChangeEvent<HTMLInputElement>) {
		if (event.target.value.length <= 1) {
			const value = event.target.value.trim();
			this.setState({ userName: value.length > 0 ? value : "" });
		} else {
			this.setState({ userName: event.target.value.substring(0, 255) });
		}
	}
	onResize = () => {
		const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
		if (this.clientHeight <= clientHeight) {
			setTimeout(() => {
				this.nameInputRef.current!.scrollIntoView({
					block: "start",
				});
			}, 20);
		}
	};
	onOrientationChange() {
		let isScreenPortrait = this.state.isScreenPortrait;
		this.props.core._config.container?.querySelectorAll("input").forEach((el) => el.blur());
		if (window.orientation === 180 || window.orientation === 0) {
			// 竖屏
			isScreenPortrait = true;
		}
		if (window.orientation === 90 || window.orientation === -90) {
			// 横屏
			isScreenPortrait = false;
		}
		if (!isScreenPortrait) {
			this.setState({ showFooter: false });
		}
		this.setState(
			{
				isScreenPortrait: isScreenPortrait,
			},
			() => {
				if (!isScreenPortrait && !isIOS()) {
					this.setViewportMeta();
				} else {
					if (this.setViewportMetaTimer) {
						clearTimeout(this.setViewportMetaTimer);
						this.setViewportMetaTimer = null;
					}
				}
			}
		);
	}
	// 解决横屏时键盘弹起导致视窗高度变小，页面缩小的问题
	setViewportMeta() {
		if (this.viewportHeight) return;
		let metaEl: HTMLMetaElement | null = document.querySelector("meta[name=viewport]");
		let content = "";
		if (window.outerHeight > window.outerWidth) {
			this.setViewportMetaTimer = setTimeout(() => {
				this.setViewportMeta();
				this.setViewportMetaTimer = null;
			}, 100);
			return;
		} else {
			this.viewportHeight = window.outerHeight;
		}
		const height = "height=" + this.viewportHeight;
		if (metaEl) {
			let contentArr = metaEl.content.split(",").filter((attr) => !attr.includes("height="));
			contentArr.push(height);
			content = contentArr.join(",");
		} else {
			metaEl = document.createElement("meta");
			metaEl.name = "viewport";
			document.querySelector("header")?.appendChild(metaEl);
		}
		metaEl.content = content;
	}
	render(): React.ReactNode {
		const { formatMessage } = this.props.core.intl;
		return (
			<div className={ZegoBrowserCheckCss.ZegoBrowserCheckSupport}>
				<div className={ZegoBrowserCheckCss.videoScree}>
					<div
						ref={this.localVideoRef}
						className={`${ZegoBrowserCheckCss.video} ${this.isIOS ? ZegoBrowserCheckCss.fill : ""} ${this.state.videoOpen ? "" : ZegoBrowserCheckCss.hideVideo}`}></div>
					{/* <video
						playsInline={true}
						className={`${ZegoBrowserCheckCss.video} ${this.isIOS ? ZegoBrowserCheckCss.fill : ""} ${this.state.videoOpen ? "" : ZegoBrowserCheckCss.hideVideo
							}`}
						autoPlay
						muted
						ref={this.videoRef}></video> */}
					{!this.props.core._config.showMyCameraToggleButton &&
						!this.props.core._config.turnOnCameraWhenJoining && (
							<div className={ZegoBrowserCheckCss.noCamera}>
								{this.state.userName.substring(0, 1) ||
									this.props.core._expressConfig.userName.substring(0, 1) ||
									"Z"}
							</div>
						)}

					{(this.props.core._config.showMyCameraToggleButton ||
						this.props.core._config.turnOnCameraWhenJoining) &&
						!this.state.videoOpen &&
						!this.state.isVideoOpening && <div className={ZegoBrowserCheckCss.videoTip}><FormattedMessage id="browserCheck.cameraDesc" /></div>}
					{this.state.isVideoOpening && (
						<div className={ZegoBrowserCheckCss.videoTip}><FormattedMessage id="browserCheck.cameraStart" /></div>
					)}
					<div className={ZegoBrowserCheckCss.handler}>
						{this.props.core._config.showMyMicrophoneToggleButton && (
							<i
								className={
									this.state.audioOpen ? ZegoBrowserCheckCss.micOpen : ZegoBrowserCheckCss.micClose
								}
								onClick={() => {
									this.toggleStream("audio");
								}}></i>
						)}
						{this.props.core._config.showMyCameraToggleButton && (
							<i
								className={
									this.state.videoOpen
										? ZegoBrowserCheckCss.cameraOpen
										: ZegoBrowserCheckCss.cameraClose
								}
								onClick={() => {
									this.toggleStream("video");
								}}></i>
						)}
					</div>
				</div>
				<div className={ZegoBrowserCheckCss.joinScreen}>
					<div className={`${ZegoBrowserCheckCss.joinRoom} ${ZegoBrowserCheckCss.focus}`}>
						{this.state.userName && <label><FormattedMessage id="browserCheck.placeholder" /></label>}
						<input
							placeholder={formatMessage({ id: "browserCheck.placeholder" })}
							ref={this.nameInputRef}
							value={this.state.userName}
							className={
								this.state.userName !== this.props.core._expressConfig.userName
									? ZegoBrowserCheckCss.focus
									: ""
							}
							onChange={(ev: ChangeEvent<HTMLInputElement>) => {
								this.handleChange(ev);
							}}
							onFocus={(ev: ChangeEvent<HTMLInputElement>) => {
								this.isIOS &&
									setTimeout(() => {
										ev.target.scrollIntoView({
											block: "start",
										});
									}, 50);
							}}
							onBlur={(ev: ChangeEvent<HTMLInputElement>) => {
								this.isAndroid &&
									setTimeout(() => {
										ev.target.scrollIntoView({
											block: "start",
										});
									}, 100);
							}}></input>
						<button
							className={this.state.userName && ZegoBrowserCheckCss.active}
							onClick={() => {
								this.joinRoom();
							}}>
							<FormattedMessage id="browserCheck.join" />
						</button>
					</div>
					{this.state.sharedLinks?.map((link) => {
						return (
							<div className={ZegoBrowserCheckCss.inviteLink} key={link.name}>
								<div className={ZegoBrowserCheckCss.inviteLinkWrapperLeft}>
									<h3>{link.name}</h3>
									<input placeholder="inviteLink" readOnly value={link.url}></input>
								</div>
								<button
									className={link.copied ? ZegoBrowserCheckCss.copied : ""}
									onClick={() => {
										link && link.url && copy(link.url);
										this.setState((preState: { sharedLinks: any[] }) => {
											return {
												sharedLinks: preState.sharedLinks.map((l) => {
													if (l.name === link.name) {
														l.copied = true;
													}
													return l;
												}),
											};
										});
										setTimeout(() => {
											this.setState((preState: { sharedLinks: any[] }) => {
												return {
													sharedLinks: preState.sharedLinks.map((l) => {
														if (l.name === link.name) {
															l.copied = false;
														}
														return l;
													}),
												};
											});
										}, 5000);
									}}></button>
							</div>
						);
					})}
				</div>

				{this.state.isJoining && <ZegoLoading content={formatMessage({ id: "global.loading" })}></ZegoLoading>}
			</div>
		);
	}
}
