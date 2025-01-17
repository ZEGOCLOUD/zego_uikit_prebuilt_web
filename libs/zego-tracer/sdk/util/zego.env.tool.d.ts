import { ZEGO_BROWSER_TYPE, ZEGO_ENV } from '../src/zego.entity';
export declare function getBrowser(): ZEGO_BROWSER_TYPE;
export declare function getCurrentEnv(): Promise<ZEGO_ENV>;
export declare function getCurrentTime(): string;
export declare function analyzeKey(key: string): any;
