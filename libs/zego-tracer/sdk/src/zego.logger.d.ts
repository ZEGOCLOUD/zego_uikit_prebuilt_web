/// <reference types="node" />
import { ENUM_REMOTE_TYPE, ZEGO_ENV, LOG_LEVEL_STR } from './zego.entity';
import { ZegoWeiXinMiniWebSocket } from '../util/zego.webSocket';
import { LoggerStateCenter } from '../util/zego.stateCenter';
export declare class ZegoLogger {
    static instance: ZegoLogger;
    appid: number;
    roomid: string;
    sessionid: string;
    userid: string;
    userName: string;
    version: string;
    logType: ENUM_REMOTE_TYPE;
    logLevel: number;
    logRemoteLevel: number;
    stateCenter: LoggerStateCenter;
    websocket: WebSocket | ZegoWeiXinMiniWebSocket | null;
    url: string;
    logUploadTimer: NodeJS.Timer | null;
    logUploadInterval: number;
    timeInterval: number;
    logCache: never[];
    logCacheSend: string[];
    logCacheMax: number;
    existUserID: boolean;
    env: ZEGO_ENV;
    constructor(env: ZEGO_ENV);
    static getInstance(env: ZEGO_ENV): ZegoLogger;
    report(data: any): void;
    /**
     *
     * 设置本地日志级别
     *
     * */
    setLogLevel(level: LOG_LEVEL_STR): boolean;
    /**
     *
     * 设置上报日志级别
     *
     * */
    setRemoteLogLevel(level: LOG_LEVEL_STR): boolean;
    setSessionInfo(appid: number, roomid: string, sessionid: string, userid: string, userName: string, version: string): void;
    debug(...values: string[]): void;
    info(...values: string[]): void;
    warn(...values: string[]): void;
    error(...values: string[]): void;
    private log;
    setLogServer(url: string): boolean;
    private stopLogServer;
    private stopWebSocketServer;
    private openHttpsLogServer;
    private stopHttpsServer;
    private RemoteLog;
    private RemoteWebSocketLog;
    private RemoteHttpsLog;
    private logParamList;
    private logReportParamList;
    private openWebSocketLogServer;
    private SendHttpsLog;
    private SendHttpsLogWeb;
    SendHttpsLogWeChatMini(): void;
}
