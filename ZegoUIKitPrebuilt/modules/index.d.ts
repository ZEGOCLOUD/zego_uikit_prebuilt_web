/// <reference types="node" />
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoDeviceInfo, ZegoLocalStreamConfig, ZegoPublishStreamConfig, ZegoServerResponse, ZegoSoundLevelInfo, ZegoStreamList } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudRemoteMedia, ZegoCloudRoomConfig, ZegoUser } from "../model";
import { ZegoCloudUserList, ZegoCloudUserListManager } from "./tools/UserListManager";
import { ZegoSuperBoardManager, ZegoSuperBoardView } from "zego-superboard-web";
export declare class ZegoCloudRTCCore {
    static _instance: ZegoCloudRTCCore;
    static _zg: ZegoExpressEngine;
    zum: ZegoCloudUserListManager;
    _expressConfig: {
        appID: number;
        userID: string;
        userName: string;
        roomID: string;
        token: string;
        avatar?: string;
    };
    zegoSuperBoard: ZegoSuperBoardManager;
    zegoSuperBoardView: ZegoSuperBoardView | null | undefined;
    static getInstance(kitToken: string): ZegoCloudRTCCore;
    status: {
        loginRsp: boolean;
        videoRefuse: boolean;
        audioRefuse: boolean;
        micDeviceID?: string;
        cameraDeviceID?: string;
        speakerDeviceID?: string;
        videoResolution?: string;
    };
    remoteStreamMap: {
        [index: string]: ZegoCloudRemoteMedia;
    };
    waitingHandlerStreams: {
        add: ZegoStreamList[];
        delete: ZegoStreamList[];
    };
    _config: ZegoCloudRoomConfig & {
        plugins: {
            ZegoSuperBoardManager?: typeof ZegoSuperBoardManager;
        };
    };
    _currentPage: "BrowserCheckPage" | "Room" | "RejoinRoom";
    extraInfoKey: string;
    _roomExtraInfo: {
        [index: string]: any;
    };
    NetworkStatusTimer: NodeJS.Timer | null;
    get isCDNLive(): boolean;
    addPlugins(plugins: {
        ZegoSuperBoardManager?: typeof ZegoSuperBoardManager;
    }): void;
    setConfig(config: ZegoCloudRoomConfig): boolean;
    checkWebRTC(): Promise<boolean>;
    setPin(userID?: string, pined?: boolean, stopUpdateUser?: boolean): void;
    setMaxScreenNum(num: number, stopUpdateUser?: boolean): Promise<void>;
    setSidebarLayOut(enable: boolean, stopUpdateUser?: boolean): Promise<void>;
    setShowNonVideo(enable: boolean): Promise<void>;
    setCurrentPage(page: "BrowserCheckPage" | "Room" | "RejoinRoom"): void;
    getCameras(): Promise<ZegoDeviceInfo[]>;
    useVideoDevice(localStream: MediaStream, deviceID: string): Promise<ZegoServerResponse>;
    getMicrophones(): Promise<ZegoDeviceInfo[]>;
    getSpeakers(): Promise<ZegoDeviceInfo[]>;
    setVolume(media: HTMLVideoElement, volume: number): void;
    createStream(source?: ZegoLocalStreamConfig): Promise<MediaStream>;
    createAndPublishWhiteboard(parentDom: HTMLDivElement, name: string): Promise<ZegoSuperBoardView>;
    setWhiteboardToolType(type: number, fontSize?: number, color?: string): void;
    setWhiteboardFont(font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC", fontSize?: number, color?: string): void;
    setVideoConfig(media: MediaStream, constraints: ZegoPublishStreamConfig): Promise<ZegoServerResponse>;
    stopPublishingStream(streamID: string): boolean;
    destroyStream(stream: MediaStream): void;
    destroyAndStopPublishWhiteboard(): Promise<void>;
    useCameraDevice(media: MediaStream, deviceID: string): Promise<ZegoServerResponse>;
    useMicrophoneDevice(media: MediaStream, deviceID: string): Promise<ZegoServerResponse>;
    useSpeakerDevice(media: HTMLMediaElement, deviceID: string): Promise<ZegoServerResponse>;
    enableVideoCaptureDevice(localStream: MediaStream, enable: boolean): Promise<boolean>;
    mutePublishStreamVideo(localStream: MediaStream, enable: boolean): Promise<boolean>;
    mutePublishStreamAudio(localStream: MediaStream, enable: boolean): Promise<boolean>;
    muteMicrophone(enable: boolean): Promise<boolean>;
    set roomExtraInfo(value: {
        [index: string]: any;
    });
    get roomExtraInfo(): {
        [index: string]: any;
    };
    setLive(status: "live" | "stop"): Promise<boolean>;
    enterRoom(): Promise<number>;
    streamUpdateTimer(_waitingHandlerStreams: {
        add: ZegoStreamList[];
        delete: ZegoStreamList[];
    }): Promise<void>;
    publishLocalStream(media: MediaStream, streamType?: "main" | "media" | "screensharing"): boolean | string;
    replaceTrack(media: MediaStream, mediaStreamTrack: MediaStreamTrack): Promise<ZegoServerResponse>;
    private subscribeUserListCallBack;
    subscribeUserList(callback: (userList: ZegoCloudUserList) => void): void;
    private subscribeScreenStreamCallBack;
    subscribeScreenStream(callback: (userList: ZegoCloudUserList) => void): void;
    subscribeWhiteBoardCallBack: (zegoSuperBoardView: ZegoSuperBoardView | null) => void;
    subscribeWhiteBoard(callback: (zegoSuperBoardView: ZegoSuperBoardView | null) => void): void;
    private onRemoteMediaUpdateCallBack;
    private onNetworkStatusQualityCallBack;
    onNetworkStatusQuality(func: (roomID: string, level: number) => void): void;
    private onRemoteUserUpdateCallBack;
    onRemoteUserUpdate(func: (roomID: string, updateType: "DELETE" | "ADD", user: ZegoUser[]) => void): void;
    private onSoundLevelUpdateCallBack;
    onSoundLevelUpdate(func: (soundLevelList: ZegoSoundLevelInfo[]) => void): void;
    private onRoomLiveStateUpdateCallBack;
    onRoomLiveStateUpdate(func: (live: "1" | "0") => void): void;
    sendRoomMessage(message: string): Promise<import("zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d").ZegoServerResponse>;
    private onRoomMessageUpdateCallBack;
    onRoomMessageUpdate(func: (roomID: string, info: ZegoBroadcastMessageInfo[]) => void): void;
    private onScreenSharingEndedCallBack;
    onScreenSharingEnded(func: (stream: MediaStream) => void): void;
    private onNetworkStatusCallBack;
    onNetworkStatus(func: (roomID: string, type: "ROOM" | "STREAM", status: "DISCONNECTED" | "CONNECTING" | "CONNECTED") => void): void;
    private streamExtraInfoUpdateCallBack;
    private coreErrorCallback;
    onCoreError(func: (errCode: number, errMsg: string) => void): void;
    leaveRoom(): void;
    setStreamExtraInfo(streamID: string, extraInfo: string): Promise<ZegoServerResponse>;
}
