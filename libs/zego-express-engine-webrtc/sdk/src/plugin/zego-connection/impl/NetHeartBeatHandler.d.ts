import { ZegoLogger } from '../util/logger';
import { ZegoLinkStream } from './stream/ZegoLinkStream';
import { StreamManager } from './stream/StreamManager';
import { StateCenter } from './stateCenter';
export declare enum HeartBeatMode {
    /**
     * 信令每次发消息都重置计时器，在没有消息五秒后发送心跳。
     */
    Lazy = "lazy",
    /**
     * 不重置计时器，固定五秒频率发送心跳
     */
    Periodic = "periodic"
}
export declare class NetHeartBeatHandler {
    private _streamManager;
    private _logger;
    private _stateCenter;
    private _hbTimer;
    private _hbInterval;
    private _hbTimeout;
    private _hbTimeoutMaxCount;
    private _tryHbCount;
    private _checkingStartTime;
    get _hbStream(): ZegoLinkStream;
    mode: HeartBeatMode;
    constructor(_streamManager: StreamManager, _logger: ZegoLogger, _stateCenter: StateCenter);
    get _zgp_needHBCheck(): boolean;
    get _isTimeout(): boolean;
    setLogger(logger: ZegoLogger): void;
    init(msg: {
        data: {
            logic_hb_interval: number;
            logic_hb_timeout: number;
        };
    }): void;
    /**
     * 每当有发送其他消息就重置计时发心跳，不用一直发心跳包。每次发完。如果一次心跳间隔内没有收到任何消息回包，则发送心跳超时。
     */
    startHB(): void;
    private _sendHB;
    onHBTimeout(): void;
    stop(): void;
}
