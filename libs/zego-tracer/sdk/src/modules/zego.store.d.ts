import { ZegoStore, ZEGO_ENV } from '../common/zego.entity';
export declare class ZegoWechatMiniStore {
    storeName: string;
    keyPrefix: string;
    constructor(storeName: string);
    getItem(key: string): Promise<any>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<any>;
    clear(): Promise<void>;
    keys(): Promise<string[]>;
}
export declare function createZegoStore(name: string, storeName: string, env: ZEGO_ENV): ZegoStore;
