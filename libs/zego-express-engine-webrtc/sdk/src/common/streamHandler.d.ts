import { StateCenter } from "./stateCenter";
import { ERRO, ZegoResponse, ZegoRoomInfo, CdnPushConfig, ZReporter, MiniStreamDispatchRequest } from "./zego.entity";
import { ZegoLogger } from "../common/zego.entity";
import { ZegoExpressWebRTM } from "../rtm";
import { ZegoStreamCenter } from "./streamCenter";
export interface ServerRoomStreamInfo {
    stream_id: string;
    anchor_id_name?: string;
    id_name?: string;
    user_id?: string;
}
export declare class StreamHandler {
    private _zgp_logger;
    private _zgp_stateCenter;
    private rtm;
    private _zgp_streamCenter;
    private _zgp_roomID;
    private _zgp_minStreamSeq;
    private _zgp_streamSeq;
    private _zgp_maxFullStreamSeq;
    private _zgp_streamQuerying;
    private _zgp_streamSeqMergeMap;
    private _zgp_streamSeqMergeTimer;
    private _zgp_streamListHBMergeInterval;
    private _zgp_streamListMergeInterval;
    room?: ZegoRoomInfo;
    mixStreamTaskList: {
        [index: string]: {
            mixStatusVer: number;
            requestId: string;
        };
    };
    mixRequestIdList: string[];
    mixStreamHbList: {
        [index: string]: {
            timer?: any;
        };
    };
    roomID: string;
    stateCenter: StateCenter;
    logger: ZegoLogger;
    private get _zgp_reporter();
    get reporter(): ZReporter;
    constructor(_zgp_logger: ZegoLogger, _zgp_stateCenter: StateCenter, rtm: ZegoExpressWebRTM, _zgp_streamCenter: ZegoStreamCenter, _zgp_roomID: string);
    private _setCDNInfo;
    onStreamUpdated(roomid: string, type: number, streamList: any[]): void;
    onStreamExtraInfoUpdated(roomid: string, streamList: any[]): void;
    onStreamAttrUpdated(roomid: string, streamList: any[]): void;
    handleStreamStart(msg: any, room: ZegoRoomInfo): void;
    onFullUpdateStream(newStreamList: Array<ServerRoomStreamInfo>): void;
    onPublishStateUpdate(type: number, streamId: string, error: ERRO): void;
    _updateStreamInfo(streamid: string, cmd: string | number, stream_extra_info?: string, success?: Function, error?: Function, stream_attr_opts?: {
        stream_resource?: number;
        stream_codec?: number;
    }): void;
    updateStreamInfo(streamid: string, cmd: string | number, stream_extra_info?: string, success?: Function, error?: Function, stream_attr_opts?: {
        stream_resource?: number;
        stream_codec?: number;
    }): void;
    handleStreamUpdateRsp(msg: any, streamid?: string, cmd?: number | string): void;
    handleStreamSync(msg: any, streamID: string, cmd?: string | number): void;
    handleStreamRsp(room: ZegoRoomInfo, streamID: string, streamInfo: any, cmd?: string | number): void;
    handleFetchStreamListRsp(msg: any, updateStreamID?: string): void;
    syncPublishStreamList(): void;
    handleFullUpdateStream(serverStreamSeq: number, serverStreamList: any[]): void;
    handlePushStreamUpdateMsg(msg: any): void;
    private _zgp_handleAddedStreamList;
    private _zgp_handleDeletedStreamList;
    private _handleUpdatedStreamList;
    fetchStreamList(streamID?: string): void;
    private _handleReconnectStream;
    makeCallbackStreamList(streamList: any[]): any;
    sendHttpPBRequest(httpURLs: {
        interfaceID: number;
        resID?: string;
        protoCmd?: string;
    }, reqBody: Uint8Array, suc: Function, err: Function, options?: {
        timeout?: number;
    }): void;
    sendMixRequest(httpURLs: {
        interfaceID: number;
        resID?: string;
        protoCmd?: string;
    }, reqBody: Uint8Array, suc: Function, err: Function, retryCount?: number): void;
    sendRTMPRequest(app: string, requestInfo: MiniStreamDispatchRequest, success: (res: any) => void, fail: (res: any) => void): void;
    _publishTarget(cdnPushConfig: CdnPushConfig, success: (result: {
        errorCode: number;
        extendedData: string;
    }) => void, error: (err: {
        code: number;
        message: string;
    }, externMsg?: string) => void): void;
    updateStreamExtraInfo(streamid: string, extraInfo: string, success: Function, error: Function): void;
    getMixStreamStatus(transResults: any): void;
    setStreamExtraInfo(streamID: string, extraInfo: string, success: Function, error: (err: {
        code: number;
        message: string;
    }, errMsg: string) => void): void;
    _publishTargetWeb(cdnPushConfig: any, success: (result: ZegoResponse) => void, error: (err: ERRO, externMsg?: string) => void): void;
    patchStreamList(msg: any): void;
    getStreamSeq(): number;
    mergeStreamByStreamSeq(cmd: number, streamSeq: number, streamList: any[]): void;
    handleMergeTimeout(): void;
    mergeStream(streamSeqList: any[]): void;
    reset(): void;
}
