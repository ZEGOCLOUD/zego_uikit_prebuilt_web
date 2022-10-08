import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { LiveRole, ScenarioModel, ZegoCloudRemoteMedia } from "../../model";
export declare type ZegoCloudUserList = ZegoCloudUser[];
export declare type ZegoCloudUser = ZegoUser & {
    pin: boolean;
    overScreenMuteVideo?: boolean;
    streamList: ZegoCloudRemoteMedia[];
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
    setPin(userID?: string, pined?: boolean): void;
    setShowNonVideo(enable: boolean): Promise<boolean>;
    setMaxScreenNum(num: number): Promise<boolean>;
    setSidebarLayOut(enable: boolean): Promise<boolean>;
    updateStream(): Promise<boolean>;
    openVideo(user: ZegoCloudUser): Promise<void>;
    muteVideo(user: ZegoCloudUser): Promise<void>;
    userOrderList: string[];
    userUpdate(roomID: string, updateType: "DELETE" | "ADD", users: ZegoUser[]): Promise<boolean>;
    mainStreamUpdate(updateType: "DELETE" | "ADD" | "UPDATE", streamList: ZegoCloudRemoteMedia[]): Promise<boolean>;
    screenStreamUpdate(updateType: "DELETE" | "ADD" | "UPDATE", streamList: ZegoCloudRemoteMedia[]): void;
    waitingPullStreams: {
        streamID: string;
        userID: string;
    }[];
    isLive: 1 | 0;
    setLiveStates(state: 1 | 0): Promise<void>;
    scenario: ScenarioModel;
    role: LiveRole;
    startPullStream(userID: string, streamID: string): Promise<MediaStream | undefined>;
    stopPullStream(userID: string, streamID: string): void;
    reset(): void;
}
