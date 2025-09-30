import { LOG_LEVEL_STR } from '../common/zego.entity';
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
export declare class ZegoLog {
    logLevel: number;
    constructor();
    /**
     *
     * 设置本地日志级别
     *
     * */
    setLogLevel(level: LOG_LEVEL_STR): boolean;
    debug(...values: string[]): void;
    log(...values: string[]): void;
    info(...values: string[]): void;
    warn(...values: string[]): void;
    error(...values: string[]): void;
}
