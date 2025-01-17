/// <reference types="node" />
import { ReportDataItem, InitConfig, ZegoStore } from '../common/zego.entity';
import { StateCenter } from '../common/stateCenter';
export declare class ZegoStoreHandler {
    private _name;
    private _storeName;
    private _config;
    private _traceType;
    private _staticConfig;
    private _stateCenter;
    private _product;
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
    storesKeys: string;
    transStores: string[];
    private get _KEY();
    private get _STORES_KEY();
    constructor(_name: string, _storeName: string, _config: InitConfig, _traceType: any, _staticConfig: any, _stateCenter: StateCenter, _product: string);
    init(): Promise<void>;
    uninit(): void;
    private setCommonStoreState;
    resetCommonStore(): Promise<void>;
    transferStoreData(): Promise<void>;
    dropInstance(name: string, storeName: string): Promise<void>;
    setDropCallBack(dropCallBack: Function): void;
    storeData(reportDataItem: ReportDataItem): Promise<void>;
    loadPendingData(): Promise<void>;
    storePendingData(items: ReportDataItem[]): Promise<void>;
    bufferDump(): Promise<void>;
    dropDBData(level: number, storeKey: string, content: any): Promise<void>;
    removeDataItem(reportDataItem: ReportDataItem): Promise<void>;
    private _refreshStoreInfo;
    readStoreDataItem(): Promise<ReportDataItem>;
    loadDBData(packageSize: number, packageNum: number, memSize: number, isInMem: (k: string) => boolean): Promise<{
        datas: ReportDataItem[];
        len: number;
    }>;
    sortKeys(keys: string[], ascend?: boolean): void;
    saveStorage(key: string, val: string): void;
    getStorage(key: string): string | null | undefined;
    saveDataToStorage(reportDataItem: ReportDataItem): void;
    transportStorageData(): void;
}
