import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudRemoteMedia } from "../../model";
export declare type ZegoCloudUserList = ZegoCloudUser[];
export declare type ZegoCloudUser = ZegoUser & {
    pin: boolean;
    streamList: ZegoCloudRemoteMedia[];
};
export declare class ZegoCloudUserListManager {
    private zg;
    constructor(zg: ZegoExpressEngine);
    showNonVideo: boolean;
    screenNumber: number;
    remoteUserList: ZegoCloudUserList;
    setPin(userID?: string, pined?: boolean): void;
    setShowNonVideo(enable: boolean): Promise<boolean>;
    setMaxScreenNum(num: number): Promise<boolean>;
    updateStream(): Promise<boolean>;
    userUpdate(roomID: string, updateType: "DELETE" | "ADD", users: ZegoUser[]): void;
    streamNumUpdate(updateType: "DELETE" | "ADD" | "UPDATE", streamList: ZegoCloudRemoteMedia[]): void;
    clearUserList(): void;
}