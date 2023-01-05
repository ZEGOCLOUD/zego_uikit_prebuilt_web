/// <reference types="node" />
import ZIM from "zego-zim-web";
import { CallInvitationEndReason, CallInvitationInfo, ScenarioModel, ZegoCallInvitationConfig, ZegoCloudRoomConfig, ZegoInvitationType, ZegoSignalingPluginNotificationConfig, ZegoUser } from "../../model";
export declare class ZimManager {
    _zim: ZIM | null;
    isLogin: boolean;
    isServiceActivated: boolean;
    expressConfig: {
        appID: number;
        userID: string;
        userName: string;
        roomID: string;
        token: string;
    };
    callInfo: CallInvitationInfo;
    inSendOperation: boolean;
    inRefuseOperation: boolean;
    inAcceptOperation: boolean;
    inCancelOperation: boolean;
    config: ZegoCallInvitationConfig;
    incomingTimer: NodeJS.Timer | null;
    outgoingTimer: NodeJS.Timer | null;
    constructor(ZIM: ZIM, expressConfig: {
        appID: number;
        userID: string;
        userName: string;
        roomID: string;
        token: string;
    });
    private initListener;
    private answeredTimeoutCallback;
    sendInvitation(invitees: ZegoUser[], type: number, timeout: number, data: string, notificationConfig?: ZegoSignalingPluginNotificationConfig): Promise<{
        errorInvitees: ZegoUser[];
    }>;
    cancelInvitation(data?: string): Promise<void>;
    refuseInvitation(reason?: string, callID?: string, data?: string): Promise<void>;
    acceptInvitation(data?: string): Promise<void>;
    private clearCallInfo;
    destroy(): void;
    private notifyJoinRoomCallback;
    /** 通知UI层调用joinRoom */
    notifyJoinRoom(func: (type: ZegoInvitationType, roomConfig: ZegoCloudRoomConfig, mode: ScenarioModel) => void): void;
    private notifyLeaveRoomCallback;
    /** 通知UI层调用leaveRoom */
    notifyLeaveRoom(func: () => void): void;
    private onUpdateRoomIDCallback;
    /**收到邀请后需要更新roomID*/
    onUpdateRoomID(func: (roomID: string) => void): void;
    /**结束 call,清除 callInfo */
    endCall(reason: CallInvitationEndReason): void;
    setCallInvitationConfig(config: ZegoCallInvitationConfig): void;
    private clearOutgoingTimer;
    private clearIncomingTimer;
}
