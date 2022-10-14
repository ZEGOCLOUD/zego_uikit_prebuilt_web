import { ZegoUser, ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudRTCCore } from "../modules";
import { ZegoCloudUser, ZegoCloudUserList } from "../modules/tools/UserListManager";
export interface ZegoCloudRemoteMedia {
    media: MediaStream | undefined;
    fromUser: ZegoUser;
    micStatus: "OPEN" | "MUTE";
    cameraStatus: "OPEN" | "MUTE";
    state: "NO_PLAY" | "PLAY_REQUESTING" | "PLAYING";
    streamID: string;
}
export declare enum LiveRole {
    Host = "Host",
    Cohost = "Cohost",
    Audience = "Audience"
}
export declare enum ScenarioModel {
    OneONoneCall = "OneONoneCall",
    GroupCall = "GroupCall",
    VideoConference = "VideoConference",
    LiveStreaming = "LiveStreaming"
}
export interface ScenarioConfig {
    [ScenarioModel.LiveStreaming]: {
        role: LiveRole;
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
export interface ZegoCloudRoomConfig {
    container?: HTMLElement | undefined | null;
    preJoinViewConfig?: {
        title?: string;
        invitationLink?: string;
    };
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
    branding?: {
        logoURL?: string;
    };
    showLeavingView?: boolean;
    maxUsers?: number;
    layout?: "Sidebar" | "Grid" | "Auto";
    showNonVideoUser?: boolean;
    showOnlyAudioUser?: boolean;
    useFrontFacingCamera?: boolean;
    onJoinRoom?: () => void;
    onLeaveRoom?: () => void;
    onUserJoin?: (user: ZegoUser[]) => void;
    onUserLeave?: (user: ZegoUser[]) => void;
    sharedLinks?: {
        name?: string;
        url?: string;
    }[];
    showScreenSharingButton?: boolean;
    scenario?: {
        mode?: ScenarioModel;
        config?: ScenarioConfig[ScenarioModel];
    };
    showLayoutButton?: boolean;
    showPinButton?: boolean;
    facingMode?: "user" | "environment";
    joinRoomCallback?: () => void;
    leaveRoomCallback?: () => void;
    userUpdateCallback?: (updateType: "DELETE" | "ADD", userList: ZegoUser[]) => void;
    roomTimerDisplayed?: boolean;
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
export declare enum ZegoStreamType {
    main = 0,
    media = 1,
    screensharing = 2
}
