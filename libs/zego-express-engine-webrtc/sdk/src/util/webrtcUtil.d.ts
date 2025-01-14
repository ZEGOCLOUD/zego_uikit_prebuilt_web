import { CapabilityDetection, CapabilityDetectionSingle, Constraints, SupportVideoCodeSucCall, ZegoCheckSingleType, ConstraintExtend, ERRO, OSType, PlayMode } from "../common/zego.entity";
import { NetType } from "../rtm/zego.entity";
export declare function supportVideoCodeType(sucCall: SupportVideoCodeSucCall, checkLevel: 0 | 1, type?: "webRTC" | "VP8" | "H264" | "newWay", customUa?: boolean): Promise<void>;
export declare function supportDetection(screenShotReady: boolean, success: (result: CapabilityDetection | CapabilityDetectionSingle) => void, checkLevel: 0 | 1, type?: ZegoCheckSingleType, customUa?: boolean): Promise<void>;
export declare const WebRTCUtil: {
    supportDetection: typeof supportDetection;
};
export declare function deleteUndefinedKey(options: any): any;
export declare function base64ToUint8Array(base64String: string): Uint8Array;
export declare function decodeString(u8arr: Uint8Array): string;
export declare function encodeString(str: string): Uint8Array;
export declare function getCandidate(sdp: string): any;
export declare function getIceServers(sdp: string): string[];
export declare function getPlaySourceType(mode: number): PlayMode;
export declare function getChromeVer(): number;
export declare function getVersionNumber(version: string): number;
export declare function isAdaptBrowserVersion(browserInfo: {
    name: string;
    version: string;
}, bro: string, ver: number, compare: number): boolean;
export declare function getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream | any>;
/**
 * 上一次调度节点{A、B、C、D} 已试节点A、B
 * 1、重新调度节点{A、B、C、D},  对比已试节点列表， 重新排序{C、D、A、B}，C节点首先被重试 => sortGwNodes(['A','B', 'C', 'D'], ['A', 'B'])
 * 2、重新调度节点{E、F、A、G},  对比已试节点列表， 重新排序{E、F、G、A}，E节点首先被重试 => sortGwNodes(['E','F', 'A', 'G'], ['A', 'B'])
 * 3、重新调度节点{A、B、E、F},  对比已试节点列表， 重新排序{E、F、A、B}，E节点首先被重试 => sortGwNodes(['A','B', 'E', 'F'], ['A', 'B'])
 */
export declare function sortGwNodes(newNodes: string[], oldNodes: string[], isDispatchByPass: boolean): string[];
export declare function formatTypePreference(pref: number, browser: string): string | undefined;
export declare function getElemByMediaStream(stream: MediaStream | null, tagName?: string): HTMLMediaElement | null;
export declare function getDevices(deviceInfoCallback: (res: {
    microphones: Array<{
        deviceName: string;
        deviceID: string;
    }>;
    speakers: Array<{
        deviceName: string;
        deviceID: string;
    }>;
    cameras: Array<{
        deviceName: string;
        deviceID: string;
    }>;
}) => void, error: (err: ERRO) => void): void;
export declare function getNetTypeNum(): NetType;
/**
 * 获取操作系统信息 os_type只有特定的枚举值
 */
export declare function getOsType(): OSType;
export declare function checkBitRateLimit(bitRateValue: number, errorCallback: Function): boolean;
export declare function checkCameraOrScreenBitRate(bitRate: number | undefined, errorCallback: Function): boolean;
export declare function checkConstraintExtendWithMessage(constraintExtend: ConstraintExtend, param: string, limitMin?: number, // 每个参数限制的最小值
limitMax?: number): {
    result: boolean;
    message: string;
};
export declare function checkConstraintExtend(constraintExtend: ConstraintExtend, param: string, errorCallback?: Function, // for createStream
limitMin?: number, // 每个参数限制的最小值（正整数）
limitMax?: number): boolean;
export declare function checkParamsWithConstraintExtend(constraints: {
    width?: number | ConstraintExtend;
    height?: number | ConstraintExtend;
    frameRate?: number | ConstraintExtend;
}, errorCallback?: Function): boolean;
export declare function checkScreenParams(screen: Constraints["screen"], errorCallback: Function): boolean;
export declare function checkCameraParams(cameras: {
    width?: number | ConstraintExtend;
    height?: number | ConstraintExtend;
    frameRate?: number | ConstraintExtend;
    bitRate?: number;
}, errorCallback: Function): boolean;
