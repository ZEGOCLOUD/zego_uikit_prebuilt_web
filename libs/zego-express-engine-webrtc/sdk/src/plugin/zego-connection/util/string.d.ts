export declare const encodeString: (str: string) => Uint8Array;
export declare const decodeString: (u8arr: Uint8Array) => string;
export declare const uuidNum: (len?: number, radix?: number) => string;
export declare function encryptStores(originString: string, secret: string): string;
export declare function decryptStores(ciphertext: string, secret: string): string;
export declare function setLocalStorage(env: number, key: string, data: any): void;
export declare function getLocalStorage(env: number, key: string): any;
export declare function getHttp3ServerStorage(env: number, appID: number): {
    [sever: string]: {
        status: boolean;
        time: number;
    };
} | null;
export declare function setHttp3ServerStatus(env: number, appID: number, data: {
    [sever: string]: {
        status: boolean;
        time: number;
    };
}, isMerge?: boolean): void;
