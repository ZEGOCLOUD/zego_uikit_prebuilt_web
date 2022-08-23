import { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
export declare class ZegoPrebuiltUIKit {
    static core: ZegoCloudRTCCore;
    static _instance: ZegoPrebuiltUIKit;
    root: Root | undefined;
    static create(token: string): ZegoPrebuiltUIKit;
    joinRoom(roomConfig?: ZegoCloudRoomConfig): void;
    destroy(): void;
}
