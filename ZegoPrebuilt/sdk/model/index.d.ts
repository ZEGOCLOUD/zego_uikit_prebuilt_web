import { ZegoUser, ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudRTCCore } from "../modules";
export interface ZegoCloudRemoteMedia {
    media: MediaStream;
    fromUser: ZegoUser;
    micStatus: "OPEN" | "MUTE";
    cameraStatus: "OPEN" | "MUTE";
    state: "NO_PLAY" | "PLAY_REQUESTING" | "PLAYING";
}
export interface ZegoCloudRoomConfig {
    container?: HTMLElement | undefined | null;
    joinScreen?: {
        visible: boolean;
        title?: string;
        inviteURL?: string;
    };
    micEnabled?: boolean;
    cameraEnabled?: boolean;
    userCanToggleSelfCamera?: boolean;
    userCanToggleSelfMic?: boolean;
    deviceSettings?: boolean;
    chatEnabled?: boolean;
    userListEnabled?: boolean;
    notification?: {
        userOnlineOfflineTips?: boolean;
        unreadMessageTips?: boolean;
    };
    leaveRoomCallback?: () => void;
    roomTimerDisplayed?: boolean;
    branding?: {
        logoURL?: string;
    };
    leftScreen?: boolean;
    i18nURL?: string;
    i18nJSON?: string;
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
