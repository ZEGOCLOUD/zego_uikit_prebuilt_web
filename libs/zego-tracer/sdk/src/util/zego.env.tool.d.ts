import { ZEGO_BROWSER_TYPE, ZEGO_ENV } from '../common/zego.entity';
export declare function getBrowser(): ZEGO_BROWSER_TYPE;
export declare function getCurrentEnv(): Promise<ZEGO_ENV>;
export declare function getCurrentTime(): string;
export declare function analyzeKey(key: string): any;
export declare function calculateMemSize(content: any): number;
export declare function uuid(len?: number, radix?: number): string;
