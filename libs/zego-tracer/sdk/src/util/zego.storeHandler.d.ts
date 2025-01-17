import { DataStatisticsItem, InitConfig, ZegoStore } from '../common/zego.entity';
export declare class ZegoStoreHandler {
    private storeName;
    private config;
    store: ZegoStore;
    storeDelPer: number;
    readStorePer: number;
    constructor(storeName: string, config: InitConfig);
    storeData(reportDataItem: DataStatisticsItem): Promise<void>;
    readStoredData(): Promise<{
        level: any;
        timestamp: any;
        seq: any;
        content: unknown;
    }[]>;
    sortKeys(keys: string[], ascend?: boolean): void;
}
