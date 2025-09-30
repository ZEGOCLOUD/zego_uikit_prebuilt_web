import { InitConfig } from '../common/zego.entity';
import { ZegoLogger } from './zego.logger';
import { ZegoStoreHandler } from './zego.storeHandler';
import { PendingQueue } from './pendingQueue';
export declare class ZegoDataReport {
    logger: ZegoLogger;
    product: string;
    config: InitConfig;
    pendingQueue: PendingQueue;
    storeHandler: ZegoStoreHandler;
    QUEUE_MAX: number;
    cacheMaxSize: number;
    cacheDelPer: number;
    state: string;
    forceDataTotalLen: number;
    reportPackagesSize: number;
    staticConfig: {
        totalAvailCache: number;
        totalDBSize: number;
        bps: number;
    };
    dataInDb: string[];
    listenerList: {
        [index: string]: Array<Function>;
    };
    tempBuffer: {
        data: Record<string, any>;
        level: number;
    }[];
    userID: string;
    traceType: {
        MEM_I_API: number;
        MEM_O_DONE: number;
        MEM_O_DUMP: number;
        MEM_I_LOAD: number;
        DB_O_DROP: number;
        DB_O_DONE: number;
        DB_I_BACKUP: number;
    };
    isPaused: boolean;
    pro: string;
    reporterCommonField: Map<string, string>;
    startCommonField: Map<string, string>;
    isLoadReportData: boolean;
    constructor(product: string);
    /**
     * 初始化
     * @param config 初始化配置
     */
    init(config: InitConfig): Promise<void>;
    setConfig(cfg: {
        bps?: number;
        totalDBSize?: number;
        serverUrl?: string;
    }): void;
    pause(): void;
    /**
     * 开始上报
     * @param startCommonField 开始上报传入的信息，如userID、token
     * @returns
     */
    startReport(startCommonField: Map<string, string>): boolean;
    resume(): void;
    /**
     * 监听事件，如强制上报进度
     * @param event 事件
     * @param callback 回调方法
     * @returns
     */
    on(event: string, callback: Function): boolean;
    /**
     * 移除事件监听
     * @param event 事件
     * @param callback 回调方法
     * @returns
     */
    off(event: string, callback: Function): boolean;
    /**
     * 上报数据
     * @param data 上报的数据
     * @param level 数据级别
     * @returns
     */
    report(data: string, level: number): boolean;
    dumpData(data: string, level: number): void;
    private bufferDump;
    isConfigOK(config: {
        userID: string;
        token: string;
        server: string;
    }): boolean;
    testSize(content: any): void;
    /**
     * 强制上报
     * @param cfg 强制上报的配置
     * @returns
     */
    forceReport(cfg?: {
        bps?: number;
    }): void;
    private bindWindowListener;
    private postSucHandler;
    private checkPendingQueue;
    private initPendingQueue;
    private loadDBDataToMem;
    private storePendingDataToDB;
    private storePackagesDataToDB;
    private storeDataItem;
    private loadReportData;
    private setCommonField;
    private _bindListener;
    private _deleteListener;
    private _actionListener;
}
