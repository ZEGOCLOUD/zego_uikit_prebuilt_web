/// <reference types="node" />
import { AccessHubMessageType, BusinessService, ConnectedType, DisconnectedType, PcConnectState, PCOption } from '../../entity/AccessHubDefine';
import { EventManager } from '../../util/EventManager';
import { ZegoLogger } from '../../util/logger';
import { ZegoLinkStream } from '../stream/ZegoLinkStream';
import { StreamManager } from '../stream/StreamManager';
export interface ZegoPCEvent {
    connected: (type: ConnectedType) => void;
    broken: () => void;
    disconnected: (state: DisconnectedType, error?: any) => void;
    downLoadMessage: (payload: any, extras?: any) => void;
    exception: (msg: any, extras?: any) => void;
    pcConnectedEvent: (msg: any) => void;
    pcBrokenEvent: (msg: any) => void;
    pcDisconnectedEvent: (msg: any) => void;
}
export declare class NetAgentPCRequest {
    private _logger;
    private _service;
    private _streamManager;
    private _pcEstablishTimeout;
    private _option?;
    connectState: PcConnectState;
    lastConnectState: PcConnectState;
    brokenTimer: NodeJS.Timeout | number | null;
    listenerList: {
        [index: string]: Array<Function>;
    };
    pcEmitState: PcConnectState;
    eventManager: EventManager;
    private _netPcStream;
    get netPcStream(): ZegoLinkStream;
    constructor(_logger: ZegoLogger, _service: BusinessService, _streamManager: StreamManager, _pcEstablishTimeout: number, _option?: PCOption | undefined);
    createPcStream(): ZegoLinkStream;
    /**
     * 发送长连接消息
     * @param body 长连接内容
     * @param failFunc 失败回调
     * @param ackFunc 统一接入服务收到消息回调
     */
    sendRequest(body: {
        payload: any;
        ack?: boolean;
        isInSendMap?: boolean;
    }, failFunc?: Function, ackFunc?: Function, extras?: any): void;
    onPushEvent(msgType: AccessHubMessageType, msg: any, extras?: any): void;
    /**
     * 注册长连接回调
     * @param event 事件名
     * @param callBack 回调函数
     * @returns
     */
    on<K extends keyof ZegoPCEvent>(event: K, callBack: ZegoPCEvent[K]): boolean;
    /**
     * 删除长连接回调
     * @param event 事件名
     * @param callBack 回调函数
     * @returns
     */
    off(event: string, callBack?: Function): void;
    pcEstablished(msg: any, streamID: number): void;
    pcBroken(): void;
    resetBrokenTimer(): void;
    _close(state: string, errorCode: number, type?: DisconnectedType): void;
    closePc(errorCode: number): void;
    closeRequest(): void;
    setConnectState(newConnectState: PcConnectState): void;
    reportEvent(event: string, extraInfos?: any): void;
}
