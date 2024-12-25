import { ReportDataItem, Queue } from '../common/zego.entity';
export declare class PendingQueue {
    private levels;
    private product;
    private staticConfig;
    cacheMap: Map<number, Queue<any>>;
    byteLength: number;
    size: number;
    pendingDataSize: number;
    enCallback: Function | undefined;
    deCallback: Function | undefined;
    constructor(levels: number[], product: string, staticConfig: any);
    enqueue(element: any, level: number): void;
    dequeue(level: number): ReportDataItem;
    readReportData(maxLen: number): any;
    readStoreData(delPer: number): {
        totalLen: number;
        storeArr: ReportDataItem[];
    };
    readData(cacheArr: any, maxLen: number, isReport: boolean): {
        totalLen: number;
        resArr: ReportDataItem[];
    };
    decodeReportData(reportDataArr: ReportDataItem[]): void;
    setListener(callBackList: {
        enCallback?: Function;
        deCallback?: Function;
    }): void;
    getPendingDataInfo(): {
        pendingDataSize: number;
        size: number;
    };
    refresh(dataLen: number): void;
    reset(): void;
}
