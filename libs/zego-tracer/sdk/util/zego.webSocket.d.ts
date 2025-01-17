import { ZegoWebSocket, ZEGO_ENV } from '../src/zego.entity';
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
    send(msg: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    close(): void;
}
export declare function createZegoWebSocket(url: string, env: ZEGO_ENV): ZegoWebSocket;
