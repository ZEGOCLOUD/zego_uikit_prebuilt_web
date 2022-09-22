import { deprecate } from "util";
import {
  ZegoUser,
  ZegoBroadcastMessageInfo,
} from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";

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
}

export enum LiveRole {
  Host = "Host",
  Cohost = "Cohost",
  Audience = "Audience",
}

export enum ScenarioModel {
  OneONoneCall = "OneONoneCall",
  VideoConference = "VideoConference",
  LiveStreaming = "LiveStreaming",
}

export interface ScenarioConfig {
  [ScenarioModel.LiveStreaming]: {
    role: LiveRole;
  };
  [ScenarioModel.OneONoneCall]: {
    role: LiveRole;
  };
  [ScenarioModel.VideoConference]: {
    role: LiveRole;
  };
}

export interface ZegoCloudRoomConfig {
  container?: HTMLElement | undefined | null; // 挂载容器
  preJoinViewConfig?: {
    title?: string; // 标题设置，默认enter Room
    invitationLink?: string; // 邀请链接，空则不显示，默认空, 废弃中
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
    logoURL?: string;
  };
  showLeavingView?: boolean; // 离开房间后页面，默认有

  maxUsers?: number; // 房间人数2～20，默认2
  layout?: "Sidebar" | "Grid" | "Auto"; // 默认Default

  showNonVideoUser?: boolean; // 是否显示无视频用户，默认显示
  showOnlyAudioUser?: boolean; // 是否显示纯音频用户，默认显示

  useFrontFacingCamera?: boolean;
  onJoinRoom?: (users: ZegoUser[]) => void;
  onLeaveRoom?: (users: ZegoUser[]) => void;
  onUserJoin?: (user: ZegoUser[]) => void; // 用户进入回调
  onUserLeave?: (user: ZegoUser[]) => void; // 用户退入回调
  sharedLinks?: { name: string; url: string }[]; // 产品链接描述
  showScreenSharingButton?: boolean; // 是否显示屏幕共享按钮
  scenario?: {
    mode?: ScenarioModel; // 场景选择
    config?: ScenarioConfig[ScenarioModel]; // 对应场景专有配置
  };

  showLayoutButton?: boolean; // 是否显示布局切换按钮
  showPinButton?: boolean; // 是否显pin按钮

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
