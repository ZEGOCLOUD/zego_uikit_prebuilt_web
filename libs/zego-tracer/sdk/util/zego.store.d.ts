import { ZegoStore, ZEGO_ENV } from '../src/zego.entity';
export declare class ZegoWechatMiniStore {
    storeName: string;
    constructor(storeName: string);
    getItem(key: string): Promise<unknown>;
    setItem(key: string, value: any): Promise<unknown>;
    removeItem(key: string): Promise<unknown>;
    clear(): Promise<unknown>;
    keys(): Promise<unknown>;
}
export declare function createZegoStore(storeName: string, env: ZEGO_ENV): ZegoStore;
