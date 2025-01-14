import { ZegoLogger } from '../util/logger';
import { AppInfo } from '../entity/AccessHubDefine';
import { AccessHubProtoBuf } from '../protocol/AccessHubProtoBuf';
import { StateCenter } from './stateCenter';
import { StreamManager } from './stream/StreamManager';
export declare class NetAgentBusinessRequestMgr {
    private _streamManager;
    private _protobuf;
    private _logger;
    protected stateCenter: StateCenter;
    constructor(_streamManager: StreamManager, _protobuf: AccessHubProtoBuf, _logger: ZegoLogger, stateCenter: StateCenter);
    get appInfo(): AppInfo;
    setLogger(logger: ZegoLogger): void;
    getConfig(suc: Function, err: Function): void;
    dispatchURL(success: Function, fail: Function): void;
    getAppConfig(type: string, userID: string, token: string, timeout?: number, etag?: number, options?: {
        isSpecial?: boolean;
    }): Promise<{
        code: number;
        data?: any;
        etag?: number;
    }>;
    decodeConfigMessage(data: Uint8Array): any;
    getSvrAddr(): Promise<unknown>;
}
