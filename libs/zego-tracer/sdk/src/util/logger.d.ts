export declare class ZegoLog {
    constructor();
    log(...values: string[]): void;
    debug(...values: string[]): void;
    info(...values: string[]): void;
    warn(...values: string[]): void;
    error(...values: string[]): void;
}
declare const log: ZegoLog;
export { log };
