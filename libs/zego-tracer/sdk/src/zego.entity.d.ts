import { ZegoWechatMiniStore } from '../util/zego.store';
import { ZegoWeiXinMiniWebSocket } from '../util/zego.webSocket';
export declare enum ZEGO_ENV {
    BROWSER = 0,
    WEIXINMINI = 1
}
export interface InitConfig {
    appID: number;
    token: string;
    serverUrl: string;
    env: ZEGO_ENV;
    dbLevel: number;
    levels: number[];
    byteLength?: number;
    size?: number;
}
export declare enum ZEGO_BROWSER_TYPE {
    IE = 0,
    FIREFOX = 1,
    CHROME = 2,
    SAFARI = 3,
    OPERA = 4,
    WEIXIN = 5,
    WEIXINMINI = 6,
    UNKOWN = 7
}
export declare enum ENUM_REMOTE_TYPE {
    DISABLE = 0,
    WEBSOCKET = 1,
    HTTPS = 2
}
export declare const ENUM_LOG_LEVEL: {
    DEBUG: number;
    INFO: number;
    WARN: number;
    ERROR: number;
    REPORT: number;
    DISABLE: number;
    debug: number;
    info: number;
    warn: number;
    error: number;
    report: number;
    disable: number;
};
export declare type LOG_LEVEL_STR = 'debug' | 'info' | 'warn' | 'error' | 'report' | 'disable';
export declare enum E_CLIENT_TYPE {
    ClientType_None = 0,
    ClientType_H5 = 1,
    ClientType_SmallPragram = 2,
    ClientType_Webrtc = 3
}
export interface DataStatisticsItemEvent {
    event: string;
    event_time: number;
    time_consumed?: number;
    msg_ext?: {
        [index: string]: string | number;
    };
}
export interface DataStatisticsItem {
    content: string;
    seq: number;
    timestamp: number;
    level: number;
}
export interface DataStatistics {
    [index: string]: DataStatisticsItem;
}
export declare const getSeq: Function;
export declare type ZegoWebSocket = ZegoWeiXinMiniWebSocket | WebSocket;
export declare type ZegoStore = LocalForage | ZegoWechatMiniStore;
