import { Tracer } from '../tracer/Tracer';
import { ZegoSpan } from './zego-span';
import { InitOptions, SampleConfig, ZSpanOptions } from './type';
import { Span } from '../tracer/Span';
import { ZegoDataReport } from '../reporter/zego.datareport';
import { LOG_LEVEL_STR, ZegoStore } from '../common/zego.entity';
import { ZegoLog } from '../util/zego.logger';
import { StateCenter } from '../common/stateCenter';
export declare class ZegoTracer {
    tracer: Tracer;
    reporter: ZegoDataReport;
    _maxTracingSpanSize: number;
    rootSpan: Span;
    name: string;
    level: number;
    dyStore: ZegoStore;
    options: InitOptions;
    log: ZegoLog;
    stateCenter: StateCenter;
    constructor(proxyCtrl?: any);
    /**
     * 初始化
     * @param options
     */
    init(options: InitOptions): void;
    private _initRoot;
    /**
     * 创建 span
     * @param name span name
     * @param options 额外参数
     * @returns
     */
    createSpan(level: number, name: string, options?: ZSpanOptions): ZegoSpan;
    setLogger(logger: any): void;
    setTimeOffset(offset: number): void;
    setWaitNtpTimeout(timeout: number): void;
    /**
     *
     * 设置本地日志级别
     *
     * */
    setLogLevel(level: LOG_LEVEL_STR): boolean;
    /**
     * 开始上报
     * @param startCommonField 开始上报传入的信息，userID、token
     * @returns
     */
    startReport(startCommonField: Map<string, string>): boolean;
    /**
     * 动态设置配置
     * @param cfg
     */
    setConfig(cfg: {
        bps?: number;
        totalDBSize?: number;
        serverUrl?: string;
    }): void;
    loadJs(isRemote: boolean, url: string, key: string, hash: string, code: string, param: any): Promise<void>;
    /**
     * 强制上报
     * @param cfg 强制上报的配置
     * @returns
     */
    flush(cfg?: {
        bps?: number;
    }): void;
    setUnloadState(level: number): void;
    shutdown(): void;
    destroy(): void;
    /**
     * 立即导出所有未导出的span
     * @returns
     */
    /**
     * 设置exporter sample tags
     * @param config
     */
    setSampleConfig(config: SampleConfig): void;
    setResource(resource: any): void;
    setNetStateCheck(): void;
}
