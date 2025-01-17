import { ZegoError } from "../common/zego.entity";
export declare class ErrorUtil {
    static createError(err: ZegoError, externMsg?: string): ZegoError;
}
