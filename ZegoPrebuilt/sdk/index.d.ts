import { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
export declare class ZegoUIkitPrebuilt {
    static core: ZegoCloudRTCCore;
    static _instance: ZegoUIkitPrebuilt;
    root: Root | undefined;
    static init(token: string): ZegoUIkitPrebuilt;
    joinRoom(roomConfig?: ZegoCloudRoomConfig): void;
    destroyRoom(): void;
}
