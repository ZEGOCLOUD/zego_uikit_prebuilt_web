import type { ZReporter, ZegoLogger, ZegoReportSpan } from "../common/zego.entity";
export declare const ZegoPromise: PromiseConstructor;
export declare const ZegoDocument: Document;
export declare function createVideoEle(width?: number, height?: number, autoplay?: boolean): HTMLVideoElement;
export declare function createAudioEle(mute: boolean): HTMLAudioElement;
export declare function createCanvasEle(width: number, height: number): HTMLCanvasElement;
export declare function actionCall(logger: ZegoLogger, action: string, content?: string): void;
export declare function actionEnd(logger: ZegoLogger, action: string, content?: string): void;
export declare function actionSuccess(logger: ZegoLogger, action: string, content?: string): void;
export declare function getRandomNumber(min: number, max: number): number;
export declare function getModuleErrorStr(moduleNames: Array<string>): string;
export declare function getModuleError(moduleNames: Array<string>, errorCode?: number): {
    errorCode: number;
    extendedData: string;
};
export declare function moduleRejectFn(moduleNames: Array<string>, errorCode?: number): Promise<{
    errorCode: number;
    extendedData: string;
}>;
export declare function longToNumber(long: any): number;
export declare function supplementPBInfo(body: any): void;
export declare function checkIllegalCharacters(str: string): boolean;
export declare function checkStreamIDIllegalCharacters(str: string): boolean;
export declare function isUrl(str: string): boolean;
export declare function checkInteger(num: number | undefined, positive?: boolean): boolean;
export declare const roomNotExistStr = "room not exist";
export declare const deviceIsNotFoundStr = "device is not found";
export declare const streamNotFromZegoStr = "stream is not from zego";
export declare const inputParamErrorStr = "input param error";
export declare const localStreamWrongStr = "local stream wrong";
export declare const noPreviewStr = "no preview";
export declare const publishStreamNoFoundStr = "publish stream no found";
export declare const networkIsBrokenStr = "network is broken";
export declare const stopRetryStr = "stop retry";
export declare function getSpan(reporter: ZReporter, level: number, par: string, spanName: string, parentKey: string, otherParentKey?: string, isMap?: boolean): ZegoReportSpan;
export declare function updateSpanByReporter(reporter: ZReporter, par: string, spanName: string, attributes?: any): void;
export declare function endSpanByReporter(reporter: ZReporter, par: string, spanName: string, attributes?: any, reverse?: boolean): void;
export declare function endSpanBySelf(span: ZegoReportSpan, attributes?: {
    [key: string]: any;
}, immediately?: boolean): void;
export declare function JSONStringify(obj: any): string;
export declare function JSONParse(obj: string): any;
