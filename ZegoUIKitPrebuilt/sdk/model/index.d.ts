import { ZegoUser, ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudRTCCore } from "../modules";
import { ZegoCloudUserList } from "../modules/tools/UserListManager";
export interface ZegoCloudRemoteMedia {
    media: MediaStream;
    fromUser: ZegoUser;
    micStatus: "OPEN" | "MUTE";
    cameraStatus: "OPEN" | "MUTE";
    state: "NO_PLAY" | "PLAY_REQUESTING" | "PLAYING";
    streamID: string;
}
export interface ZegoCloudRoomConfig {
    container?: HTMLElement | undefined | null;
    preJoinViewConfig?: {
        title?: string;
        invitationLink?: string;
    };
    facingMode?: "user" | "environment";
    showPreJoinView?: boolean;
    turnOnMicrophoneWhenJoining?: boolean;
    turnOnCameraWhenJoining?: boolean;
    showMyCameraToggleButton?: boolean;
    showMyMicrophoneToggleButton?: boolean;
    showAudioVideoSettingsButton?: boolean;
    showTextChat?: boolean;
    showUserList?: boolean;
    lowerLeftNotification?: {
        showUserJoinAndLeave?: boolean;
        showTextChat?: boolean;
    };
    joinRoomCallback?: () => void;
    leaveRoomCallback?: () => void;
    userUpdateCallback?: (type: "ADD" | "DELETE", user: ZegoUser[]) => void;
    roomTimerDisplayed?: boolean;
    branding?: {
        logoURL?: string;
    };
    showLeavingView?: boolean;
    localizationJSON?: object;
    maxUsers?: number;
    layout?: "Sidebar" | "Grid" | "Default";
    showNonVideoUser?: boolean;
    showOnlyAudioUser?: boolean;
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
export interface SoundLevelMap {
    [userID: string]: {
        [streamID: string]: number;
    };
}
