import {
  // ZegoUser,
  ZegoBroadcastMessageInfo,
} from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoSuperBoardManager, ZegoSuperBoardView } from "zego-superboard-web";
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
  StandardLive = "StandardLive", // CDN
  PremiumLive = "PremiumLive", // L3
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
  // @deprecate
  facingMode?: "user" | "environment"; // 前置摄像头模式
  // @deprecate
  joinRoomCallback?: () => void; // 加入房间成功回调
  // @deprecate
  leaveRoomCallback?: () => void; // 退出房间回调
  // @deprecate
  userUpdateCallback?: (
    updateType: "DELETE" | "ADD",
    userList: ZegoUser[]
  ) => void; // 用户新增/退出 回调

  // @deprecate
  roomTimerDisplayed?: boolean; // 是否显示倒计时

  whiteboardConfig?: {
    showAddImageButton?: boolean; //  默认false， 开通文件共享功能，并引入插件，后才会生效； 否则使用会错误提示：“ Failed to add image, this feature is not supported.”
  };
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
  enableCustomCallInvitationWaitingPage: boolean; // 是否自定义呼叫邀请等待页面
  enableCustomCallInvitationDialog: boolean; // 是否自定义呼叫邀请弹窗
  // 进入呼叫等待页面时的回调，返回cancel方法，调用的话可以取消邀请
  onCallInvitationWaitingPageShowed?: (
    invitees: ZegoUser[],
    cancel: CancelCallInvitationFunc
  ) => boolean;

  // 被呼叫者收到邀请时，邀请弹窗展示回调，返回accept、refuse方法给用户绑定UI
  onCallInvitationDialogShowed?: (
    type: ZegoInvitationType,
    inviter: ZegoUser,
    accept: AcceptCallInvitationFunc,
    refuse: RefuseCallInvitationFunc,
    data: string
  ) => boolean;

  // 接受邀请后进房前的回调，用于设置房间配置，由内部自动加入房间，房间配置根据ZegoInvitationType默认的来
  onSetRoomConfigBeforeJoining?: (
    type: ZegoInvitationType,
    data: string
  ) => ZegoCloudRoomConfig;

  // 呼叫邀请结束回调（呼叫拒绝、超时、占线，用户退出呼叫邀请的房间等情况触发）
  onCallInvitationEnded?: (
    reason: "Refused" | "Timeout" | "Canceled" | "Busy",
    data: string
  ) => void;
}
export type CancelCallInvitationFunc = (
  invitees: string[],
  data?: string
) => void; // 取消邀请
export type AcceptCallInvitationFunc = (data?: string) => void; // 接受邀请
export type RefuseCallInvitationFunc = (data?: string) => void; // 拒绝邀请
