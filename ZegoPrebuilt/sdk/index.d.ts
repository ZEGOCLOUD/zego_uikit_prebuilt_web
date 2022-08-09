import { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
export declare class ZegoUIKitPrebuilt {
  static core: ZegoCloudRTCCore;
  static _instance: ZegoUIKitPrebuilt;
  root: Root | undefined;
  static create(token: string): ZegoUIKitPrebuilt;
  joinRoom(roomConfig?: ZegoCloudRoomConfig): void;
  destroy(): void;
}
