import type { ZegoLogger } from "../../../common/zego.entity";
import { StreamView } from "../streamView/streamView";
import { ZegoCaptureScreenAudio, ZegoCaptureScreenVideo, ZegoCustomVideo } from "../../../common/zego.entity";
import { ZegoServerResponse, ZegoSnapshotOptions, ZegoLocalViewOptions, ZegoLocalAduioOptions, ZegoLocalStreamEvent } from "../../../../code/zh/ZegoExpressEntity.web";
import { ZegoStreamOptions, ZegoCaptureMicrophone, ZegoCaptureCamera, ZegoCustomAudio } from "../../../common/zego.entity";
import { PublishModule } from "../publishModules";
import { ZegoStreamCenterWeb } from "../zego.streamCenter.web";
import { AdvancedModule } from "../../../modules/advance/advancedModule";
import { ZegoPreview } from "../publishModules/zego.preview";
import { StateCenter } from "../../../common/stateCenter";
interface BitrateConfig {
    bitRate?: number;
    startBitrate?: "default" | "target" | undefined;
    minBitrate?: number;
    audioBitrate?: number;
    channelCount?: number;
}
export declare class ZegoCaptureStream {
    private _zgp_options;
    private _zgp_logger;
    private _zgp_streamCenter;
    private _zgp_stateCenter;
    private _zgp_publishModule;
    private _zgp_advancedModule;
    get active(): boolean;
    id: string;
    originVideoStream: MediaStream | null;
    originAudioStream: MediaStream | null;
    audioMuted: boolean;
    audioCaptureMuted: boolean;
    stream: MediaStream | null;
    private _zgp_ACacheStreams;
    private _zgp_VCacheStreams;
    private _zgp_eventHandler;
    private _zgp_eventManager;
    get view(): HTMLElement | null;
    private _zgp_isPlayingVideo;
    private _zgp_isPlayingCaptureVideo;
    get autoPlay(): boolean;
    getAudioTracks(): MediaStreamTrack[] | [];
    getVideoTracks(): MediaStreamTrack[] | [];
    getTracks(): MediaStreamTrack[] | [];
    get aCaptureViewer(): StreamView | null;
    private _zgp_aCaptureViewer;
    private _zgp_vCaptureViewers;
    get viewer(): StreamView | null;
    private _zgp_viewer;
    private _zgp_previewer;
    private _zgp_originStreamPreviewType;
    private _zgp_streamPreviewType;
    private _zgp_originVideoTrack;
    private _zgp_originAudioTrack;
    get videoDeviceId(): string;
    get audioDeviceId(): string;
    constructor(_zgp_options: ZegoStreamOptions, _zgp_logger: ZegoLogger, _zgp_streamCenter: ZegoStreamCenterWeb, _zgp_stateCenter: StateCenter, _zgp_publishModule: PublishModule, _zgp_advancedModule: AdvancedModule);
    on<k extends keyof ZegoLocalStreamEvent>(event: k, callBack: ZegoLocalStreamEvent[k]): boolean;
    off<k extends keyof ZegoLocalStreamEvent>(event: k, callBack?: ZegoLocalStreamEvent[k]): boolean;
    startPublish(): void;
    resetPublish(): void;
    private _getDeviceIdByTrack;
    private _zgp_handleCapture;
    private _zgp_updateOriginStream;
    get isPublish(): boolean;
    updateStreamAudioTrack(successFn?: Function, failFn?: Function, action?: 0 | 1): Promise<void>;
    updateStreamVideoTrack(successFn?: Function, failFn?: Function, action?: 0 | 1): Promise<void>;
    updateStreamVideoAndAudio(successFn?: Function, failFn?: Function, action?: 0 | 1): Promise<void>;
    private _updateStreamTrack;
    private _zgp_initPreviewer;
    createZegoStreamPreview(stream: MediaStream, onlyPreview: boolean, previewType?: "camera" | "custom" | "screen", bitrateConfig?: BitrateConfig): ZegoPreview;
    private checkPreview;
    /**
     * 将视频或音频流的preview信息更新到目标流中
     * @param targetStream 目标流
     * @param videoStream 视频流信息
     * @param audioStream 音频流信息
     * @param updateMainStream 目标流是否为主流
     * @returns
     */
    private _zgp_updatePreviewer;
    private _getVideoBitrate;
    private _getAudioBitrate;
    private _createStream;
    startCaptureMicrophone(options?: ZegoCaptureMicrophone): Promise<ZegoServerResponse>;
    startCaptureCamera(options?: ZegoCaptureCamera): Promise<ZegoServerResponse>;
    startCaptureCameraAndMicrophone(cameraOptions?: ZegoCaptureCamera, microphoneOptions?: ZegoCaptureMicrophone): Promise<ZegoServerResponse>;
    autoCapture(): Promise<ZegoServerResponse>;
    startCaptureCustomAudio(options: ZegoCustomAudio): Promise<ZegoServerResponse>;
    startCaptureCustomVideo(options: ZegoCustomVideo): Promise<ZegoServerResponse>;
    startCaptureCustomVideoAndAudio(videoOptions: ZegoCustomVideo, audioOptions: ZegoCustomAudio): Promise<ZegoServerResponse>;
    startCaptureScreen(options?: ZegoCaptureScreenVideo): Promise<ZegoServerResponse>;
    startCaptureScreenWithAudio(screenVideoOptions?: ZegoCaptureScreenVideo, screenAudioOptions?: ZegoCaptureScreenAudio): Promise<ZegoServerResponse>;
    stopCaptureAudio(): Promise<boolean>;
    stopCaptureVideo(): Promise<boolean>;
    private _zgp_createStreamView;
    private _zgp_initStreamView;
    playAudio(config?: ZegoLocalAduioOptions): void;
    playCaptureAudio(config?: ZegoLocalAduioOptions): void;
    playVideo(view?: HTMLElement, config?: ZegoLocalViewOptions): void;
    playCaptureVideo(view?: HTMLElement, config?: ZegoLocalViewOptions): void;
    updatePlayVideo(): void;
    updatePlayAudio(): void;
    takeStreamSnapshot(option?: ZegoSnapshotOptions): string;
    resumeVideo(): Promise<void> | void;
    resumeAudio(): Promise<void> | void;
    stopVideo(): void;
    stopAudio(): void;
    stopPlayCaptureVideo(): void;
    stopPlayCaptureAudio(): void;
    setVolume(volume: number): boolean;
    _destroyCacheStream(streams: MediaStream[]): MediaStream[];
    private _zgp_checkAndRecycleStream;
    destroy(): void;
}
export {};
