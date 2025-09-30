/// <reference types="node" />
import { ReportDataItem, InitConfig, ZegoStore } from '../common/zego.entity';
export declare class ZegoStoreHandler {
    private name;
    private storeName;
    private config;
    private traceType;
    private staticConfig;
    store: ZegoStore;
    storeSize: number;
    storeTime: number;
    storeDelPer: number;
    commonStore: ZegoStore;
    dropCallBack: Function;
    updateTimeFreq: number;
    storeSleepInterval: number;
    droping: boolean;
    bufferData: ReportDataItem[];
    updateTimer: NodeJS.Timeout | null | number;
    interSymbol: string;
    drops: {
        name: string;
        storeName: string;
    }[];
    constructor(name: string, storeName: string, config: InitConfig, traceType: any, staticConfig: any);
    init(): Promise<void>;
    uninit(): void;
    transferStoreData(): Promise<void>;
    updateStoreTime(updateTimeFreq: number): void;
    dropInstance(name: string, storeName: string): Promise<void>;
    setDropCallBack(dropCallBack: Function): void;
    storeData(reportDataItem: ReportDataItem): Promise<void>;
    loadPendingData(): Promise<void>;
    storePendingData(items: ReportDataItem[]): Promise<void>;
    bufferDump(): Promise<void>;
    dropDBData(level: number, storeKey: string, content: any): Promise<void>;
    removeDataItem(reportDataItem: ReportDataItem): Promise<void>;
    private refreshStoreInfo;
    readStoreDataItem(): Promise<ReportDataItem>;
    loadDBData(packageSize: number, packageNum: number, memSize: number, isInMem: (k: string) => boolean): Promise<{
        datas: ReportDataItem[];
        len: number;
    }>;
    sortKeys(keys: string[], ascend?: boolean): void;
}
