/// <reference types="node" />
import { LinkedList, ListNode } from '../../entity/linkNode';
import { AccessHubMessageType, ConnectEvent, DestroyType, ERROR, StreamType } from '../../entity/AccessHubDefine';
import { AccessHubProtoBuf } from '../../protocol/AccessHubProtoBuf';
import { ZegoLink } from './ZegoLink';
import { NetSocketService } from './NetSocketService';
import { StateCenter } from '../stateCenter';
import { ZegoLogger } from '../../util/logger';
import { WebTransportError } from '../../entity/http3';
import { NetHeartBeatHandler } from '../NetHeartBeatHandler';
declare type MessageItem = {
    data: any;
    txid: number;
    sendTime: number;
    timeOut: number;
    ack: boolean;
    type: AccessHubMessageType;
    streamID: number;
    success: Function | null;
    error: Function | null;
    ackFunc: Function | null;
    isSend: boolean;
    isCheck: boolean;
    streamType: StreamType;
};
export declare class ZegoWssLink extends ZegoLink {
    private _protobuf;
    private _logger;
    protected _stateCenter: StateCenter;
    private proxyCtrl?;
    socketService: NetSocketService;
    urlIndex: number;
    http3Index: number;
    servers: string[];
    http3Servers: string[];
    updatedMsgTime: number;
    unUpdateMsgTimeTypes: AccessHubMessageType[];
    netLinkState: number;
    sendCommandList: LinkedList<MessageItem>;
    unSendCommandList: LinkedList<MessageItem>;
    sendCommandMap: {
        [index: number]: ListNode<MessageItem>;
    };
    unSendCommandMap: {
        [index: number]: ListNode<MessageItem>;
    };
    private _sendDataCheckOnceCount;
    private _sendDataDropTimeout;
    private _sendDataCheckTimer;
    private _sendDataCheckInterval;
    private _timeout;
    private _onConnectedEvent;
    private _onConnectingEvent;
    private _onDisConnectedEvent;
    private _onPushEvent;
    connectInterval: number;
    connectTimer: NodeJS.Timeout | null | number;
    connectRsp: {
        suc?: Function;
        fail?: Function;
    };
    unlogTypes: number[];
    tryServers: string[];
    tryConnectEvents: ConnectEvent[];
    connectStartTime: number;
    isTestedWebTransport: boolean;
    msgCache: {
        [index: number]: {
            streamID: number;
            data: Uint8Array;
            undecodedDataLen: number;
        };
    };
    private _startConnectTime;
    constructor(_protobuf: AccessHubProtoBuf, _logger: ZegoLogger, _stateCenter: StateCenter, proxyCtrl?: any);
    initSocketService(): void;
    private _HBHandler;
    set HBHandler(handler: NetHeartBeatHandler);
    setLogger(logger: ZegoLogger): void;
    initEvent(onConnectedEvent: (servers: string[], connectEvents: ConnectEvent[]) => void, onDisConnectedEvent: (isReconnect: boolean) => void, onConnectingEvent: (isReconnect: boolean) => void, onPushEvent: (streamID: number, msgType: number, msg: any, extras?: any) => void, onBackToWebSocket: (reason: WebTransportError, error: any) => void): void;
    createSocket(servers: string[]): void;
    setServers(servers: string[], http3Servers?: string[]): void;
    setHttp3Servers(servers: string[]): void;
    isNeedTestWebTransport(): boolean;
    destroySocket(type: DestroyType, error?: ERROR): void;
    refreshServers(servers: string[]): void;
    isEnableHttp3(): boolean;
    connectSocket(isNext?: boolean, success?: Function, failCB?: Function): boolean;
    closeCallback(type: 'close' | 'error', err: any): void;
    bindSocketEvent(): void;
    closeSocket(): void;
    private _connectEvent;
    resetConnect(): void;
    release(): void;
    isConnect(): boolean;
    isDisConnect(): boolean;
    isConnecting(): boolean;
    setState(state: number): void;
    closeHandler(handler: (evt: any) => void): void;
    openHandler(handler: () => void): void;
    errorHandler(handler: (evt: Event) => void): void;
    sendMessage(type: AccessHubMessageType, streamID: number, body: any, isFirst: boolean | undefined, success: Function | null | undefined, error: Function | null | undefined, ackFunc: Function | null | undefined, option: {
        timeout?: number | undefined;
        isInSendMap?: boolean | undefined;
        extras?: any;
        isMsgCache?: boolean | undefined;
    } | undefined, streamType: StreamType): void;
    checkUnSendMsgs(messageList: LinkedList<MessageItem>, messageMap: {
        [index: number]: ListNode<MessageItem>;
    }): void;
    clearUnsentMsgs(streamID: number): void;
    private _Uint8ToArrayBuffer;
    private sendUint8Data;
    onMessage(): void;
    isRspMsg(txid: number): boolean;
    startCheck(): void;
    stopCheck(): void;
    private _checkMessageListTimeout;
    private _checkSendMessageList;
    private clearMessageList;
    protected handleSendCommandMsgRsp(msgType: number, txid: number, body: any, extras?: any): void;
    private _onBackToWebSocket;
    /**
     * @description 获取可用的 http3 server
     * @returns {*}  {string}
     */
    getUseableHttp3Server(servers: string[]): string;
    /**
     * @description 获取需要测试的 http3 server
     * @param {string[]} servers 调度返回的 servers
     * @returns {*}  {string[]}
     */
    private _getNeedTestHttp3Serves;
    testWebTransport(servers: string[]): void;
    /**
     * @description 检测 http3Server 是否可用
     * 1. 连接 WebTransport
     * 2. 连接成功后发送 getConfig 请求
     * 3. 获取配置成功后关闭连接, 并且更新缓存
     * 4. 递归调用检测, 直到所有 server 都检测完毕或者有可用的 server
     */
    private startTestHttp3Server;
}
export {};
