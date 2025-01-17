import { ZegoLogger } from "../common/zego.entity";
export declare class TrackUtil {
    private _zgp_logger;
    private _zgp_deviceCaptureExceptionDetection;
    constructor(_zgp_logger: ZegoLogger);
    isTrackStopBySDK(track: MediaStreamTrack): boolean;
    stopTrack(track: MediaStreamTrack | null | undefined): void;
}
