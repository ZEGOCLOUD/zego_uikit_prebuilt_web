import { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
export declare class ZegoUIkitPrebuiltMeeting {
    static core: ZegoCloudRTCCore;
    static _instance: ZegoUIkitPrebuiltMeeting;
    root: Root | undefined;
    static init(token: string): ZegoUIkitPrebuiltMeeting;
    joinRoom(roomConfig?: ZegoCloudRoomConfig): void;
    destroyRoom(): void;
}
