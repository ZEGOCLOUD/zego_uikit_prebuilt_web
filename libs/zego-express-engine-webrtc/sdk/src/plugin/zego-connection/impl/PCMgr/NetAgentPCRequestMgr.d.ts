import { ZegoLogger } from '../../util/logger';
import { PcConnectState, BusinessService, DisconnectedType, PCOption, ERROR } from '../../entity/AccessHubDefine';
import { NetAgentPCRequest } from './NetAgentPCRequest';
import { StreamManager } from '../stream/StreamManager';
export declare class NetAgentPCRequestMgr {
    private _streamManager;
    private _logger;
    pcStreamRequests: NetAgentPCRequest[];
    pcEstablishTimeout: number;
    constructor(_streamManager: StreamManager, _logger: ZegoLogger);
    setLogger(logger: ZegoLogger): void;
    getRequest(service: BusinessService, option?: PCOption): NetAgentPCRequest;
    updateConnectState(state: PcConnectState, type: DisconnectedType, error?: ERROR): void;
    closePCs(errorCode: number): void;
    setEstablishTimeout(timeout: number): void;
}
