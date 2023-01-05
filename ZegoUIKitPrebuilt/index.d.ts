import { Root } from "react-dom/client";
import { ZegoSuperBoardManager } from "zego-superboard-web";
import ZIM from "zego-zim-web";
import { LiveRole, LiveStreamingMode, ScenarioModel, VideoResolution, ZegoCallInvitationConfig, ZegoCloudRoomConfig, ZegoInvitationType, ZegoSignalingPluginNotificationConfig, ZegoUser } from "./model/index";
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
    static VideoResolution_180P: VideoResolution;
    static VideoResolution_360P: VideoResolution;
    static VideoResolution_480P: VideoResolution;
    static VideoResolution_720P: VideoResolution;
    static LiveStreamingMode: typeof LiveStreamingMode;
    static InvitationTypeVoiceCall: ZegoInvitationType;
    static InvitationTypeVideoCall: ZegoInvitationType;
    private hasJoinedRoom;
    root: Root | undefined;
    static generateKitTokenForTest(appID: number, serverSecret: string, roomID: string, userID: string, userName?: string, ExpirationSeconds?: number): string;
    static generateKitTokenForProduction(appID: number, token: string, roomID: string, userID: string, userName?: string): string;
    static create(kitToken: string): ZegoUIKitPrebuilt;
    addPlugins(plugins?: {
        ZegoSuperBoardManager?: typeof ZegoSuperBoardManager;
        ZIM?: typeof ZIM;
    }): void;
    joinRoom(roomConfig?: ZegoCloudRoomConfig): void;
    destroy(): void;
    setCallInvitationConfig(config?: ZegoCallInvitationConfig): void;
    sendCallInvitation(params: {
        callees: ZegoUser[];
        callType: ZegoInvitationType;
        timeout?: number;
        data?: string;
        notificationConfig?: ZegoSignalingPluginNotificationConfig;
    }): Promise<{
        errorInvitees: ZegoUser[];
    }>;
}
