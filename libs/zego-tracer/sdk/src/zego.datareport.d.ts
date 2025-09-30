import { DataStatisticsItem, InitConfig } from './zego.entity';
import { ZegoLogger } from './zego.logger';
import { ZegoStoreHandler } from '../util/zego.storeHandler';
import { Queue } from './zego.queue';
export declare class ZegoDataReport {
    logger: ZegoLogger;
    product: string;
    config: InitConfig;
    pendingQueue: Queue<DataStatisticsItem>;
    storeHandler: ZegoStoreHandler;
    QUEUE_MAX: number;
    defaultConfig: {
        byteLength: number;
        size: number;
    };
    constructor(product: string);
    init(config: InitConfig): void;
    report(data: string, level: number): void;
    forceReport(): void;
}
