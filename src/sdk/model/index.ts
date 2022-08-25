import {
  ZegoUser,
  ZegoBroadcastMessageInfo,
} from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";

import { ZegoCloudRTCCore } from "../modules";
export interface ZegoCloudRemoteMedia {
  media: MediaStream;
  fromUser: ZegoUser;
  micStatus: "OPEN" | "MUTE";
  cameraStatus: "OPEN" | "MUTE";
  state: "NO_PLAY" | "PLAY_REQUESTING" | "PLAYING";
}
export interface ZegoCloudRoomConfig {
  container?: HTMLElement | undefined | null; // 挂载容器
  preJoinViewConfig?: {
    title?: string; // 标题设置，默认enter Room
    invitationLink?: string; // 邀请链接，空则不显示，默认空
  };
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
  leaveRoomCallback?: () => void; // 退出房间回调
  joinRoomCallback?: () => void; // 进入房间回调
  roomTimerDisplayed?: boolean; //是否计时，默认不计时
  branding?: {
    logoURL?: string;
  };
  showLeavingView?: boolean; // 离开房间后页面，默认有
  localizationJSON?: object; //者json对象
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
  };
  closeCallBack?: () => void;
  onMicChange: (deviceID: string) => void;
  onCameraChange: (deviceID: string) => void;
  onSpeakerChange: (deviceID: string) => void;
  onVideoResolutionChange: (level: string) => void;
}
