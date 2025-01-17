import { StateCenter } from "../../../common/stateCenter";
import { ZegoLogger } from "../../../common/zego.entity";
import { ZegoStreamCenterWeb } from "../zego.streamCenter.web";
interface DevicesInfo {
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
}
/**
 * 快速拔插设备异常检测
 */
export declare class QuickDeviceChangeDetection {
    private _zgp_logger;
    private _zgp_stateCenter;
    private _zgp_streamCenter;
    private _zgp_devicesInfo?;
    private _zgp_maxQuickDeviceChangeDelayMs;
    lastRecordDeviceTime: number;
    constructor(_zgp_logger: ZegoLogger, _zgp_stateCenter: StateCenter, _zgp_streamCenter: ZegoStreamCenterWeb);
    private getDetectionStreams;
    private _zgp_actionMicDeviceQuickChangeException;
    private _zgp_getDeviceName;
    private _zgp_actionCameraDeviceQuickChangeException;
    private _zgp_updateDeviceInfo;
    private _zgp_getTrackStatsSnapshot;
    private _zgp_includeExceptionDevices;
    private _zgp_checkAudioTrackStatsChange;
    private _zgp_checkVideoTrackStatsChange;
    private _zgp_checkStreamStatesChanged;
    isRecordQuickly(): boolean;
    onDeviceNoChangeQuickly(res: DevicesInfo): void;
}
export {};
