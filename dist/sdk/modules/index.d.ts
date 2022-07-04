import { SoundLevel } from "./soundmeter";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoDeviceInfo, ZegoLocalStreamConfig, ZegoPublishStreamConfig, ZegoServerResponse } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { ZegoUser, ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudRemoteMedia, ZegoCloudRoomConfig } from "../model";
import { SoundMeter } from "./soundmeter";
export declare class ZegoCloudRTCCore {
    static _instance: ZegoCloudRTCCore;
    static _zg: ZegoExpressEngine;
    _expressConfig: {
        appID: number;
        userID: string;
        userName: string;
        roomID: string;
        token: string;
    };
    static _soundMeter: SoundMeter;
    static getInstance(token: string): ZegoCloudRTCCore;
    status: {
        loginRsp: boolean;
    };
    remoteStreamMap: {
        [index: string]: ZegoCloudRemoteMedia;
    };
    constructor();
    checkWebRTC(): Promise<boolean>;
    _config: ZegoCloudRoomConfig;
    setConfig(config: ZegoCloudRoomConfig): void;
    getCameras(): Promise<ZegoDeviceInfo[]>;
    getMicrophones(): Promise<ZegoDeviceInfo[]>;
    getSpeakers(): Promise<ZegoDeviceInfo[]>;
    capturedSoundLevelUpdate(media: HTMLVideoElement, callback: (soundLevel: SoundLevel) => {}): void;
    stopCapturedSoundLevelUpdate(media: HTMLVideoElement, callback: (soundLevel: SoundLevel) => {}): void;
    setVolume(media: HTMLVideoElement, volume: number): void;
    createStream(source?: ZegoLocalStreamConfig): Promise<MediaStream>;
    setVideoConfig(media: MediaStream, constraints: ZegoPublishStreamConfig): Promise<ZegoServerResponse>;
    destroyStream(stream: MediaStream): void;
    useCameraDevice(media: MediaStream, deviceID: string): Promise<ZegoServerResponse>;
    useMicrophoneDevice(media: MediaStream, deviceID: string): Promise<ZegoServerResponse>;
    useSpeakerDevice(media: HTMLMediaElement, deviceID: string): Promise<ZegoServerResponse>;
    enableVideoCaptureDevice(localStream: MediaStream, enable: boolean): Promise<boolean>;
    muteMicrophone(enable: boolean): Promise<boolean>;
    enterRoom(): Promise<boolean>;
    publishLocalStream(media: MediaStream): boolean;
    private onRemoteMediaUpdateCallBack;
    onRemoteMediaUpdate(func: (updateType: "DELETE" | "ADD" | "UPDATE", streamList: ZegoCloudRemoteMedia[]) => void): void;
    private onRemoteUserUpdateCallBack;
    onRemoteUserUpdate(func: (roomID: string, updateType: "DELETE" | "ADD", user: ZegoUser[]) => void): void;
    sendRoomMessage(message: string): Promise<import("zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d").ZegoServerResponse>;
    private onRoomMessageUpdateCallBack;
    onRoomMessageUpdate(func: (roomID: string, info: ZegoBroadcastMessageInfo[]) => void): void;
    private onNetworkStatusCallBack;
    onNetworkStatus(func: (roomID: string, type: "ROOM" | "STREAM", status: "DISCONNECTED" | "CONNECTING" | "CONNECTED") => void): void;
    leaveRoom(): void;
}
