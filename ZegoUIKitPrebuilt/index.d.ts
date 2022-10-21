import { Root } from "react-dom/client";
import { LiveRole, ScenarioModel, ZegoCloudRoomConfig } from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
export declare class ZegoUIKitPrebuilt {
    static core: ZegoCloudRTCCore | undefined;
    static _instance: ZegoUIKitPrebuilt;
    static Host: LiveRole;
    static Cohost: LiveRole;
    static Audience: LiveRole;
    static OneONoneCall: ScenarioModel;
    static GroupCall: ScenarioModel;
    static LiveStreaming: ScenarioModel;
    static VideoConference: ScenarioModel;
    private hasJoinedRoom;
    root: Root | undefined;
    static create(token: string): ZegoUIKitPrebuilt;
    joinRoom(roomConfig?: ZegoCloudRoomConfig): void;
    destroy(): void;
}
