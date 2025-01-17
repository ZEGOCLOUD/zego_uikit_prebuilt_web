import { EncodecSelectionModeType, ZegoVideoCodec } from "../common/zego.entity";
export declare class SdpUtil {
    static getSDPByVideDecodeType(sdp: string, type: ZegoVideoCodec, isSoft?: boolean, encodecSelectionMode?: EncodecSelectionModeType): string;
}
