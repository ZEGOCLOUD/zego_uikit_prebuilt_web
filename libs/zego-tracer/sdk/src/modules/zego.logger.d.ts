/// <reference types="node" />
import { ENUM_REMOTE_TYPE, Queue, ZEGO_ENV, LogParams, ReportDataItem, ENUM_NETWORK_STATE, ENUM_CONNECT_STATE } from '../common/zego.entity';
import { ZegoWeiXinMiniWebSocket } from '../util/zego.webSocket';
import { LogService } from '../common/service';
export declare class ZegoLogger {
    private env;
    private product;
    private pro;
    static instance: ZegoLogger;
    service: LogService;
    logType: ENUM_REMOTE_TYPE;
    url: string;
    websocket: WebSocket | ZegoWeiXinMiniWebSocket | null;
    packageLen: number;
    packagesDataSize: number;
    PACKAGE_MAX_LEN: number;
    msgID: number;
    logUploadTimer: NodeJS.Timer | null;
    logUploadInterval: number;
    logCacheSend: string[];
    logCacheMax: number;
    tokenBucket: any;
    reportQueue: Queue<any>;
    private reportDataCheckTimer;
    private reportDataCheckInterval;
    postSucCallbackList: {
        [index: string]: Function;
    };
    postFailCallbackList: {
        [index: string]: Function;
    };
    failCount: number;
    failStartTime: number;
    netWorkFail: boolean;
    logParams: LogParams;
    networkState: ENUM_NETWORK_STATE;
    state: ENUM_CONNECT_STATE;
    constructor(env: ZEGO_ENV, bps: number, product: string, pro: string);
    bindWindowListener(): void;
    setLogServer(url: string): boolean;
    setLogUrlParams(logParams: LogParams): void;
    private openWebSocketLogServer;
    private stopWebSocketServer;
    private openHttpsLogServer;
    private stopHttpsServer;
    private SendHttpsLog;
    private SendHttpsLogWeb;
    SendHttpsLogWeChatMini(reportDatas: any, dataLen: number, suc: Function, fail: Function): void;
    openHandler(): void;
    setPostSucCallback(product: string, callback: Function): void;
    setPostFailCallback(product: string, callback: Function): void;
    reportAllowed(): boolean;
    report(reportDatas: any[], dataLen: number, product: string): void;
    setBps(bps: number): void;
    startReport(): void;
    reportData(reportDatas: ReportDataItem[], dataLen: number, product: string, suc: Function, fail: Function): void;
    unsigned2signed(unsigned: any): string | number;
    decodeReportQueue(): any;
}
