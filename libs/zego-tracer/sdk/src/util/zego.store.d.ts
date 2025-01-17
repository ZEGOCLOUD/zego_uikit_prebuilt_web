export declare type ZegoStore = LocalForage | ZegoWechatMiniStore;
export declare enum ZEGO_ENV {
    BROWSER = 0,
    WEIXINMINI = 1
}
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
export declare function createZegoStore(name: string, env: ZEGO_ENV, storeName?: string): ZegoStore;
