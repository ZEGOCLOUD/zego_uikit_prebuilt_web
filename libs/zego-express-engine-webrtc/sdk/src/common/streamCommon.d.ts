import { StateCenter } from "./stateCenter";
import { ZegoStreamCenter } from "./streamCenter";
import { ZegoLogger } from "./zego.entity";
import { ZegoExpressWebRTM } from "../rtm";
export declare class StreamCommon {
    private _zgp_streamCenter;
    private _zgp_stateCenter;
    private _zgp_logger;
    private rtm;
    private get _zgp_reporter();
    constructor(_zgp_streamCenter: ZegoStreamCenter, _zgp_stateCenter: StateCenter, _zgp_logger: ZegoLogger, rtm: ZegoExpressWebRTM);
    setStreamExtraInfo(streamID: string, extraInfo: string): Promise<{
        errorCode: number;
        extendedData: string;
    }>;
}
