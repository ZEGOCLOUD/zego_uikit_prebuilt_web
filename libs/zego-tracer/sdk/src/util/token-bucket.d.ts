export declare class TokenBucket {
    private currentTokenCount;
    private nextRefreshTime;
    private unitAddNum;
    private maxTokenNum;
    constructor(unitAddNum: number, maxTokenNum: number, isFullStart: boolean);
    acquire(needTokenNum: number): boolean;
    calculateNextRefreshTime(currentTimestamp: number): number;
    doAcquire(needTokenNum: number, currentTimestamp: number): boolean;
    refreshCurrentTokenCount(currentTimestamp: number): void;
    calculateNeedAddTokenNum(currentTimestamp: number): any;
}
