import { LinkType, StreamType } from './../../entity/AccessHubDefine';
import { AccessHubMessageType } from '../../entity/AccessHubDefine';
import { WebTransportError } from '../../entity/http3';
export declare class NetSocketService {
    private proxyCtrl?;
    private _socket;
    ENV: number;
    server: string;
    type: LinkType;
    constructor(ENV: number, proxyCtrl?: any);
    createSocket(server: string, type: LinkType): void;
    openHandler(handle: (e: any) => void): void;
    responseHandler(): void;
    onMessage(msg: any, streamId?: number, bidirectionalStreamID?: number): void;
    closeHandler(handler: (e: any) => void): void;
    errorHandler(handler: (e: any) => void): void;
    closeSocket(): void;
    isDisConnect(): boolean;
    sendMessage(msg: ArrayBuffer, streamId: number, type: AccessHubMessageType, streamType: StreamType): void;
    onBackToWebSocket(reason: WebTransportError, error: any): void;
    closeStream(streamID: number): void;
    hasStream(streamID: number): boolean;
}
