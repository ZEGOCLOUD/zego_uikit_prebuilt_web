import { ZegoError } from '../zego.entity';
import { StateCenter } from '../stateCenter';
import { LiveRoomModules } from '.';
import { LiveRoomHandler } from './liveroomHandler';
import { ZegoLogger, ZegoDataReport } from '../../common/zego.entity';
export declare class HeartBeatHandler {
    private _zgp_logger;
    private _zgp_stateCenter;
    private _dataReport;
    private _zgp_liveRoomHandler;
    private _zgp_room;
    private _zgp_heartbeatTimer;
    private _zgp_heartbeatInterval;
    private get _zgp_reporter();
    private _zgp_heartbeatTimeout;
    private _zgp_overtimeTimer;
    private _zgp_initCount;
    private _zgp_hasReset;
    constructor(_zgp_logger: ZegoLogger, _zgp_stateCenter: StateCenter, _dataReport: ZegoDataReport, _zgp_liveRoomHandler: LiveRoomHandler, _zgp_room: LiveRoomModules);
    private _zgp_startOverTimeTimer;
    private _zgp_stopOverTimeTimer;
    init(msg: any): void;
    start(heartbeatInterval: number): void;
    private _zgp_handleHeartbeatRsp;
    heartbeatRspNotiFy(msg: any, roomID: string): void;
    hbLogout(err: ZegoError): void;
    resetHeartbeat(): void;
}
