/// <reference types="node" />
import { ZegoLogger } from "./zego.entity";
import { StateCenter } from "./stateCenter";
export declare class HttpRetryHandler {
    protected _zgp_logger: ZegoLogger;
    protected _zgp_stateCenter: StateCenter;
    attempt: number;
    _zgp_baseInterval: number;
    _zgp_capInterval: number;
    _zgp_retryRule: number;
    retryTimer: NodeJS.Timeout | null | number;
    maxTimer: NodeJS.Timeout | null | number;
    isOverTime: boolean;
    requestInfo: any;
    sucCallBack: Function | undefined;
    failCallBack: Function | undefined;
    RETRY_MAX_TIME: number;
    _err: any;
    constructor(_zgp_logger: ZegoLogger, _zgp_stateCenter: StateCenter);
    /**
     * 0: 默认规则 -> 基础间隔 0.3s， 前两次 attempt 视作 0，第三次开始使用正常 attempt，最大 _zgp_capInterval 4.8s，即 0.3s、0.3s、1.2s、2.4s、4.8s
     * 1: 特殊规则1（gateway 返回 429 或 5XX），基础间隔 0.3s，attempt 从 2 开始，最大 cap 32s，即 0.3s、0.3s、1.2s、2.4s...32s
     * @param rule
     */
    setRetryRule(rule: number): void;
    getRetryDelayByCount(attempt: number): number;
    initCallback(sucCallBack: Function, failCallBack: Function): void;
    startMaxTime(): void;
    invalid(): void;
    clearRetryTimer(): void;
    requestFail(err?: any): void;
    stopMaxTime(): void;
    resetCallback(): void;
}
