import { AccessHubMessageType } from "../../entity/AccessHubDefine";
export declare enum ZEGO_ENV {
    BROWSER = 0,
    WEIXINMINI = 1
}
export declare class ZegoWeiXinMiniWebSocket {
    url: string;
    readyState: number;
    _websocket: any;
    constructor(url: string, protocol?: string);
    init(): void;
    onopen(e: any): void;
    onerror(e: any): void;
    onclose(e: any): void;
    onmessage(e: any): void;
    send(msg: string | ArrayBufferLike | Blob | ArrayBufferView, streamId?: number, type?: AccessHubMessageType): void;
    close(): void;
}
export declare type ZegoWebSocket = ZegoWeiXinMiniWebSocket | WebSocket;
export declare function createZegoWebSocket(url: string, env: ZEGO_ENV, proxyCtrl?: any): ZegoWebSocket;
