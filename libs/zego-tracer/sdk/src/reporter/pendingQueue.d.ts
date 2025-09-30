import { StateCenter } from '../common/stateCenter';
import { ReportDataItem, Queue } from '../common/zego.entity';
export declare class PendingQueue {
    private _levels;
    private _product;
    private _staticConfig;
    private _stateCenter;
    cacheMap: Map<number, Queue<any>>;
    byteLength: number;
    size: number;
    pendingDataSize: number;
    enCallback: Function | undefined;
    deCallback: Function | undefined;
    constructor(_levels: number[], _product: string, _staticConfig: any, _stateCenter: StateCenter);
    enqueue(element: any, level: number): void;
    dequeue(level: number): ReportDataItem;
    findInQueue(reportDataItem: ReportDataItem): boolean;
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
