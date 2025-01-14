export declare class APIReportController {
    private _zgp_lastReportTime;
    private _zgp_maxDeltaTime;
    private _zgp_triggerCount;
    constructor(maxDeltaTime: number);
    trigger(): {
        toReport: boolean;
        failCount?: number;
    };
}
