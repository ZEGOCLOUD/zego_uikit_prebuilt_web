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
  media: MediaStream;
  fromUser: ZegoUser;
  micStatus: "OPEN" | "MUTE";
  cameraStatus: "OPEN" | "MUTE";
  state: "NO_PLAY" | "PLAY_REQUESTING" | "PLAYING";
  streamID: string;
}
export interface ZegoCloudRoomConfig {
  container?: HTMLElement | undefined | null; // 挂载容器
  preJoinViewConfig?: {
    title?: string; // 标题设置，默认enter Room
    invitationLink?: string; // 邀请链接，空则不显示，默认空
  };
  facingMode?: "user" | "environment";
  showPreJoinView?: boolean; // 是否显示预览检测页面，默认显示
  turnOnMicrophoneWhenJoining?: boolean; // 是否开启自己的麦克风,默认开启
  turnOnCameraWhenJoining?: boolean; // 是否开启自己的摄像头 ,默认开启
  showMyCameraToggleButton?: boolean; // 是否可以控制自己的麦克风,默认开启
  showMyMicrophoneToggleButton?: boolean; // 是否可以控制体自己的摄像头,默认开启
  showAudioVideoSettingsButton?: boolean; // 是否显示音频设置,默认显示

  showTextChat?: boolean; // 是否开启聊天，默认开启
  showUserList?: boolean; //是否显示成员列表，默认不展示
  lowerLeftNotification?: {
    showUserJoinAndLeave?: boolean; //是否显示成员进出，默认不显示
    showTextChat?: boolean; // 是否显示未读消息，默认不显示
  };
  joinRoomCallback?: () => void;
  leaveRoomCallback?: () => void; // 退出房间回调
  userUpdateCallback?: (type: "ADD" | "DELETE", user: ZegoUser[]) => void; // 用户进入退出回调
  roomTimerDisplayed?: boolean; //是否计时，默认不计时
  branding?: {
    logoURL?: string;
  };
  showLeavingView?: boolean; // 离开房间后页面，默认有
  localizationJSON?: object; //者json对象

  ////////二期新增功能///////////////
  maxUsers?: number; // 房间人数2～20，默认2
  layout?: "Sidebar" | "Grid" | "Default"; // 默认Default

  showNonVideoUser?: boolean; // 是否显示无视频用户，默认显示
  showOnlyAudioUser?: boolean; // 是否显示纯音频用户，默认显示
  // 是否现在做，跟凯华讨论下
  // permissions: {
  //   showRemoteUserMicrophoneToggleOption?: boolean; // 是否允许开关用户麦克风，默认允许
  //   showRemoteUserCameraToggleOption?: boolean; // 是否允许开关用户摄像头，默认允许
  // };
  // role?: "Host" | "Participant"; // 用户角色，HOST可以关闭对方摄像头和麦克风，Participant则不可以,默认HOST
  ////////三期新增配置 ///////////////
  showScreenSharingButton?: boolean; // 是否显示屏幕共享按钮
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
