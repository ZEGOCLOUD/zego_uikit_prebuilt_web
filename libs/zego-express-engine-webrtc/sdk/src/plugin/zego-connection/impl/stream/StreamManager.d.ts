import { AccessHubMessageType, StreamType } from '../../entity/AccessHubDefine';
import { ZegoWssLink } from '../net/ZegoWssLink';
import { ZegoLinkStream } from './ZegoLinkStream';
export declare class StreamManager {
    private _zegoLink;
    streamID: number;
    pcStreams: ZegoLinkStream[];
    streams: ZegoLinkStream[];
    hbStream: ZegoLinkStream | undefined;
    constructor(_zegoLink: ZegoWssLink);
    destroy(): void;
    createStream(streamType: StreamType): ZegoLinkStream;
    getHbStream(): ZegoLinkStream;
    getFreeStream(streamType: StreamType): ZegoLinkStream;
    onPushEvent(streamID: number, msgType: AccessHubMessageType, msg: any, extras?: any): void;
    getNextStreamID(): number;
    refreshAllStream(): void;
    clearStreams(): void;
}
