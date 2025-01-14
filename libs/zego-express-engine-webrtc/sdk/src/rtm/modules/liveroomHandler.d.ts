import { TermType } from '../zego.entity';
import { ZegoDataReport, ZegoLogger } from "../../common/zego.entity";
import { StateCenter } from '../stateCenter';
import { LiveRoomModules } from '.';
import { ZegoExpressWebRTM } from '..';
import ZegoConnectionAgent from '../../plugin/zegoConnection';
export type SuccCallback = (msg: {
    body: any;
    header: any;
}, seq: number, params?: any) => void;
export type FailCallback = (msg: any, seq?: number, params?: any) => void;
export declare enum LIVEROOM_STATE {
    disconnected = 0,
    broken = 1,
    connected = 2
}
interface HeaderExtras {
    contextKey?: number;
}
export declare class LiveRoomHandler {
    private _zgp_logger;
    private _zgp_stateCenter;
    private _ua;
    private _dataReport;
    private rtm;
    private _zgp_liveroomRequest;
    private _zgp_crypto;
    seq: number;
    private _zgp_controls;
    private _zgp_sendCommandList;
    private _zgp_sendCommandMap;
    /** 保存第一次login使用的token, 用于logout校验 */
    private _zgp_logoutCheckToken;
    zPushSid: string;
    switchSessionID: any;
    private _zgp_loginKeyTransMap;
    private _zgp_sendDataCheckOnceCount;
    private _zgp_sendDataDropTimeout;
    private _zgp_sendDataCheckTimer;
    private _zgp_sendDataCheckInterval;
    private _zgp_protoInstance;
    private _zgp_roomKeyIDs;
    private _zgp_roomIDKeys;
    private _zgp_pushMsgCacheMap;
    private _zgp_swPushCmdList;
    private _zgp_onSwitchCmdList;
    private _zgp_noContextKeyCmdList;
    private _zgp_state;
    private _zgp_unStructCmdList;
    private _zgp_reloginToken;
    get nickName(): Uint8Array;
    get TermType(): TermType;
    private get _zgp_reporter();
    constructor(_zgp_logger: ZegoLogger, _zgp_stateCenter: StateCenter, _ua: ZegoConnectionAgent, _dataReport: ZegoDataReport, rtm: ZegoExpressWebRTM);
    isDisConnect(): boolean;
    getHeader(cmd: number, extra?: HeaderExtras): [number, Uint8Array];
    get isUaConnect(): boolean;
    sendMessage(cmd: string | number, body: Uint8Array, success?: SuccCallback, error?: FailCallback, params?: {
        roomID?: string;
    }, option?: {
        timeout: number;
    }, isInSendMap?: boolean): number;
    getHead(headerLen: number, bodyLen: number): Uint8Array;
    handlePush(data: Uint8Array, extras?: any): void;
    handleSwitchPush(header: any, body: any): void;
    handlePushTokenExpire(msg: any): void;
    handlePushKickout(msg: any, isSwitch: boolean): void;
    handlePushUserStateUpdateMsg(msg: any): void;
    handlePushStreamMsg(msg: any): void;
    handlePushSignalMsg(msg: any): void;
    handlePushMergeMsg(msg: any): void;
    handlePushCustomMsg(pushReq: {
        header: any;
        body: any;
    }): void;
    handlePushRoomMsg(msg: any): void;
    handlePushTransMsg(pushReq: {
        header: any;
        body: any;
    }): void;
    handlePushUserTransMsg(pushReq: {
        header: any;
        body: any;
    }): void;
    onSwitchMessage(header: any, decryptBody: Uint8Array): void;
    decodeResponseBody(header: any, bodyData: Uint8Array): any;
    login(room: LiveRoomModules, suc?: Function, err?: Function): void;
    private _zgp_transLoginRspKeys;
    transKeysName(obj: any, keys: [string, string][]): void;
    keysExist(obj: any, keys: string[]): void;
    longToStringNumber(obj: any, keys: string[], type: string): void;
    private _zgp_bytesToString;
    logout(room: LiveRoomModules, suc: SuccCallback, err: FailCallback): number;
    private _zgp_checkSendMessageList;
    private _zgp_checkMessageListTimeout;
    startCheck(): void;
    stopCheck(): void;
    protected handleSendCommandMsgRsp(msg: {
        [index: string]: any;
    }): void;
    getReqHead(room: LiveRoomModules): any;
    heartBeat(suc: SuccCallback, err: FailCallback, room: LiveRoomModules, timeout: number): void;
    fetchUserList(body: {
        user_index: number;
        sort_type: number;
    }, suc: SuccCallback, err: FailCallback, room: LiveRoomModules): number;
    sendRoomMsg(body: {
        msg_category: number;
        msg_type: number;
        msg_priority: number;
        msg_content: string;
    }, suc: SuccCallback, err: FailCallback, room: LiveRoomModules): number;
    sendReliableMessage(body: {
        trans_type: string;
        trans_data: string;
        trans_local_seq: number;
        trans_channel: string;
    }, suc: SuccCallback, err: FailCallback, room: LiveRoomModules): number;
    fetchReliableMessage(body: {
        fetch_array: {
            trans_type: string;
            trans_seq: number;
        }[];
        trans_channel: string;
    }, suc: SuccCallback, err: FailCallback, room: LiveRoomModules): number;
    fetchUserTransInfo(body: {
        fetch_array: {
            trans_type: string;
            trans_seq: number;
        }[];
        trans_channel: string;
    }, suc: SuccCallback, err: FailCallback, room: LiveRoomModules): number;
    sendCustomCommand(body: {
        dest_id_name: string[];
        custom_msg: string;
    }, suc: SuccCallback, err: FailCallback, room: LiveRoomModules): number;
    sendBigRoomMessage(body: {
        msgs: {
            msg_category: number;
            msg_type: number;
            msg_content: string;
            bigmsg_client_id: string;
        }[];
    }, suc: SuccCallback, err: FailCallback, room: LiveRoomModules): number;
    sendSignalCmd(body: {
        sub_cmd: number;
        signal_msg: string;
        dest_id_name: string[];
    }, suc: SuccCallback, err: FailCallback, room: LiveRoomModules): number;
    sendStreamUpdate(body: {
        sub_cmd: number;
        stream_msg: string;
        third_token?: string;
        stream_resource?: number;
        stream_codec?: number;
    }, suc: SuccCallback, err: FailCallback, room: {
        sessionID: any;
        roomID: any;
        roomSessionID: any;
    }): number;
    getStreamList(body: {}, suc: SuccCallback, err: FailCallback, room: {
        sessionID: any;
        roomID: any;
        roomSessionID: any;
    }): void;
    private _zgp_transBufForLog;
    transHeader(msg: any): any;
    transRsp(res: any): any;
    private _zgp_transBytes;
    transRspHead(rspHead: {
        code: number;
        message: string;
    }): {
        err_code?: number;
        err_message?: string;
    };
    private _zgp_decode;
    private _zgp_handleDisconnected;
    private _zgp_handleBroken;
    private _zgp_handleReconnecting;
    private _zgp_handleConnected;
    renewToken(body: {
        token: string;
    }, sucCallBack: (msg: any, seq: number) => void, failCallBack: (error: any) => void, room: LiveRoomModules): void;
    reset(): void;
    closeRequest(): void;
    resetSessionInfo(): void;
    processPushMsgCache(contextKey: any): void;
    clearAllPushMsgCache(): void;
    clearPushMsgCacheByRoomID(roomID: string): void;
    handleLogoutRsp(roomID: string): void;
}
export {};
