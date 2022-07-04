import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudRTCCore } from "../modules";
export interface ZegoCloudRemoteMedia {
    media: MediaStream;
    fromUser: ZegoUser;
    micStatus: "OPEN" | "MUTE";
    cameraStatus: "OPEN" | "MUTE";
    state: "NO_PLAY" | "PLAY_REQUESTING" | "PLAYING";
}
export interface ZegoCloudRoomConfig {
    container: HTMLElement;
    joinScreen?: {
        visible: boolean;
        title?: string;
        inviteURL?: string;
    };
    micEnabled?: boolean;
    cameraEnabled?: boolean;
    userCanToggleSelfCamera?: boolean;
    userCanToggleSelfMic?: boolean;
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
    leftScreen?: true;
    i18nURL?: string;
    i18nJSON?: string;
}
export interface ZegoBrowserCheckProp {
    core: ZegoCloudRTCCore;
    joinRoom?: () => void;
    leaveRoom?: () => void;
}
