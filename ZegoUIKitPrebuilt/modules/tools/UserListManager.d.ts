import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { LiveRole, LiveStreamingMode, ScenarioModel, ZegoCloudRemoteMedia } from "../../model";
export type ZegoCloudUserList = ZegoCloudUser[];
export type ZegoCloudUser = ZegoUser & {
    pin: boolean;
    overScreenMuteVideo?: boolean;
    streamList: ZegoCloudRemoteMedia[];
    avatar?: string;
};
export declare class ZegoCloudUserListManager {
    private zg;
    constructor(zg: ZegoExpressEngine);
    showNonVideo: boolean;
    showOnlyAudioUser: boolean;
    screenNumber: number;
    sidebarEnabled: boolean;
    remoteUserList: ZegoCloudUserList;
    remoteScreenStreamList: ZegoCloudUserList;
    scenario: ScenarioModel;
    role: LiveRole;
    liveStreamingMode: LiveStreamingMode;
    userOrderList: string[];
    waitingPullStreams: {
        streamID: string;
        userID: string;
    }[];
    isLive: "1" | "0";
    get isL3Live(): boolean;
    setPin(userID?: string, pined?: boolean): void;
    setShowNonVideo(enable: boolean): Promise<boolean>;
    setMaxScreenNum(num: number): Promise<boolean>;
    setSidebarLayOut(enable: boolean): Promise<boolean>;
    updateStream(): Promise<boolean>;
    openVideo(user: ZegoCloudUser): Promise<void>;
    muteVideo(user: ZegoCloudUser): Promise<void>;
    userUpdate(roomID: string, updateType: "DELETE" | "ADD", users: ZegoUser[]): Promise<boolean>;
    mainStreamUpdate(updateType: "DELETE" | "ADD" | "UPDATE", streamList: ZegoCloudRemoteMedia[]): Promise<boolean>;
    screenStreamUpdate(updateType: "DELETE" | "ADD" | "UPDATE", streamList: ZegoCloudRemoteMedia[]): void;
    setLiveStates(state: "1" | "0"): Promise<void>;
    startPullStream(userID: string, streamID: string): Promise<MediaStream | undefined>;
    stopPullStream(userID: string, streamID: string): void;
    reset(): void;
    updateUserInfo(userID: string, key: keyof ZegoCloudUser, value: any): void;
    updateStreamInfo(userID: string, streamID: string, key: keyof ZegoCloudRemoteMedia, value: any): void;
}
