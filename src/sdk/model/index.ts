import {
  // ZegoUser,
  ZegoBroadcastMessageInfo,
} from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoSuperBoardView } from "zego-superboard-web";
import { ZegoCloudRTCCore } from "../modules";
import {
  ZegoCloudUser,
  ZegoCloudUserList,
} from "../modules/tools/UserListManager";
export interface ZegoCloudRemoteMedia {
  media: MediaStream | undefined;
  fromUser: ZegoUser;
  micStatus: "OPEN" | "MUTE";
  cameraStatus: "OPEN" | "MUTE";
  state: "NO_PLAY" | "PLAY_REQUESTING" | "PLAYING";
  streamID: string;
  // 新增 CDN 拉流地址
  urlsHttpsFLV?: string;
  urlsHttpsHLS?: string;
  hasAudio?: boolean;
  hasVideo?: boolean;
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
export interface ScenarioConfig {
  [ScenarioModel.LiveStreaming]: {
    role: LiveRole;
    liveStreamingMode: LiveStreamingMode;
  };
  [ScenarioModel.OneONoneCall]: {
    role: LiveRole;
  };
  [ScenarioModel.GroupCall]: {
    role: LiveRole;
  };
  [ScenarioModel.VideoConference]: {
    role: LiveRole;
  };
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
export interface ZegoCloudRoomConfig {
  container?: HTMLElement | undefined | null; // 挂载容器
  preJoinViewConfig?: {
    title?: string; // 标题设置，默认enter Room
    invitationLink?: string;
  };
  showPreJoinView?: boolean; // 是否显示预览检测页面，默认显示
  turnOnMicrophoneWhenJoining?: boolean; // 是否开启自己的麦克风,默认开启
  turnOnCameraWhenJoining?: boolean; // 是否开启自己的摄像头 ,默认开启
  showMyCameraToggleButton?: boolean; // 是否显示控制自己的麦克风按钮,默认显示
  showMyMicrophoneToggleButton?: boolean; // 是否显示控制自己摄像头按钮,默认显示
  showAudioVideoSettingsButton?: boolean; // 是否显示音视频设置按钮,默认显示

  showTextChat?: boolean; // 是否开启聊天，默认开启
  showUserList?: boolean; //是否显示成员列表，默认不展示
  lowerLeftNotification?: {
    showUserJoinAndLeave?: boolean; //是否显示成员进出，默认不显示
    showTextChat?: boolean; // 是否显示未读消息，默认不显示
  };
  branding?: {
    logoURL?: string; // 通话页面Logo
  };
  showLeavingView?: boolean; // 离开房间后页面，默认有

  maxUsers?: number; // 房间人数2～20，默认2
  layout?: "Sidebar" | "Grid" | "Auto"; // 默认Default

  showNonVideoUser?: boolean; // 是否显示无视频用户，默认显示
  showOnlyAudioUser?: boolean; // 是否显示纯音频用户，默认显示

  useFrontFacingCamera?: boolean;
  onJoinRoom?: () => void; // 用户进入通话页面回调
  onLeaveRoom?: () => void; // 用户退出通话页面回调
  onUserJoin?: (user: ZegoUser[]) => void; // 其他用户进入回调
  onUserLeave?: (user: ZegoUser[]) => void; // 其他用户退入回调
  sharedLinks?: { name?: string; url?: string }[]; // 产品链接描述
  showScreenSharingButton?: boolean; // 是否显示屏幕共享按钮
  scenario?: {
    mode?: ScenarioModel; // 场景选择
    config?: ScenarioConfig[ScenarioModel]; // 对应场景专有配置
  };

  showLayoutButton?: boolean; // 是否显示布局切换按钮
  showPinButton?: boolean; // 是否显pin按钮
  onUserAvatarSetter?: (user: ZegoUser[]) => void; //是否可以设置用户头像回调
  videoResolutionList?: VideoResolution[]; // 视频分辨率列表（默认使用第一个）
  videoResolutionDefault?: VideoResolution; // 默认视频分辨率
  onLiveStart?: (user: ZegoUser) => void; //直播开始回调
  onLiveEnd?: (user: ZegoUser) => void; //直播结束回调
  /**
   * @deprecated facingMode will be removed
   * */
  facingMode?: "user" | "environment"; // 前置摄像头模式
  /**
   * @deprecated joinRoomCallback will be removed
   * */
  joinRoomCallback?: () => void; // 加入房间成功回调
  /**
   * @deprecated leaveRoomCallback will be removed
   * */
  leaveRoomCallback?: () => void; // 退出房间回调
  /**
   * @deprecated userUpdateCallback will be removed
   * */
  userUpdateCallback?: (
    updateType: "DELETE" | "ADD",
    userList: ZegoUser[]
  ) => void; // 用户新增/退出 回调
  /**
   * @deprecated roomTimerDisplayed will be removed
   * */
  roomTimerDisplayed?: boolean; // 是否显示倒计时

  whiteboardConfig?: {
    showAddImageButton?: boolean; //  默认false， 开通文件共享功能，并引入插件，后才会生效； 否则使用会错误提示：“ Failed to add image, this feature is not supported.”
    showCreateAndCloseButton?: boolean;
  };
  autoLeaveRoomWhenOnlySelfInRoom?: boolean; // 当房间内只剩一个人的时候，自动退出房间
}

export interface ZegoBrowserCheckProp {
  core: ZegoCloudRTCCore;
  joinRoom?: () => void;
  leaveRoom?: () => void;
  returnHome?: () => void;
}

export interface ZegoNotification {
  type: "USER" | "MSG";
  content: string;
  userName: undefined | string;
  messageID: number;
}

export declare type ZegoBroadcastMessageInfo2 = ZegoBroadcastMessageInfo & {
  status: "SENDING" | "SENDED" | "FAILED";
};

export interface ZegoSettingsProps {
  core: ZegoCloudRTCCore;
  theme?: string;
  initDevices: {
    mic: string | undefined;
    cam: string | undefined;
    speaker: string | undefined;
    videoResolve: string | undefined;
    showNonVideoUser: boolean | undefined;
  };
  closeCallBack?: () => void;
  onMicChange: (deviceID: string) => void;
  onCameraChange: (deviceID: string) => void;
  onSpeakerChange: (deviceID: string) => void;
  onVideoResolutionChange: (level: string) => void;
  onShowNonVideoChange: (selected: boolean) => void;
}

export interface ZegoGridLayoutProps {
  userList: ZegoCloudUserList;
  videoShowNumber: number;
  gridRowNumber?: number;
  selfInfo?: {
    userID: string;
  };
  handleSetPin?: Function;
  soundLevel?: SoundLevelMap;
}

export interface ZegoSidebarLayoutProps {
  handleSetPin?: Function;
  userList: ZegoCloudUserList;
  videoShowNumber: number;
  selfInfo: {
    userID: string;
  };
  soundLevel?: SoundLevelMap;
}
export interface ZegoScreenSharingLayoutProps {
  handleSetPin?: Function;
  userList: ZegoCloudUserList;
  videoShowNumber: number;
  selfInfo: {
    userID: string;
  };
  roomID?: String;
  screenSharingUser: ZegoCloudUser;
  soundLevel?: SoundLevelMap;
  handleFullScreen?: (fullScreen: boolean) => void;
}
export interface ZegoWhiteboardSharingLayoutProps {
  handleSetPin?: Function;
  userList: ZegoCloudUserList;
  videoShowNumber: number;
  selfInfo: {
    userID: string;
  };
  roomID?: String;
  onShow: (el: HTMLDivElement) => void;
  onResize: (el: HTMLDivElement) => void;
  onclose: () => void;
  onToolChange: (type: number, fontSize?: number, color?: string) => void;
  onFontChange: (
    font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC",
    fontSize?: number,
    color?: string
  ) => void;
  soundLevel?: SoundLevelMap;
  handleFullScreen?: (fullScreen: boolean) => void;
  onImageAdd?: () => void;
  zegoSuperBoardView?: ZegoSuperBoardView | null;
}
export interface SoundLevelMap {
  [userID: string]: {
    [streamID: string]: number;
  };
}
export enum ZegoStreamType {
  main,
  media,
  screensharing,
}
export interface ZegoUser {
  userID: string;
  userName?: string;
  setUserAvatar?: (avatar: string) => void;
}
export enum CoreError {
  notSupportCDNLive = 10001,
  notSupportStandardLive = 10002,
}
export enum ZegoInvitationType {
  VoiceCall = 0,
  VideoCall,
}
export interface ZegoCallInvitationConfig {
  enableCustomCallInvitationWaitingPage?: boolean; // 是否自定义呼叫邀请等待页面，默认false
  enableCustomCallInvitationDialog?: boolean; // 是否自定义呼叫邀请弹窗,默认false
  enableNotifyWhenAppRunningInBackgroundOrQuit?: boolean; // Notify users when the app is running in the background or the app is killed, 默认false
  ringtoneConfig?: {
    incomingCallUrl?: string; // 接收时的铃声
    outgoingCallUrl?: string; // 呼出去的铃声
  };
  // 进入呼叫等待页面时的回调，返回cancel方法，调用的话可以取消邀请
  onWaitingPageWhenSending?: (
    callType: ZegoInvitationType,
    callees: ZegoUser[],
    cancel: CancelCallInvitationFunc
  ) => void;

  // 被呼叫者收到邀请时，邀请弹窗展示回调，返回accept、refuse方法给用户绑定UI
  onConfirmDialogWhenReceiving?: (
    callType: ZegoInvitationType,
    caller: ZegoUser,
    refuse: RefuseCallInvitationFunc,
    accept: AcceptCallInvitationFunc,
    data: string
  ) => void;

  // 接受邀请后进房前的回调，用于设置房间配置，由内部自动加入房间，房间配置根据ZegoInvitationType默认的来
  onSetRoomConfigBeforeJoining?: (
    callType: ZegoInvitationType
  ) => ZegoCloudRoomConfig;

  // 呼叫邀请结束回调（呼叫拒绝、超时、占线，用户退出呼叫邀请的房间等情况触发）
  onCallInvitationEnded?: (
    reason: CallInvitationEndReason,
    data: string
  ) => void;

  // Prebuilt内部收到呼叫邀请后，将内部数据转成对应数据后抛出
  onIncomingCallReceived?: (
    callID: string,
    caller: ZegoUser,
    callType: ZegoInvitationType,
    callees: ZegoUser[]
  ) => void;
  // 当呼叫者取消呼叫后，将内部数据转成对应数据后抛出。
  onIncomingCallCanceled?: (callID: string, caller: ZegoUser) => void;
  // 当被叫者接受邀请后，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
  onOutgoingCallAccepted?: (callID: string, callee: ZegoUser) => void;
  // 当被叫者正在通话中，拒接邀请后，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
  onOutgoingCallRejected?: (callID: string, callee: ZegoUser) => void;
  // 当被叫者主动拒绝通话时，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
  onOutgoingCallDeclined?: (callID: string, callee: ZegoUser) => void;
  //当被叫者超时没回应邀请时，被叫者会收到该回调，将内部数据转成对应数据后抛出。
  onIncomingCallTimeout?: (callID: string, caller: ZegoUser) => void;
  //当呼叫超过固定时间后，如果还有被叫者没有响应，则呼叫者会收到该回调，将内部数据转成对应数据后抛出。
  onOutgoingCallTimeout?: (callID: string, callees: ZegoUser[]) => void;
}
export type CancelCallInvitationFunc = (data?: string) => void; // 取消邀请
export type AcceptCallInvitationFunc = (data?: string) => void; // 接受邀请
export type RefuseCallInvitationFunc = (data?: string) => void; // 拒绝邀请
export interface CallInvitationInfo {
  callID: string;
  roomID: string;
  inviter: ZegoUser;
  invitees: ZegoUser[];
  /** 已接受邀请的用户 */
  acceptedInvitees: ZegoUser[];
  type: ZegoInvitationType;
  isGroupCall: boolean;
}
export enum CallInvitationEndReason {
  Declined = "Declined",
  Timeout = "Timeout",
  Canceled = "Canceled",
  Busy = "Busy",
  LeaveRoom = "LeaveRoom",
}
export interface ZegoSignalingPluginNotificationConfig {
  resourcesID?: string;
  title?: string;
  message?: string;
}
