import React, { RefObject } from "react";
import {
	CoreError,
	LiveRole,
	LiveStreamingMode,
	ReasonForRefusedInviteToCoHost,
	RightPanelExpandedType,
	ScenarioModel,
	ScreenSharingResolution,
	SoundLevelMap,
	UserListMenuItemType,
	UserTypeEnum,
	ZegoBroadcastMessageInfo2,
	ZegoBrowserCheckProp,
	ZegoNotification,
	ZegoUIKitLanguage,
} from "../../../model";
import ZegoRoomCss from "./index.module.scss";
import { ZegoUser, ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";

import { ZegoTimer } from "./components/zegoTimer";
import { ZegoOne2One } from "./components/zegoOne2One";
import { ZegoMessage } from "./components/zegoMessage";
import { getVideoResolution, isFireFox, isSafari, randomNumber, throttle } from "../../../util";
import { ZegoSettings } from "../../components/zegoSetting";
import { ZegoModelShow } from "../../components/zegoModel";
import { ZegoToast } from "../../components/zegoToast";
import { ZegoGridLayout } from "./components/zegoGridLayout";
import { ZegoSidebarLayout } from "./components/zegoSidebarLayout";
import { ZegoCloudUser, ZegoCloudUserList } from "../../../modules/tools/UserListManager";
import { ZegoRoomInvite } from "./components/zegoRoomInvite";
import { ZegoUserList } from "./components/zegoUserList";
import { ZegoSoundLevelInfo } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { ZegoScreenSharingLayout } from "./components/ZegoScreenSharingLayout";
import { ZegoSuperBoardView } from "zego-superboard-web";
import { ZegoWhiteboardSharingLayout } from "./components/ZegoWhiteboardSharingLayout";
import ShowManageContext from "../context/showManage";
import ZegoAudio from "../../components/zegoMedia/audio";
import { ZegoMixPlayer } from "./components/zegoMixPlayer";
import { FormattedMessage } from "react-intl";
import { ZegoInvitationList } from './components/zegoInvitationList'

export class ZegoRoom extends React.PureComponent<ZegoBrowserCheckProp> {
	state: {
		localStream: undefined | MediaStream;
		layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE" | "INVITE_LIST";
		zegoCloudUserList: ZegoCloudUserList;
		messageList: ZegoBroadcastMessageInfo2[];
		notificationList: ZegoNotification[];
		micOpen: boolean;
		cameraOpen: boolean;
		showSettings: boolean;
		isNetworkPoor: boolean;
		connecting: boolean;
		firstLoading: boolean;
		selectMic: string | undefined;
		selectSpeaker: string | undefined;
		selectCamera: string | undefined;
		selectVideoResolution: string;
		showNonVideoUser: boolean;
		videoShowNumber: number; // 展示视频的数量
		gridRowNumber: number; // Grid 行数
		layout: "Auto" | "Grid" | "Sidebar";
		showLayoutSettingsModel: boolean; // 是否显示布局设置弹窗
		isLayoutChanging: boolean; // 布局是否正在变更中
		soundLevel: SoundLevelMap;
		liveCountdown: number;
		liveStatus: "1" | "0";
		isScreenSharingBySelf: boolean; // 自己是否正在屏幕共享

		screenSharingStream: undefined | MediaStream; // 本地屏幕共享流
		zegoSuperBoardView: ZegoSuperBoardView | null; // 本地白板共享
		isZegoWhiteboardSharing: boolean; // 是否开启白板共享
		screenSharingUserList: ZegoCloudUserList; // 屏幕共享列表
		showZegoSettings: boolean;
		haveUnReadMsg: boolean;
		isRequestingCohost: boolean; // 是否正在申请连麦
		unreadInviteList: Set<string>; // 是否有未读的连麦申请
		isMixing: "1" | "0"; // 是否
	} = {
			localStream: undefined,
			layOutStatus: this.initLayout(),
			zegoCloudUserList: [],
			messageList: [],
			notificationList: [],
			micOpen: !!this.props.core._config.turnOnMicrophoneWhenJoining,
			cameraOpen: !!this.props.core._config.turnOnCameraWhenJoining,
			showSettings: false,
			isNetworkPoor: false,
			connecting: false,
			firstLoading: true,
			selectMic: this.props.core.status.micDeviceID,
			selectSpeaker: this.props.core.status.speakerDeviceID,
			selectCamera: this.props.core.status.cameraDeviceID,
			selectVideoResolution:
				this.props.core.status.videoResolution || this.props.core._config.videoResolutionList![0],
			videoShowNumber: 9,
			gridRowNumber: 3,
			layout: this.props.core._config.layout || "Auto",
			showLayoutSettingsModel: false,
			isLayoutChanging: false,
			soundLevel: {},
			showNonVideoUser: this.props.core._config.showNonVideoUser as boolean,
			liveCountdown: -1,
			liveStatus: "0",
			isScreenSharingBySelf: false,
			screenSharingStream: undefined,
			zegoSuperBoardView: null,
			screenSharingUserList: [],
			showZegoSettings: false,
			haveUnReadMsg: false,
			isZegoWhiteboardSharing: false,
			isRequestingCohost: false,
			unreadInviteList: new Set(),
			isMixing: "0",
		};

	settingsRef: RefObject<HTMLDivElement> = React.createRef();
	moreRef: RefObject<HTMLDivElement> = React.createRef();

	micStatus: -1 | 0 | 1 = !!this.props.core._config.turnOnMicrophoneWhenJoining ? 1 : 0;
	cameraStatus: -1 | 0 | 1 = !!this.props.core._config.turnOnCameraWhenJoining ? 1 : 0;
	notifyTimer!: NodeJS.Timeout;
	msgDelayed = true; // 5s不显示
	localUserPin = false;
	localStreamID = "";
	screenSharingStreamID = "";
	isCreatingScreenSharing = false;
	isCreatingWhiteboardSharing = false;
	fullScreen = false;
	showNotSupported = 0;
	notSupportMultipleVideoNotice = 0;
	inviteModelRoot: any = null;
	get showHeader(): boolean {
		return !!(
			this.props.core._config.branding?.logoURL ||
			this.props.core._config.showRoomTimer ||
			this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming
		);
	}
	get isCDNLive(): boolean {
		return (
			this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
			this.props.core._config.scenario.config?.role === LiveRole.Audience &&
			(this.props.core._config.scenario.config as any).liveStreamingMode === LiveStreamingMode.LiveStreaming
		);
	}
	get showRequestCohost(): boolean | undefined {
		return (
			this.props.core._config.scenario?.config?.role === LiveRole.Audience &&
			this.state.liveStatus === "1" &&
			this.props.core._config?.showRequestToCohostButton
		)
	}
	userUpdateCallBack = () => { };
	componentDidMount() {
		this.setAllSinkId(this.state.selectSpeaker || "");
		this.computeByResize();
		setTimeout(() => {
			this.msgDelayed = false;
		}, 5000);
		this.initInRoomInviteMgListener();
		this.initSDK();
		this.props.core.eventEmitter.on("hangUp", () => {
			this.leaveRoom();
		});
		// 点击其他区域时, 隐藏更多弹窗)
		document.addEventListener("click", this.onOpenSettings);
		window.addEventListener("resize", this.onWindowResize.bind(this));
		// this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
		//   this.props.core._config.scenario?.config?.role === LiveRole.Audience &&
		//   this.toggleLayOut("MESSAGE");
		// if(this.props.core._zimManager && )
	}
	componentDidUpdate(
		preProps: ZegoBrowserCheckProp,
		preState: {
			localStream: undefined | MediaStream;
			layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
			zegoCloudUserList: ZegoCloudUserList;
			messageList: ZegoBroadcastMessageInfo2[];
			notificationList: ZegoNotification[];
			micOpen: boolean;
			cameraOpen: boolean;
			showMore: boolean;
			layout: string;
			videoShowNumber: number;
			liveStatus: "1" | "0";
			isScreenSharingBySelf: boolean;
			isZegoWhiteboardSharing: boolean;
			screenSharingUserList: ZegoCloudUserList;
		}
	) {
		if (
			(preState.notificationList.length > 0 &&
				this.state.notificationList.length > 0 &&
				preState.notificationList[preState.notificationList.length - 1].messageID !==
				this.state.notificationList[this.state.notificationList.length - 1].messageID) ||
			(preState.notificationList.length === 0 && this.state.notificationList.length > 0)
		) {
			this.notifyTimer && clearTimeout(this.notifyTimer);
			this.notifyTimer = setTimeout(() => {
				this.setState({
					notificationList: [],
				});
			}, 3000);
		}
		if (
			preState.layout !== this.state.layout ||
			preState.isScreenSharingBySelf !== this.state.isScreenSharingBySelf ||
			preState.isZegoWhiteboardSharing !== this.state.isZegoWhiteboardSharing
		) {
			this.computeByResize();
		}
		if (preState.videoShowNumber !== this.state.videoShowNumber) {
			if (preState.zegoCloudUserList === this.state.zegoCloudUserList) {
				this.userUpdateCallBack();
			}
		}
	}
	componentWillUnmount() {
		document.removeEventListener("click", this.onOpenSettings);
		window.removeEventListener("resize", this.onWindowResize.bind(this));
		this.props.core.eventEmitter.off("hangUp");
		this.state.isScreenSharingBySelf && this.closeScreenSharing();
		this.state.localStream && this.props.core.destroyStream(this.state.localStream);
		this.props.core.localStream = undefined;
	}
	async initSDK() {
		const { formatMessage } = this.props.core.intl;
		this.props.core.onNetworkStatusQuality((roomID: string, level: number) => {
			this.setState({
				isNetworkPoor: level > 2,
			});
		});
		this.props.core.onNetworkStatus(
			(roomID: string, type: "ROOM" | "STREAM", status: "DISCONNECTED" | "CONNECTING" | "CONNECTED") => {
				if (status === "DISCONNECTED" && type === "ROOM") {
					this.setState({
						connecting: false,
						firstLoading: false,
					});
					this.leaveRoom();
				} else if (status === "CONNECTING" && type !== "STREAM") {
					this.setState({
						connecting: true,
					});
				} else {
					this.setState({
						connecting: false,
						firstLoading: false,
					});
				}
				if (type === "STREAM" && status === "CONNECTED") {
					// 推流成功，开始混流
				}
			}
		);
		this.props.core.onRemoteUserUpdate(
			(roomID: string, updateType: "DELETE" | "ADD", userList: ZegoUser[], allUsers: ZegoUser[]) => {
				let notificationList: ZegoNotification[] = [];
				const { formatMessage } = this.props.core.intl;
				if (this.props.core._config.lowerLeftNotification?.showUserJoinAndLeave) {
					userList.forEach((u) => {
						notificationList.push({
							content: u.userName + " " + (updateType === "ADD" ? formatMessage({ id: "global.enter" }) : formatMessage({ id: "global.quit" })) + formatMessage({ id: "global.room" }),
							type: "USER",
							userName: u.userName,
							messageID: randomNumber(5),
						});
					});
				}
				// 当房间只剩自己的时候，自动离开房间
				if (updateType === "DELETE") {
					if (this.props.core._config.autoLeaveRoomWhenOnlySelfInRoom && allUsers.length === 0) {
						this.leaveRoom();
						return;
					}
					// 当呼叫发起者离开通话时，整个通话要结束时，离开房间
					const inviterID = this.props.core._zimManager?.callInfo?.inviter?.userID
					const endCallWhenInitiatorLeave = this.props.core._zimManager?.config?.endCallWhenInitiatorLeave
					if (endCallWhenInitiatorLeave && userList.some(({ userID }) => userID === inviterID)) {
						this.leaveRoom(false, false);
						return;
					}
				}
				this.setState((state: { notificationList: string[] }) => {
					return {
						notificationList: [...state.notificationList, ...notificationList],
					};
				});
				this.computeByResize();
			}
		);
		this.props.core.onRoomMessageUpdate((roomID: string, messageList: ZegoBroadcastMessageInfo[]) => {
			this.setState(
				(state: { messageList: ZegoBroadcastMessageInfo2[]; notificationList: ZegoNotification[] }) => {
					let lowerLeftNotification: ZegoNotification[] = [];
					if (
						this.state.layOutStatus !== "MESSAGE" &&
						this.props.core._config.lowerLeftNotification?.showTextChat
					) {
						lowerLeftNotification = [
							...state.notificationList,
							...messageList.map<ZegoNotification>((m) => {
								return {
									content: m.message,
									type: "MSG",
									userName: m.fromUser.userName,
									messageID: m.messageID,
								};
							}),
						];
					}

					return {
						messageList: [...state.messageList, ...messageList],
						notificationList: lowerLeftNotification,
						haveUnReadMsg: this.state.layOutStatus !== "MESSAGE",
					};
				}
			);
		});
		this.props.core.subscribeUserList((userList) => {
			this.userUpdateCallBack();
			if (this.isCDNLive) {
				// CDN拉流最大限制6条，超过限制就不拉了
				let userListCopy: ZegoCloudUserList = JSON.parse(JSON.stringify(userList));
				const userNum = userListCopy.filter(
					(user) =>
						user.streamList.length > 0 &&
						(user.streamList[0].cameraStatus === "OPEN" || user.streamList[0].micStatus === "OPEN")
				).length;
				let limitNum = this.state.screenSharingUserList.length > 0 ? 5 : 6;
				if (isSafari()) {
					limitNum = 1;
				}
				if (userNum > limitNum) {
					let i = 0;
					let targetUsers = userListCopy.reverse().map((user: ZegoCloudUser) => {
						if (
							user.streamList.length > 0 &&
							(user.streamList[0].cameraStatus === "OPEN" || user.streamList[0].micStatus === "OPEN")
						) {
							if (i >= limitNum) {
								user.streamList = [];
							} else {
								i++;
							}
						}
						return user;
					});
					this.setState({
						zegoCloudUserList: targetUsers.reverse(),
					});
					if (isSafari() && this.notSupportMultipleVideoNotice === 0) {
						this.notSupportMultipleVideoNotice = 1;
						ZegoModelShow(
							{
								header: formatMessage({ id: "global.notice" }),
								contentText: formatMessage({ id: "room.browserNotSupport" }),
								okText: "Okay",
							},
							document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
						);
					}
					return;
				}
			}
			this.setState({
				zegoCloudUserList: userList,
			});
		});

		this.props.core.onRoomLiveStateUpdate((res: "1" | "0") => {
			this.setState((preState: { liveCountdown: number }) => {
				return {
					liveStatus: res,
					liveCountdown:
						preState.liveCountdown === -1 || preState.liveCountdown === 0
							? res === "1"
								? 0
								: -1
							: preState.liveCountdown,
				};
			});
		});
		this.props.core.onRoomMixingStateUpdate((isMixing: "0" | "1") => {
			this.setState({
				isMixing,
			});
		});
		this.props.core.subscribeScreenStream((userList) => {
			if (
				this.isCDNLive &&
				isSafari() &&
				this.state.zegoCloudUserList.filter(
					(user) =>
						user.streamList.length > 0 &&
						(user.streamList[0].cameraStatus === "OPEN" || user.streamList[0].micStatus === "OPEN")
				).length > 0
			) {
				this.setState({ screenSharingUserList: [] }, () => {
					this.computeByResize();
				});
			} else {
				this.setState({ screenSharingUserList: userList }, () => {
					this.computeByResize();
				});
			}
		});
		this.props.core.subscribeWhiteBoard((superBoardView: ZegoSuperBoardView | null) => {
			// 有变化才设置，否则不管，防止多个白板时被覆盖
			if (
				(!this.state.zegoSuperBoardView && superBoardView) ||
				(this.state.zegoSuperBoardView && !superBoardView)
			) {
				this.setState(
					{
						zegoSuperBoardView: superBoardView,
						isZegoWhiteboardSharing: !!superBoardView,
					},
					() => {
						this.computeByResize();
					}
				);
			}
		});
		this.props.core.onSoundLevelUpdate((soundLevelList: ZegoSoundLevelInfo[]) => {
			let list: SoundLevelMap = {};
			soundLevelList.forEach((s) => {
				let userId = s.streamID.split("_")[1];
				if (list[userId]) {
					list[userId][s.streamID] = Math.floor(s.soundLevel);
				} else {
					list[userId] = {
						[s.streamID]: Math.floor(s.soundLevel),
					};
				}
			});
			this.setState({
				soundLevel: list,
			});
		});
		this.props.core.onScreenSharingEnded((stream: MediaStream) => {
			if (stream === this.state.screenSharingStream) {
				this.closeScreenSharing();
			}
		});
		this.props.core.onCoreError((code: CoreError, msg: string) => {
			if (code === CoreError.notSupportStandardLive || code === CoreError.notSupportCDNLive) {
				if (this.showNotSupported) return;
				this.showNotSupported = 1;
				ZegoModelShow(
					{
						header: formatMessage({ id: "global.notice" }),
						contentText: formatMessage({ id: "room.serviceNotAvailable" }),
						okText: "Okay",
					},
					document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
				);
			}
		});
		// 监听呼叫邀请离开房间的通知
		this.props.core._zimManager &&
			this.props.core._zimManager.notifyLeaveRoom(() => {
				this.leaveRoom();
			});
		// 监听远端控制摄像头麦克风
		this.props.core.onChangeYourDeviceStatus(
			async (type: "Camera" | "Microphone", status: "OPEN" | "CLOSE", fromUser: ZegoUser) => {
				if (type === "Camera" && status === "CLOSE" && this.state.cameraOpen) {
					await this.toggleCamera();
					ZegoToast({
						content: formatMessage({ id: "room.turnedCameraOff" }, { user: fromUser.userName }),
					});
				}
				if (type === "Microphone" && status === "CLOSE" && this.state.micOpen) {
					await this.toggleMic();
					ZegoToast({
						content: formatMessage({ id: "room.turnedMicOff" }, { user: fromUser.userName }),
					});
				}
			}
		);
		this.props.core.onKickedOutRoom(() => {
			this.leaveRoom(true);
		});

		const logInRsp = await this.props.core.enterRoom();
		let massage = "";
		if (logInRsp === 0) {
			this.createStream();
			return;
		} else if (logInRsp === 1002034) {
			// 登录房间的用户数超过该房间配置的最大用户数量限制（测试环境下默认房间最大用户数为 50，正式环境无限制）。
			massage = formatMessage({ id: "global.joinRoomFailedDesc" });
		} else if ([1002031, 1002053].includes(logInRsp)) {
			//登录房间超时，可能是由于网络原因导致。
			massage = formatMessage({ id: "global.joinRoomFailedNetwork" });
		} else if ([1102018, 1102016, 1102020].includes(logInRsp)) {
			// 登录 token 错误，
			massage = formatMessage({ id: "global.joinRoomFailedToken" });
		} else if (1002056 === logInRsp) {
			// 用户重复进行登录。
			massage = formatMessage({ id: "global.joinRoomFailedRepeat" });
		} else {
			massage = formatMessage({ id: "global.joinRoomFailed" }, { code: logInRsp });
		}
		ZegoModelShow(
			{
				header: formatMessage({ id: "global.loginRoomFailed" }),
				contentText: massage,
				okText: "OK",
			},
			document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
		);
	}
	initInRoomInviteMgListener() {
		// 收到邀请上麦的通知
		const { formatMessage } = this.props.core.intl;
		this.props.core._zimManager?._inRoomInviteMg.notifyInviteToCoHost((inviterName: string) => {
			this.inviteModelRoot = ZegoModelShow(
				{
					header: formatMessage({ id: "room.invitationDialogTitle" }),
					contentText: formatMessage({ id: "room.invitationDialogDesc" }),
					okText: formatMessage({ id: "global.agree" }),
					cancelText: formatMessage({ id: "global.disagree" }),
					onOk: async () => {
						this.props.core._zimManager?._inRoomInviteMg.audienceAcceptInvitation();
						// TODO 角色变更，更新config，开始推流,
						await this.props.core.changeAudienceToCohostInLiveStream();
						const res = await this.createStream();
						if (!res) {
							this.props.core.changeCohostToAudienceInLiveStream();
						}
					},
					onCancel: () => {
						this.props.core._zimManager?._inRoomInviteMg.audienceRefuseInvitation();
					},
					countdown: 60,
				},
				document.querySelector(".zego_model_parent")
			);
		});
		this.props.core._zimManager?._inRoomInviteMg.notifyInviteToCoHostRefused(
			(reason: ReasonForRefusedInviteToCoHost, user: { inviteeName: string; inviteeID?: string }) => {
				if (reason === ReasonForRefusedInviteToCoHost.Disagree) {
					ZegoToast({
						content: formatMessage({ id: "room.disagreedInvitationToast" }, { user: user.inviteeName }),
					});
				} else if (reason === ReasonForRefusedInviteToCoHost.Busy) {
					ZegoToast({
						content: formatMessage({ id: "room.InvitationSent" }),
					});
				}
			}
		);
		this.props.core._zimManager?._inRoomInviteMg.notifyRemoveCoHost(() => {
			// Cohost 变成 Audience，停止推流
			this.cohostToBeAudience();
		});
		this.props.core._zimManager?._inRoomInviteMg.notifyRequestCoHost((inviter: ZegoUser, state: 0 | 1) => {
			//收到观众连麦通知，0 取消|超时， 1 申请
			// 左侧通知
			if (state === 1) {
				ZegoToast({
					content: formatMessage({ id: "room.requestingConnectionToast" }, { user: inviter.userName }),
				});
			}
			// 设置红点
			if (state === 1) {
				this.state.unreadInviteList.add(inviter.userID);
			} else {
				this.state.unreadInviteList.delete(inviter.userID);
			}
			this.setState({
				unreadInviteList: this.state.unreadInviteList,
			});

			// 设置观众状态
			this.updateUserRequestCohostState(inviter.userID, !!state);
		});
		this.props.core._zimManager?._inRoomInviteMg.notifyHostRespondRequestCohost(async (respond: 0 | 1 | 2 | 3) => {
			if (respond === 0) {
				await this.props.core.changeAudienceToCohostInLiveStream();
				const res = await this.createStream();
				if (!res) {
					this.props.core.changeCohostToAudienceInLiveStream();
				}
			} else if (respond === 1) {
				ZegoToast({
					content: formatMessage({ id: "room.rejectedRequestToast" }),
				});
			} else if (respond === 2) {
				this.inviteModelRoot?.unmount();
			}
			this.setState({
				isRequestingCohost: false,
			});
		});
		// 观众的连麦申请超时（观众端）
		this.props.core._zimManager?._inRoomInviteMg.notifyRequestCohostTimeout(() => {
			this.setState({
				isRequestingCohost: false,
			});
		});
	}

	async createStream(): Promise<boolean> {
		const { formatMessage } = this.props.core.intl;
		if (
			!this.props.core._config.turnOnCameraWhenJoining &&
			!this.props.core._config.turnOnMicrophoneWhenJoining &&
			!this.props.core._config.showMyCameraToggleButton &&
			!this.props.core._config.showMyMicrophoneToggleButton
		) {
			return false;
		}
		if (!this.props.core.status.videoRefuse || !this.props.core.status.audioRefuse) {
			try {
				const solution = getVideoResolution(this.state.selectVideoResolution);
				const localStream = await this.props.core.createStream({
					camera: {
						video: !this.props.core.status.videoRefuse,
						audio: !this.props.core.status.audioRefuse,
						videoInput: this.state.selectCamera,
						audioInput: this.state.selectMic,
						videoQuality: 4,
						channelCount: this.props.core._config.enableStereo ? 2 : 1,
						...solution,
					},
				});
				this.props.core.localStream = localStream;
				this.props.core.enableVideoCaptureDevice(
					localStream,
					!!this.props.core._config.turnOnCameraWhenJoining
				);
				this.props.core.muteMicrophone(!this.props.core._config.turnOnMicrophoneWhenJoining);
				this.setState({
					localStream,
					cameraOpen: !!this.props.core._config.turnOnCameraWhenJoining,
					micOpen: !!this.props.core._config.turnOnMicrophoneWhenJoining,
				});
				const extraInfo = JSON.stringify({
					isCameraOn: !!this.props.core._config.turnOnCameraWhenJoining,
					isMicrophoneOn: this.props.core._config.turnOnMicrophoneWhenJoining,
					hasVideo: !this.props.core.status.videoRefuse,
					hasAudio: !this.props.core.status.audioRefuse,
				});
				try {
					const res = this.props.core.publishLocalStream(localStream, "main", extraInfo);
					if (res !== false) {
						this.localStreamID = res as string;
					}
				} catch (error) {
					// 推流失败就销毁创建的流
					console.error("【ZEGOCLOUD】publishStream failed:", error);
					this.props.core.destroyStream(localStream);
					this.setState({
						localStream: null,
					});
					return false;
				}

				return true;
			} catch (error: any) {
				console.error("【ZEGOCLOUD】createStream or publishLocalStream failed,Reason: ", JSON.stringify(error));
				if (error?.code === 1103065 || error?.code === 1103061) {
					ZegoToast({
						content: formatMessage({ id: "room.occupiedToast" }),
					});
				}
				if (error?.code === 1103064) {
					this.props.core.status.videoRefuse = true;
					this.props.core.status.audioRefuse = true;
					this.setState({
						cameraOpen: false,
						micOpen: false,
					});
				}
				return false;
			}
		} else {
			return false;
		}
	}
	stopPublish() {
		try {
			this.localStreamID && this.props.core.stopPublishingStream(this.localStreamID);
			console.log('===mytag', this.state.localStream)
			this.state.localStream && this.props.core.destroyStream(this.state.localStream);
			this.props.core.localStream = undefined;

			this.setState({
				localStream: null,
			});
			this.localStreamID = "";
		} catch (error) {
			console.error(error);
		}
	}
	async toggleMic() {
		const { formatMessage } = this.props.core.intl;
		if (this.props.core.status.audioRefuse) {
			ZegoModelShow(
				{
					header: formatMessage({ id: "global.equipment" }),
					contentText: formatMessage({ id: "global.equipmentDesc" }),
					okText: "Okay",
				},
				document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
			);
			return;
		}

		if (this.micStatus === -1) return;
		this.micStatus = -1;

		let result;
		if (this.state.localStream && this.state.localStream.getAudioTracks().length > 0) {
			result = await this.props.core.muteMicrophone(this.state.micOpen);

			try {
				await this.props.core.setStreamExtraInfo(
					this.localStreamID as string,
					JSON.stringify({
						isCameraOn: this.state.cameraOpen,
						isMicrophoneOn: !this.state.micOpen,
						hasVideo: !this.props.core.status.videoRefuse,
						hasAudio: !this.props.core.status.audioRefuse,
					})
				);
			} catch (error: any) {
				console.log('setStreamExtraInfo error', error);
			}
		}

		this.micStatus = !this.state.micOpen ? 1 : 0;
		if (result) {
			ZegoToast({
				content: this.props.core.intl.formatMessage({ id: "room.microphoneStatus" }) + (this.micStatus ? this.props.core.intl.formatMessage({ id: "room.on" }) : this.props.core.intl.formatMessage({ id: "room.off" })),
			});
			result &&
				this.setState(
					{
						micOpen: !!this.micStatus,
					},
					() => {
						this.computeByResize(this.state.cameraOpen || this.state.micOpen);
					}
				);
		}
		return !!result;
	}

	async toggleCamera(): Promise<boolean> {
		const { formatMessage } = this.props.core.intl;
		if (this.props.core.status.videoRefuse) {
			ZegoModelShow(
				{
					header: formatMessage({ id: "global.equipment" }),
					contentText: formatMessage({ id: "global.equipmentDesc" }),
					okText: "Okay",
				},
				document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
			);
			return Promise.resolve(false);
		}
		if (this.cameraStatus === -1) return Promise.resolve(false);
		this.cameraStatus = -1;

		let result;
		if (this.state.localStream && this.state.localStream.getVideoTracks().length > 0) {
			result = await this.props.core.enableVideoCaptureDevice(this.state.localStream, !this.state.cameraOpen);
			try {
				await this.props.core.setStreamExtraInfo(
					this.localStreamID as string,
					JSON.stringify({
						isCameraOn: !this.state.cameraOpen,
						isMicrophoneOn: this.state.micOpen,
						hasVideo: !this.props.core.status.videoRefuse,
						hasAudio: !this.props.core.status.audioRefuse,
					})
				);
			} catch (error: any) {
				console.log('setStreamExtraInfo error', error);
			}
		}
		this.cameraStatus = !this.state.cameraOpen ? 1 : 0;
		if (result) {
			ZegoToast({
				content: this.props.core.intl.formatMessage({ id: "room.cameraStatus" }) + (this.cameraStatus ? this.props.core.intl.formatMessage({ id: "room.on" }) : this.props.core.intl.formatMessage({ id: "room.off" })),
			});
			result &&
				this.setState(
					{
						cameraOpen: !!this.cameraStatus,
					},
					() => {
						this.computeByResize(this.state.cameraOpen || this.state.micOpen);
					}
				);
		}

		return !!result;
	}
	async toggleScreenSharing() {
		if (this.state.isScreenSharingBySelf) {
			this.closeScreenSharing();
		} else {
			this.createScreenSharing();
		}
	}

	async createScreenSharing() {
		if (this.state.isZegoWhiteboardSharing) return;
		const { formatMessage } = this.props.core.intl;
		if (this.state.screenSharingUserList.length > 0) {
			ZegoToast({
				content: formatMessage({ id: "room.otherScreenPresentingToast" }, { user: this.state.screenSharingUserList[0].userName }),
			});
			return;
		}
		if (this.isCreatingScreenSharing) return;
		this.isCreatingScreenSharing = true;
		try {
			let screenConfig;
			if (this.props.core._config.screenSharingConfig?.resolution === ScreenSharingResolution.Custom) {
				screenConfig = {
					videoQuality: 4,
					bitRate: this.props.core._config.screenSharingConfig!.maxBitRate!,
					width: this.props.core._config.screenSharingConfig!.width!,
					height: this.props.core._config.screenSharingConfig!.height!,
					frameRate: this.props.core._config.screenSharingConfig!.frameRate!,
				};
			} else if (this.props.core._config.screenSharingConfig?.resolution !== ScreenSharingResolution.Auto) {
				screenConfig = {
					videoQuality: 4,
					...getVideoResolution(this.props.core._config.screenSharingConfig!.resolution!),
				};
			} else {
				screenConfig = {
					videoQuality: 2,
					bitRate: 1500,
					frameRate: 15,
				};
			}
			console.error(screenConfig);
			const screenSharingStream = await this.props.core.createStream({
				// @ts-ignore
				screen: {
					...screenConfig,
					audio: !isFireFox(),
				},
			});

			const streamID = this.props.core.publishLocalStream(
				screenSharingStream,
				"screensharing",
				JSON.stringify({
					isCameraOn: true,
					isMicrophoneOn: true,
					hasVideo: screenSharingStream.getVideoTracks().length > 0,
					hasAudio: screenSharingStream.getAudioTracks()[0].enabled,
				})
			);
			streamID && (this.screenSharingStreamID = streamID as string);
			this.setState({
				isScreenSharingBySelf: true,
				screenSharingStream: screenSharingStream,
			});
		} catch (error: any) {
			console.error(error);
			if (!this.props.core._config.screenSharingConfig?.onError) {
				if (error?.code === 1103043) {
					ZegoModelShow(
						{
							header: formatMessage({ id: "global.notice" }),
							contentText: formatMessage({ id: "global.browserNotSupportSharing" }),
							okText: "Okay",
						},
						document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
					);
				} else if (error?.code === 1103010 && error?.msg.includes("Permission")) {
					ZegoModelShow(
						{
							header: formatMessage({ id: "global.shareAuthority" }),
							contentText: formatMessage({ id: "global.shareAuthorityDesc" }),
							okText: "Okay",
						},
						document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
					);
				} else if (error?.code !== 1103042) {
					ZegoToast({
						content: formatMessage({ id: "room.presentingFailed" }, { code: error?.code || -1 }),
					});
				}
			} else {
				// custom toast text
				const customToastText = this.props.core._config.screenSharingConfig?.onError(error?.code);
				// no text, Business side customization toast
				if (!customToastText) return;
				ZegoToast({
					content: customToastText,
				});
			}
		}
		this.isCreatingScreenSharing = false;
	}
	closeScreenSharing() {
		try {
			this.screenSharingStreamID && this.props.core.stopPublishingStream(this.screenSharingStreamID);
			this.state.screenSharingStream && this.props.core.destroyStream(this.state.screenSharingStream);
			this.setState({
				isScreenSharingBySelf: false,
			});
		} catch (error) {
			console.error(error);
		}
	}

	async toggleWhiteboardSharing() {
		if (this.getScreenSharingUser.length > 0) return;
		if (this.state.zegoSuperBoardView) {
			this.closeWhiteboardSharing();
		} else if (!this.state.isZegoWhiteboardSharing) {
			this.createWhiteboardSharing();
		}
	}

	async createWhiteboardSharing() {
		const { formatMessage } = this.props.core.intl;
		if (this.state.screenSharingUserList.length > 0) {
			ZegoToast({
				content: formatMessage({ id: "room.otherWhiteboardPresentingToast" }, { user: this.state.screenSharingUserList[0].userName }),
			});

			return;
		} else if (this.state.zegoSuperBoardView) {
			ZegoToast({
				content: formatMessage({ id: "room.otherWhiteboardPresentingToast" }, { user: this.state.zegoSuperBoardView.getCurrentSuperBoardSubView()?.getModel.name }),
			});
			return;
		}

		if (this.isCreatingWhiteboardSharing) return;
		this.isCreatingWhiteboardSharing = true;
		this.setState({ isZegoWhiteboardSharing: true });
	}

	closeWhiteboardSharing() {
		try {
			this.state.zegoSuperBoardView && this.props.core.destroyAndStopPublishWhiteboard();
			this.setState({
				isZegoWhiteboardSharing: false,
				zegoSuperBoardView: null,
			});
			this.isCreatingWhiteboardSharing = false;
		} catch (error) {
			console.error(error);
		}
	}

	toggleLayOut(layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE" | "INVITE_LIST") {
		this.setState(
			(state: { layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE" }) => {
				return {
					layOutStatus: state.layOutStatus === layOutStatus ? "ONE_VIDEO" : layOutStatus,
				};
			},
			() => {
				this.computeByResize();
			}
		);
	}

	async sendMessage(msg: string) {
		let messageID = randomNumber(5);
		this.setState((state: { messageList: ZegoBroadcastMessageInfo2[] }) => {
			return {
				messageList: [
					...state.messageList,
					{
						fromUser: {
							userID: this.props.core._expressConfig.userID,
							userName: this.props.core._expressConfig.userName,
						},
						message: msg,
						sendTime: Date.now(),
						messageID,
						status: "SENDING",
						attrs: this.props.core._config.addInRoomMessageAttributes
							? this.props.core._config.addInRoomMessageAttributes()
							: "",
					},
				],
			}
		});
		let resp = {} as any;
		try {
			let message
			if (this.props.core._config.addInRoomMessageAttributes) {
				message = JSON.stringify({
					msg,
					attrs: this.props.core._config.addInRoomMessageAttributes(),
				})
			} else {
				message = msg
			}

			resp = await this.props.core.sendRoomMessage(message)
		} catch (err) {
			console.error("【ZEGOCLOUD】sendMessage failed!", JSON.stringify(err));
		}
		this.setState((state: { messageList: ZegoBroadcastMessageInfo2[] }) => {
			const _messageList = state.messageList.map((msg) => {
				if (msg.messageID === messageID) {
					msg.status = resp?.errorCode === 0 ? "SENDED" : "FAILED";
				}
				return msg;
			});
			console.log(_messageList);
			return {
				messageList: _messageList,
			};
		});
	}

	openSettings() {
		this.setState({
			showSettings: !this.state.showSettings,
		});
	}
	onOpenSettings = (event: any) => {
		if (
			this.settingsRef.current === event.target ||
			this.settingsRef.current?.contains(event.target as Node) ||
			this.moreRef.current === event.target ||
			this.moreRef.current?.contains(event.target as Node)
		) {
		} else {
			this.setState({
				showSettings: false,
			});
		}
	};
	handleSetting() {
		this.setState({
			showZegoSettings: true,
		});
	}

	handleInvitation(invitees: ZegoUser[]) {
		if (invitees.length) {
			const { formatMessage } = this.props.core.intl;
			this.props.core._zimManager?.addInvitation?.(invitees, {})
				?.catch((err) => {
					ZegoToast({
						content: formatMessage({ id: "room.sendInvitationFailToast" }),
					});
				})
		}
		this.setState({
			layOutStatus: "ONE_VIDEO",
		})
	}

	confirmLeaveRoom() {
		if (this.props.core._config.scenario?.config?.role !== LiveRole.Audience) {
			this.props.core._config.turnOnCameraWhenJoining = this.state.cameraOpen;
			this.props.core._config.turnOnMicrophoneWhenJoining = this.state.micOpen;
		}
		this.props.core.status.micDeviceID = this.state.selectMic;
		this.props.core.status.cameraDeviceID = this.state.selectCamera;
		this.props.core.status.speakerDeviceID = this.state.selectSpeaker;
		this.props.core.status.videoResolution = this.state.selectVideoResolution;
		this.leaveRoom();
	}
	handleLeave() {
		if (!this.props.core._config.showLeaveRoomConfirmDialog) {
			this.confirmLeaveRoom();
		} else {
			ZegoModelShow(
				{
					header: this.props.core._config.leaveRoomDialogConfig?.titleText ?? this.props.core.intl.formatMessage({ id: "global.leaveDialogTitle" }),
					contentText: this.props.core._config.leaveRoomDialogConfig?.descriptionText ?? this.props.core.intl.formatMessage({ id: "global.leaveDialogDesc" }),
					okText: this.props.core.intl.formatMessage({ id: "global.confirm" }),
					cancelText: this.props.core.intl.formatMessage({ id: "global.cancel" }),
					onOk: () => {
						this.confirmLeaveRoom();
						this.props.core._config.leaveRoomDialogConfig?.confirmCallback && this.props.core._config.leaveRoomDialogConfig.confirmCallback();
					},
				},
				document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
			);
		}
	}
	leaveRoom(isKickedOut = false, isCallQuit = true) {
		this.props.core._zimManager?._inRoomInviteMg?.audienceCancelRequest();
		this.state.isScreenSharingBySelf && this.closeScreenSharing();
		this.state.localStream && this.props.core.destroyStream(this.state.localStream);
		this.props.core.localStream = undefined;
		this.props.core.leaveRoom();
		this.props.leaveRoom && this.props.leaveRoom(isKickedOut, isCallQuit);
	}
	get showSelf() {
		if (this.props.core._config.showNonVideoUser) {
			return true;
		} else {
			if (this.props.core._config.showOnlyAudioUser) {
				return this.localStreamID && (this.state.micOpen || this.state.cameraOpen);
			} else {
				return this.localStreamID && this.state.cameraOpen;
			}
		}
	}
	async computeByResize(justSetNum = false) {
		const width = Math.max(this.props.core._config.container!.clientWidth, 640);
		const height = Math.max(this.props.core._config.container!.clientHeight, 328);
		let videoShowNumber = 0,
			gridRowNumber = 0;

		if (this.getScreenSharingUser.length > 0 || this.state.isZegoWhiteboardSharing) {
			//Screen Sidebar
			const videWrapHight =
				height - (this.showHeader ? 64 : 16) - 84 - (this.state.isZegoWhiteboardSharing ? 0 : 38);
			const n = parseInt(String(videWrapHight / 124)) || 1;
			videoShowNumber = Math.min(n * 124 + (n - 1) * 10 <= videWrapHight ? n : n - 1 || 1, 5);

			!justSetNum && (await this.props.core.setSidebarLayOut(false));
			if (this.fullScreen) {
				this.setState({
					videoShowNumber: 0,
				});
				await this.props.core.setMaxScreenNum(0);
			} else {
				this.setState({
					videoShowNumber: videoShowNumber,
				});
				await this.props.core.setMaxScreenNum(this.showSelf ? videoShowNumber - 1 : videoShowNumber);
			}

			return;
		}
		if (this.state.layout === "Sidebar") {
			// Sidebar
			const videWrapHight = height - (this.showHeader ? 64 : 16) - 84;
			const n = parseInt(String(videWrapHight / 124)) || 1;
			videoShowNumber = Math.min(n * 124 + (n - 1) * 10 <= videWrapHight ? n : n - 1 || 1, 5);
			const sidebarEnabled = this.state.cameraOpen || this.state.micOpen ? !this.localUserPin : true;
			!justSetNum && (await this.props.core.setSidebarLayOut(sidebarEnabled));
			this.setState({
				videoShowNumber: videoShowNumber,
			});

			await this.props.core.setMaxScreenNum(this.showSelf ? videoShowNumber : videoShowNumber + 1);
			return;
		}

		if (this.state.layout === "Grid" || this.state.layout === "Auto") {
			if (height < 406 - (this.showHeader ? 16 : 64)) {
				const videoWrapWidth = width - 32 - (this.state.layOutStatus === "ONE_VIDEO" ? 0 : 350);
				const n = parseInt(String(videoWrapWidth / 160));
				videoShowNumber = Math.min(n * 160 + (n - 1) * 10 <= videoWrapWidth ? n : n - 1, 10);
				gridRowNumber = 1;
			} else if (height < 540 - (this.showHeader ? 16 : 64)) {
				const videoWrapWidth = width - 32 - (this.state.layOutStatus === "ONE_VIDEO" ? 0 : 350);
				const n = parseInt(String(videoWrapWidth / 124));
				videoShowNumber = Math.min(n * 124 + (n - 1) * 10 <= videoWrapWidth ? 2 * n : 2 * (n - 1), 10);
				gridRowNumber = 2;
			} else {
				videoShowNumber = 9;
				gridRowNumber = 3;
			}
			!justSetNum && (await this.props.core.setSidebarLayOut(false));
			this.setState({
				videoShowNumber: videoShowNumber,
				gridRowNumber: gridRowNumber,
			});
			await this.props.core.setMaxScreenNum(this.showSelf ? videoShowNumber - 1 : videoShowNumber);
			return;
		}
	}
	onWindowResize = throttle(this.computeByResize.bind(this), 500);
	showLayoutSettings(show: boolean) {
		this.setState({
			showLayoutSettingsModel: show,
		});
	}
	async changeLayout(type: string) {
		if (this.state.isLayoutChanging) return;
		return new Promise((resolve, reject) => {
			this.userUpdateCallBack = () => {
				this.setState({
					isLayoutChanging: false,
				});
				resolve(true);
			};
			if (type === "Grid" || type === "Auto") {
				this.props.core.setPin();
				this.localUserPin = false;
			}
			this.setState({
				isLayoutChanging: true,
				layout: type,
			});
			this.props.core.setSidebarLayOut(type === "Sidebar");
			setTimeout(() => {
				this.setState({
					isLayoutChanging: false,
				});
				resolve(false);
			}, 5000);
		});
	}

	getAllUser(): ZegoCloudUserList {
		return [
			{
				userID: this.props.core._expressConfig.userID,
				userName: this.props.core._expressConfig.userName,
				pin: this.localUserPin,
				avatar: this.props.core._expressConfig.avatar,
				streamList: [
					{
						media: this.state.localStream!,
						fromUser: {
							userID: this.props.core._expressConfig.userID,
							userName: this.props.core._expressConfig.userName,
						},
						micStatus: this.state.micOpen ? "OPEN" : "MUTE",
						cameraStatus: this.state.cameraOpen ? "OPEN" : "MUTE",
						state: "PLAYING",
						streamID: this.localStreamID,
					},
				],
			},
			...this.state.zegoCloudUserList,
		];
	}

	getWaitingUser(): ZegoCloudUserList {
		if (!this.props.core._zimManager) return []
		const { callInfo } = this.props.core._zimManager
		const { showWaitingCallAcceptAudioVideoView } = this.props.core._config
		const waitingUsers = showWaitingCallAcceptAudioVideoView
			? callInfo.waitingUsers || []
			: []
		return waitingUsers
			.filter(({ type }) => type === UserTypeEnum.CALLING_WAITTING)
			.map((waitingUser) => ({
				...waitingUser,
				streamList: [],
				pin: false,
			}))
	}

	getShownUser(forceShowNonVideoUser = false, showWaitingUser = true) {
		const shownUser = this.getAllUser().filter((item) => {
			if (!this.props.core._config.showNonVideoUser && !forceShowNonVideoUser) {
				if (
					item.streamList &&
					item.streamList[0] &&
					(item.streamList[0].media || item.streamList[0].urlsHttpsFLV || item.streamList[0].urlsHttpsHLS)
				) {
					if (item.streamList[0].cameraStatus === "OPEN") {
						return true;
					} else if (this.props.core._config.showOnlyAudioUser && item.streamList[0].micStatus === "OPEN") {
						return true;
					} else {
						return false;
					}
				} else {
					return false;
				}
			} else {
				return true;
			}
		});
		if (showWaitingUser) {
			const waittingUser = this.getWaitingUser()
			return [...shownUser, ...waittingUser] as ZegoCloudUserList;
		}
		return shownUser as ZegoCloudUserList;
	}
	get getScreenSharingUser(): ZegoCloudUserList {
		if (this.state.isScreenSharingBySelf) {
			return [
				{
					userID: this.props.core._expressConfig.userID,
					userName: this.props.core._expressConfig.userName,
					avatar: this.props.core._expressConfig.avatar,
					pin: false,
					streamList: [
						{
							media: this.state.screenSharingStream!,
							fromUser: {
								userID: this.props.core._expressConfig.userID,
								userName: this.props.core._expressConfig.userName,
							},
							micStatus: "OPEN",
							cameraStatus: "OPEN",
							state: "PLAYING",
							streamID: this.screenSharingStreamID,
						},
					],
				},
			];
		} else {
			return this.state.screenSharingUserList;
		}
	}
	getHiddenUser() {
		const hiddenUser = this.getAllUser().filter((item) => {
			if (
				!this.props.core._config.showNonVideoUser &&
				item.streamList &&
				item.streamList[0] &&
				(item.streamList[0].media || item.streamList[0].urlsHttpsFLV || item.streamList[0].urlsHttpsHLS) &&
				item.streamList[0].cameraStatus !== "OPEN" &&
				!this.props.core._config.showOnlyAudioUser &&
				item.streamList[0].micStatus === "OPEN"
			) {
				return true;
			} else {
				return false;
			}
		});

		return (
			<>
				{hiddenUser.map((user) => {
					return (
						<ZegoAudio
							muted={user.userID === this.props.core._expressConfig.userID}
							userInfo={user}
							key={user.userID + "_hiddenAudio"}></ZegoAudio>
					);
				})}
			</>
		);
	}
	get showScreenShareBottomTip(): boolean {
		if (
			this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
			this.props.core._config.scenario?.config?.role === LiveRole.Audience &&
			this.state.liveStatus !== "1"
		) {
			return false;
		} else {
			return this.getScreenSharingUser.length > 0;
		}
	}

	getLiveNotStartedText() {
		const { _config: { liveNotStartedTextForAudience }, intl } = this.props.core
		return liveNotStartedTextForAudience || intl.formatMessage({ id: "room.liveNotStarted" })
	}

	getLayoutScreen() {
		if (this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming) {
			const hasVideo = [...this.getAllUser(), ...this.getScreenSharingUser].some((u) => {
				if (u.streamList) {
					return u.streamList.some((s) => {
						return s.cameraStatus === "OPEN" || s.micStatus === "OPEN";
					});
				}
				return false;
			});
			if (this.props.core._config.scenario?.config?.role === LiveRole.Audience) {
				if (this.state.liveStatus !== "1") {
					return (
						<div className={ZegoRoomCss.liveNotStart}>
							<i></i>
							<span>{this.getLiveNotStartedText()}</span>
						</div>
					);
				} else if (
					hasVideo &&
					this.props.core._config.scenario.config.enableVideoMixing &&
					this.props.core._config.scenario.config.role === LiveRole.Audience
				) {
					return (
						<ZegoMixPlayer
							userInfo={this.props.core.mixUser}
							isPureAudio={this.props.core.zum.isPureAudio}
							isPureVideo={this.props.core.zum.isPureVideo}></ZegoMixPlayer>
					);
				}
			}
			if (!hasVideo) {
				return (
					<div className={ZegoRoomCss.noOneStreaming}>
						<i></i>
						<FormattedMessage id="room.noOneStreaming" />
					</div>
				);
			}
		}
		if (this.getScreenSharingUser.length > 0) {
			return (
				<>
					<ZegoScreenSharingLayout
						core={this.props.core}
						handleMenuItem={this.handleMenuItem.bind(this)}
						userList={this.getShownUser()}
						videoShowNumber={this.state.videoShowNumber}
						selfInfo={{
							userID: this.props.core._expressConfig.userID,
						}}
						screenSharingUser={this.getScreenSharingUser[0]}
						soundLevel={this.state.soundLevel}
						handleFullScreen={this.handleFullScreen.bind(this)}
						roomID={this.props.core._expressConfig.roomID}></ZegoScreenSharingLayout>
				</>
			);
		}

		if (this.state.isZegoWhiteboardSharing) {
			const { formatMessage } = this.props.core.intl;
			return (
				<ZegoWhiteboardSharingLayout
					core={this.props.core}
					handleMenuItem={this.handleMenuItem.bind(this)}
					userList={this.getShownUser()}
					videoShowNumber={this.state.videoShowNumber}
					selfInfo={{
						userID: this.props.core._expressConfig.userID,
					}}
					soundLevel={this.state.soundLevel}
					handleFullScreen={this.handleFullScreen.bind(this)}
					roomID={this.props.core._expressConfig.roomID}
					onShow={async (el: HTMLDivElement) => {
						// console.error(
						//   "【ZEGOCLOUD】onShow",
						//   this.isCreatingWhiteboardSharing,
						//   !this.state.zegoSuperBoardView
						// );
						// 主动渲染
						if (this.isCreatingWhiteboardSharing && !this.state.zegoSuperBoardView) {
							try {
								const zegoSuperBoardView = await this.props.core.createAndPublishWhiteboard(
									el,
									this.props.core._expressConfig.userName
								);
								this.setState({
									zegoSuperBoardView,
								});
							} catch (error: any) {
								ZegoModelShow(
									{
										header: formatMessage({ id: "global.notice" }),
										contentText: formatMessage({ id: "global.tooFrequent" }),
										okText: "Okay",
									},
									document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
								);
							}
							this.isCreatingWhiteboardSharing = false;
						} else if (this.state.zegoSuperBoardView) {
							// 被动渲染
							const uniqueID = this.state.zegoSuperBoardView
								.getCurrentSuperBoardSubView()
								?.getModel().uniqueID;
							uniqueID && this.state.zegoSuperBoardView.switchSuperBoardSubView(uniqueID);
						}
					}}
					onResize={(el: HTMLDivElement) => {
						// 主动渲染
						if (this.state.isZegoWhiteboardSharing && el) {
							try {
								this.state.zegoSuperBoardView?.getCurrentSuperBoardSubView()?.reloadView();
							} catch (error) {
								console.warn("【ZEGOCLOUD】onResize", error);
							}
						}
					}}
					onclose={() => {
						this.toggleWhiteboardSharing();
					}}
					onToolChange={(type: number, fontSize?: number, color?: string) => {
						this.props.core.setWhiteboardToolType(type, fontSize, color);
					}}
					onFontChange={(
						font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC",
						fontSize?: number,
						color?: string
					) => {
						this.props.core.setWhiteboardFont(font, fontSize, color);
					}}
					zegoSuperBoardView={this.state.zegoSuperBoardView}></ZegoWhiteboardSharingLayout>
			);
		}

		if ((this.state.layout === "Auto" && this.getShownUser().length < 3) || this.getShownUser().length < 2) {
			return (
				<ZegoOne2One
					core={this.props.core}
					onLocalStreamPaused={async () => {
						await this.props.core.enableVideoCaptureDevice(this.state.localStream!, !this.state.cameraOpen);
						this.props.core.enableVideoCaptureDevice(this.state.localStream!, this.state.cameraOpen);
					}}
					selfInfo={{
						userID: this.props.core._expressConfig.userID,
					}}
					handleMenuItem={this.handleMenuItem.bind(this)}
					userList={this.getShownUser()}
					soundLevel={this.state.soundLevel}></ZegoOne2One>
			);
		}
		if (
			(this.state.layout === "Grid" && this.getShownUser().length > 1) ||
			(this.state.layout === "Auto" && this.getShownUser().length > 2)
		) {
			return (
				<ZegoGridLayout
					core={this.props.core}
					userList={this.getShownUser()}
					videoShowNumber={this.state.videoShowNumber}
					gridRowNumber={this.state.gridRowNumber}
					selfInfo={{
						userID: this.props.core._expressConfig.userID,
					}}
					handleMenuItem={this.handleMenuItem.bind(this)}
					soundLevel={this.state.soundLevel}></ZegoGridLayout>
			);
		}
		if (this.state.layout === "Sidebar" && this.getShownUser().length > 1) {
			return (
				<ZegoSidebarLayout
					core={this.props.core}
					handleMenuItem={this.handleMenuItem.bind(this)}
					userList={this.getShownUser()}
					videoShowNumber={this.state.videoShowNumber}
					selfInfo={{
						userID: this.props.core._expressConfig.userID,
					}}
					soundLevel={this.state.soundLevel}></ZegoSidebarLayout>
			);
		}
		return <></>;
	}
	handleMenuItem(type: UserListMenuItemType, user: ZegoCloudUser) {
		this.menuOptions[type](user);
	}
	menuOptions: { [key in UserListMenuItemType]: Function } = {
		[UserListMenuItemType.ChangePin]: (user: ZegoCloudUser) => {
			if (user.userID === this.props.core._expressConfig.userID) {
				this.localUserPin = !this.localUserPin;
				this.props.core.setPin();
			} else {
				this.localUserPin = false;
				this.props.core.setPin(user.userID);
			}
			this.props.core.setSidebarLayOut(
				this.getScreenSharingUser.length > 0 ? false : this.localUserPin === false
			);
			this.setState({ layout: "Sidebar" });
		},
		[UserListMenuItemType.MuteMic]: async (user: ZegoCloudUser) => {
			if (user.streamList?.[0]?.micStatus === "MUTE") return;
			let res;
			try {
				if (user.userID === this.props.core._expressConfig.userID) {
					res = await this.toggleMic();
				} else {
					res = await this.props.core.turnRemoteMicrophoneOff(user.userID);
				}
				if (res) {
					ZegoToast({
						content: this.props.core.intl.formatMessage({ id: "room.turnOffMicToast" }),
					});
				}
			} catch (error) { }
		},
		[UserListMenuItemType.MuteCamera]: async (user: ZegoCloudUser) => {
			if (user.streamList?.[0]?.cameraStatus === "MUTE") return;
			let res;
			try {
				if (user.userID === this.props.core._expressConfig.userID) {
					res = await this.toggleCamera();
				} else {
					res = await this.props.core.turnRemoteCameraOff(user.userID);
				}
				if (res) {
					ZegoToast({
						content: this.props.core.intl.formatMessage({ id: "room.turnOffCameraToast" }),
					});
				}
			} catch (error) { }
		},
		[UserListMenuItemType.RemoveUser]: (user: ZegoCloudUser) => {
			const { formatMessage } = this.props.core.intl;
			ZegoModelShow(
				{
					header: formatMessage({ id: "room.remove" }),
					contentText: formatMessage({ id: "room.removeDesc" }, { user: user.userName }),
					okText: formatMessage({ id: "global.confirm" }),
					cancelText: formatMessage({ id: "global.cancel" }),
					onOk: () => {
						this.props.core.removeMember(user.userID);
					},
				},
				document.querySelector(".zego_model_parent")
			);
		},
		[UserListMenuItemType.InviteCohost]: async (user: ZegoCloudUser) => {
			const res = await this.props.core._zimManager?._inRoomInviteMg.inviteJoinToCohost(
				user.userID,
				user.userName || ""
			);
			console.warn("InviteCohost", res);
			const { formatMessage } = this.props.core.intl;
			let text = "";
			if (res?.code === 2) {
				text = formatMessage({ id: "room.sendInvitation" });
			} else if (res?.code === 0) {
				text = formatMessage({ id: "room.sendInvitationSuccessToast" });
			} else {
				text = formatMessage({ id: "room.sendInvitationFailToast" });
			}
			ZegoToast({
				content: text,
			});
		},
		[UserListMenuItemType.RemoveCohost]: async (user: ZegoCloudUser) => {
			const isSelf = user.userID === this.props.core._expressConfig.userID;
			const { formatMessage } = this.props.core.intl;
			ZegoModelShow(
				{
					header: formatMessage({ id: "room.endConnection" }),
					contentText: isSelf
						? formatMessage({ id: "room.endConnectionDesc" }, { user: "the host" })
						: formatMessage({ id: "room.endConnectionDesc" }, { user: user.userName }),
					okText: formatMessage({ id: "global.confirm" }),
					cancelText: formatMessage({ id: "global.cancel" }),
					onOk: () => {
						if (isSelf) {
							this.cohostToBeAudience();
						} else {
							this.props.core._zimManager?._inRoomInviteMg.removeCohost(user.userID);
						}
					},
				},
				document.querySelector(".zego_model_parent")
			);
		},
		[UserListMenuItemType.DisagreeRequestCohost]: async (user: ZegoCloudUser) => {
			const res = await this.props.core._zimManager?._inRoomInviteMg.hostRefuseRequest(user.userID);
			this.updateUserRequestCohostState(user.userID, false);
			this.state.unreadInviteList.delete(user.userID);
			this.setState({
				unreadInviteList: this.state.unreadInviteList,
			});
			console.warn("DisagreeRequestCohost", res);
		},
		[UserListMenuItemType.AgreeRequestCohost]: async (user: ZegoCloudUser) => {
			const res = await this.props.core._zimManager?._inRoomInviteMg.hostAcceptRequest(user.userID);
			if (res?.code === 6000276) {
				ZegoToast({
					content: this.props.core.intl.formatMessage({ id: "room.requestExpired" }),
				});
			}
			this.updateUserRequestCohostState(user.userID, false);
			this.state.unreadInviteList.delete(user.userID);
			this.setState({
				unreadInviteList: this.state.unreadInviteList,
			});
			console.warn("AgreeRequestCohost", res);
		},
	};
	private cohostToBeAudience() {
		this.stopPublish();
		this.closeScreenSharing();
		this.setState({
			showLayoutSettings: false,
			showSettings: false,
		});
		this.props.core.changeCohostToAudienceInLiveStream();
	}

	async handleRequestCohost() {
		const { formatMessage } = this.props.core.intl;
		if (this.state.isRequestingCohost) {
			await this.props.core._zimManager?._inRoomInviteMg.audienceCancelRequest();
			this.setState({
				isRequestingCohost: false,
			});
		} else {
			const res = await this.props.core._zimManager?._inRoomInviteMg.requestCohost();
			if (res?.code === 0) {
				ZegoToast({
					content: formatMessage({ id: "room.appliedConnectionToast" }),
				});
				this.setState({
					isRequestingCohost: true,
				});
			} else if (res?.code === 1) {
				ZegoToast({
					content: formatMessage({ id: "room.hostLeftToast" }),
				});
			} else {
				ZegoToast({
					content: formatMessage({ id: "room.appliedFailToast" }),
				});
			}
		}
	}
	private updateUserRequestCohostState(userID: string, state: boolean) {
		const userList = this.state.zegoCloudUserList.map((user) => {
			if (user.userID === userID) {
				user.requestCohost = state ? Date.now() : undefined;
			}
			return user;
		});
		this.setState({
			zegoCloudUserList: userList,
		});
	}
	handleFullScreen(fullScreen: boolean) {
		this.fullScreen = fullScreen;
		this.computeByResize();
	}

	async setLive() {
		if (this.state.liveCountdown === 0) {
			const { formatMessage } = this.props.core.intl;
			ZegoModelShow(
				{
					header: formatMessage({ id: "room.stopLive" }),
					contentText: formatMessage({ id: "room.stopLiveDesc" }),
					okText: formatMessage({ id: "global.stop" }),
					cancelText: formatMessage({ id: "global.cancel" }),
					onOk: async () => {
						// stop live
						await this.props.core.setLive("stop");
						this.setState({
							liveCountdown: -1,
						});
					},
				},
				document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
			);
		} else if (this.state.liveCountdown === -1) {
			this.setState(
				{
					liveCountdown: 3,
				},
				() => {
					setTimeout(() => {
						this.liveCountdownTimer();
					}, 1000);
				}
			);
		}
	}
	liveCountdownTimer() {
		this.setState(
			(preState: { liveCountdown: number }) => {
				return {
					liveCountdown: preState.liveCountdown - 1,
				};
			},
			async () => {
				if (this.state.liveCountdown === 0) {
					await this.props.core.setLive("live");
				} else {
					setTimeout(() => {
						this.liveCountdownTimer();
					}, 1000);
				}
			}
		);
	}

	// 设置扬声器 ID
	private setAllSinkId(speakerId: string) {
		const room = document.querySelector(`.${ZegoRoomCss.ZegoRoom}`);
		room?.querySelectorAll("video").forEach((video: any) => {
			video?.setSinkId?.(speakerId || "");
		});
		room?.querySelectorAll("audio").forEach((audio: any) => {
			audio?.setSinkId?.(speakerId || "");
		});
	}
	showTurnOffMicrophoneButton(user: ZegoCloudUser) {
		if (!this.props.core._config.showTurnOffRemoteMicrophoneButton) return false;

		return (
			this.props.core._config.scenario?.config?.role === LiveRole.Host ||
			(user.userID === this.props.core._expressConfig.userID &&
				this.props.core._config.scenario?.config?.role === LiveRole.Cohost)
		);
	}
	showTurnOffCameraButton(user: ZegoCloudUser) {
		if (!this.props.core._config.showTurnOffRemoteCameraButton) return false;
		return (
			this.props.core._config.scenario?.config?.role === LiveRole.Host ||
			(user.userID === this.props.core._expressConfig.userID &&
				this.props.core._config.scenario?.config?.role === LiveRole.Cohost)
		);
	}
	showRemoveButton(user: ZegoCloudUser) {
		if (!this.props.core._config.showRemoveUserButton) return false;
		if (this.props.core.isHost(user.userID)) return false;
		return (
			this.props.core._config.scenario?.config?.role === LiveRole.Host &&
			(user.userID !== this.props.core._expressConfig.userID || user.streamList.length === 0)
		);
	}
	isShownPin(user: ZegoCloudUser): boolean {
		if (this.props.core._config.scenario?.mode === ScenarioModel.OneONoneCall) {
			return false;
		}
		let showPinButton = !!this.props.core._config.showPinButton && this.getShownUser().length > 1;
		return (
			showPinButton &&
			!!(
				this.props.core._config.showNonVideoUser ||
				(user.streamList && user.streamList[0] && user.streamList[0].cameraStatus === "OPEN") ||
				(user.streamList &&
					user.streamList[0] &&
					user.streamList[0].micStatus === "OPEN" &&
					!!this.props.core._config.showOnlyAudioUser)
			)
		);
	}
	showRemoveCohostButton(user: ZegoUser) {
		if (!this.props.core._config.showRemoveCohostButton) return false;
		if (this.state.liveStatus === "0") return false;
		if (this.props.core.isHost(this.props.core._expressConfig.userID)) {
			return user.userID !== this.props.core._expressConfig.userID;
		} else {
			return user.userID === this.props.core._expressConfig.userID;
		}
	}
	showMenu(user: ZegoCloudUser) {
		return (
			this.isShownPin(user) ||
			this.showRemoveButton(user) ||
			this.showTurnOffCameraButton(user) ||
			this.showTurnOffMicrophoneButton(user) ||
			this.showRemoveCohostButton(user)
		);
	}
	private initLayout(): "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE" {
		switch (this.props.core._config.rightPanelExpandedType) {
			case RightPanelExpandedType.None:
				return "ONE_VIDEO";
			case RightPanelExpandedType.RoomDetails:
				return this.props.core._config.showRoomDetailsButton ? "INVITE" : "ONE_VIDEO";
			case RightPanelExpandedType.RoomMembers:
				return this.props.core._config.showUserList ? "USER_LIST" : "ONE_VIDEO";
			case RightPanelExpandedType.RoomMessages:
				return this.props.core._config.showTextChat ? "MESSAGE" : "ONE_VIDEO";
			default:
				return "ONE_VIDEO";
		}
	}
	get backgroundUrl() {
		return this.props.core._config.backgroundUrl || "";
	}

	get contentStyle() {
		const { backgroundUrl } = this.props.core._config;
		return {
			backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : '',
			paddingTop: this.showHeader ? 0 : "16px",
		}
	}

	getLiveButtonText() {
		const { liveCountdown } = this.state
		const { startLiveButtonText } = this.props.core._config
		if ([-1, 3].includes(liveCountdown)) {
			return startLiveButtonText || <FormattedMessage id="room.live" />
		}
		if (liveCountdown === 0) {
			return <FormattedMessage id="room.stopLive" />
		}
		return <FormattedMessage id="room.living" />
	}

	showInvitationButton() {
		if (!this.props.core._zimManager) return false
		const { config, callInfo } = this.props.core._zimManager
		const { userID } = this.props.core._expressConfig
		if (!config.canInvitingInCalling) return false
		if (!config.onlyInitiatorCanInvite) return true
		return userID === callInfo.inviter?.userID
	}

	getCallingInvitationListConfig() {
		return this.props.core._config.callingInvitationListConfig || {
			defaultChecked: true,
			waitingSelectUsers: [],
		}
	}

	// 已邀请的用户列表
	getSelectedUsers() {
		return this.props.core._zimManager?.callInfo?.invitees || []
	}

	render(): React.ReactNode {
		const startIndex = this.state.notificationList.length < 4 ? 0 : this.state.notificationList.length - 2;
		const { formatMessage } = this.props.core.intl
		return (
			<ShowManageContext.Provider
				value={{
					enableVideoMixing: this.props.core._config.scenario?.config?.enableVideoMixing,
					showPinButton: !!this.props.core._config.showPinButton && this.getShownUser().length > 1,
					liveStatus: this.state.liveStatus,
					showTurnOffMicrophoneButton: this.showTurnOffMicrophoneButton.bind(this),
					showTurnOffCameraButton: this.showTurnOffCameraButton.bind(this),
					showRemoveButton: this.showRemoveButton.bind(this),
					isShownPin: this.isShownPin.bind(this),
					showRemoveCohostButton: this.showRemoveCohostButton.bind(this),
					speakerId: this.state.selectSpeaker,
					whiteboard_page:
						this.state.zegoSuperBoardView?.getCurrentSuperBoardSubView()?.getCurrentPage() || 1,
					whiteboard_toolType: this.props.core.zegoSuperBoard?.getToolType() || 0,
					whiteboard_fontSize: this.props.core.zegoSuperBoard?.getFontSize() || 0,
					whiteboard_brushSize: this.props.core.zegoSuperBoard?.getBrushSize() || 0,
					whiteboard_brushColor: this.props.core.zegoSuperBoard?.getBrushColor() || "",
					whiteboard_isFontBold: this.props.core.zegoSuperBoard?.isFontBold(),
					whiteboard_isFontItalic: this.props.core.zegoSuperBoard?.isFontItalic(),
					whiteboard_showAddImage: this.props.core._config.whiteboardConfig?.showAddImageButton,
					userInfo: { userID: this.props.core._expressConfig.userID },
					whiteboard_showCreateClose: this.props.core._config.whiteboardConfig?.showCreateAndCloseButton,
				}}>
				<div className={`${ZegoRoomCss.ZegoRoom} zego_model_parent`}>
					{this.showHeader && (
						<div className={ZegoRoomCss.header}>
							<div className={ZegoRoomCss.headerLeft}>
								{this.props.core._config.branding?.logoURL && (
									<img
										className={ZegoRoomCss.logo}
										src={this.props.core._config.branding?.logoURL}
										alt="logo"
									/>
								)}
								{this.props.core._config.showRoomTimer &&
									this.props.core._config?.scenario?.mode !== ScenarioModel.LiveStreaming && (
										<ZegoTimer></ZegoTimer>
									)}
								{this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
									(this.state.liveCountdown === 0 || this.state.liveStatus === "1") && (
										<div className={ZegoRoomCss.liveState}>Live</div>
									)}
							</div>

							{this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
								this.props.core._config.scenario?.config?.role === LiveRole.Host && (
									<button
										className={`${ZegoRoomCss.goLive}  ${this.state.liveCountdown === 0 ? ZegoRoomCss.goLiveEnabled : ""
											}`}
										id="ZegoLiveButton"
										onClick={() => {
											this.setLive()
										}}>
										{this.getLiveButtonText()}
									</button>
								)}
						</div>
					)}
					<div className={ZegoRoomCss.content} style={this.contentStyle}>
						<div className={`${ZegoRoomCss.contentLeft} ${this.backgroundUrl && ZegoRoomCss.transparent}`}>
							{this.getLayoutScreen()}
							{this.getHiddenUser()}
							<div className={ZegoRoomCss.notify} id="zego_left_notify_wrapper">
								{this.state.notificationList.slice(startIndex).map((notify, index) => {
									if (notify.type === "MSG") {
										return (
											<div key={index} className={ZegoRoomCss.notifyContent}>
												<h5>{notify.userName}</h5>
												<span>{notify.content}</span>
											</div>
										)
									} else if (notify.type === "USER") {
										return (
											<div key={index} className={ZegoRoomCss.notifyContent}>
												<span className={ZegoRoomCss.nowrap}>{notify.content}</span>
											</div>
										)
									} else {
										return (
											<div key={index} className={ZegoRoomCss.notifyContent}>
												<span className={ZegoRoomCss.nowrap}>{notify.content}</span>
											</div>
										)
									}
								})}
							</div>
							{this.state.isNetworkPoor && <div className={ZegoRoomCss.network}></div>}
						</div>
						<div
							className={ZegoRoomCss.contentRight}
							style={{
								display: this.state.layOutStatus !== "ONE_VIDEO" ? "flex" : "none",
							}}>
							<div className={ZegoRoomCss.listHeader}>
								{this.state.layOutStatus === "INVITE" && <FormattedMessage id="global.roomDetails" />}
								{this.state.layOutStatus === "USER_LIST" && <FormattedMessage id="global.roomMembers" />}
								{this.state.layOutStatus === "MESSAGE" && <FormattedMessage id="global.roomMessages" />}
								{this.state.layOutStatus === "INVITE_LIST" && <FormattedMessage id="global.invitees" />}
								<span
									className={ZegoRoomCss.listHeaderClose}
									onClick={() => {
										this.setState({
											layOutStatus: "ONE_VIDEO",
										})
									}}></span>
							</div>
							<div className={ZegoRoomCss.listContent}>
								{this.state.layOutStatus === "INVITE" && (
									<ZegoRoomInvite core={this.props.core}></ZegoRoomInvite>
								)}
								{this.state.layOutStatus === "USER_LIST" && (
									<ZegoUserList
										core={this.props.core}
										userList={this.getShownUser(true, false)}
										selfUserID={this.props.core._expressConfig.userID}
										handleMenuItem={this.handleMenuItem.bind(this)}
										soundLevel={this.state.soundLevel}></ZegoUserList>
								)}
								{this.state.layOutStatus === "MESSAGE" && (
									<ZegoMessage
										core={this.props.core}
										messageList={this.state.messageList}
										sendMessage={(msg: string) => {
											this.sendMessage(msg)
										}}
										customMsgUI={this.props.core._config.customMessageUI}
										selfUserID={this.props.core._expressConfig.userID}></ZegoMessage>
								)}
								{this.state.layOutStatus === "INVITE_LIST" && (
									<ZegoInvitationList
										core={this.props.core}
										callingInvitationListConfig={this.getCallingInvitationListConfig()}
										userList={this.getShownUser(true)}
										handleInvitation={(invitees: ZegoUser[]) => {
											this.handleInvitation(invitees)
										}}
									/>
								)}
							</div>
						</div>
					</div>
					{this.showScreenShareBottomTip && (
						<div className={ZegoRoomCss.screenBottomBar}>
							<div className={ZegoRoomCss.screenBottomBarLeft}>
								<span></span>
								<p>
									{this.state.isScreenSharingBySelf
										? formatMessage({ id: "room.presentingDesc" })
										: formatMessage({ id: "room.presenting" }, { user: this.state.screenSharingUserList[0].userName })}
								</p>
							</div>
							{this.state.isScreenSharingBySelf && (
								<div
									className={ZegoRoomCss.screenBottomBarRight}
									onClick={() => {
										this.toggleScreenSharing()
									}}>
									{formatMessage({ id: "room.stopPresenting" })}
								</div>
							)}
						</div>
					)}
					<div className={ZegoRoomCss.footer}>
						<div className={ZegoRoomCss.handlerMiddle}>
							{this.props.core._config.showMyMicrophoneToggleButton && (
								<div
									className={`${ZegoRoomCss.micButton} ${!this.state.micOpen && ZegoRoomCss.close}`}
									onClick={() => {
										this.toggleMic()
									}}></div>
							)}
							{this.props.core._config.showMyCameraToggleButton && (
								<div
									className={`${ZegoRoomCss.cameraButton} ${!this.state.cameraOpen && ZegoRoomCss.close
										}`}
									onClick={() => {
										this.toggleCamera()
									}}></div>
							)}
							{this.props.core._config.showScreenSharingButton && (
								<div
									className={`${ZegoRoomCss.screenButton} ${this.state.isScreenSharingBySelf && ZegoRoomCss.sharing
										} ${this.state.isZegoWhiteboardSharing && ZegoRoomCss.forbidden}`}
									onClick={() => {
										this.toggleScreenSharing()
									}}></div>
							)}
							{this.props.core._config.plugins?.ZegoSuperBoardManager &&
								this.props.core._config.whiteboardConfig?.showCreateAndCloseButton && (
									<div
										className={`${ZegoRoomCss.whiteboardButton} ${this.state.isZegoWhiteboardSharing && ZegoRoomCss.sharing
											}  ${this.getScreenSharingUser.length > 0 && ZegoRoomCss.forbidden}`}
										onClick={() => {
											this.toggleWhiteboardSharing()
										}}></div>
								)}

							{(this.props.core._config.showAudioVideoSettingsButton ||
								this.props.core._config.showLayoutButton) && (
									<div
										ref={this.moreRef}
										className={ZegoRoomCss.moreButton}
										onClick={() => {
											this.openSettings()
										}}>
										<div
											className={ZegoRoomCss.settingsButtonModel}
											style={{
												display: this.state.showSettings ? "block" : "none",
											}}
											ref={this.settingsRef}>
											{this.props.core._config.showLayoutButton && (
												<div onClick={() => this.showLayoutSettings(true)}><FormattedMessage id="room.chageLayout" /></div>
											)}
											{this.props.core._config.showAudioVideoSettingsButton &&
												this.props.core._config.showLayoutButton && <span></span>}
											{this.props.core._config.showAudioVideoSettingsButton && (
												<div onClick={() => this.handleSetting()}><FormattedMessage id="global.settings" /></div>
											)}
											{this.showInvitationButton() && (
												<div onClick={() => this.toggleLayOut("INVITE_LIST")}><FormattedMessage id="global.inviteMembers" /></div>
											)}
										</div>
									</div>
								)}
							{this.showRequestCohost && (
								<div
									className={`${ZegoRoomCss.requestCohostButton} ${this.state.isRequestingCohost ? ZegoRoomCss.cancel : ZegoRoomCss.active
										}`}
									onClick={() => {
										this.handleRequestCohost()
									}}></div>
							)}
							<div
								id="ZegoRoomLeaveButton"
								className={
									this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming
										? ZegoRoomCss.liveLeaveButton
										: ZegoRoomCss.leaveButton
								}
								onClick={() => {
									this.handleLeave()
								}}></div>
						</div>
						<div className={ZegoRoomCss.handlerRight}>
							{this.props.core._config.showRoomDetailsButton && (
								<div
									className={ZegoRoomCss.inviteButton}
									onClick={() => {
										this.toggleLayOut("INVITE")
									}}></div>
							)}
							{this.props.core._config.showUserList && (
								<div
									className={`${ZegoRoomCss.memberButton} ${this.state.unreadInviteList.size > 0 ? ZegoRoomCss.msgButtonRed : ""
										}`}
									onClick={() => {
										this.toggleLayOut("USER_LIST")
									}}>
									{this.state.unreadInviteList.size === 0 && (
										<span className={ZegoRoomCss.memberNum}>
											{this.state.zegoCloudUserList.length > 99
												? "99+"
												: this.state.zegoCloudUserList.length + 1}
										</span>
									)}
								</div>
							)}
							{this.props.core._config.showTextChat && (
								<div
									className={`${ZegoRoomCss.msgButton} ${this.state.haveUnReadMsg ? ZegoRoomCss.msgButtonRed : ""
										}`}
									onClick={() => {
										this.setState({
											haveUnReadMsg: false,
										})
										this.toggleLayOut("MESSAGE")
									}}></div>
							)}
						</div>
					</div>
					<div
						className={ZegoRoomCss.reconnect}
						style={{
							display: this.state.connecting ? "flex" : "none",
							backgroundColor: this.state.firstLoading ? "#1C1F2E" : "",
						}}>
						<div></div>
						<p>
							{this.state.firstLoading
								? <FormattedMessage id="global.joining" />
								: <FormattedMessage id="global.network" />}
						</p>
					</div>

					<div
						className={ZegoRoomCss.countDown}
						style={{
							display: this.state.liveCountdown > 0 ? "flex" : "none",
						}}>
						<div>{this.state.liveCountdown}</div>
					</div>

					{this.state.showLayoutSettingsModel && (
						<div className={ZegoRoomCss.layoutSettingsMask}>
							<div className={ZegoRoomCss.layoutSettingsWrapper}>
								<div className={ZegoRoomCss.layoutSettingsHeader}>
									<p><FormattedMessage id="room.chageLayout" /></p>
									<span
										className={ZegoRoomCss.layoutSettingsCloseIcon}
										onClick={() => this.showLayoutSettings(false)}></span>
								</div>
								<div className={ZegoRoomCss.layoutSettingsContent}>
									<div
										className={ZegoRoomCss.layoutSettingsItemRow}
										onClick={() => this.changeLayout("Auto")}>
										<p>
											<span
												className={`${ZegoRoomCss.layoutSettingsItemIcon} ${this.state.layout === "Auto"
													? ZegoRoomCss.layoutSettingsItemChecked
													: ""
													} ${this.state.isLayoutChanging && this.state.layout === "Auto"
														? ZegoRoomCss.layoutSettingsItemLoading
														: ""
													}`}></span>
											{formatMessage({ id: "room.autoLayout" })}
										</p>
										<img
											src={require("../../../sdkAssets/img_layout_auto@2x.png")}
											alt="grid layout"
										/>
									</div>
									<div
										className={ZegoRoomCss.layoutSettingsItemRow}
										onClick={() => this.changeLayout("Grid")}>
										<p>
											<span
												className={`${ZegoRoomCss.layoutSettingsItemIcon} ${this.state.layout === "Grid"
													? ZegoRoomCss.layoutSettingsItemChecked
													: ""
													} ${this.state.isLayoutChanging && this.state.layout === "Grid"
														? ZegoRoomCss.layoutSettingsItemLoading
														: ""
													}`}></span>
											{formatMessage({ id: "room.gridLayout" })}
										</p>
										<img
											src={require("../../../sdkAssets/img_layout_grid@2x.png")}
											alt="grid layout"
										/>
									</div>
									<div
										className={ZegoRoomCss.layoutSettingsItemRow}
										onClick={() => this.changeLayout("Sidebar")}>
										<p>
											<span
												className={`${ZegoRoomCss.layoutSettingsItemIcon} ${this.state.layout === "Sidebar"
													? ZegoRoomCss.layoutSettingsItemChecked
													: ""
													} ${this.state.isLayoutChanging && this.state.layout === "Sidebar"
														? ZegoRoomCss.layoutSettingsItemLoading
														: ""
													}`}></span>
											{formatMessage({ id: "room.sidebarLayout" })}
										</p>
										<img
											src={require("../../../sdkAssets/img_layout_sidebar@2x.png")}
											alt="Sidebar layout"
										/>
									</div>
								</div>
							</div>
						</div>
					)}
					{this.state.showZegoSettings && (
						<ZegoSettings
							core={this.props.core}
							theme={"black"}
							initDevices={{
								mic: this.state.selectMic,
								cam: this.state.selectCamera,
								speaker: this.state.selectSpeaker,
								videoResolve: this.state.selectVideoResolution,
								showNonVideoUser: this.state.showNonVideoUser,
							}}
							closeCallBack={() => {
								this.setState({
									showZegoSettings: false,
								})
							}}
							onMicChange={(deviceID: string) => {
								this.setState(
									{
										selectMic: deviceID,
									},
									() => {
										if (this.state.localStream) {
											this.props.core.useMicrophoneDevice(this.state.localStream, deviceID)
										}
									}
								)
							}}
							onCameraChange={(deviceID: string) => {
								this.setState(
									{
										selectCamera: deviceID,
									},
									async () => {
										if (this.state.localStream) {
											await this.props.core.useCameraDevice(this.state.localStream, deviceID)
											this.setState({
												cameraOpen: true,
											})
										}
									}
								)
							}}
							onSpeakerChange={(deviceID: string) => {
								this.setState(
									{
										selectSpeaker: deviceID,
									},
									() => {
										this.setAllSinkId(deviceID)
									}
								)
							}}
							onVideoResolutionChange={(level: string) => {
								this.setState(
									{
										selectVideoResolution: level,
									},
									() => {
										if (this.state.localStream) {
											const { width, height, bitrate, frameRate } = getVideoResolution(level)
											this.props.core.setVideoConfig(this.state.localStream, {
												width,
												height,
												maxBitrate: bitrate,
												frameRate,
											})
										}
									}
								)
							}}
							onShowNonVideoChange={(selected: boolean) => {
								this.props.core._config.showNonVideoUser = selected
								this.props.core.setShowNonVideo(selected)
								this.setState({
									showNonVideoUser: selected,
								})
							}}></ZegoSettings>
					)}
				</div>
			</ShowManageContext.Provider>
		)
	}
}
