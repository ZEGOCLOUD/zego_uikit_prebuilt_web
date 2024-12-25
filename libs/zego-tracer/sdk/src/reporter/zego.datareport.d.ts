import { InitConfig } from '../common/zego.entity';
import { ZegoService } from './zego.service';
import { ZegoStoreHandler } from './zego.storeHandler';
import { PendingQueue } from './pendingQueue';
import { StateCenter } from '../common/stateCenter';
export declare class ZegoDataReport {
    private _stateCenter;
    zegoService: ZegoService;
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
    startCommonField: Map<string, string>;
    isLoadReportData: boolean;
    dropCount: number;
    reportMap: any;
    timeInterval: boolean;
    reportTimer: any;
    clientTimeOffset: number;
    isWaitNtpTimeout: boolean;
    ntpTimer: any;
    waitNtpTimeout: number;
    unloadLevel: number;
    postDataState: string;
    checkDataTimer: any;
    constructor(product: string, _stateCenter: StateCenter);
    /**
     * 初始化
     * @param config 初始化配置
     */
    init(config: InitConfig): Promise<void>;
    uninit(): void;
    setConfig(cfg: {
        bps?: number;
        totalDBSize?: number;
        serverUrl?: string;
    }): void;
    /**
     * 暂停上报
     */
    pause(): void;
    /**
     * 恢复上报
     */
    resume(): void;
    /**
     * 开始上报，需要传入 userId 信息方能上报
     * @param startCommonField 开始上报传入的信息，如userID、token
     * @returns
     */
    startReport(startCommonField: Map<string, string>): boolean;
    setTimeOffset(offset: number): void;
    setProcessData(process: any): void;
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
    setUnloadState(level: number): void;
    /**
     * 数据落地内存/DB
     * @param data
     * @param level
     */
    private _dumpData;
    private _isWithNtp;
    /**
     * 把 buffer 数据落地 cache/DB
     */
    private _bufferDump;
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
    flush(cfg?: {
        bps?: number;
    }): void;
    setWaitNtpTimeout(timeout: number): void;
    private _setWaitNtpTimer;
    private _startReportTimer;
    private _checkCacheDataTimer;
    private _bindWindowListener;
    saveDataBeforeUnload(): void;
    setNetStateCheck(): void;
    private _postSucHandler;
    private _checkPendingQueue;
    private _initPendingQueue;
    private _loadDBDataToMem;
    private _storePendingDataToDB;
    private _storePackagesDataToDB;
    private _storeDataItem;
    private _loadReportData;
    private _setCommonField;
    private _bindListener;
    private _deleteListener;
    private _actionListener;
}
