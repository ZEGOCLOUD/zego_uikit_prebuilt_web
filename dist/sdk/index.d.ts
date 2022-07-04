import { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model";
import { ZegoCloudRTCCore } from "./modules";
export default class ZegoCloudRTCKit {
    static core: ZegoCloudRTCCore;
    static _instance: ZegoCloudRTCKit;
    root: Root | undefined;
    static init(token: string): ZegoCloudRTCKit;
    joinRoom(roomConfig: ZegoCloudRoomConfig): void;
    destroyRoom(): void;
}
