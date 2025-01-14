import { ZegoLogger } from '../../util/logger';
import { BusinessService, HttpReq, HttpReq2 } from '../../entity/AccessHubDefine';
import { ZegoLinkStream } from '../stream/ZegoLinkStream';
import { StreamManager } from '../stream/StreamManager';
export declare class NetAgentHttpRequest {
    private _logger;
    private _streamManager;
    private _service?;
    get netHttpStream(): ZegoLinkStream;
    constructor(_logger: ZegoLogger, _streamManager: StreamManager, _service?: BusinessService | undefined);
    sendRequest(params: HttpReq, sucFunc?: Function | null, errFunc?: Function | null, ackFunc?: Function | null, option?: {
        timeout?: number;
    }): void;
    sendRequest2(reqs: HttpReq2, sucFunc?: Function | null, errFunc?: Function | null, ackFunc?: Function | null, option?: {
        timeout?: number;
        extras?: any;
    }): void;
}
