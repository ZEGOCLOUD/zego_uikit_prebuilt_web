import { ERRO, ZegoDataReport, ZegoLogger } from "../common/zego.entity";
export declare function registerCallback(fName: string, option: {
    success?: Function;
    error?: Function;
}, callbackList: {
    [index: string]: Function;
}): void;
export declare function actionErrorCallback(fName: string, callbackList: {
    [index: string]: Function;
}): Function;
export declare function actionSuccessCallback(fName: string, callbackList: {
    [index: string]: Function;
}): Function;
export declare function dataReportEvent(dataReport: ZegoDataReport, reportSeq: number, reportName: string, eventName: string, args: any): void;
export declare function logReportCallback(logEvent: string, dataReport: ZegoDataReport, reportSeq: number, callbackList: {
    [index: string]: Function;
}): void;
export declare function actionLogReportCallback(logEvent: string, callbackList: {
    [index: string]: Function;
}, reportAction: string, eventName: string, args?: any): void;
export declare function getServerError(code: number, msg?: string): any;
export declare function unregisterCallback(fName: string, callbackList: {
    [index: string]: Function;
}): void;
export declare function decodeServerError(code: number, msg: string): {
    code: number;
    message: string;
};
export declare function getLiveRoomError(code: number): string;
export declare function getKickoutError(code: number): {
    code: number;
    message: string;
    name?: string;
};
export declare function isKeepTryLogin(code: number): boolean;
export declare function mergeStreamList(idName: string, oldStreamList: any[], newStreamList: any[], callbackResult: {
    (addStreamList: any[], delStreamList: any[], updateStreamList: any[], updateAttrStreamList: any[]): void;
}): void;
export declare function checkValidNumber(param: number, min?: number, max?: number): boolean;
export declare function uuid(len?: number, radix?: number): string;
export declare function getPublisherStateType(type: 0 | 1 | 2): string;
export declare function getPlayerStateType(type: 0 | 1 | 2): string;
export declare function getSteamUpdateType(type: 0 | 1): string;
export declare function isParamEmpty(param: any): boolean;
export declare function isTooLong(param: string, len: number): boolean;
export declare function isTypeString(param: string): boolean;
export declare function isReDispatch(error: ERRO): boolean;
export declare function arrAvg(arr: Array<number>, val: any, shiftLen: number): any;
export declare function calcQualityOfRtt(rtt: number): number;
export declare function calcQualityOfJitter(jitter: number): number;
export declare function calcQualityOfLostRate(lostRate: number, isProbe: boolean): number;
export declare function getNetQuality(rtt: number, lostRate: number, jitter?: number): number;
export declare function quality2QualityGrade(quality: number): number;
export declare function isSupportEncodedTransforms(): boolean;
export declare function isSupportTransceiver(): boolean;
export declare function isSupportConfiguration(): boolean;
export declare function uint8arrayToBase64(u8Arr: Uint8Array): string;
export declare function getStreamTracksStatus(stream: MediaStream): string;
export declare function logTrackStatus(track: MediaStreamTrack, _zgp_logger: ZegoLogger, action: string, option?: {
    streamID?: string;
}): void;
/**
 * 浅拷贝，排除部分Key，拷贝源
 * @param sourceObject 源
 * @param excludeKeys 排除的Key
 * @returns
 */
export declare function assignPartialObject(sourceObject: Record<string, any>, excludeKeys: string[]): Record<string, any>;
export declare const stringToHash: (str: string) => number;
export declare function generaStreamSid(appID: number, userID: string, streamID: string): number;
export declare function getBitCode(x: number, bit: number): number;
export declare function compareArrayBuffers(view1: Uint8Array, view2: Uint8Array): boolean;
export declare function getBrowser(): string;
export declare function getLogLevel(level: "debug" | "info" | "warn" | "error" | "report" | "disable"): number;
export declare function getNetType(): string;
export declare function encryptStores(originString: string, secret: string): string;
export declare function decryptStores(ciphertext: string, secret: string): string;
export declare function getCurrentTime(): string;
export declare function isRightServerForAppid(server: string, appid: number): boolean;
export declare function setLocalStorage(key: string, data: any): void;
/**
 *  wx 小程序缓存失效可能
 * 1、主动删除小程序
 * 2、系统清缓存
 * 3、微信设置页清理缓存
 * 4、开发者主动调clearStorage
 * @param key
 * @returns
 */
export declare function getLocalStorage(key: string): any;
export declare function saveWXNetType(): void;
/**
 * @param taskCallBack return async boolean 返回是否成功
 * @param timeout 超时回调
 */
export declare function retryUtilTimeoutTask(taskCallBack: () => Promise<boolean>, timeoutCallback: () => void, option: {
    maxTimeoutDelay: number;
    retryDelay: number;
}): void;
export declare function hashNumber(number: number, size: number): number;
export declare function checkConfigParam(appid: number, server: string | Array<string>, logger: ZegoLogger): boolean;
export declare function proxyRes(dataReport: ZegoDataReport, reportSeq: number, resolve: any, reject: any): any;
export declare function mergeUserList(logger: ZegoLogger, oldUserList: any[], newUserList: any[], callbackResult: (addUserList: any[], delUserList: any[]) => void): void;
export declare function generateRandumNumber(maxNum: number): number;
export declare function isTestEnv(server: string): boolean;
export declare function getUint64(byteOffset: number, littleEndian: boolean, dv: DataView): number;
/**
 *  返回 token 过期时间点，单位 s
 */
export declare function decodeTokenExpire(token: string): number;
export declare function bin2hex(s: string): string;
export declare function getCanvasFingerprint(domain: string): string;
export declare function createUUID(env: number): string;
export declare function generateUUID(env?: number): string;
