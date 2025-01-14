import { AccessHubMessageType, ConnectEvent, DestroyType, StreamType } from '../../entity/AccessHubDefine';
export declare abstract class ZegoLink {
    txid: number;
    linkRetryTime: number;
    updatedMsgTime: number;
    connectServer: string;
    constructor();
    createSocket(servers: string[]): void;
    setState(state: number): void;
    abstract connectSocket(isNext?: boolean, success?: Function, fail?: Function): boolean;
    abstract isConnect(): boolean;
    abstract isDisConnect(): boolean;
    abstract isConnecting(): boolean;
    initEvent(onConnectedEvent: (servers: string[], connectEvents: ConnectEvent[]) => void, onDisConnectedEvent: (isReconnect: boolean) => void, onConnectingEvent: (isReconnect: boolean) => void, onPushEvent: (streamID: number, msgType: number, msg: any) => void, onBackToWebSocket: () => void): void;
    sendMessage(type: AccessHubMessageType, streamID: number, body: any, isFirst: boolean | undefined, success: Function | null | undefined, error: Function | null | undefined, ackFunc: Function | null | undefined, option: {
        timeout?: number | undefined;
        isInSendMap?: boolean | undefined;
        extras?: any;
        isMsgCache?: boolean | undefined;
    } | undefined, streamType: StreamType): void;
    abstract destroySocket(type: DestroyType, error?: {
        code: number;
        msg: string;
    }): void;
    abstract resetConnect(): void;
    abstract release(): void;
}
