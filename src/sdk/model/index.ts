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
  container?: HTMLElement; // 挂载容器
  joinScreen?: {
    visible: boolean; // 是否显示娱乐检测页面，默认显示
    title?: string; // 标题设置，默认enter Room
    inviteURL?: string; // 邀请链接，空则不显示，默认空
  };
  micEnabled?: boolean; // 是否开启自己的麦克风,默认开启
  cameraEnabled?: boolean; // 是否开启自己的摄像头 ,默认开启
  userCanToggleSelfCamera?: boolean; // 是否可以控制自己的麦克风,默认开启
  userCanToggleSelfMic?: boolean; // 是否可以控制体自己的摄像头,默认开启
  deviceSettings?: {
    audio: boolean; // 是否显示音频设置
    video: boolean; // 是否显示视频设置
  };

  chatEnabled?: boolean; // 是否开启聊天，默认开启   joinScreen: boolean，// 通话前检测页面是否需要，默认需要
  userListEnabled?: boolean; //是否显示成员列表，默认不展示
  notification?: {
    userOnlineOfflineTips?: boolean; //是否显示成员进出，默认不显示
    unreadMessageTips?: boolean; // 是否显示未读消息，默认不显示
  };
  leaveRoomCallback?: () => void; // 退出房间回调
  roomTimerDisplayed?: boolean; //是否计时，默认不计时
  branding?: {
    logoURL?: string;
  };
  leftScreen?: true; // 离开房间后页面，默认有
  i18nURL?: string; // 自定义翻译文件，json地址，默认不需要，默认英文，需要先提供英文版key
  i18nJSON?: string; //者json对象
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
}

export declare type ZegoBroadcastMessageInfo2 = ZegoBroadcastMessageInfo & {
  status: "SENDING" | "SENDED" | "FAILED";
};
