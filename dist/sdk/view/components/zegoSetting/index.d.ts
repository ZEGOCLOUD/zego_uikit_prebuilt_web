import React from "react";
import { ZegoDeviceInfo, ZegoLocalStreamConfig } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { ZegoCloudRTCCore } from "../../../modules";
export declare class ZegoSettings extends React.Component<{
    core: ZegoCloudRTCCore;
    localVideoStream?: MediaStream;
    localAudioStream?: MediaStream;
    closeCallBack?: () => void;
}> {
    state: {
        visible: boolean;
        seletTab: "AUDIO" | "VIDEO";
        seletMic: string | undefined;
        seletSpeaker: string | undefined;
        seletCamera: string | undefined;
        seletVideoResolve: string | undefined;
        micDevices: ZegoDeviceInfo[];
        speakerDevices: ZegoDeviceInfo[];
        cameraDevices: ZegoDeviceInfo[];
        localVideoStream: MediaStream | undefined;
        localAudioStream: MediaStream | undefined;
    };
    videoRef: React.RefObject<HTMLDivElement>;
    componentDidMount(): void;
    getDevices(): Promise<void>;
    createVideoStream(source?: ZegoLocalStreamConfig): Promise<boolean>;
    createAudioStream(source?: ZegoLocalStreamConfig): Promise<boolean>;
    toggleMic(deviceID: string): Promise<void>;
    toggleSpeaker(deviceID: string): Promise<void>;
    toggleCamera(deviceID: string): Promise<void>;
    toggleVideoResolve(level: string): Promise<void>;
    close(): void;
    render(): React.ReactNode;
}
export declare const ZegoSettingsAlert: (config: {
    core: ZegoCloudRTCCore;
    closeCallBack: () => void;
    localVideoStream?: MediaStream;
    localAudioStream?: MediaStream;
}) => void;
