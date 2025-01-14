export declare abstract class RetryHandler {
    RETRY_MAX_TIME: number;
    RETRY_START_TIME_INTERVAL: number;
    RETRY_CONTINUE_COUNT: number;
    RETRY_MAX_TIME_INTERVAL: number;
    retryTimer: any;
    maxTimer: any;
    startRetryTimer: any;
    retryStartTime: number;
    retryActiveCount: number;
    retryActiveInterval: number;
    /**用于检测网络进行重试 */
    retryNetCount: number;
    /**用于检测网络重试最大次数 */
    retryNetMaxTimes: number;
    isOverTime: boolean;
    constructor();
    init(retryMaxTime?: number, startTimeInterval?: number, retryContinueCount?: number, maxTimeInterval?: number): void;
    invalid(): void;
    isRetrying(): boolean;
    abstract startMaxTime(): void;
    abstract stopMaxTime(): void;
    abstract active(...args: Array<any>): void;
    abstract onactive(...args: Array<any>): void;
}
