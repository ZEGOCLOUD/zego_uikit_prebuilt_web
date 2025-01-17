import { AccessHubMessageType, StreamType } from '../../entity/AccessHubDefine';
import { ZegoWssLink } from '../net/ZegoWssLink';
export declare class ZegoLinkStream {
    type: StreamType;
    private _streamID;
    private _zegoLink;
    isFree: boolean;
    isFirst: boolean;
    timestamp: number;
    constructor(type: StreamType, _streamID: number, _zegoLink: ZegoWssLink);
    get StreamID(): number;
    private _updateTimestamp;
    refresh(streamID: number): void;
    sendMessage(type: AccessHubMessageType, body: any, successFunc?: Function | null, errorFunc?: Function | null, ackFunc?: Function | null, option?: {
        timeout?: number;
        isInSendMap?: boolean;
        extras?: any;
        isMsgCache?: boolean;
    }): void;
    onPushEvent(msgType: AccessHubMessageType, msg: any, extras?: any): void;
    closeStream(code: number, msg: string): void;
    destroyed(): void;
    isConnect(): boolean;
    onDestroyed(): void;
}
