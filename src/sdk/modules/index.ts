import { generateStreamID, getConfig, changeCDNUrlOrigin, throttle, transformMsg, compareVersion } from "./tools/util"
import { ZegoExpressEngine } from "zego-express-engine-webrtc"
import { ZegoStreamOptions } from "zego-express-engine-webrtc/sdk/src/common/zego.entity"
import ZegoLocalStream from "zego-express-engine-webrtc/sdk/code/zh/ZegoLocalStream.web"
import {
	AiDenoiseMode,
	BackgroundBlurOptions,
	ZegoDeviceInfo,
	ZegoLocalStreamConfig,
	ZegoMixStreamAdvance,
	ZegoMixStreamConfig,
	ZegoMixStreamInput,
	ZegoPlayerState,
	ZegoPublisherState,
	ZegoPublishStats,
	ZegoPublishStreamConfig,
	ZegoServerResponse,
	ZegoSoundLevelInfo,
	ZegoStreamList,
	ZegoVideoCodecID,
} from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web"

import { ZegoBroadcastMessageInfo, ZegoRoomExtraInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d"
import {
	CallingInvitationListConfig,
	CoreError,
	LiveRole,
	LiveStreamingMode,
	RightPanelExpandedType,
	ScenarioModel,
	ScreenSharingResolution,
	VideoMixinLayoutType,
	VideoMixinOutputResolution,
	VideoResolution,
	ZegoCloudRemoteMedia,
	ZegoCloudRoomConfig,
	ZegoSignalingInRoomTextMessage,
	ZegoUIKitCreateConfig,
	ZegoUIKitLanguage,
	ZegoUIKitMessageType,
	ZegoUser,
} from "../model"
import { ZegoCloudUser, ZegoCloudUserList, ZegoCloudUserListManager } from "./tools/UserListManager"
import { ZegoSuperBoardManager, ZegoSuperBoardSubViewModel, ZegoSuperBoardView } from "zego-superboard-web"
import { ZIM } from "zego-zim-web"
import { ZimManager } from "./tools/ZimManager"
import { getVideoResolution } from "../util"
import { EventEmitter } from "./tools/EventEmitter"
import { createIntl, createIntlCache } from "react-intl";
import { i18nMap } from '../locale';
import { ZegoStreamView } from "zego-express-engine-webrtc/sdk/code/zh/ZegoStreamView.web"
// import { AiDenoise } from "zego-express-engine-webrtc/aidenoise";
import { VoiceChanger } from "zego-express-engine-webrtc/voice-changer";
import { BackgroundProcess } from 'zego-express-engine-webrtc/background-process';
import { TracerConnect } from "./tools/ZegoTracer"
import { SpanEvent } from "../model/tracer"

// declare const SDK_VERSION: string;
export class ZegoCloudRTCCore {
	static _instance: ZegoCloudRTCCore
	static _zg: ZegoExpressEngine
	localStream: ZegoLocalStream | undefined
	_zimManager: ZimManager | null = null
	zum!: ZegoCloudUserListManager
	_expressConfig!: {
		appID: number
		userID: string
		userName: string
		roomID: string
		token: string
		avatar?: string
	}
	zegoSuperBoard!: ZegoSuperBoardManager
	zegoSuperBoardView: ZegoSuperBoardView | null | undefined = undefined
	eventEmitter = new EventEmitter()
	// 多语言
	intl: any
	AiDenoiseConfig: { mode: AiDenoiseMode } | null = null;
	BackgroundProcessConfig: {
		blurDegree?: 1 | 2 | 3, source?: HTMLImageElement,
		objectFit?: 'fill' | 'contain' | 'cover', initialized?: boolean, enabled?: boolean
	} | null = null;
	//   static _soundMeter: SoundMeter;
	// 当前屏幕状态
	isScreenPortrait: boolean = true;
	static getInstance(kitToken: string, createConfig?: ZegoUIKitCreateConfig, cloudProxyConfig?: { proxyList: { hostName: string, port?: number }[] }): ZegoCloudRTCCore {
		const config = getConfig(kitToken);
		console.warn('===createConfig', createConfig?.BackgroundProcessConfig, config);
		if (!ZegoCloudRTCCore._instance && config) {
			// 开启云代理
			createConfig?.cloudProxyConfig && (ZegoExpressEngine.setCloudProxyConfig(createConfig.cloudProxyConfig.proxyList, config.token, true));
			// 开启ai降噪
			createConfig?.AiDenoiseConfig && (ZegoExpressEngine.use(VoiceChanger));
			// 开启背景处理
			createConfig?.BackgroundProcessConfig && (ZegoExpressEngine.use(BackgroundProcess));
			ZegoCloudRTCCore._instance = new ZegoCloudRTCCore();
			ZegoCloudRTCCore._instance._expressConfig = config;
			//   ZegoCloudRTCCore._soundMeter = new SoundMeter();
			ZegoCloudRTCCore._zg = new ZegoExpressEngine(
				ZegoCloudRTCCore._instance._expressConfig.appID,
				"wss://webliveroom" + ZegoCloudRTCCore._instance._expressConfig.appID + "-api.zegocloud.com/ws"
			)
			createConfig?.AiDenoiseConfig && (ZegoCloudRTCCore._instance.AiDenoiseConfig = createConfig.AiDenoiseConfig);
			createConfig?.BackgroundProcessConfig && (ZegoCloudRTCCore._instance.BackgroundProcessConfig = createConfig.BackgroundProcessConfig);
			ZegoCloudRTCCore._instance.zum = new ZegoCloudUserListManager(ZegoCloudRTCCore._zg);
			TracerConnect.createTracer(this._instance._expressConfig.appID, this._instance._expressConfig.token, this._instance._expressConfig.userID);
		}
		return ZegoCloudRTCCore._instance
	}
	// static getVersion(): string {
	// 	return '2.13.2' // SDK_VERSION;
	// }
	status: {
		loginRsp: boolean
		videoRefuse?: boolean
		audioRefuse?: boolean
		micDeviceID?: string
		cameraDeviceID?: string
		speakerDeviceID?: string
		videoResolution?: string
	} = {
			loginRsp: false,
			videoRefuse: undefined,
			audioRefuse: undefined,
		}
	remoteStreamMap: { [index: string]: ZegoCloudRemoteMedia } = {}
	waitingHandlerStreams: {
		add: ZegoStreamList[]
		delete: ZegoStreamList[]
	} = { add: [], delete: [] }

	_config: ZegoCloudRoomConfig & {
		plugins: {
			ZegoSuperBoardManager?: typeof ZegoSuperBoardManager
			ZIM?: ZIM
		}
	} = {
			// @ts-ignore
			container: undefined, // 挂载容器
			preJoinViewConfig: {
				title: "Join Room", // 标题设置，默认join Room
				//   invitationLink: window.location.href, // 邀请链接，空则不显示，默认空
			},
			showPreJoinView: true, // 是否显示预览检测页面，默认显示

			turnOnMicrophoneWhenJoining: true, // 是否开启自己的麦克风,默认开启
			turnOnCameraWhenJoining: true, // 是否开启自己的摄像头 ,默认开启
			showMyCameraToggleButton: true, // 是否可以控制自己的麦克风,默认开启
			showMyMicrophoneToggleButton: true, // 是否可以控制体自己的摄像头,默认开启
			showAudioVideoSettingsButton: true,

			showTextChat: true, // 是否开启聊天，默认开启   preJoinViewConfig: boolean，// 通话前检测页面是否需要，默认需要
			showUserList: true, // 是否显示成员列表，默认展示
			lowerLeftNotification: {
				showUserJoinAndLeave: true, //是否显示成员进出，默认显示
				showTextChat: true, // 是否显示未读消息，默认显示
			},
			branding: {
				logoURL: "",
			},

			showLeavingView: true, // 离开房间后页面，默认有

			maxUsers: 0, // 房间人数2～20，默认2
			layout: "Auto", // 默认Default

			showNonVideoUser: true, // 是否显示无视频用户，默认显示
			showOnlyAudioUser: false, // 是否显示纯音频用户，默认显示

			useFrontFacingCamera: true,

			onJoinRoom: () => { },
			onLeaveRoom: () => { },
			onUserJoin: (user: ZegoUser[]) => { }, // 用户进入回调
			onUserLeave: (user: ZegoUser[]) => { }, // 用户退入回调
			onUserAvatarSetter: (user: ZegoUser[]) => { }, // 用户可以设置头像时机回调
			sharedLinks: [], // 产品链接描述
			showScreenSharingButton: true, // 是否显示屏幕共享按钮
			scenario: {
				mode: ScenarioModel.OneONoneCall, // 场景选择
				config: {
					role: LiveRole.Host,
					liveStreamingMode: undefined,
					enableVideoMixing: false,
					videoMixingLayout: VideoMixinLayoutType.AutoLayout,
					videoMixingOutputResolution: VideoMixinOutputResolution._540P,
				}, // 对应场景专有配置
			},

			facingMode: "user",
			joinRoomCallback: () => { }, // 点击加入房间触发
			leaveRoomCallback: () => { }, // 退出房间回调
			userUpdateCallback: () => { },
			showLayoutButton: true, // 是否显示布局切换按钮
			showPinButton: true, // 是否显pin按钮
			whiteboardConfig: {
				showAddImageButton: false, //  默认false， 开通文件共享功能，并引入插件，后才会生效； 否则使用会错误提示：“ Failed to add image, this feature is not supported.”
				showCreateAndCloseButton: true,
			},
			videoResolutionList: [], //视频分辨率可选列表
			plugins: {},
			autoLeaveRoomWhenOnlySelfInRoom: false, // 当房间内只剩一个人的时候，自动退出房间
			showRoomTimer: false, // 是否显示房间计时器
			videoCodec: "H264", //视频编解码器
			showRoomDetailsButton: true,
			showInviteToCohostButton: false, // 主播是否展示邀请观众连麦按钮
			showRemoveCohostButton: false, // 主播是否展示移下麦按钮
			showRequestToCohostButton: false, // 观众是否展示申请连麦按钮
			rightPanelExpandedType: RightPanelExpandedType.None,
			autoHideFooter: true,
			enableStereo: false,
			showLeaveRoomConfirmDialog: true,
			screenSharingConfig: {
				resolution: ScreenSharingResolution.Auto,
			},
			language: ZegoUIKitLanguage.ENGLISH,
			showMoreButton: true, // 是否显示更多按钮
			showUserName: true, // 是否显示用户名
			hideUsersById: [],
			backgroundUrl: '',
			showWaitingCallAcceptAudioVideoView: true,
			callingInvitationListConfig: {
				waitingSelectUsers: [],
				defaultChecked: true,
			},
			videoScreenConfig: {
				objectFit: "contain",
				mirror: false,
			}
		}
	_currentPage: "BrowserCheckPage" | "Room" | "RejoinRoom" = "BrowserCheckPage"
	extraInfoKey = "extra_info"
	_roomExtraInfo: { [index: string]: any } = {
		live_status: "0",
	}
	NetworkStatusTimer: NodeJS.Timer | null = null
	hostSetterTimer: NodeJS.Timer | null = null
	localStreamInfo: {
		streamID: string
		micStatus: "OPEN" | "MUTE"
		cameraStatus: "OPEN" | "MUTE"
	} = {
			streamID: "",
			micStatus: "OPEN",
			cameraStatus: "OPEN",
		}
	localScreensharingStreamInfo: {
		streamID: string
		micStatus: "OPEN"
		cameraStatus: "OPEN"
	} = {
			streamID: "",
			micStatus: "OPEN",
			cameraStatus: "OPEN",
		}
	hasPublishedStream = false // 是否有已经推上去的流
	mixStreamDomain = "" // 混流域名
	mixUser = {} as ZegoCloudUser // 混流用户数据
	get isCDNLive(): boolean {
		return (
			this._config.scenario?.mode === ScenarioModel.LiveStreaming &&
			this._config.scenario.config?.role === LiveRole.Audience &&
			(this._config.scenario.config as any).liveStreamingMode === LiveStreamingMode.LiveStreaming
		)
	}
	get zg() {
		return ZegoCloudRTCCore._zg;
	}
	isHost(userID?: string): boolean {
		userID ??= this._expressConfig.userID
		return userID === this.roomExtraInfo?.host
	}
	addPlugins(plugins: { ZegoSuperBoardManager?: typeof ZegoSuperBoardManager; ZIM?: ZIM }): void {
		// check superboard version
		// express 3.0.0+ need superboard version >= 2.15.0

		if (plugins.ZegoSuperBoardManager) {
			if (
				compareVersion(plugins.ZegoSuperBoardManager?.getInstance()?.getSDKVersion(), "2.15.0") < 0 &&
				compareVersion(ZegoCloudRTCCore._zg.getVersion(), "3.0.0") < 0
			) {
				throw new Error("zego-superboard-web version need >= 2.15.0")
			}
		}
		this._config.plugins = plugins
		if (plugins.ZIM && this._expressConfig.token) {
			this.initZIM(plugins.ZIM)
		}
	}

	_originConfig: { [index: string]: any } = {}
	set originConfig(config: ZegoCloudRoomConfig) {
		if (config.container) {
			this._originConfig["cw"] = config.container.clientWidth / document.body.clientWidth
			this._originConfig["ch"] = config.container.clientHeight / document.body.clientHeight
		}
		if (config.showPreJoinView !== undefined) {
			this._originConfig["spj"] = config.showPreJoinView ? 1 : 0
		}
		if (config.turnOnMicrophoneWhenJoining !== undefined) {
			this._originConfig["tmwj"] = config.turnOnMicrophoneWhenJoining ? 1 : 0
		}
		if (config.turnOnCameraWhenJoining !== undefined) {
			this._originConfig["tcwj"] = config.turnOnCameraWhenJoining ? 1 : 0
		}
		if (config.showMyMicrophoneToggleButton !== undefined) {
			this._originConfig["smtb"] = config.showMyMicrophoneToggleButton ? 1 : 0
		}
		if (config.showMyCameraToggleButton !== undefined) {
			this._originConfig["sctb"] = config.showMyCameraToggleButton ? 1 : 0
		}
		if (config.showAudioVideoSettingsButton !== undefined) {
			this._originConfig["savsb"] = config.showAudioVideoSettingsButton ? 1 : 0
		}
		if (config.showTextChat !== undefined) {
			this._originConfig["stc"] = config.showTextChat ? 1 : 0
		}
		if (config.showUserList !== undefined) {
			this._originConfig["sul"] = config.showUserList ? 1 : 0
		}
		if (config.showLeavingView !== undefined) {
			this._originConfig["slv"] = config.showLeavingView ? 1 : 0
		}
		if (config.maxUsers !== undefined) {
			this._originConfig["mu"] = config.maxUsers ? 1 : 0
		}
		if (config.layout !== undefined) {
			this._originConfig["lo"] = config.layout
		}
		if (config.showScreenSharingButton !== undefined) {
			this._originConfig["sssb"] = config.showScreenSharingButton ? 1 : 0
		}
		if (this._config.plugins.ZegoSuperBoardManager !== undefined) {
			this._originConfig["swbb"] = 1
		}
		if (this._config.plugins.ZIM !== undefined) {
			this._originConfig["zim"] = 1
		}
		if (config.scenario?.mode !== undefined) {
			this._originConfig["sm"] = config.scenario.mode
		}
		if (config.lowerLeftNotification !== undefined) {
			this._originConfig["lln"] = config.lowerLeftNotification ? 1 : 0
		}
		if (config.showNonVideoUser !== undefined) {
			this._originConfig["snvu"] = config.showNonVideoUser ? 1 : 0
		}
		if (config.showOnlyAudioUser !== undefined) {
			this._originConfig["snau"] = config.showOnlyAudioUser ? 1 : 0
		}
		if (config.onJoinRoom !== undefined) {
			this._originConfig["ojr"] = 1
		}
		if (config.onLeaveRoom !== undefined) {
			this._originConfig["olr"] = 1
		}
		if (config.onLiveStart !== undefined) {
			this._originConfig["ols"] = 1
		}
		if (config.onLiveEnd !== undefined) {
			this._originConfig["ole"] = 1
		}
		if (config.autoLeaveRoomWhenOnlySelfInRoom !== undefined) {
			this._originConfig["lrwos"] = config.autoLeaveRoomWhenOnlySelfInRoom ? 1 : 0
		}
		if (config.language !== undefined) {
			this._originConfig["lang"] = config.language
		}
		if (config.onYouRemovedFromRoom !== undefined) {
			this._originConfig["oyrfr"] = 1
		}

		this._originConfig["url"] = window.location.origin + window.location.pathname
	}
	get originConfig() {
		return this._originConfig
	}
	setConfig(config: ZegoCloudRoomConfig): boolean {
		this.originConfig = { ...config }
		if (config.scenario && config.scenario.mode === ScenarioModel.LiveStreaming) {
			if (config.showNonVideoUser === true) {
				console.error("【ZEGOCLOUD】 showNonVideoUser have be false scenario.mode is LiveStreaming!!")
				return false
			}
			config.videoCodec = "H264"
			config.showNonVideoUser = false
			config.showOnlyAudioUser = true
			config.autoLeaveRoomWhenOnlySelfInRoom = false
			if (config.scenario.config && config.scenario.config.role === LiveRole.Host) {
				if (
					config.turnOnMicrophoneWhenJoining === false &&
					config.turnOnCameraWhenJoining === false &&
					config.showMyCameraToggleButton === false &&
					config.showAudioVideoSettingsButton === false
				) {
					console.error("【ZEGOCLOUD】 Host could turn on at least one of the camera and the microphone!!")
					return false
				}
			} else if (config.scenario.config && config.scenario.config.role === LiveRole.Audience) {
				if (
					config.turnOnMicrophoneWhenJoining === true ||
					config.turnOnCameraWhenJoining === true ||
					config.showMyCameraToggleButton === true ||
					config.showMyMicrophoneToggleButton === true ||
					config.showAudioVideoSettingsButton === true ||
					config.showScreenSharingButton === true ||
					config.useFrontFacingCamera === true ||
					(!!config.layout && config.layout !== "Grid")
				) {
					console.error("【ZEGOCLOUD】 Audience cannot configure camera and microphone related params")
					return false
				}
			}

			if (!config.maxUsers) {
				config.maxUsers = 0
			}

			if (config.scenario.config && config.scenario.config.role === LiveRole.Audience) {
				config.turnOnMicrophoneWhenJoining = false
				config.turnOnCameraWhenJoining = false
				config.showMyCameraToggleButton = false
				config.showMyMicrophoneToggleButton = false
				config.showAudioVideoSettingsButton = false
				config.showScreenSharingButton = false
				config.useFrontFacingCamera = false
				config.showUserList = config.showUserList === undefined ? false : config.showUserList
				config.showPinButton = false
				config.showLayoutButton = false
				config.layout = "Grid"
				// config.lowerLeftNotification = {
				// 	showTextChat: false,
				// 	showUserJoinAndLeave: false,
				// }
			}
		} else {
			config.showInviteToCohostButton = false
			config.showRemoveCohostButton = false
			config.showRequestToCohostButton = false
		}

		if (config.scenario && config.scenario.mode === ScenarioModel.OneONoneCall) {
			if (!config.maxUsers) {
				config.maxUsers = 0
			}
			config.showLayoutButton = false
			config.showPinButton = false
			config.showTurnOffRemoteCameraButton = false
			config.showTurnOffRemoteMicrophoneButton = false
			config.showRemoveUserButton = false
		}

		if (config.scenario && config.scenario.mode === ScenarioModel.GroupCall) {
			if (!config.maxUsers) {
				config.maxUsers = 0
			}
			if (!config.showLayoutButton) { config.showLayoutButton = true }
			if (!config.showPinButton) { config.showPinButton = true }
		}
		if (config.scenario && config.scenario?.config?.role === LiveRole.Audience) {
			config.showPinButton = false
			config.showTurnOffRemoteCameraButton = false
			config.showTurnOffRemoteMicrophoneButton = false
			config.showRemoveUserButton = false
		}
		if (config?.scenario?.config?.role === LiveRole.Cohost) {
			config.showRemoveUserButton = false
		}
		config.facingMode && (config.useFrontFacingCamera = config.facingMode === "user")
		config.joinRoomCallback && (config.onJoinRoom = config.joinRoomCallback)
		config.leaveRoomCallback && (config.onLeaveRoom = config.leaveRoomCallback)
		if (config.userUpdateCallback) {
			config.onUserJoin = (users: ZegoUser[]) => {
				config.userUpdateCallback && config.userUpdateCallback("ADD", users)
			}

			config.onUserLeave = (users: ZegoUser[]) => {
				config.userUpdateCallback && config.userUpdateCallback("DELETE", users)
			}
		}

		if (config.preJoinViewConfig && config.preJoinViewConfig.invitationLink) {
			config.sharedLinks = [
				{
					name: "Share the link",
					url: config.preJoinViewConfig.invitationLink,
				},
			]
		}
		if (config.videoResolutionDefault) {
			if (!config.videoResolutionList) {
				config.videoResolutionList = []
			}
			config.videoResolutionList?.unshift(config.videoResolutionDefault)
		}
		if (config.videoResolutionList && config.videoResolutionList.length > 0) {
			const list = Array.from(new Set(config.videoResolutionList)).filter((s: string) => {
				return (
					s === VideoResolution._180P ||
					s === VideoResolution._360P ||
					s === VideoResolution._480P ||
					s === VideoResolution._720P
				)
			})
			config.videoResolutionList = list.length > 0 ? list : [VideoResolution._360P]
		} else {
			config.videoResolutionList = [VideoResolution._360P]
		}
		if (config.screenSharingConfig && config.screenSharingConfig.resolution) {
			if (config.screenSharingConfig.resolution === ScreenSharingResolution.Custom) {
				const { width, height, frameRate, maxBitRate } = config.screenSharingConfig
				if (!width || !height || !frameRate || !maxBitRate) {
					console.error(
						"【ZEGOCLOUD】【screenSharingConfig】 Please configure 'width', 'height', 'frameRate' and 'maxBitRate' for custom screen sharing resolution"
					)
					return false
				}
				if (height < 360 && width < 640) {
					config.screenSharingConfig.resolution = ScreenSharingResolution._360P
					// width height too small, it will cause screen sharing failed
					console.warn("【ZEGOCLOUD】 The minimum value of 'width' and 'height' are 640 and 360")
				}
				if (width > 3840 && height > 2160) {
					config.screenSharingConfig.resolution = ScreenSharingResolution._4K
					// width height too large, it will cause screen sharing failed
					console.warn("【ZEGOCLOUD】 The maximum value of 'width' and 'height' are 3840 and 2160")
				}
				if (maxBitRate > 10000) {
					config.screenSharingConfig.maxBitRate = 10000
					console.warn("【ZEGOCLOUD】【screenSharingConfig】 The maximum value of 'maxBitRate' is 10000")
				}
			}
		}
		config.preJoinViewConfig &&
			(config.preJoinViewConfig = {
				...this._config.preJoinViewConfig,
				...config.preJoinViewConfig,
			})

		config.scenario &&
			//   @ts-ignore
			(config.scenario.config = {
				...this._config.scenario?.config,
				...(config.scenario.config || {}),
				enableVideoMixing:
					config.scenario.mode === ScenarioModel.LiveStreaming
						? config.scenario.config?.enableVideoMixing
						: false,
			})
		config.whiteboardConfig &&
			(config.whiteboardConfig = {
				...this._config.whiteboardConfig,
				...config.whiteboardConfig,
			})
		this._config = { ...this._config, ...config }
		this.zum.scenario = this._config.scenario?.mode || ScenarioModel.OneONoneCall
		this.zum.role = this._config.scenario?.config?.role || LiveRole.Host
		this.zum.enableVideoMixing = this._config.scenario?.config?.enableVideoMixing || false
		this.zum.liveStreamingMode = this.getLiveStreamingMode(
			(this._config.scenario?.config as any)?.liveStreamingMode
		)
		this.zum.showOnlyAudioUser = !!this._config.showOnlyAudioUser
		this.zum.setShowNonVideo(!!this._config.showNonVideoUser)

		if (!this._config.turnOnCameraWhenJoining && !this._config.showMyCameraToggleButton) {
			this.status.videoRefuse = true
		}
		if (config.console) {
			let logLevel: "debug" | "info" | "warn" | "error" | "report" | "disable" = "debug"
			if (config.console === "Info") {
				logLevel = "warn"
			} else if (config.console === "Warning") {
				logLevel = "warn"
			} else if (config.console === "Error") {
				logLevel = "warn"
			} else if (config.console === "None") {
				logLevel = "disable"
			}
			ZegoCloudRTCCore._zg.setLogConfig({
				logLevel,
			})
		}
		if (this._config.language) {
			this.changeIntl();
		}
		return true
	}

	// 改变多语言对象
	async changeIntl() {
		if (this._config.language) {
			this.intl = createIntl(
				{
					locale: this._config.language,
					messages: i18nMap[this._config.language],
				},
				createIntlCache()
			);
		}
	}

	// Audience变成Cohost
	async changeAudienceToCohostInLiveStream() {
		const config = this._config
		config.scenario!.config!.role = LiveRole.Cohost
		this.zum.role = LiveRole.Cohost

		config.turnOnMicrophoneWhenJoining = true
		config.turnOnCameraWhenJoining = true
		config.showMyCameraToggleButton = true
		config.showMyMicrophoneToggleButton = true
		config.showAudioVideoSettingsButton = true
		config.showScreenSharingButton = true
		config.useFrontFacingCamera = true
		config.showUserList = true
		config.showPinButton = true
		config.showLayoutButton = true
		config.layout = "Auto"
		config.lowerLeftNotification = {
			showTextChat: true,
			showUserJoinAndLeave: true,
		}
		config.showTurnOffRemoteCameraButton = true
		config.showTurnOffRemoteMicrophoneButton = true
		this.status.videoRefuse = undefined
		this.clearMixUser()
		// 拉流需要变成RTC的
		let _streamList = []
		for (let streamInfo of Object.values(this.remoteStreamMap)) {
			// 需要停止原来的L3拉流
			if (
				streamInfo.media &&
				this._config.scenario?.config?.liveStreamingMode !== LiveStreamingMode.RealTimeLive
			) {
				ZegoCloudRTCCore._zg.stopPlayingStream(streamInfo.streamID)
			}
			try {
				const stream = await this.zum.startPullStream(streamInfo.fromUser.userID, streamInfo.streamID)
				this.remoteStreamMap[streamInfo.streamID].media = stream
				_streamList.push(this.remoteStreamMap[streamInfo.streamID])
			} catch (error) {
				console.error("【ZEGOCLOUD】change to  Cohost:", error)
			}
		}
		this.onRemoteMediaUpdateCallBack &&
			_streamList.length > 0 &&
			this.onRemoteMediaUpdateCallBack("UPDATE", _streamList)
	}
	// Cohost 变成 Audience
	async changeCohostToAudienceInLiveStream() {
		const config = this._config
		config.scenario!.config!.role = LiveRole.Audience
		this.zum.role = LiveRole.Audience

		config.turnOnMicrophoneWhenJoining = false
		config.turnOnCameraWhenJoining = false
		config.showMyCameraToggleButton = false
		config.showMyMicrophoneToggleButton = false
		config.showAudioVideoSettingsButton = false
		config.showScreenSharingButton = false
		config.useFrontFacingCamera = false
		// config.showUserList = true;
		config.showPinButton = false
		config.showLayoutButton = false
		config.layout = "Grid"
		config.lowerLeftNotification = {
			showTextChat: false,
			showUserJoinAndLeave: false,
		}
		config.showTurnOffRemoteCameraButton = false
		config.showTurnOffRemoteMicrophoneButton = false

		this.setMixUser()
		// 如果是设置的RTC拉流则不变，否则需要重新拉流
		try {
			if (
				this._config.scenario?.config?.liveStreamingMode !== LiveStreamingMode.RealTimeLive &&
				!this._config.scenario?.config?.enableVideoMixing
			) {
				let _streamList = []
				for (let key in this.remoteStreamMap) {
					// 先停止拉流
					ZegoCloudRTCCore._zg.stopPlayingStream(key)
					// 重新拉流
					if (this.isCDNLive) {
						if (!this.mixStreamDomain) {
							this.coreErrorCallback(CoreError.notSupportCDNLive, "urlsFLV is empty")
						}
						// CDN拉流
						this.remoteStreamMap[key].media = undefined
						this.remoteStreamMap[key].urlsHttpsFLV = `${this.mixStreamDomain}${key}.flv`
						this.remoteStreamMap[key].urlsHttpsHLS = `${this.mixStreamDomain}${key}.m3u8`
					} else {
						const stream = await this.zum.startPullStream(this.remoteStreamMap[key].fromUser.userID, key)
						this.remoteStreamMap[key].media = stream
						this.remoteStreamMap[key].urlsHttpsFLV = ""
						this.remoteStreamMap[key].urlsHttpsHLS = ""
					}
					_streamList.push(this.remoteStreamMap[key])
				}
				_streamList.length > 0 && this.onRemoteMediaUpdateCallBack?.("UPDATE", _streamList)
			}
		} catch (error) {
			console.error(error)
		}
	}
	// 兼容处理LiveStreamingMode
	private getLiveStreamingMode(mode: string | undefined): LiveStreamingMode {
		if (mode === "StandardLive" || mode === "LiveStreaming") return LiveStreamingMode.LiveStreaming
		if (mode === "PremiumLive" || mode === "InteractiveLiveStreaming")
			return LiveStreamingMode.InteractiveLiveStreaming
		return LiveStreamingMode.RealTimeLive
	}
	async checkWebRTC(): Promise<boolean> {
		console.warn('[ZegoCloudRTCCore]checkWebRTC')
		try {
			if (!this.isCDNLive) {
				const webRTC = await ZegoCloudRTCCore._zg.checkSystemRequirements("webRTC");
				if (this._config.videoCodec === "H264") {
					const H264 = await ZegoCloudRTCCore._zg.checkSystemRequirements("H264")
					return !!webRTC.result && !!H264.result
				}

				if (this._config.videoCodec === "VP8") {
					const VP8 = await ZegoCloudRTCCore._zg.checkSystemRequirements("VP8")
					return !!webRTC.result && !!VP8.result
				}
				return !!webRTC.result
			}
			return true
		} catch (error) {
			console.warn('[ZegoCloudRTCCore]checkWebRTC error', error)
			return false
		}

	}

	// 检查摄像头麦克风权限
	async deviceCheck(checkCamera = false) {
		// 检查摄像头
		console.warn('[ZegoCloudRTCCore]deviceCheck', this._config.scenario?.mode, this._zimManager?.callInfo.type, this.status.videoRefuse, this.status.audioRefuse);
		// if (this.props.core._config.turnOnCameraWhenJoining) {
		// 语音通话不询问摄像头权限
		if (checkCamera || String(this._zimManager?.callInfo.type) !== '0') {
			try {
				await navigator.mediaDevices.getUserMedia({ video: true }).then(async (stream) => {
					const cameras = await this.getCameras();
					console.warn('[ZegoRoom]deviceCheck camera', cameras);
					if (cameras.length < 1) {
						this.status.videoRefuse = true
					} else {
						this.status.videoRefuse = false
					}
				})
					.catch((error) => {
						console.warn('[ZegoCloudRTCCore]getUserMedia video error', error);
						this.status.videoRefuse = true;
					});
			} catch (error) {
				this.status.videoRefuse = true;
			}
		} else {
			this.status.videoRefuse = true;
		}
		// } else {
		// 	this.props.core.status.videoRefuse = true;
		// }
		// 检查麦克风
		// if (this.props.core._config.turnOnMicrophoneWhenJoining) {
		try {
			await navigator.mediaDevices.getUserMedia({ audio: true }).then(async (stream) => {
				const mics = await this.getMicrophones();
				if (mics.length < 1) {
					this.status.audioRefuse = true
				} else {
					this.status.audioRefuse = false
				}
			})
				.catch((error) => {
					console.warn('[ZegoCloudRTCCore]getUserMedia audio error', error);
					this.status.audioRefuse = true;
				});
		} catch (error) {
			this.status.audioRefuse = true;
		}
		// } else {
		// 	this.props.core.status.audioRefuse = true;
		// }
	}

	setPin(userID?: string, pined?: boolean, stopUpdateUser?: boolean): void {
		this.zum.setPin(userID, pined)
		if (!stopUpdateUser) {
			this.subscribeUserListCallBack && this.subscribeUserListCallBack([...this.zum.remoteUserList])
		}
	}

	async setMaxScreenNum(num: number, stopUpdateUser?: boolean) {
		await this.zum.setMaxScreenNum(num)
		if (!stopUpdateUser) {
			this.subscribeUserListCallBack && this.subscribeUserListCallBack([...this.zum.remoteUserList])
		}
	}

	async setSidebarLayOut(enable: boolean, stopUpdateUser?: boolean) {
		await this.zum.setSidebarLayOut(enable)
		if (!stopUpdateUser) {
			this.subscribeUserListCallBack && this.subscribeUserListCallBack([...this.zum.remoteUserList])
		}
	}

	async setShowNonVideo(enable: boolean) {
		await this.zum.setShowNonVideo(enable)
		this.subscribeUserListCallBack && this.subscribeUserListCallBack([...this.zum.remoteUserList])
	}

	setCurrentPage(page: "BrowserCheckPage" | "Room" | "RejoinRoom") {
		this._currentPage = page
	}

	getCameras(): Promise<ZegoDeviceInfo[]> {
		return ZegoCloudRTCCore._zg.getCameras()
	}

	getMicrophones(): Promise<ZegoDeviceInfo[]> {
		return ZegoCloudRTCCore._zg.getMicrophones()
	}
	getSpeakers(): Promise<ZegoDeviceInfo[]> {
		return ZegoCloudRTCCore._zg.getSpeakers()
	}

	useFrontCamera(localStream: MediaStream | ZegoLocalStream, enable: boolean): Promise<ZegoServerResponse> {
		return ZegoCloudRTCCore._zg.useFrontCamera(localStream, enable);
	}

	setVolume(media: HTMLVideoElement, volume: number): void {
		media.volume = volume
	}

	async createZegoStream(source?: ZegoStreamOptions): Promise<ZegoLocalStream> {
		const localStream = await ZegoCloudRTCCore._zg.createZegoStream(source);
		this.localStream = localStream;
		if (ZegoCloudRTCCore._instance.AiDenoiseConfig) {
			console.warn('[createZegoStream]open aiDenoise', ZegoCloudRTCCore._instance.AiDenoiseConfig)
			await ZegoCloudRTCCore._zg.setAiDenoiseMode(localStream, ZegoCloudRTCCore._instance.AiDenoiseConfig.mode);
			await ZegoCloudRTCCore._zg.enableAiDenoise(localStream, true);
		}
		if (ZegoCloudRTCCore._instance.BackgroundProcessConfig && localStream) {
			if (!ZegoCloudRTCCore._instance.BackgroundProcessConfig.initialized) {
				try {
					ZegoCloudRTCCore._zg.initBackgroundModule &&
						await ZegoCloudRTCCore._zg.initBackgroundModule(0, `./assets`)
							.then(() => {
								console.log("初始化背景处理模块成功");
								ZegoCloudRTCCore._instance.BackgroundProcessConfig!.initialized = true;
							});
				} catch (err) {
					// 控制台打印初始化背景处理模块错误
					console.error("初始化背景模块失败", err);
				}
			}
			console.warn('[createZegoStream]open backgroundProcess', localStream, ZegoCloudRTCCore._instance.BackgroundProcessConfig)
			if (ZegoCloudRTCCore._instance.BackgroundProcessConfig.blurDegree) {
				ZegoCloudRTCCore._zg.setBackgroundBlurOptions(localStream, {
					blurDegree: ZegoCloudRTCCore._instance.BackgroundProcessConfig.blurDegree  // 虚化等级 1、2	、3，等级越大，虚化程度越高
				});
			} else {
				ZegoCloudRTCCore._zg.setVirtualBackgroundOptions(localStream, {
					source: ZegoCloudRTCCore._instance.BackgroundProcessConfig.source,
					objectFit: ZegoCloudRTCCore._instance.BackgroundProcessConfig.objectFit,
				})
			}
		}
		this._config.onLocalStreamCreated && this._config.onLocalStreamCreated(localStream);
		return localStream;
	}

	async createAndPublishWhiteboard(parentDom: HTMLDivElement, name: string): Promise<ZegoSuperBoardView> {
		this.zegoSuperBoard.setToolType(1)
		this.zegoSuperBoard.setBrushColor("#333333")
		this.zegoSuperBoard.setBrushSize(6)
		this.zegoSuperBoard.setFontItalic(false)
		this.zegoSuperBoard.setFontBold(false)
		this.zegoSuperBoard.setFontSize(24)
		await this.zegoSuperBoard.createWhiteboardView({
			name,
			perPageWidth: 1480.3, // 白板每页宽度
			perPageHeight: 758.5, // 白板每页高度
			pageCount: 5, // 白板页数
		})

		// this.zegoSuperBoard.setBrushColor("#F64326"); not working to set default color
		return this.zegoSuperBoard.getSuperBoardView()
	}

	async setWhiteboardToolType(type: number, fontSize?: number, color?: string) {
		if (type === 512) {
			const zegoSuperBoardSubView = this.zegoSuperBoard.getSuperBoardView().getCurrentSuperBoardSubView()
			zegoSuperBoardSubView && zegoSuperBoardSubView.clearCurrentPage()
		} else {
			this.zegoSuperBoard.setToolType(type)
			if ([1, 4, 8, 16].includes(type)) {
				fontSize && this.zegoSuperBoard.setBrushSize(fontSize)
				color && this.zegoSuperBoard.setBrushColor(color)
			}
		}
	}

	setWhiteboardFont(font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC", fontSize?: number, color?: string) {
		if (font === "BOLD") {
			this.zegoSuperBoard.setFontBold(true)
		} else if (font === "NO_BOLD") {
			this.zegoSuperBoard.setFontBold(false)
		} else if (font === "ITALIC") {
			this.zegoSuperBoard.setFontItalic(true)
		} else if (font === "NO_ITALIC") {
			this.zegoSuperBoard.setFontItalic(false)
		}
		fontSize && this.zegoSuperBoard.setFontSize(fontSize)
		color && this.zegoSuperBoard.setBrushColor(color)
	}

	async setVideoConfig(media: MediaStream | ZegoLocalStream, constraints: ZegoPublishStreamConfig) {
		return ZegoCloudRTCCore._zg.setVideoConfig(media, constraints)
	}
	stopPublishingStream(streamID: string): boolean {
		if (streamID.indexOf("_main") > -1) {
			this.localStreamInfo = {} as any
		}
		if (streamID.indexOf("_screensharing") > -1) {
			// 停止屏幕共享，更新混流
			this.localScreensharingStreamInfo = {} as any
			this.startAndUpdateMixinTask()
		}
		return ZegoCloudRTCCore._zg.stopPublishingStream(streamID)
	}
	destroyStream(stream: MediaStream | ZegoLocalStream): void {
		ZegoCloudRTCCore._zg.destroyStream(stream)
	}

	async destroyAndStopPublishWhiteboard(): Promise<void> {
		const uniqueID = this.zegoSuperBoard.getSuperBoardView()?.getCurrentSuperBoardSubView()?.getModel().uniqueID

		if (uniqueID) {
			this.zegoSuperBoard.destroySuperBoardSubView(uniqueID)
		}

		const result: ZegoSuperBoardSubViewModel[] = await this.zegoSuperBoard.querySuperBoardSubViewList()

		for (let i = 0; i < result.length; i++) {
			await this.zegoSuperBoard.destroySuperBoardSubView(result[i].uniqueID)
		}
	}

	useCameraDevice(media: ZegoLocalStream | MediaStream, deviceID: string): Promise<ZegoServerResponse> {
		return ZegoCloudRTCCore._zg.useVideoDevice(media, deviceID)
	}

	useMicrophoneDevice(media: MediaStream | ZegoLocalStream, deviceID: string): Promise<ZegoServerResponse> {
		return ZegoCloudRTCCore._zg.useAudioDevice(media, deviceID)
	}

	async useSpeakerDevice(media: HTMLMediaElement, deviceID: string): Promise<ZegoServerResponse> {
		if (!media.srcObject) {
			return Promise.resolve({ errorCode: -1 })
		}

		try {
			const res = await ZegoCloudRTCCore._zg.useAudioOutputDevice(media, deviceID)
			return { errorCode: res ? 0 : -1 }
		} catch (error) {
			return { errorCode: -1 }
		}
	}

	async enableVideoCaptureDevice(localStream: MediaStream | ZegoLocalStream, enable: boolean): Promise<boolean> {
		this.localStreamInfo.cameraStatus = !enable ? "MUTE" : "OPEN"
		this.startAndUpdateMixinTask()
		return ZegoCloudRTCCore._zg.enableVideoCaptureDevice(localStream, enable)
	}

	// 开关正在推流的流画面
	async mutePublishStreamVideo(localStream: MediaStream | ZegoLocalStream, mute: boolean): Promise<boolean> {
		this.localStreamInfo.cameraStatus = mute ? "MUTE" : "OPEN"
		this.startAndUpdateMixinTask()
		return ZegoCloudRTCCore._zg.mutePublishStreamVideo(localStream, mute)
	}
	async mutePublishStreamAudio(localStream: MediaStream, enable: boolean): Promise<boolean> {
		this.localStreamInfo.micStatus = enable ? "MUTE" : "OPEN"
		this.startAndUpdateMixinTask()
		return ZegoCloudRTCCore._zg.mutePublishStreamAudio(localStream, enable)
	}
	async muteMicrophone(enable: boolean): Promise<boolean> {
		this.localStreamInfo.micStatus = enable ? "MUTE" : "OPEN"
		this.startAndUpdateMixinTask()
		return ZegoCloudRTCCore._zg.muteMicrophone(enable)
	}

	set roomExtraInfo(value: { [index: string]: any }) {
		if (this._currentPage === "Room") {
			if (this._roomExtraInfo.live_status === "0" && value.live_status === "1") {
				// 开始直播
				this.setMixUser()
				this._config.onLiveStart &&
					this._config.onLiveStart({
						userID: this._expressConfig.userID,
						userName: this._expressConfig.userID,
					})
			} else if (this._roomExtraInfo.live_status === "1" && value.live_status === "0") {
				// 停止直播
				this.clearMixUser()
				this._zimManager?._inRoomInviteMg?.audienceCancelRequest()
				this._zimManager?._inRoomInviteMg?.hostCancelAllInvitation()
				this._config.onLiveEnd &&
					this._config.onLiveEnd({
						userID: this._expressConfig.userID,
						userName: this._expressConfig.userID,
					})
			}
			this._roomExtraInfo = value
			this.zum.setLiveStates(this._roomExtraInfo.live_status)
			this.onRoomLiveStateUpdateCallBack?.(this._roomExtraInfo.live_status)
			this.onRoomMixingStateUpdateCallBack?.(this._roomExtraInfo.isMixing)
			// 直播时设置房间属性host
			if (this.hostSetterTimer) {
				clearTimeout(this.hostSetterTimer)
				this.hostSetterTimer = null
			}
			if (
				this._config.scenario?.mode === ScenarioModel.LiveStreaming &&
				this._config.scenario.config?.role === LiveRole.Host &&
				!this._roomExtraInfo.host
			) {
				const setRoomExtraInfo = {
					...this._roomExtraInfo,
					...{
						host: this._expressConfig.userID,
					},
				}
				ZegoCloudRTCCore._zg.setRoomExtraInfo(
					ZegoCloudRTCCore._instance._expressConfig.roomID,
					"extra_info",
					JSON.stringify(setRoomExtraInfo)
				)
				this._roomExtraInfo = setRoomExtraInfo
				if (value.live_status === "1" && this.roomExtraInfo.isMixing === "1") {
					// TODO:开播时 主播离开房间，自己变成主播，刷新混流
					this.startAndUpdateMixinTask()
				}
			}
		} else if (this._currentPage === "BrowserCheckPage" || this._currentPage === "RejoinRoom") {
			setTimeout(() => {
				this.roomExtraInfo = value
			}, 1000)
		}
		this._zimManager?._inRoomInviteMg.updateRoomExtraInfo(this._roomExtraInfo)
	}
	get roomExtraInfo() {
		return this._roomExtraInfo
	}
	async setLive(status: "live" | "stop"): Promise<boolean> {
		const setRoomExtraInfo = {
			...this._roomExtraInfo,
			...{
				live_status: status === "live" ? "1" : "0",
			},
		}

		const res = await ZegoCloudRTCCore._zg.setRoomExtraInfo(
			ZegoCloudRTCCore._instance._expressConfig.roomID,
			"extra_info",
			JSON.stringify(setRoomExtraInfo)
		)
		if (res.errorCode === 0) {
			this.roomExtraInfo = setRoomExtraInfo
			if (status === "live") {
				this.startAndUpdateMixinTask(this._config.scenario?.config?.role === LiveRole.Host)
			} else {
				this.stopMixerTask(this._config.scenario?.config?.role === LiveRole.Host)
			}
		}
		return res.errorCode === 0
	}

	async enterRoom(): Promise<number> {
		// 已经登陆过不再登录
		if (this.status.loginRsp) return Promise.resolve(0)
		if (this._config.plugins?.ZegoSuperBoardManager) {
			this.zegoSuperBoard = this._config.plugins.ZegoSuperBoardManager.getInstance()

			this.zegoSuperBoard.init(ZegoCloudRTCCore._zg, {
				isTestEnv: false,
				parentDomID: "ZegoCloudWhiteboardContainer", // 需要挂载的父容器 ID
				appID: this._expressConfig.appID, // 申请到的 AppID
				userID: this._expressConfig.userID, // 用户自定义生成的用户 ID
				token: this._expressConfig.token, // 登录房间需要用于验证身份的 Token
			})
			if (this._config.console) {
				let logLevel: "debug" | "info" | "warn" | "error" | "report" | "disable" = "debug"
				if (this._config.console === "Info") {
					logLevel = "warn"
				} else if (this._config.console === "Warning") {
					logLevel = "warn"
				} else if (this._config.console === "Error") {
					logLevel = "error"
				} else if (this._config.console === "None") {
					logLevel = "disable"
				}
				this.zegoSuperBoard.setLogConfig({
					logLevel,
					remoteLogLevel: logLevel,
				})
			}
			this.zegoSuperBoard.setWhiteboardBackgroundColor("#ffffff")
		}
		ZegoCloudRTCCore._zg.off("roomExtraInfoUpdate")
		ZegoCloudRTCCore._zg.off("roomStreamUpdate")
		ZegoCloudRTCCore._zg.off("remoteCameraStatusUpdate")
		ZegoCloudRTCCore._zg.off("remoteMicStatusUpdate")
		ZegoCloudRTCCore._zg.off("playerStateUpdate")
		ZegoCloudRTCCore._zg.off("roomUserUpdate")
		ZegoCloudRTCCore._zg.off("IMRecvBroadcastMessage")
		ZegoCloudRTCCore._zg.off("roomStateUpdate")
		ZegoCloudRTCCore._zg.off("publisherStateUpdate")
		ZegoCloudRTCCore._zg.off("publishQualityUpdate")
		ZegoCloudRTCCore._zg.off("soundLevelUpdate")
		ZegoCloudRTCCore._zg.off("IMRecvCustomCommand")
		ZegoCloudRTCCore._zg.off("videoDeviceStateChanged")

		if (this.zegoSuperBoard) {
			// 监听远端新增白板
			this.zegoSuperBoard.off("remoteSuperBoardSubViewAdded")

			// 监听远端销毁白板
			this.zegoSuperBoard.off("remoteSuperBoardSubViewRemoved")
		}

		ZegoCloudRTCCore._zg.on(
			"roomStreamUpdate",
			async (
				roomID: string,
				updateType: "DELETE" | "ADD",
				streamList: ZegoStreamList[],
				extendedData?: string
			) => {
				console.warn("【ZEGOCLOUD】roomStreamUpdate", roomID, streamList, updateType, extendedData);
				if (updateType === "ADD") {
					this.mixStreamDomain = changeCDNUrlOrigin(streamList[0]?.urlsFLV?.replace(/[^/]+$/, "") || "")
					this.waitingHandlerStreams.add = [...this.waitingHandlerStreams.add, ...streamList]

					this.waitingHandlerStreams.delete = this.waitingHandlerStreams.delete.filter((stream) => {
						if (streamList.some((add_stream) => add_stream.streamID === stream.streamID)) {
							return false
						} else {
							return true
						}
					})
				} else {
					// 找出删除流中，和之前的新增流重叠的，存储这个下面对象中
					let willDelete: string[] = []

					// 新增流中，删除下线的流
					this.waitingHandlerStreams.add = this.waitingHandlerStreams.add.filter((stream) => {
						if (
							streamList.some((delete_stream) => {
								if (delete_stream.streamID === stream.streamID) {
									willDelete.push(delete_stream.streamID)
									return true
								} else {
									return false
								}
							})
						) {
							return false
						} else {
							return true
						}
					})

					// 删除流中，去除上次要新增的
					streamList = streamList.filter((s) => {
						if (willDelete.some((wd) => wd === s.streamID)) {
							return false
						} else {
							return true
						}
					})

					this.waitingHandlerStreams.delete = [...this.waitingHandlerStreams.delete, ...streamList]
				}
				// console.error("roomStreamUpdate", this.waitingHandlerStreams);
			}
		)
		ZegoCloudRTCCore._zg.on("roomExtraInfoUpdate", (roomID: string, roomExtraInfoList: ZegoRoomExtraInfo[]) => {
			roomExtraInfoList.forEach((info) => {
				if (info.key === this.extraInfoKey) {
					this.roomExtraInfo = JSON.parse(info.value)
					console.warn("roomExtraInfo", this.roomExtraInfo)
				}
			})
		})
		ZegoCloudRTCCore._zg.on("remoteCameraStatusUpdate", (streamID: string, status: "OPEN" | "MUTE") => {
			console.warn("remoteCameraStatusUpdate", streamID, status)
			// 小程序的回调会默认打开，不用这个回调去判断摄像头开关状态
			// if (this.remoteStreamMap[streamID]) {
			// 	this.remoteStreamMap[streamID].cameraStatus = status
			// 	this.onRemoteMediaUpdateCallBack &&
			// 		this.onRemoteMediaUpdateCallBack("UPDATE", [this.remoteStreamMap[streamID]])
			// }
		})
		ZegoCloudRTCCore._zg.on("remoteMicStatusUpdate", (streamID: string, status: "OPEN" | "MUTE") => {
			console.warn("remoteMicStatusUpdate", streamID, status)
			// 小程序的回调会默认打开，不用这个回调去判断麦克风开关状态
			// if (this.remoteStreamMap[streamID]) {
			// 	this.remoteStreamMap[streamID].micStatus = status
			// 	this.onRemoteMediaUpdateCallBack &&
			// 		this.onRemoteMediaUpdateCallBack("UPDATE", [this.remoteStreamMap[streamID]])
			// }
		})
		ZegoCloudRTCCore._zg.on("playerStateUpdate", (streamInfo: ZegoPlayerState) => {
			console.warn("【ZEGOCLOUD】playerStateUpdate", streamInfo, this.remoteStreamMap)
			if (this.remoteStreamMap[streamInfo.streamID]) {
				this.remoteStreamMap[streamInfo.streamID].state = streamInfo.state
				this.onRemoteMediaUpdateCallBack &&
					this.onRemoteMediaUpdateCallBack("UPDATE", [this.remoteStreamMap[streamInfo.streamID]])
			}
			if (streamInfo.errorCode === 1104038) {
				this.coreErrorCallback(CoreError.notSupportStandardLive, streamInfo.extendedData)
			}
			if (streamInfo.errorCode === 1104039 && streamInfo.streamID.includes("__mix")) {
				// 混流拉流重试
				setTimeout(() => {
					this.clearMixUser()
					this.setMixUser()
				}, 2000)
			}
		})
		ZegoCloudRTCCore._zg.on(
			"roomUserUpdate",
			(roomID: string, updateType: "DELETE" | "ADD", userList: ZegoUser[]) => {
				console.warn("【ZEGOCLOUD】roomUserUpdate", updateType, userList)
				if (updateType === "DELETE") {
					this._zimManager?._inRoomInviteMg.clearInviteWhenUserLeave(userList)
				}
				if (this.onRemoteUserUpdateCallBack) {
					this.onRemoteUserUpdateCallBack(roomID, updateType, userList)
				} else {
					setTimeout(() => {
						this.onRemoteUserUpdateCallBack && this.onRemoteUserUpdateCallBack(roomID, updateType, userList)
					}, 1000)
				}
			}
		)
		ZegoCloudRTCCore._zg.on("IMRecvBroadcastMessage", (roomID: string, chatData: ZegoBroadcastMessageInfo[]) => {
			const newChatData = transformMsg(ZegoUIKitMessageType.rtcMessage, chatData)
			this.onRoomMessageUpdateCallBack && this.onRoomMessageUpdateCallBack(roomID, newChatData as ZegoBroadcastMessageInfo[])
			newChatData.forEach((data) => {
				this._config.onInRoomMessageReceived && this._config.onInRoomMessageReceived(data as ZegoBroadcastMessageInfo)
			})
		})
		// 房间内自定义消息
		ZegoCloudRTCCore._zg.on("IMRecvCustomCommand", (roomID: string, fromUser: ZegoUser, command: string) => {
			try {
				const commandData = JSON.parse(command)
				console.warn("IMRecvCustomCommand", commandData)
				if (
					Object.keys(commandData).includes("zego_remove_user") &&
					commandData["zego_remove_user"].includes(this._expressConfig.userID)
				) {
					// 被移除房间的通知
					// 通知UI层leaveRoom
					console.warn('[ZegoCloudRTCCore]IMRecvCustomCommand zego_remove_user', fromUser);
					this.onKickedOutRoomCallback && this.onKickedOutRoomCallback()
					return
				}
				if (
					Object.keys(commandData).includes("zego_turn_camera_off") &&
					commandData["zego_turn_camera_off"] === this._expressConfig.userID
				) {
					// 通知UI层关闭摄像头
					this.onChangeYourDeviceStatusCallback &&
						this.onChangeYourDeviceStatusCallback("Camera", "CLOSE", fromUser)
					return
				}
				if (
					Object.keys(commandData).includes("zego_turn_microphone_off") &&
					commandData["zego_turn_microphone_off"] === this._expressConfig.userID
				) {
					// 通知UI层关闭麦克风
					this.onChangeYourDeviceStatusCallback &&
						this.onChangeYourDeviceStatusCallback("Microphone", "CLOSE", fromUser)
					return
				}
			} catch (error) { }

			this._config.onInRoomCommandReceived && this._config.onInRoomCommandReceived(fromUser, command)
		})

		ZegoCloudRTCCore._zg.on("publisherStateUpdate", (streamInfo: ZegoPublisherState) => {
			let state: "DISCONNECTED" | "CONNECTING" | "CONNECTED" = "DISCONNECTED"
			if (streamInfo.state === "PUBLISHING") {
				state = "CONNECTED"
				// 推流成功后开始混流
				if (this.roomExtraInfo.live_status === "1") {
					// 直播后再开始混流
					this.startAndUpdateMixinTask()
				} else {
					// 直播未开始，先标记已经有推流了
					this.hasPublishedStream = true
				}
			} else if (streamInfo.state === "NO_PUBLISH") {
				state = "DISCONNECTED"
			} else if (streamInfo.state === "PUBLISH_REQUESTING") {
				state = "CONNECTING"
			}
			this.onNetworkStatusCallBack &&
				this.onNetworkStatusCallBack(ZegoCloudRTCCore._instance._expressConfig.roomID, "STREAM", state)
		})

		ZegoCloudRTCCore._zg.on("playQualityUpdate", (streamID: string, stats: ZegoPublishStats) => {
			this.onNetworkStatusQualityCallBack &&
				this.onNetworkStatusQualityCallBack(
					streamID,
					Math.max(stats.video.videoQuality, stats.audio.audioQuality)
				)
		})

		ZegoCloudRTCCore._zg.on("publishQualityUpdate", (streamID: string, stats: ZegoPublishStats) => {
			this.onNetworkStatusQualityCallBack &&
				this.onNetworkStatusQualityCallBack(
					streamID,
					Math.max(stats.video.videoQuality, stats.audio.audioQuality)
				)
		})
		ZegoCloudRTCCore._zg.on("soundLevelUpdate", (soundLevelList: ZegoSoundLevelInfo[]) => {
			this.onSoundLevelUpdateCallBack && this.onSoundLevelUpdateCallBack(soundLevelList)
		})
		ZegoCloudRTCCore._zg.on("screenSharingEnded", (stream: MediaStream) => {
			this.onScreenSharingEndedCallBack && this.onScreenSharingEndedCallBack(stream)
		})
		ZegoCloudRTCCore._zg.on("publisherVideoEncoderChanged", (fromCodecID: ZegoVideoCodecID, toCodecID: ZegoVideoCodecID, streamID: string) => {
			console.warn('[ZegoCloudRTCCore]publisherVideoEncoderChanged]', fromCodecID, toCodecID, streamID)
		})
		ZegoCloudRTCCore._zg.on("videoDeviceStateChanged", (updateType: 'DELETE' | 'ADD', deviceInfo: { deviceName: string; deviceID: string; }) => {
			console.warn('[ZegoCloudRTCCore]videoDeviceStateChanged]', updateType, deviceInfo)
		})

		if (this.zegoSuperBoard) {
			// 监听远端新增白板
			this.zegoSuperBoard.on("remoteSuperBoardSubViewAdded", async (uniqueID: string) => {
				console.warn('[ZegoCloudRTCCore]remoteSuperBoardSubViewAdded', uniqueID, this._roomExtraInfo.live_status);
				await this.zegoSuperBoard.querySuperBoardSubViewList()
				this.zegoSuperBoard.setToolType(1)
				this.zegoSuperBoard.setBrushColor("#333333")
				this.zegoSuperBoard.setBrushSize(6)
				this.zegoSuperBoard.setFontItalic(false)
				this.zegoSuperBoard.setFontBold(false)
				this.zegoSuperBoard.setFontSize(24)
				this.zegoSuperBoardView = this.zegoSuperBoard.getSuperBoardView()
				if (this.zegoSuperBoardView !== undefined) {
					this.subscribeWhiteBoardCallBack(this.zegoSuperBoardView)
					this.zegoSuperBoardView = undefined
				}
			})

			// 监听远端销毁白板
			this.zegoSuperBoard.on("remoteSuperBoardSubViewRemoved", (uniqueID: string) => {
				this.zegoSuperBoardView = null
			})
		}

		// if (this.isCDNLive) {
		ZegoCloudRTCCore._zg.on(
			"streamExtraInfoUpdate",
			(roomID: string, streamList: { streamID: string; user: ZegoUser; extraInfo: string }[]) => {
				if (roomID === this._expressConfig.roomID) {
					console.warn("streamExtraInfoUpdate", streamList)
					this.streamExtraInfoUpdateCallBack(streamList)
				}
			}
		)
		// }
		// 监听房间内ZIM text消息
		// this._config.onInRoomTextMessageReceived &&
		// 	this._zimManager?.onRoomTextMessage(this._config.onInRoomTextMessageReceived)
		this._zimManager?.onRoomTextMessage((msgs) => {
			const newChatData = transformMsg(ZegoUIKitMessageType.zimMessage, msgs);
			this.onRoomMessageUpdateCallBack && this.onRoomMessageUpdateCallBack(this._expressConfig.roomID, newChatData as ZegoBroadcastMessageInfo[])
			newChatData.forEach((data) => {
				this._config.onInRoomMessageReceived && this._config.onInRoomMessageReceived(data as ZegoBroadcastMessageInfo)
			})
		})
		this._config.onInRoomCustomCommandReceived &&
			this._zimManager?.onRoomCommandMessage(this._config.onInRoomCustomCommandReceived)
		const resp = await new Promise<number>(async (res, rej) => {
			ZegoCloudRTCCore._zg.on(
				"roomStateUpdate",
				(
					roomID: string,
					state: "DISCONNECTED" | "CONNECTING" | "CONNECTED",
					errorCode: number,
					extendedData: string
				) => {
					this.onNetworkStatusCallBack && this.onNetworkStatusCallBack(roomID, "ROOM", state)
					if (state === "CONNECTED" || state === "DISCONNECTED") {
						this.status.loginRsp = errorCode === 0
						res(errorCode)
					}
				}
			)
			try {
				await ZegoCloudRTCCore._zg.loginRoom(
					ZegoCloudRTCCore._instance._expressConfig.roomID,
					ZegoCloudRTCCore._instance._expressConfig.token,
					{
						userID: ZegoCloudRTCCore._instance._expressConfig.userID,
						userName: ZegoCloudRTCCore._instance._expressConfig.userName,
					},
					{
						userUpdate: true,
						maxMemberCount: ZegoCloudRTCCore._instance._config.maxUsers,
					}
				)
				const span = TracerConnect.createSpan(SpanEvent.LoginRoom, {
					room_id: ZegoCloudRTCCore._instance._expressConfig.roomID,
					error: 0,
					msg: '',
					start_time: Date.now(),
				})
				span.end();
				if (
					this._config.scenario?.mode === ScenarioModel.LiveStreaming &&
					this._config.scenario.config?.role === LiveRole.Host &&
					this.roomExtraInfo.host === undefined
				) {
					// 进房后如果没有host，就将自己设置为host
					this.hostSetterTimer = setTimeout(() => {
						if (!this.roomExtraInfo.host) {
							const setRoomExtraInfo = {
								...this.roomExtraInfo,
								...{
									host: this._expressConfig.userID,
								},
							}
							ZegoCloudRTCCore._zg.setRoomExtraInfo(
								ZegoCloudRTCCore._instance._expressConfig.roomID,
								"extra_info",
								JSON.stringify(setRoomExtraInfo)
							)
							this._roomExtraInfo = setRoomExtraInfo
						}
					}, 2000)
				}
				if (this.zegoSuperBoard) {
					this.zegoSuperBoard.setToolType(1)
					this.zegoSuperBoard.setBrushColor("#333333")
					this.zegoSuperBoard.setBrushSize(6)
					this.zegoSuperBoard.setFontItalic(false)
					this.zegoSuperBoard.setFontBold(false)
					this.zegoSuperBoard.setFontSize(24)
					const result: ZegoSuperBoardSubViewModel[] = await this.zegoSuperBoard.querySuperBoardSubViewList()
					result.length > 0 && (this.zegoSuperBoardView = this.zegoSuperBoard.getSuperBoardView())
					if (this.zegoSuperBoardView !== undefined) {
						this.subscribeWhiteBoardCallBack(this.zegoSuperBoardView)
						this.zegoSuperBoardView = undefined
					}
				}
				const user = {
					userID: ZegoCloudRTCCore._instance._expressConfig.userID,
					userName: ZegoCloudRTCCore._instance._expressConfig.userName,
					setUserAvatar: (avatar: string) => {
						if (avatar && typeof avatar === "string") {
							this._expressConfig.avatar = avatar
						}
					},
				}
				this._config.onUserAvatarSetter && this._config.onUserAvatarSetter([user])

				// @ts-ignore 日志上报
				ZegoCloudRTCCore._zg.logger.info("zu.jr " + JSON.stringify(this.originConfig))
			} catch (error) {
				console.error('[ZegoCloudRTCCore]login error', error)
			}
		})
		this._zimManager?.enterRoom();
		try {
			ZegoCloudRTCCore._zg.setSoundLevelDelegate(true, 300)
		} catch (error) {
			console.error('[ZegoCloudRTCCore]setSoundLevelDelegate error', error)
		}
		this.streamUpdateTimer(this.waitingHandlerStreams)
		return resp
	}

	async streamUpdateTimer(_waitingHandlerStreams: {
		add: ZegoStreamList[]
		delete: ZegoStreamList[]
	}): Promise<void> {
		if (!this.status.loginRsp) {
			console.warn("【ZEGOCLOUD】logoutRoom,stop streamUpdateTimer")
			return
		}
		if (this._currentPage === "Room") {
			let _streamList = []
			if (_waitingHandlerStreams.add.length > 0) {
				for (let i = 0; i < _waitingHandlerStreams.add.length; i++) {
					const streamInfo = _waitingHandlerStreams.add[i]
					let extraInfo = {
						isMicrophoneOn: undefined,
						isCameraOn: undefined,
						hasAudio: undefined,
						hasVideo: undefined,
					}
					try {
						// 防止流附加消息为空解析报错
						extraInfo = JSON.parse(streamInfo.extraInfo)
					} catch (err) { }
					try {
						console.log('===isCDNLive', this.isCDNLive);
						if (this.isCDNLive) {
							console.log('===streaminfo', streamInfo);
							if (!streamInfo.urlsFLV) {
								this.coreErrorCallback(CoreError.notSupportCDNLive, "urlsFLV is empty")
							}
							// CDN拉流
							this.remoteStreamMap[streamInfo.streamID] = {
								fromUser: streamInfo.user,
								media: undefined,
								micStatus: extraInfo?.isMicrophoneOn ? "OPEN" : "MUTE",
								cameraStatus: extraInfo?.isCameraOn ? "OPEN" : "MUTE",
								state: "PLAYING",
								streamID: streamInfo.streamID,
								urlsHttpsFLV: changeCDNUrlOrigin(streamInfo.urlsHttpsFLV || streamInfo.urlsFLV),
								urlsHttpsHLS: changeCDNUrlOrigin(streamInfo.urlsHttpsHLS || streamInfo.urlsHLS),
								hasAudio: extraInfo.hasAudio,
								hasVideo: extraInfo.hasVideo,
							}
						} else {
							const stream = await this.zum.startPullStream(streamInfo.user.userID, streamInfo.streamID)
							this.remoteStreamMap[streamInfo.streamID] = {
								fromUser: streamInfo.user,
								media: stream,
								micStatus: extraInfo?.isMicrophoneOn ? "OPEN" : "MUTE",
								cameraStatus: extraInfo?.isCameraOn ? "OPEN" : "MUTE",
								state: "PLAYING",
								streamID: streamInfo.streamID,
							}
							console.log('===拉流', stream?.getVideoTracks().length)
						}

						_streamList.push(this.remoteStreamMap[streamInfo.streamID])
					} catch (error: any) {
						console.warn("【ZEGOCLOUD】startPlayingStream error:", error)
						// 未开通L3服务
						if (error?.errorCode === 110438) {
							this.coreErrorCallback(CoreError.notSupportStandardLive, error?.extendedData)
						}
					}
				}

				this.onRemoteMediaUpdateCallBack &&
					_streamList.length > 0 &&
					this.onRemoteMediaUpdateCallBack("ADD", _streamList)
			}

			if (_waitingHandlerStreams.delete.length > 0) {
				_streamList = []
				for (let i = 0; i < _waitingHandlerStreams.delete.length; i++) {
					const streamInfo = _waitingHandlerStreams.delete[i]
					this.remoteStreamMap[streamInfo.streamID] &&
						_streamList.push(this.remoteStreamMap[streamInfo.streamID])
					await this.zum.stopPullStream(streamInfo.user.userID, streamInfo.streamID)
					delete this.remoteStreamMap[streamInfo.streamID]
				}
				this.onRemoteMediaUpdateCallBack &&
					_streamList.length > 0 &&
					this.onRemoteMediaUpdateCallBack("DELETE", _streamList)
			}

			if (this.zegoSuperBoardView !== undefined) {
				this.subscribeWhiteBoardCallBack(this.zegoSuperBoardView)
				this.zegoSuperBoardView = undefined
			}
			// const nextWaitingHandlerStreams = {
			//   add: [...this.waitingHandlerStreams.add],
			//   delete: [...this.waitingHandlerStreams.delete],
			// };
			const nextWaitingHandlerStreams = {
				add: this.waitingHandlerStreams.add.filter((realTime_item) => {
					if (
						_waitingHandlerStreams.add.some(
							(handing_item) => handing_item.streamID === realTime_item.streamID
						)
					) {
						return false
					} else {
						return true
					}
				}),
				delete: this.waitingHandlerStreams.delete.filter((realTime_item) => {
					if (
						_waitingHandlerStreams.delete.some(
							(handing_item) => handing_item.streamID === realTime_item.streamID
						)
					) {
						return false
					} else {
						return true
					}
				}),
			}
			this.setMixUser()
			this.waitingHandlerStreams = nextWaitingHandlerStreams
			setTimeout(() => {
				this.streamUpdateTimer(this.waitingHandlerStreams)
			}, 700)
		} else if (this._currentPage === "BrowserCheckPage" || this._currentPage === "RejoinRoom") {
			setTimeout(() => {
				this.streamUpdateTimer(_waitingHandlerStreams)
			}, 1000)
		}
	}

	publishLocalStream(
		media: ZegoLocalStream,
		streamType?: "main" | "media" | "screensharing",
		extraInfo?: string
	): boolean | string {
		if (!media) return false
		const streamID = generateStreamID(this._expressConfig.userID, this._expressConfig.roomID, streamType)
		if (streamType === "main") {
			this.localStreamInfo.streamID = streamID
		}
		if (streamType === "screensharing") {
			this.localScreensharingStreamInfo.streamID = streamID
		}
		let publishOption
		if (extraInfo) {
			publishOption = {
				extraInfo,
				trafficControlFocusOnMode: 1,
			}
		}
		const res = ZegoCloudRTCCore._zg.startPublishingStream(streamID, media, {
			...publishOption,
			...{ videoCodec: this._config.videoCodec, enableAutoSwitchVideoCodec: true },
		})
		if (res) {
			console.warn(`[ZegoCloudRTCCore]startPublishingStream success, time: ${new Date().getTime()}, streamID: ${streamID}`)
		}
		return res && streamID
	}

	async replaceTrack(media: MediaStream | ZegoLocalStream, mediaStreamTrack: MediaStreamTrack): Promise<ZegoServerResponse> {
		return ZegoCloudRTCCore._zg.replaceTrack(media as any, mediaStreamTrack)
	}

	private subscribeUserListCallBack!: (userList: ZegoCloudUserList) => void
	subscribeUserList(callback: (userList: ZegoCloudUserList) => void): void {
		this.subscribeUserListCallBack = callback
	}

	private subscribeScreenStreamCallBack!: (userList: ZegoCloudUserList) => void
	subscribeScreenStream(callback: (userList: ZegoCloudUserList) => void): void {
		this.subscribeScreenStreamCallBack = callback
	}

	subscribeWhiteBoardCallBack!: (zegoSuperBoardView: ZegoSuperBoardView | null) => void
	subscribeWhiteBoard(callback: (zegoSuperBoardView: ZegoSuperBoardView | null) => void) {
		this.subscribeWhiteBoardCallBack = callback
	}
	private onRemoteMediaUpdateCallBack: (
		updateType: "DELETE" | "ADD" | "UPDATE",
		streamList: ZegoCloudRemoteMedia[]
	) => void = async (updateType: "DELETE" | "ADD" | "UPDATE", streamList: ZegoCloudRemoteMedia[]) => {
		await this.zum.mainStreamUpdate(updateType, streamList)
		await this.zum.screenStreamUpdate(updateType, streamList)
		this.throttleStartAndUpdateMixinTask()
		this.subscribeUserListCallBack && this.subscribeUserListCallBack([...this.zum.remoteUserList])
		this.subscribeScreenStreamCallBack && this.subscribeScreenStreamCallBack([...this.zum.remoteScreenStreamList])
	}
	private onNetworkStatusQualityCallBack!: (roomID: string, level: number) => void
	onNetworkStatusQuality(func: (roomID: string, level: number) => void) {
		this.onNetworkStatusQualityCallBack = func
	}

	private onRemoteUserUpdateCallBack!: (roomID: string, updateType: "DELETE" | "ADD", user: ZegoUser[]) => void
	onRemoteUserUpdate(
		func: (roomID: string, updateType: "DELETE" | "ADD", user: ZegoUser[], allUser: ZegoUser[]) => void
	) {
		this.onRemoteUserUpdateCallBack = async (roomID: string, updateType: "DELETE" | "ADD", users: ZegoUser[]) => {
			if (this._currentPage === "BrowserCheckPage" || this._currentPage === "RejoinRoom") {
				setTimeout(() => {
					this.onRemoteUserUpdateCallBack(roomID, updateType, users)
				}, 1000)
			} else if (this._currentPage === "Room") {
				// 本地数据管理
				await this.zum.userUpdate(roomID, updateType, users)
				// 人员进出通知
				func(roomID, updateType, users, this.zum.remoteUserList)
				// 用户监听回调
				const newUserList = users.map((user) => {
					user.setUserAvatar = (avatar: string) => {
						if (avatar && typeof avatar === "string") {
							this.zum.updateUserInfo(user.userID, "avatar", avatar)
						}
					}
					return user
				})
				if (updateType === "ADD") {
					this._config.onUserAvatarSetter && this._config.onUserAvatarSetter(newUserList)
					this._config.onUserJoin && this._config.onUserJoin(users)
				} else {
					this._config.onUserLeave && this._config.onUserLeave(users)
				}

				// 页面渲染
				setTimeout(() => {
					console.warn(
						"【ZEGOCLOUD】roomUserUpdate",
						[...this.zum.remoteUserList],
						[...this.zum.remoteUserList].length
					)
					this.subscribeUserListCallBack && this.subscribeUserListCallBack([...this.zum.remoteUserList])
				}, 0)
			}
		}
	}
	private onSoundLevelUpdateCallBack!: (soundLevelList: ZegoSoundLevelInfo[]) => void
	onSoundLevelUpdate(func: (soundLevelList: ZegoSoundLevelInfo[]) => void) {
		this.onSoundLevelUpdateCallBack = func
	}

	private onRoomLiveStateUpdateCallBack!: (live: "1" | "0") => void
	onRoomLiveStateUpdate(func: (live: "1" | "0") => void) {
		this.onRoomLiveStateUpdateCallBack = func
	}
	private onRoomMixingStateUpdateCallBack!: (isMixing: "1" | "0") => void
	onRoomMixingStateUpdate(func: (isMixing: "1" | "0") => void) {
		this.onRoomMixingStateUpdateCallBack = func
	}
	sendRoomMessage(message: string) {
		return ZegoCloudRTCCore._zg.sendBroadcastMessage(ZegoCloudRTCCore._instance._expressConfig.roomID, message)
	}
	private onRoomMessageUpdateCallBack!: (roomID: string, info: ZegoBroadcastMessageInfo[]) => void
	onRoomMessageUpdate(func: (roomID: string, info: ZegoBroadcastMessageInfo[]) => void) {
		this.onRoomMessageUpdateCallBack = func
	}

	private onScreenSharingEndedCallBack!: (stream: MediaStream) => void
	onScreenSharingEnded(func: (stream: MediaStream) => void) {
		this.onScreenSharingEndedCallBack = func
	}

	private onNetworkStatusCallBack!: (
		roomID: string,
		type: "ROOM" | "STREAM",
		status: "DISCONNECTED" | "CONNECTING" | "CONNECTED"
	) => void
	onNetworkStatus(
		func: (roomID: string, type: "ROOM" | "STREAM", status: "DISCONNECTED" | "CONNECTING" | "CONNECTED") => void
	) {
		this.onNetworkStatusCallBack = (
			roomID: string,
			type: "ROOM" | "STREAM",
			status: "DISCONNECTED" | "CONNECTING" | "CONNECTED"
		) => {
			if (status === "CONNECTING") {
				!this.NetworkStatusTimer &&
					(this.NetworkStatusTimer = setTimeout(() => {
						func(roomID, type, "DISCONNECTED")
					}, 60000))
			} else {
				if (this.NetworkStatusTimer) {
					clearTimeout(this.NetworkStatusTimer)
					this.NetworkStatusTimer = null
				}
			}
			func(roomID, type, status)
		}
	}
	private streamExtraInfoUpdateCallBack(streamList: { streamID: string; user: ZegoUser; extraInfo: string }[]): void {
		// 流附加消息解析
		streamList.forEach((stream) => {
			const extraInfo = JSON.parse(stream.extraInfo)
			console.warn("extraInfo", extraInfo)
			if (extraInfo.isCameraOn !== undefined) {
				this.zum.updateStreamInfo(
					stream.user.userID,
					stream.streamID,
					"cameraStatus",
					extraInfo.isCameraOn ? "OPEN" : "MUTE"
				)
			}
			if (extraInfo.isMicrophoneOn !== undefined) {
				this.zum.updateStreamInfo(
					stream.user.userID,
					stream.streamID,
					"micStatus",
					extraInfo.isMicrophoneOn ? "OPEN" : "MUTE"
				)
			}
			extraInfo.hasVideo !== undefined &&
				this.zum.updateStreamInfo(stream.user.userID, stream.streamID, "hasVideo", !!extraInfo.hasVideo)
			extraInfo.hasAudio !== undefined &&
				this.zum.updateStreamInfo(stream.user.userID, stream.streamID, "hasAudio", !!extraInfo.hasAudio)
		})
		this.subscribeUserListCallBack && this.subscribeUserListCallBack([...this.zum.remoteUserList])
		this.subscribeScreenStreamCallBack && this.subscribeScreenStreamCallBack([...this.zum.remoteScreenStreamList])
	}
	// 往UI层抛出需要展示提示的错误
	private coreErrorCallback!: (errCode: number, errMsg: string) => void
	onCoreError(func: (errCode: number, errMsg: string) => void) {
		this.coreErrorCallback = func
	}
	leaveRoom(): void {
		if (!this.status.loginRsp) return
		ZegoCloudRTCCore._zg.off("streamExtraInfoUpdate")
		ZegoCloudRTCCore._zg.off("roomExtraInfoUpdate")
		ZegoCloudRTCCore._zg.off("roomStreamUpdate")
		ZegoCloudRTCCore._zg.off("remoteCameraStatusUpdate")
		ZegoCloudRTCCore._zg.off("remoteMicStatusUpdate")
		ZegoCloudRTCCore._zg.off("playerStateUpdate")
		ZegoCloudRTCCore._zg.off("roomUserUpdate")
		ZegoCloudRTCCore._zg.off("IMRecvBroadcastMessage")
		ZegoCloudRTCCore._zg.off("roomStateUpdate")
		ZegoCloudRTCCore._zg.off("publisherStateUpdate")
		ZegoCloudRTCCore._zg.off("publishQualityUpdate")
		ZegoCloudRTCCore._zg.off("soundLevelUpdate")
		ZegoCloudRTCCore._zg.off("screenSharingEnded")
		ZegoCloudRTCCore._zg.off("IMRecvCustomCommand")
		ZegoCloudRTCCore._zg.off("publisherVideoEncoderChanged")

		ZegoCloudRTCCore._zg.setSoundLevelDelegate(false)
		this.onNetworkStatusCallBack = () => { }
		this.onRemoteMediaUpdateCallBack = async (
			updateType: "DELETE" | "ADD" | "UPDATE",
			streamList: ZegoCloudRemoteMedia[]
		) => {
			await this.zum.mainStreamUpdate(updateType, streamList)
			await this.zum.screenStreamUpdate(updateType, streamList)
			this.throttleStartAndUpdateMixinTask()
			this.subscribeUserListCallBack && this.subscribeUserListCallBack([...this.zum.remoteUserList])
			this.subscribeScreenStreamCallBack &&
				this.subscribeScreenStreamCallBack([...this.zum.remoteScreenStreamList])
		}
		this.onRemoteUserUpdateCallBack = () => { }
		this.onRoomMessageUpdateCallBack = () => { }
		this.onRoomLiveStateUpdateCallBack = () => { }
		this.subscribeUserListCallBack = () => { }
		this.zum.reset()
		this.localStreamInfo = {
			streamID: "",
			micStatus: "OPEN",
			cameraStatus: "OPEN",
		}
		this.localScreensharingStreamInfo = {
			streamID: "",
			micStatus: "OPEN",
			cameraStatus: "OPEN",
		}
		// TODO
		// this.startAndUpdateMixinTask();
		for (let key in this.remoteStreamMap) {
			ZegoCloudRTCCore._zg.stopPlayingStream(key)
		}
		this.remoteStreamMap = {}
		this.clearMixUser()

		this.waitingHandlerStreams = { add: [], delete: [] }
		if (this.isHost()) {
			// host离开房间，清除房间属性host
			const setRoomExtraInfo = {
				...this._roomExtraInfo,
				...{
					host: "",
				},
			}
			ZegoCloudRTCCore._zg.setRoomExtraInfo(
				ZegoCloudRTCCore._instance._expressConfig.roomID,
				"extra_info",
				JSON.stringify(setRoomExtraInfo)
			)
			this._roomExtraInfo = setRoomExtraInfo
		}
		this.hasPublishedStream = false

		this._zimManager?.leaveRoom()
		this.status.loginRsp = false
		setTimeout(() => {
			try {
				ZegoCloudRTCCore._zg.logoutRoom();
				const span = TracerConnect.createSpan(SpanEvent.LogoutRoom, {
					room_id: this._expressConfig.roomID,
					error: 0
				})
				span.end();
			} catch (error) {
				const span = TracerConnect.createSpan(SpanEvent.LogoutRoom, {
					room_id: this._expressConfig.roomID,
					error: -1,
					message: error,
				})
				span.end();
			}
		}, 300)
	}
	setStreamExtraInfo(streamID: string, extraInfo: string): Promise<ZegoServerResponse> {
		return ZegoCloudRTCCore._zg.setStreamExtraInfo(streamID, extraInfo)
	}
	private initZIM(ZIM: ZIM) {
		if (this._zimManager) return
		this._zimManager = new ZimManager(ZIM, this._expressConfig)
		// 更新roomID
		this._zimManager.onUpdateRoomID((roomID: string) => {
			this._expressConfig.roomID = roomID
		})
	}
	//   发送房间自定义消息
	async sendInRoomCommand(message: string, userIDs: string[]): Promise<boolean> {
		const res = await ZegoCloudRTCCore._zg.sendCustomCommand(
			this._expressConfig.roomID,
			message,
			this.zum.remoteUserList.length > 500 ? [] : userIDs
		)
		if (res.errorCode === 0) {
			return true
		} else {
			console.error("【ZEGOCLOUD】sendInRoomCommand error:", res.errorCode)
			return false
		}
	}
	// 踢人
	removeMember(userID: string) {
		this.sendInRoomCommand(JSON.stringify({ zego_remove_user: [userID] }), [userID])
	}
	//关闭摄像头麦克风
	async turnRemoteCameraOff(userID: string): Promise<boolean> {
		return await this.sendInRoomCommand(JSON.stringify({ zego_turn_camera_off: userID }), [userID])
	}
	async turnRemoteMicrophoneOff(userID: string): Promise<boolean> {
		return await this.sendInRoomCommand(JSON.stringify({ zego_turn_microphone_off: userID }), [userID])
	}
	// 被移出房间回调
	private onKickedOutRoomCallback!: () => void
	onKickedOutRoom(func: () => void) {
		func && (this.onKickedOutRoomCallback = func)
	}
	// 控制设备开关状态
	private onChangeYourDeviceStatusCallback!: (
		type: "Camera" | "Microphone",
		status: "OPEN" | "CLOSE",
		fromUser: ZegoUser
	) => void
	onChangeYourDeviceStatus(
		func: (type: "Camera" | "Microphone", status: "OPEN" | "CLOSE", fromUser: ZegoUser) => void
	) {
		func && (this.onChangeYourDeviceStatusCallback = func)
	}
	private async startMixerTask(): Promise<ZegoServerResponse> {
		const { width, height, bitrate, frameRate } = getVideoResolution(
			this._config.scenario?.config?.videoMixingOutputResolution || "540p"
		)
		const inputList = this.getMixStreamInput(width, height)
		if (!inputList.length) return { errorCode: 1 }
		const config: ZegoMixStreamConfig = {
			taskID: `${this._expressConfig.roomID}__task`,
			inputList: this.getMixStreamInput(width, height),
			outputList: [
				`${this._expressConfig.roomID}__mix`,
				// `rtmp://publish-ws.coolxcloud.com/uikit/${this._expressConfig.roomID}_11__mix`,
			],
			outputConfig: {
				outputBitrate: bitrate,
				outputFPS: frameRate,
				outputWidth: width,
				outputHeight: height,
			},
		}
		console.warn("getMixStreamInput", config)
		try {
			return await ZegoCloudRTCCore._zg.startMixerTask(config)
		} catch (error) {
			console.error(error)
			return { errorCode: 1 }
		}
	}
	async stopMixerTask(isHost = false): Promise<ZegoServerResponse | undefined> {
		const taskID = `${this._expressConfig.roomID}__task`
		if ((this.isHost() || isHost) && this.roomExtraInfo.isMixing === "1") {
			// 停止混流，设置房间附加属性isMixing:0|1
			const setRoomExtraInfo = {
				...this.roomExtraInfo,
				...{
					isMixing: "0",
				},
			}
			await ZegoCloudRTCCore._zg.setRoomExtraInfo(
				ZegoCloudRTCCore._instance._expressConfig.roomID,
				"extra_info",
				JSON.stringify(setRoomExtraInfo)
			)
			this._roomExtraInfo = setRoomExtraInfo
			const res = await ZegoCloudRTCCore._zg.stopMixerTask(taskID)
			console.warn("stopMixerTask", res)
			return res
		}
	}
	async setMixerTaskConfig(config: ZegoMixStreamAdvance): Promise<ZegoServerResponse> {
		return await ZegoCloudRTCCore._zg.setMixerTaskConfig(config)
	}
	private getMixStreamInput(outWidth: number, outHeight: number): ZegoMixStreamInput[] {
		const hasScreensharing =
			this.zum.remoteScreenStreamList.length > 0 || this.localScreensharingStreamInfo.streamID
		const inputList: ZegoMixStreamInput[] = []
		let videoWidth = 0,
			videoHeight = 0,
			screensharingWidth: number,
			screensharingHeight: number
		// if((this._config.scenario?.config as ScenarioConfig[ScenarioModel.LiveStreaming])?.videoMixingLayout === VideoMixinLayoutType.AutoLayout) {
		// 自适应布局
		const streams = this.zum.remoteUserList
			.filter(
				(user) =>
					user.streamList[0]?.streamID &&
					(user.streamList[0]?.cameraStatus === "OPEN" || user.streamList[0]?.micStatus === "OPEN")
			)
			.map((u) => ({
				streamID: u.streamList[0].streamID,
				cameraStatus: u.streamList[0].cameraStatus,
				micStatus: u.streamList[0].micStatus,
				userName: u.userName,
			}))
		if (
			this.localStreamInfo.streamID &&
			(this.localStreamInfo.cameraStatus === "OPEN" || this.localStreamInfo.micStatus === "OPEN")
		) {
			streams.unshift({
				...this.localStreamInfo,
				userName: this._expressConfig.userName,
			})
		}
		let config: ZegoMixStreamInput
		if (hasScreensharing) {
			let maxVideo = 5
			videoHeight = Math.floor((outHeight - 16 * 2 - 4 * 10) / 5)
			videoWidth = Math.floor((videoHeight * 16) / 9)
			screensharingWidth = outWidth - 16 * 2 - 10 - videoWidth
			screensharingHeight = outHeight - 16 * 2
			if (streams.length > 0) {
				// screen sharing
				inputList.push({
					streamID:
						this.localScreensharingStreamInfo.streamID ||
						this.zum.remoteScreenStreamList[0].streamList[0].streamID,
					contentType: "VIDEO",
					layout: {
						top: 16,
						left: 16,
						bottom: screensharingHeight + 16,
						right: screensharingWidth + 16,
					},
					cornerRadius: 10,
					renderMode: 1,
				})
				// user streams
				streams.forEach((user) => {
					if (maxVideo > 0) {
						config = {
							streamID: user.streamID,
							contentType: "VIDEO",
							layout: {
								top: 16 + (5 - maxVideo) * (videoHeight + 10),
								left: screensharingWidth + 26,
								bottom: 16 + (5 - maxVideo) * (videoHeight + 10) + videoHeight,
								right: outWidth - 16,
							},
							label: {
								text: user.userName!,
								font: {
									size: 14,
									transparency: 0,
									color: 16777215,
									border: true,
									borderColor: 8421505,
								},
								left: 20,
								top: videoHeight - 24,
							},
							cornerRadius: 10,
							renderMode: 1,
						}

						inputList.push(config)
						maxVideo--
					} else {
						inputList.push({
							streamID: user.streamID,
							contentType: "AUDIO",
							layout: {
								top: 0,
								left: 0,
								bottom: 1,
								right: 1,
							},

							renderMode: 1,
						})
					}
				})
			} else {
				// 只有屏幕共享的情况
				inputList.push({
					streamID:
						this.localScreensharingStreamInfo.streamID ||
						this.zum.remoteScreenStreamList[0].streamList[0].streamID,
					contentType: "VIDEO",
					layout: {
						top: 16,
						left: 16,
						bottom: outHeight - 16,
						right: outWidth - 16,
					},
					cornerRadius: 10,
					renderMode: 1,
				})
			}
		} else {
			// 没有屏幕共享的情况
			let len = streams.length

			if (len === 1) {
				config = {
					streamID: streams[0].streamID,
					contentType: "VIDEO",
					layout: {
						top: 16,
						left: 16,
						bottom: outHeight - 16,
						right: outWidth - 16,
					},
					label: {
						text: streams[0].userName!,
						font: {
							size: 14,
							transparency: 0,
							color: 16777215,
							border: true,
							borderColor: 8421505,
						},
						left: 20,
						top: outHeight - 16 * 2 - 24,
					},
					cornerRadius: 10,
					renderMode: 1,
				}
				if (streams[0].cameraStatus === "MUTE") {
					config.imageInfo = {
						url: "https://resource.zegocloud.com/office/sdk_static/mixing_video_bg.jpg",
					}
				}
				inputList.push(config)
			} else if (len === 2) {
				videoWidth = Math.floor((outWidth - 16 * 2 - 10) / 2)
				streams.forEach((u, i) => {
					config = {
						streamID: u.streamID,
						contentType: "VIDEO",
						layout: {
							top: 16,
							left: 16 + (videoWidth + 10) * i,
							bottom: outHeight - 16,
							right: 16 + (videoWidth + 10) * i + videoWidth,
						},
						label: {
							text: u.userName!,
							font: {
								size: 14,
								transparency: 0,
								color: 16777215,
								border: true,
								borderColor: 8421505,
							},
							left: 20,
							top: outHeight - 16 * 2 - 24,
						},
						cornerRadius: 10,
						renderMode: 1,
					}
					if (u.cameraStatus === "MUTE") {
						config.imageInfo = {
							url: "https://resource.zegocloud.com/office/sdk_static/mixing_video_bg.jpg",
						}
					}
					inputList.push(config)
				})
			} else if (len === 3 || len === 4) {
				videoWidth = Math.floor((outWidth - 16 * 2 - 10) / 2)
				videoHeight = Math.floor((outHeight - 16 * 2 - 10) / 2)
				streams.forEach((u, i) => {
					config = {
						streamID: u.streamID,
						contentType: "VIDEO",
						layout: {
							top: i <= 1 ? 16 : 16 + 10 + videoHeight,
							left:
								len === 3
									? i < 2
										? 16 + (videoWidth + 10) * i
										: Math.floor((outWidth - videoWidth) / 2)
									: i % 2 === 0
										? 16
										: 16 + videoWidth + 10,
							bottom: i <= 1 ? 16 + videoHeight : outHeight - 16,
							right:
								len === 3 && i === 2
									? outWidth - Math.floor((outWidth - videoWidth) / 2)
									: i % 2 === 0
										? 16 + videoWidth
										: outWidth - 16,
						},
						label: {
							text: u.userName!,
							font: {
								size: 14,
								transparency: 0,
								color: 16777215,
								border: true,
								borderColor: 8421505,
							},
							left: 20,
							top: videoHeight - 24,
						},
						cornerRadius: 10,
						renderMode: 1,
					}
					if (u.cameraStatus === "MUTE") {
						config.imageInfo = {
							url: "https://resource.zegocloud.com/office/sdk_static/mixing_video_bg.jpg",
						}
					}
					inputList.push(config)
				})
			} else if (len === 5 || len === 6) {
				videoWidth = Math.floor((outWidth - 16 * 2 - 10 * 2) / 3)
				videoHeight = Math.floor((outHeight - 16 * 2 - 10) / 2)
				let lastRowPaddingLeft = len === 5 ? Math.floor((videoWidth + 10) / 2) : 0

				streams.forEach((u, i) => {
					const left =
						i <= 2 ? 16 + (videoWidth + 10) * i : 16 + lastRowPaddingLeft + (videoWidth + 10) * (i % 3)
					config = {
						streamID: u.streamID,
						contentType: "VIDEO",
						layout: {
							top: i <= 2 ? 16 : 16 + 10 + videoHeight,
							left: left,
							bottom: i <= 2 ? 16 + videoHeight : outHeight - 16,
							right: left + videoWidth,
						},
						label: {
							text: u.userName!,
							font: {
								size: 14,
								transparency: 0,
								color: 16777215,
								border: true,
								borderColor: 8421505,
							},
							left: 20,
							top: videoHeight - 16,
						},
						cornerRadius: 10,
						renderMode: 1,
					}
					if (u.cameraStatus === "MUTE") {
						config.imageInfo = {
							url: "https://resource.zegocloud.com/office/sdk_static/mixing_video_bg.jpg",
						}
					}
					inputList.push(config)
				})
			} else {
				videoWidth = Math.floor((outWidth - 16 * 2 - 10 * 2) / 3)
				videoHeight = Math.floor((outHeight - 16 * 2 - 10 * 2) / 3)
				let lastRowPaddingLeft = 0
				if (len === 7) {
					lastRowPaddingLeft = videoWidth + 10
				}
				if (len === 8) {
					lastRowPaddingLeft = Math.floor((videoWidth + 10) / 2)
				}
				streams.forEach((u, i) => {
					if (i < 9) {
						const left =
							i < 6
								? 16 + (videoWidth + 10) * (i % 3)
								: 16 + lastRowPaddingLeft + (videoWidth + 10) * (i % 3)
						config = {
							streamID: u.streamID,
							contentType: "VIDEO",
							layout: {
								top: 16 + (videoHeight + 10) * Math.floor(i / 3),
								left: left,
								bottom: 16 + (videoHeight + 10) * Math.floor(i / 3) + videoHeight,
								right: left + videoWidth,
							},
							label: {
								text: u.userName!,
								font: {
									size: 14,
									transparency: 0,
									color: 16777215,
									border: true,
									borderColor: 8421505,
								},
								left: 20,
								top: videoHeight - 16,
							},
							cornerRadius: 10,
							renderMode: 1,
						}
						if (u.cameraStatus === "MUTE") {
							config.imageInfo = {
								url: "https://resource.zegocloud.com/office/sdk_static/mixing_video_bg.jpg",
							}
						}
						inputList.push(config)
					} else {
						inputList.push({
							streamID: u.streamID,
							contentType: "AUDIO",
							layout: {
								top: 0,
								left: 0,
								bottom: 1,
								right: 1,
							},
							renderMode: 1,
						})
					}
				})
			}
		}

		// }
		return inputList
	}
	async startAndUpdateMixinTask(isHost = false) {
		// 多主播情况下，非房间属性主播开启直播，也需要开始混流
		if (!this.isHost() && !isHost) return
		if (!(this._config.scenario?.config?.enableVideoMixing && this.roomExtraInfo.live_status === "1")) return

		const res = await this.startMixerTask()
		console.warn("startMixerTask", res)
		if (res?.errorCode !== 0) return
		if (this.roomExtraInfo.isMixing !== "1") {
			//第一次混流，需要设置房间附加属性isMixing:0|1
			const setRoomExtraInfo = {
				...this.roomExtraInfo,
				...{
					isMixing: "1",
				},
			}
			ZegoCloudRTCCore._zg.setRoomExtraInfo(
				ZegoCloudRTCCore._instance._expressConfig.roomID,
				"extra_info",
				JSON.stringify(setRoomExtraInfo)
			)
			this._roomExtraInfo = setRoomExtraInfo
		}
	}
	throttleStartAndUpdateMixinTask = throttle(this.startAndUpdateMixinTask, 1200)
	//   设置混流用户数据用于渲染
	async setMixUser() {
		if (this.mixUser?.streamList?.length > 0) return
		if (
			this._config.scenario?.mode === ScenarioModel.LiveStreaming &&
			(this._config.scenario.config as any).liveStreamingMode === LiveStreamingMode.LiveStreaming &&
			!this.mixStreamDomain
		)
			return
		if (this.roomExtraInfo.live_status !== "1") return
		if (!this._config.scenario?.config?.enableVideoMixing) return
		if (this._config.scenario.config.role !== LiveRole.Audience) return

		let stream: ZegoCloudRemoteMedia = {
			media: undefined,
			fromUser: {
				userID: this.roomExtraInfo.host,
			},
			micStatus: "OPEN",
			cameraStatus: "OPEN",
			//   hasVideo: false, //为了一开始能播放纯音频
			state: "PLAYING",
			streamID: `${this._expressConfig.roomID}__mix`,
		}
		if (this._config.scenario.config.liveStreamingMode === LiveStreamingMode.LiveStreaming) {
			// CDN
			stream.urlsHttpsFLV = `${this.mixStreamDomain}${stream.streamID}.flv`
			stream.urlsHttpsHLS = `${this.mixStreamDomain}${stream.streamID}.m3u8`
		} else {
			// RTC, L3
			try {
				const media = await this.zum.startPullStream(this.roomExtraInfo.host, stream.streamID)
				if (media) {
					stream.media = media
				} else {
					stream = null as any
				}
			} catch (error) {
				console.error("startPullStream", error)
			}
		}
		this.mixUser = {
			pin: false,
			userID: this.roomExtraInfo.host,
			userName: "",
			streamList: [],
		}
		stream && this.mixUser.streamList.push(stream)
	}
	//   停止拉混流，Cohost变成 Audience，或离开房间时
	clearMixUser() {
		if (!this.mixUser?.streamList?.length) return
		if (this._config.scenario?.config?.liveStreamingMode !== LiveStreamingMode.LiveStreaming) {
			ZegoCloudRTCCore._zg.stopPlayingStream(this.mixUser.streamList[0].streamID)
		}
		this.mixUser.streamList = []
	}

	// 更新通话中邀请用户配置
	updateCallingInvitationListConfig(config: CallingInvitationListConfig) {
		this._config.callingInvitationListConfig = {
			...this._config.callingInvitationListConfig || {},
			...config,
		}
	}

	// 创建媒体流播放组件
	createRemoteStreamView(remoteStream: MediaStream): ZegoStreamView {
		return ZegoCloudRTCCore._zg.createRemoteStreamView(remoteStream);
	}

	setScreenLayout(type: boolean) {
		this.isScreenPortrait = type;
	}
	// h5下切换横屏布局
	rotateToLandscape() {
		const roomDom = document.querySelector('.ZegoRoomMobile_ZegoRoom') as HTMLDivElement;
		if (!roomDom) {
			console.error("【ZEGOCLOUD】 please join Room !!");
			return;
		}
		const width = roomDom?.clientWidth;
		const height = roomDom?.clientHeight;
		if (this.isScreenPortrait) {
			// 手机竖屏时点击旋转成横屏
			const style = document.createElement('style');
			style.innerHTML = `.transform {
         		width: ${height}px;
          		height: ${width}px;
          		transform: rotate(90deg) translate(${(height - width) / 2}px, ${(height - width) / 2}px);
        	}`
			document.head.appendChild(style);
			roomDom?.classList.add('transform');
		} else {
			// 手机横屏时点击旋转成横屏
			roomDom.classList.remove('transform');
		}
		this._config.onScreenRotation && this._config.onScreenRotation('landscape');
	}
	// h5下切换竖屏布局
	rotateToPortrait() {
		const roomDom = document.querySelector('.ZegoRoomMobile_ZegoRoom') as HTMLDivElement;
		if (!roomDom) {
			console.error("【ZEGOCLOUD】 please join Room !!");
			return;
		}
		const width = roomDom?.clientWidth;
		const height = roomDom?.clientHeight;

		if (this.isScreenPortrait) {
			// 手机竖屏时候点击旋转成竖屏
			roomDom.classList.remove('transform');
		} else {
			// 手机横屏时候点击旋转成竖屏
			const style = document.createElement('style');
			style.innerHTML = `.transform {
            	width: ${height}px;
            	height: ${width}px;
            	transform: rotate(-90deg) translate(${(width - height) / 2}px, ${(width - height) / 2}px);
          	}`
			document.head.appendChild(style);
			roomDom.classList.add('transform');
		}
		this._config.onScreenRotation && this._config.onScreenRotation('portrait');
	}

	// 刷新token
	renewToken(kitToken: string): boolean {
		console.warn('[ZegoCloudRTCCore]renewToken');
		const config = getConfig(kitToken);
		let result: boolean = false;
		this._zimManager?._zim?.renewToken(config!.token)
			.then((res) => {
				if (this._expressConfig.token) {
					this._expressConfig.token = config?.token!;
				}
				console.warn('[ZegoCloudRTCCore]renewToken zim success11111', res)
				if (this.status.loginRsp) {
					const rtcRes = ZegoCloudRTCCore._zg.renewToken(config!.token)
					console.warn('[ZegoCloudRTCCore]renewToken rtc success', rtcRes)
					result = rtcRes;
				} else {
					result = true;
				}
			})
			.catch((error) => {
				console.warn('[ZegoCloudRTCCore]renewToken zim error', error)
				result = false
			});
		return result;
	}

	// 关闭背景虚化及虚拟背景
	async closeBackgroundProcess() {
		if (this.localStream) {
			try {
				const res = await ZegoCloudRTCCore._zg.enableBackgroundProcess(this.localStream, false, 0);
				if (res.errorCode === 0) {
					ZegoCloudRTCCore._instance.BackgroundProcessConfig!.enabled = false;
				}
				return res;
			} catch (error: ZegoServerResponse | any) {
				console.log('[ZegoCloudRTCCore]closeBackgroundProcess error', error);
				return error;
			}
		} else {
			console.warn('[ZegoCloudRTCCore]closeBackgroundProcess localStream is null');
			return { errorCode: -1, extendedData: 'localStream is null' };
		}
	}

	// 开启背景虚化及虚拟背景
	async openBackgroundProcess(): Promise<ZegoServerResponse> {
		if (this.localStream) {
			try {
				const res = await ZegoCloudRTCCore._zg.enableBackgroundProcess(this.localStream, true, 0);
				console.log('[ZegoCloudRTCCore]openBackgroundProcess', res);
				if (res.errorCode === 0) {
					ZegoCloudRTCCore._instance.BackgroundProcessConfig!.enabled = true;
				}
				return res;
			} catch (error: ZegoServerResponse | any) {
				console.warn('[ZegoCloudRTCCore]openBackgroundProcess error', error);
				return error;
			}
		} else {
			console.warn('[ZegoCloudRTCCore]openBackgroundProcess localStream is null');
			return { errorCode: -1, extendedData: 'localStream is null' };
		}
	}
}
