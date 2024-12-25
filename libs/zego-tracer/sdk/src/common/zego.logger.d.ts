/// <reference types="node" />
import { ENUM_REMOTE_TYPE, ZEGO_ENV } from './zego.entity';
import { ZegoWeiXinMiniWebSocket } from '../util/zego.webSocket';
import { LogService } from './service';
import { TokenBucket } from '../util/token-bucket';
import { Queue } from './structure';
export declare class ZegoLogger {
    private env;
    static instance: ZegoLogger;
    service: LogService;
    logType: ENUM_REMOTE_TYPE;
    url: string;
    websocket: WebSocket | ZegoWeiXinMiniWebSocket | null;
    packageLen: number;
    PACKAGE_MAX_LEN: number;
    logUploadTimer: NodeJS.Timer | null;
    logUploadInterval: number;
    logCacheSend: string[];
    logCacheMax: number;
    tokenBucket: TokenBucket;
    reportQueue: Queue<any>;
    private reportDataCheckTimer;
    private reportDataCheckInterval;
    constructor(env: ZEGO_ENV);
    static getInstance(env: ZEGO_ENV): ZegoLogger;
    setLogServer(url: string): boolean;
    private openWebSocketLogServer;
    private stopWebSocketServer;
    private openHttpsLogServer;
    private stopHttpsServer;
    private SendHttpsLog;
    private SendHttpsLogWeb;
    SendHttpsLogWeChatMini(reportDatas: any[], dataLen: number, suc: Function, fail: Function): void;
    reportAllowed(): boolean;
    report(reportDatas: any[], dataLen: number): void;
    startReport(): void;
    reportData(reportDatas: any[], dataLen: number): void;
}
