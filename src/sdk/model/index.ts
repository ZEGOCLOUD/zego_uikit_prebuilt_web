import { ZegoSuperBoardView } from "zego-superboard-web"
import type { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity"
import { ZegoCloudRTCCore } from "../modules"
import { ZegoCloudUser, ZegoCloudUserList } from "../modules/tools/UserListManager"
import ZegoLocalStream from "zego-express-engine-webrtc/sdk/code/zh/ZegoLocalStream.web"
import { AiDenoiseMode } from "zego-express-engine-webrtc/sdk/code/zh/ZegoVoiceChangerEntity.web"
import { ZegoStreamView } from "zego-express-engine-webrtc/sdk/code/zh/ZegoStreamView.web"
export interface ZegoCloudRemoteMedia {
	media: ZegoLocalStream | MediaStream | undefined
	fromUser: ZegoUser
	micStatus: "OPEN" | "MUTE"
	cameraStatus: "OPEN" | "MUTE"
	state: "NO_PLAY" | "PLAY_REQUESTING" | "PLAYING"
	streamID: string
	// 新增 CDN 拉流地址
	urlsHttpsFLV?: string
	urlsHttpsHLS?: string
	hasAudio?: boolean
	hasVideo?: boolean
	view?: ZegoStreamView
}

export interface ZegoUIKitCreateConfig {
	cloudProxyConfig?: { proxyList: { hostName: string, port?: number }[] },
	AiDenoiseConfig?: { mode: AiDenoiseMode },
	BackgroundProcessConfig?: {
		blurDegree?: 1 | 2 | 3,
		source?: HTMLImageElement,
		objectFit?: 'fill' | 'contain' | 'cover',
	}
}

export enum LiveRole {
	Host = "Host",
	Cohost = "Cohost",
	Audience = "Audience",
}

export enum ScenarioModel {
	OneONoneCall = "OneONoneCall",
	GroupCall = "GroupCall",
	VideoConference = "VideoConference",
	LiveStreaming = "LiveStreaming",
}
export enum VideoResolution {
	_180P = "180p",
	_360P = "360p",
	_480P = "480p",
	_720P = "720p",
}
export enum ScreenSharingResolution {
	_360P = "360p",
	_480P = "480p",
	_720P = "720p",
	_1080P = "1080p",
	_2K = "2k",
	_4K = "4k",
	Auto = "auto",
	Custom = "custom",
}

export interface ScenarioConfig {
	role: LiveRole
	liveStreamingMode?: LiveStreamingMode
	enableVideoMixing?: boolean // 是否混流
	videoMixingLayout?: VideoMixinLayoutType // 混流布局
	videoMixingOutputResolution?: VideoMixinOutputResolution // 混流输出分辨率
}
export enum LiveStreamingMode {
	/**
	 * @Deprecated  StanderLive will be removed, please use LiveStreaming instead
	 */
	StanderLive = "LiveStreaming",
	/**
	 * @Deprecated  PremiumLive will be removed, please use InteractiveLiveStreaming instead
	 */
	PremiumLive = "InteractiveLiveStreaming",
	LiveStreaming = "LiveStreaming", // CDN
	InteractiveLiveStreaming = "InteractiveLiveStreaming", // L3
	RealTimeLive = "RealTimeLive", //RTC
}
export enum VideoMixinLayoutType {
	AutoLayout = 0, // 自适应布局
	GridLayout, //平分布局
	HorizontalLayout, // 水平布局
	VerticalLayout, // 垂直布局
}
export enum VideoMixinOutputResolution {
	_180P = "180p",
	_360P = "360p",
	_540P = "540p",
	_720P = "720p",
	_1080P = "1080p",
}

export enum ConsoleLevel {
	Debug = "Debug",
	Info = "Info",
	Warning = "Warning",
	Error = "Error",
	None = "None",
}

export interface CallingInvitationListConfig {
	waitingSelectUsers: ZegoUser[]; // 等待选择的成员列表
	defaultChecked?: boolean; // 是否默认选中， 默认true
}

export interface ZegoCloudRoomConfig {
	container?: HTMLElement | undefined | null // 挂载容器
	preJoinViewConfig?: {
		title?: string // 标题设置，默认enter Room
		invitationLink?: string
	}
	showPreJoinView?: boolean // 是否显示预览检测页面，默认显示
	turnOnMicrophoneWhenJoining?: boolean // 是否开启自己的麦克风,默认开启
	turnOnCameraWhenJoining?: boolean // 是否开启自己的摄像头 ,默认开启
	showMyCameraToggleButton?: boolean // 是否显示控制自己的摄像头按钮,默认显示
	showMyMicrophoneToggleButton?: boolean // 是否显示控制自己麦克风按钮,默认显示
	showAudioVideoSettingsButton?: boolean // 是否显示音视频设置按钮,默认显示

	showTextChat?: boolean // 是否开启聊天，默认开启
	showUserList?: boolean // 是否显示成员列表，默认显示
	lowerLeftNotification?: {
		showUserJoinAndLeave?: boolean //是否显示成员进出，默认不显示
		showTextChat?: boolean // 是否显示未读消息，默认不显示
	}
	branding?: {
		logoURL?: string // 通话页面Logo
	}
	showLeavingView?: boolean // 离开房间后页面，默认有

	maxUsers?: number // 房间人数2～20，默认2
	layout?: "Sidebar" | "Grid" | "Auto" // 默认Default

	showNonVideoUser?: boolean // 是否显示无视频用户，默认显示
	showOnlyAudioUser?: boolean // 是否显示纯音频用户，默认显示

	useFrontFacingCamera?: boolean
	onJoinRoom?: () => void // 用户进入通话页面回调
	onLeaveRoom?: () => void // 用户退出通话页面回调
	onUserJoin?: (user: ZegoUser[]) => void // 其他用户进入回调
	onUserLeave?: (user: ZegoUser[]) => void // 其他用户退入回调
	sharedLinks?: { name?: string; url?: string }[] // 产品链接描述
	showScreenSharingButton?: boolean // 是否显示屏幕共享按钮
	scenario?: {
		mode?: ScenarioModel // 场景选择
		// config?: ScenarioConfig[ScenarioModel]; // 对应场景专有配置
		config?: ScenarioConfig // 对应场景专有配置
	}
	showLayoutButton?: boolean // 是否显示布局切换按钮
	showPinButton?: boolean // 是否显示 pin 按钮，默认false
	onUserAvatarSetter?: (user: ZegoUser[]) => void //是否可以设置用户头像回调
	videoResolutionList?: VideoResolution[] // 视频分辨率列表（默认使用第一个）
	videoResolutionDefault?: VideoResolution // 默认视频分辨率
	onLiveStart?: (user: ZegoUser) => void //直播开始回调
	onLiveEnd?: (user: ZegoUser) => void //直播结束回调
	/**
	 * @deprecated facingMode will be removed
	 * */
	facingMode?: "user" | "environment" // 前置摄像头模式
	/**
	 * @deprecated joinRoomCallback will be removed
	 * */
	joinRoomCallback?: () => void // 加入房间成功回调
	/**
	 * @deprecated leaveRoomCallback will be removed
	 * */
	leaveRoomCallback?: () => void // 退出房间回调
	/**
	 * @deprecated userUpdateCallback will be removed
	 * */
	userUpdateCallback?: (updateType: "DELETE" | "ADD", userList: ZegoUser[]) => void // 用户新增/退出 回调

	whiteboardConfig?: {
		showAddImageButton?: boolean //  默认false， 开通文件共享功能，并引入插件，后才会生效； 否则使用会错误提示：“ Failed to add image, this feature is not supported.”
		showCreateAndCloseButton?: boolean
	}
	autoLeaveRoomWhenOnlySelfInRoom?: boolean // 当房间内只剩一个人的时候，自动退出房间
	console?: ConsoleLevel
	//  1.7.0版本新增
	showRoomTimer?: Boolean // 是否展示计时器，默认false，
	showTurnOffRemoteCameraButton?: Boolean // 是否显示关闭远端摄像头按钮，默认false
	showTurnOffRemoteMicrophoneButton?: Boolean // 是否显示关闭远端麦克风按钮，默认false
	showRemoveUserButton?: Boolean // 是否显示移出成员按钮， 默认false
	onYouRemovedFromRoom?: () => void // 自己被移出房间回调
	videoCodec?: "H264" | "VP8" // 视频编解码器
	//   1.7.3
	showRoomDetailsButton?: boolean // 是否显示RoomDetail，默认true
	onInRoomMessageReceived?: (messageInfo: InRoomMessageInfo) => void
	onInRoomCommandReceived?: (fromUser: ZegoUser, command: string) => void // 房间自定义消息回调
	onInRoomTextMessageReceived?: (messages: ZegoSignalingInRoomTextMessage[]) => void // zim房间文本消息回调
	//   1.8.0
	showInviteToCohostButton?: boolean // 主播是否展示邀请观众连麦按钮，默认false
	showRemoveCohostButton?: boolean // 主播是否展示移下麦按钮，默认false
	showRequestToCohostButton?: boolean // 观众是否展示申请连麦按钮，默认false
	rightPanelExpandedType?: RightPanelExpandedType // 右侧面板展开状态
	enableStereo?: boolean // 是否开启双声道
	autoHideFooter?: boolean // 是否自动隐藏底部工具栏，默认true
	// 1.8.11
	enableUserSearch?: boolean // 是否开启用户搜索, 默认false
	// 1.9.0
	onInRoomCustomCommandReceived?: (command: ZegoSignalingInRoomCommandMessage[]) => void // 收到 zim 房间自定义消息回调
	// 1.10.0
	showLeaveRoomConfirmDialog?: boolean // default true
	screenSharingConfig?: {
		resolution?: ScreenSharingResolution
		width?: number
		height?: number
		frameRate?: number
		maxBitRate?: number
		// 2.2.0
		onError?: (errorCode: number) => string | undefined // custom screen sharing failure pop-up text or pop-up
	}
	// 1.11.0
	onReturnToHomeScreenClicked?: () => void //
	// 1.12.0
	addInRoomMessageAttributes?: () => any //  add in room message message attribute. return custom message attribute.
	customMessageUI?: (msg: InRoomMessageInfo) => HTMLElement
	// 2.1.0
	language?: ZegoUIKitLanguage
	// 2.2.0
	leaveRoomDialogConfig?: {
		titleText?: string, // custom leave room confrim dialog title
		descriptionText?: string, // // custom leave room confrim dialog desctiption
		// 2.9.0
		confirmCallback?: () => void, // custom leave room confirm callback
	},
	// 2.7.0
	showMoreButton?: boolean; // 是否显示更多按钮，默认true
	showUserName?: boolean; // 是否显示用户名称，默认true
	hideUsersById?: string[]; // 隐藏指定用户id对应的画面
	videoViewConfig?: {
		userID?: string; // 用户ID
		showAvatarWhenCameraOff?: boolean; // 摄像头关闭时是否显示用户头像，默认true
	}[];
	backgroundUrl?: string; // 背景图
	// 2.8.0
	liveNotStartedTextForAudience?: string; // 自定义观众端直播开始前展示的文本
	startLiveButtonText?: string; // 自定义开始直播按钮文本
	// 2.11.0
	// 通话中邀请用户时，邀请用户窗口将出现在邀请方，如果您想隐藏此视图，请将其设置为false。默认展示。
	// 您可以在此视图中取消对此用户的邀请。
	showWaitingCallAcceptAudioVideoView?: boolean;
	// 通话中呼叫邀请列表配置
	callingInvitationListConfig?: CallingInvitationListConfig;
	// 2.13.0
	// 房间内自定义view，位于视频上方
	requireRoomForegroundView?: () => HTMLElement;
	// 整体视频画面配置
	videoScreenConfig?: {
		objectFit?: "cover" | "contain" | "fill" // 视频画面显示模式，默认 "contain"
		mirror?: boolean // 是否镜像，默认 false
	}
	// 发送消息回调
	onSendMessageResult?: (response: { errCode: number, message: string, timestamp?: string }) => void
	// Screen rotation Button
	showRotatingScreenButton?: boolean;
	// Screen rotation notification
	onScreenRotation?: (currentScreen: 'landscape' | 'portrait') => void
	// User status updated
	onUserStateUpdated?: (status: ZegoUserState) => void
	// Member view config
	memberViewConfig?: {
		operationListCustomButton?: () => Element
	}
	// 2.14.0
	// 消息发送通道配置
	sendMessageChannel?: "RTC" | "ZIM"
	// 2.15.0
	// 背景虚化及虚拟背景开关按钮
	showBackgroundProcessButton?: boolean
	onLocalStreamCreated?: (stream: ZegoLocalStream) => void
	// 2.16.0
	onStreamUpdate?: (streamId: string) => void
}

export enum ZegoUserState {
	Normal = "Normal",
	Banned = "Banned"
}
export enum RightPanelExpandedType {
	None = "None",
	RoomDetails = "RoomDetails",
	RoomMembers = "RoomMembers",
	RoomMessages = "RoomMessages",
}
export interface ZegoSignalingInRoomTextMessage {
	messageID: string
	timestamp: number
	orderKey: number
	senderUserID: string
	text: string
	extendedData?: string
}
export interface ZegoSignalingInRoomCommandMessage {
	messageID: string
	timestamp: number
	orderKey: number
	senderUserID: string
	command: object
}
export interface InRoomMessageInfo {
	fromUser: ZegoUser
	message: string
	sendTime: number
	messageID: number
	attrs?: any
	status?: "SENDING" | "SENDED" | "FAILED"
}

export interface ZegoBrowserCheckProp {
	core: ZegoCloudRTCCore
	joinRoom?: () => void
	leaveRoom?: (isKickedOut?: boolean, isCallQuit?: boolean) => void
	returnHome?: () => void
}

export interface ZegoNotification {
	type: "USER" | "MSG" | "INVITE"
	content: string
	userName: undefined | string
	messageID: number
}

export declare type ZegoBroadcastMessageInfo2 = ZegoBroadcastMessageInfo & {
	status: "SENDING" | "SENDED" | "FAILED"
}

export interface ZegoSettingsProps {
	core: ZegoCloudRTCCore
	theme?: string
	initDevices: {
		mic: string | undefined
		cam: string | undefined
		speaker: string | undefined
		videoResolve: string | undefined
		showNonVideoUser: boolean | undefined
	}
	closeCallBack?: () => void
	onMicChange: (deviceID: string) => void
	onCameraChange: (deviceID: string) => void
	onSpeakerChange: (deviceID: string) => void
	onVideoResolutionChange: (level: string) => void
	onShowNonVideoChange: (selected: boolean) => void
}

export interface ZegoGridLayoutProps {
	core: ZegoCloudRTCCore
	userList: ZegoCloudUserList
	videoShowNumber: number
	gridRowNumber?: number
	selfInfo?: {
		userID: string
	}
	handleMenuItem?: (type: UserListMenuItemType, user: ZegoCloudUser) => void

	soundLevel?: SoundLevelMap
	myClass?: string
}

export interface ZegoSidebarLayoutProps {
	core: ZegoCloudRTCCore
	handleMenuItem?: (type: UserListMenuItemType, user: ZegoCloudUser) => void

	userList: ZegoCloudUserList
	videoShowNumber: number
	selfInfo: {
		userID: string
	}
	soundLevel?: SoundLevelMap
}
export interface ZegoScreenSharingLayoutProps {
	core: ZegoCloudRTCCore
	handleMenuItem?: (type: UserListMenuItemType, user: ZegoCloudUser) => void

	userList: ZegoCloudUserList
	videoShowNumber: number
	selfInfo: {
		userID: string
	}
	roomID?: String
	screenSharingUser: ZegoCloudUser
	soundLevel?: SoundLevelMap
	handleFullScreen?: (fullScreen: boolean) => void
}
export interface ZegoWhiteboardSharingLayoutProps {
	core: ZegoCloudRTCCore
	handleMenuItem?: (type: UserListMenuItemType, user: ZegoCloudUser) => void
	handleSetPin?: (userID: string) => void
	userList: ZegoCloudUserList
	videoShowNumber: number
	selfInfo: {
		userID: string
	}
	roomID?: String
	onShow: (el: HTMLDivElement) => void
	onResize: (el: HTMLDivElement) => void
	onclose: () => void
	onToolChange: (type: number, fontSize?: number, color?: string) => void
	onFontChange: (font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC", fontSize?: number, color?: string) => void
	soundLevel?: SoundLevelMap
	handleFullScreen?: (fullScreen: boolean) => void
	onImageAdd?: () => void
	zegoSuperBoardView?: ZegoSuperBoardView | null
}
export interface SoundLevelMap {
	[userID: string]: {
		[streamID: string]: number
	}
}
export enum ZegoStreamType {
	main,
	media,
	screensharing,
}
export interface ZegoUser {
	userID: string
	userName?: string
	avatar?: string
	setUserAvatar?: (avatar: string) => void
}
export enum CoreError {
	notSupportCDNLive = 10001,
	notSupportStandardLive = 10002,
}
export enum ZegoInvitationType {
	VoiceCall = 0,
	VideoCall,
	RequestCoHost,
	InviteToCoHost,
	RemoveCoHost,
}
export interface ZegoCallInvitationConfig {
	enableCustomCallInvitationWaitingPage?: boolean // 是否自定义呼叫邀请等待页面，默认false
	enableCustomCallInvitationDialog?: boolean // 是否自定义呼叫邀请弹窗,默认false
	enableNotifyWhenAppRunningInBackgroundOrQuit?: boolean // Notify users when the app is running in the background or the app is killed, 默认false
	ringtoneConfig?: {
		incomingCallUrl?: string // 接收时的铃声
		outgoingCallUrl?: string // 呼出去的铃声
	}
	// 进入呼叫等待页面时的回调，返回cancel方法，调用的话可以取消邀请
	onWaitingPageWhenSending?: (
		callType: ZegoInvitationType,
		callees: ZegoUser[],
		cancel: CancelCallInvitationFunc
	) => void

	// 被呼叫者收到邀请时，邀请弹窗展示回调，返回accept、refuse方法给用户绑定UI
	onConfirmDialogWhenReceiving?: (
		callType: ZegoInvitationType,
		caller: ZegoUser,
		refuse: RefuseCallInvitationFunc,
		accept: AcceptCallInvitationFunc,
		data: string
	) => void

	// 接受邀请后进房前的回调，用于设置房间配置，由内部自动加入房间，房间配置根据ZegoInvitationType默认的来
	onSetRoomConfigBeforeJoining?: (callType: ZegoInvitationType) => ZegoCloudRoomConfig

	// 呼叫邀请结束回调（呼叫拒绝、超时、占线，用户退出呼叫邀请的房间等情况触发）
	onCallInvitationEnded?: (reason: CallInvitationEndReason, data: string) => void

	// Prebuilt内部收到呼叫邀请后，将内部数据转成对应数据后抛出
	onIncomingCallReceived?: (
		callID: string,
		caller: ZegoUser,
		callType: ZegoInvitationType,
		callees: ZegoUser[]
	) => void
	// 当呼叫者取消呼叫后，将内部数据转成对应数据后抛出。
	onIncomingCallCanceled?: (callID: string, caller: ZegoUser) => void
	// 当被叫者接受邀请后，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
	onOutgoingCallAccepted?: (callID: string, callee: ZegoUser) => void
	// 当被叫者正在通话中，拒接邀请后，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
	onOutgoingCallRejected?: (callID: string, callee: ZegoUser) => void
	// 当被叫者主动拒绝通话时，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
	onOutgoingCallDeclined?: (callID: string, callee: ZegoUser) => void
	//当被叫者超时没回应邀请时，被叫者会收到该回调，将内部数据转成对应数据后抛出。
	onIncomingCallTimeout?: (callID: string, caller: ZegoUser) => void
	//当呼叫超过固定时间后，如果还有被叫者没有响应，则呼叫者会收到该回调，将内部数据转成对应数据后抛出。
	onOutgoingCallTimeout?: (callID: string, callees: ZegoUser[]) => void
	// 2.1.0
	language?: ZegoUIKitLanguage
	// 2.6.0
	// 被叫者点击接收按钮回调
	onIncomingCallAcceptButtonPressed?: () => void
	// 被叫者点击拒绝按钮回调
	onIncomingCallDeclineButtonPressed?: () => void
	// 2.11.0
	// 是否允许在通话中发送邀请
	// 默认值为false。
	canInvitingInCalling?: boolean;
	// 是否只有呼叫发起者有权限邀请其他人加入通话。
	// 默认值为false。
	// 如果设置为false，则通话中的所有参与者都可以邀请其他人。
	onlyInitiatorCanInvite?: boolean;
	// 当呼叫发起者离开通话时，整个通话是否应该结束（导致其他参与者一起离开）。
	// 默认值为false。
	// 如果设置为false，则即使发起者离开，通话仍然可以继续。
	endCallWhenInitiatorLeave?: boolean;
	// onTokenWillExpire 还未进房前需要监听
	onTokenWillExpire?: () => void
}
export type CancelCallInvitationFunc = (data?: string) => void // 取消邀请
export type AcceptCallInvitationFunc = (data?: string) => void // 接受邀请
export type RefuseCallInvitationFunc = (data?: string) => void // 拒绝邀请

export interface InRoomInvitationInfo {
	callID: string
	inviter: ZegoUser
	invitee: ZegoUser
	type: ZegoInvitationType
}
export type InRoomInvitationReceivedInfo = Omit<InRoomInvitationInfo, "invitee">

export type WaitingUser = ZegoUser & {
	type: UserTypeEnum
}

export interface CallInvitationInfo {
	callID: string
	roomID: string
	callOwner: ZegoUser
	inviter: ZegoUser
	invitees: ZegoUser[]
	/** 已接受邀请的用户 */
	acceptedInvitees: ZegoUser[]
	type: ZegoInvitationType
	isGroupCall: boolean
	// 等待接受的用户列表
	waitingUsers?: WaitingUser[]
}
export enum CallInvitationEndReason {
	Declined = "Declined",
	Timeout = "Timeout",
	Canceled = "Canceled",
	Busy = "Busy",
	LeaveRoom = "LeaveRoom",
}
export interface ZegoSignalingPluginNotificationConfig {
	resourcesID?: string
	title?: string
	message?: string
}
export enum UserListMenuItemType {
	ChangePin = "ChangePin",
	MuteMic = "MuteMic",
	MuteCamera = "MuteCamera",
	RemoveUser = "RemoveUser",
	RemoveCohost = "RemoveCohost",
	InviteCohost = "InviteCohost",
	DisagreeRequestCohost = "disagreeRequestCohost",
	AgreeRequestCohost = "agreeRequestCohost",
	BanSendingMessages = 'banSendingMessages',
	CancelBanSendingMessages = 'cancelBanSendingMessages',
}
export const enum ReasonForRefusedInviteToCoHost {
	Disagree, // 主动拒绝
	Busy, // 占线拒绝
	Timeout, // 超时拒绝
}
export enum ZegoUIKitLanguage {
	CHS = "zh-CN", // 中文
	ENGLISH = "en-US", // 英文
}

export enum ZIMCallInvitationMode {
	Unknown = -1,
	General = 0,
	Advanced = 1
}

export enum UserTypeEnum {
	CALLING_WAITTING, // 通话中邀请 - 等待中
	GENERAL_WAITING, // 通话前邀请 - 等待中
}
export enum ZIMCallUserState {
	Unknown = -1,
	Inviting = 0,
	Accepted = 1,
	Rejected = 2,
	Cancelled = 3,
	Received = 5,
	Timeout = 6,
	Quit = 7,
	Ended = 8,
	NotYetReceived = 9,
	BeCancelled = 10,
}
export enum ZegoUIKitMessageType {
	rtcMessage = 1,
	zimMessage = 2,
}