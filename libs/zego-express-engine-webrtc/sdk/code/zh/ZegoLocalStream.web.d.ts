import { ZegoCaptureScreenAudio, ZegoCaptureScreenVideo, ZegoCustomVideo } from "../../src/common/zego.entity";
import { ZegoServerResponse, ZegoSnapshotOptions, ZegoLocalViewOptions, ZegoLocalAduioOptions, ZegoLocalStreamEvent } from "./ZegoExpressEntity.web";
import { ZegoCaptureMicrophone, ZegoCaptureCamera, ZegoCustomAudio } from "../../src/common/zego.entity";
/**
 * zego本地流
 *
 * 详情描述：通过调用createZegoStream可以生成一个ZegoLocalStream实例，ZegoLocalStream集成了音视频的采集、播放API。
 *
 * 业务场景：创建一条本地流，用于预览与推流。
 *
 */
export default class ZegoLocalStream {
    get active(): boolean;
    get id(): string;
    get videoCaptureStream(): MediaStream | null;
    get audioCaptureStream(): MediaStream | null;
    get stream(): MediaStream | null;
    getAudioTracks(): MediaStreamTrack[] | [];
    getVideoTracks(): MediaStreamTrack[] | [];
    getTracks(): MediaStreamTrack[] | [];
    get videoDeviceId(): string;
    get audioDeviceId(): string;
    zegoStream: any;
    constructor(zegoCaptureStream: any);
    /**
       * 注册回调事件。
       *
       * Note: 支持版本：3.0.0 及以上
       *
       * Note: 详情描述：用于处理 SDK 主动通知开发者回调的接口，通过注册不同 event 的事件，可以收到不同功能的回调。可监听的事件回调可以通过 ZegoLocalStreamEvent 查看。
       *
       * Note: 业务场景：用于注册 ZegoLocalStream 媒体流功能相关的业务事件的回调处理。
       *
       * Note: 调用时机：通过调用[createZegoStream]创建 ZegoLocalStreamEvent 实例之后。
       *
       * Note: 注意事项：同样的事件可以注册多个, 相同的注册事件，会根据注册的先后顺序依次触发。
       *
       * Note: 相关接口：调用接口 off 来注销对应回调事件处理。
       *
       * @param event 监听事件名。
       * @param callback 回调函数。
       *
       * @return 注册是否成功。
       */
    on<k extends keyof ZegoLocalStreamEvent>(event: k, callBack: ZegoLocalStreamEvent[k]): boolean;
    /**
       * 注销回调事件。
       *
       * Note: 支持版本：3.0.0 及以上
       *
       * Note: 详情描述：用于处理 SDK 主动通知开发者回调的接口，通过注册不同 event 的事件，可以收到不同功能的回调。用于删除注册的同一类回调事件。
       *
       * Note: 业务场景：用于注销 ZegoLocalStream 媒体流功能相关的业务事件的回调处理。
       *
       * Note: 调用时机：通过调用[createZegoStream]创建 ZegoLocalStreamEvent 实例之后。
       *
       * Note: 注意事项：如果没有传要注销的回调函数参数 [callback]，将会注销所有该事件的回调函数。
       *
       * @param event 监听事件名。
       * @param callback 回调函数。
       *
       * @return 注销回调是否成功。
       */
    off<k extends keyof ZegoLocalStreamEvent>(event: k, callBack?: ZegoLocalStreamEvent[k]): boolean;
    /**
         * 开始采集麦克风音频流。
         *
         * 支持版本：3.0.0及以上
         *
         * 详情描述：开始采集麦克风流，不会同步更新正在推流中的音频，如需更新，可调用[updatePublishingStream]。
         *
         * 业务场景：采集麦克风流用于预览或者更新推流中的音频。
         *
         * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例后。
         *
         * @param options 采集麦克风配置参数
         */
    startCaptureMicrophone(options?: ZegoCaptureMicrophone): Promise<ZegoServerResponse>;
    /**
       * 开始采集摄像头视频流。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：开始采集摄像头流，不会同步更新正在推流中的视频，如需更新，可调用[updatePublishingStream]。
       *
       * 业务场景：采集摄像头流用于预览或者更新推流中的视频。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例后。
       *
       * @param options 采集摄像头配置参数
       */
    startCaptureCamera(options?: ZegoCaptureCamera): Promise<ZegoServerResponse>;
    /**
       * 开始采集摄像头和麦克风音视频流。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：开始采集摄像头和麦克风流，不会同步更新正在推流中的音视频，如需更新，可调用[updatePublishingStream]。
       *
       * 业务场景：采集摄像头和麦克风流用于预览或者更新推流中的音视频。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例后。
       *
       * @param cameraOptions 采集摄像头配置参数
       * @param microphoneOptions 采集麦克风配置参数
       */
    startCaptureCameraAndMicrophone(cameraOptions?: ZegoCaptureCamera, microphoneOptions?: ZegoCaptureMicrophone): Promise<ZegoServerResponse>;
    /**
       * 开始采集第三方音视频流。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：开始采集第三方音频流，不会同步更新正在推流中的音频，如需更新，可调用[updatePublishingStream]。
       *
       * 业务场景：采集第三方音频用于预览或者更新推流中的音频。
       *
       * 注意事项：第三方音频流来自于同一个audio的采集，再次采集会导致前一次采集停止，若音频来自于同个audio不建议多次调用[startCaptureCustomVideoAndAudio]和[startCaptureCustomAudio]。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例后。
       *
       * @param options 采集第三方音频流参数配置
       */
    startCaptureCustomAudio(options: ZegoCustomAudio): Promise<ZegoServerResponse>;
    /**
       * 开始采集第三方视频流。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：开始采集第三方视频流，不会同步更新正在推流中的视频，如需更新，可调用[updatePublishingStream]。
       *
       * 业务场景：采集第三方视频用于预览或者更新推流中的视频。
       *
       * 注意事项：第三方音视频流来自于同一个video的采集，再次采集会导致前一次采集停止，若音视频来自于同个video不建议多次调用[startCaptureCustomVideoAndAudio]、[startCaptureCustomVideo]。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例后。
       *
       * @param options 采集第三方视频流参数配置
       */
    startCaptureCustomVideo(options: ZegoCustomVideo): Promise<ZegoServerResponse>;
    /**
       * 开始采集第三方音视频流。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：开始采集第三方音视频流，不会同步更新正在推流中的音视频，如需更新，可调用[updatePublishingStream]。
       *
       * 业务场景：采集第三方音视频用于预览或者更新推流中的音视频。
       *
       * 注意事项：第三方音视频流来自于同一个audio或者video的采集，再次采集会导致前一次采集停止，若音视频来自于同个audio或者video不建议多次调用[startCaptureCustomVideoAndAudio]、[startCaptureCustomVideo]和[startCaptureCustomAudio]。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例后。
       *
       * @param videoOptions 采集第三方视频流参数配置
       * @param audioOptions 采集第三方音频流参数配置
       */
    startCaptureCustomVideoAndAudio(videoOptions: ZegoCustomVideo, audioOptions: ZegoCustomAudio): Promise<ZegoServerResponse>;
    /**
       * 开始采集屏幕共享视频流。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：开始采集屏幕共享视频流，不会同步更新正在推流中的视频，如需更新，可调用[updatePublishingStream]。
       *
       * 业务场景：采集屏幕共享视频流用于预览或者更新推流中的视频。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例后。
       *
       * @param options 采集屏幕共享配置参数
       */
    startCaptureScreen(options?: ZegoCaptureScreenVideo): Promise<ZegoServerResponse>;
    /**
       * 开始采集屏幕共享视频和共享音频流。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：开始采集屏幕共享视频和共享音频流，不会同步更新正在推流中的视频，如需更新，可调用[updatePublishingStream]。
       *
       * 业务场景：开始采集屏幕共享视频和共享音频流用于预览或者更新推流中的音视频。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例后。
       *
       * @param screenVideoOptions 采集屏幕共享视频配置参数
       * @param screenAudioOptions 采集屏幕共享音频配置参数
       */
    startCaptureScreenWithAudio(screenVideoOptions?: ZegoCaptureScreenVideo, screenAudioOptions?: ZegoCaptureScreenAudio): Promise<ZegoServerResponse>;
    /**
       * 停止采集音频。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：停止采集音频，销毁正在音频预览的播放组件，若处于推流中，则推流中的音频停止采集成功后，预览流的音频采集才会停止，否则停止采集音频失败。
       *
       * 业务场景：停止采集音频。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例后。
       */
    stopCaptureAudio(): Promise<boolean>;
    /**
       * 停止采集视频。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：停止采集视频，销毁正在视频预览的播放组件，若处于推流中，则推流中的视频停止采集成功后，预览流的视频采集才会停止，否则停止采集视频失败。
       *
       * 业务场景：停止采集视频。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例后。
       */
    stopCaptureVideo(): Promise<boolean>;
    /**
       * 在页面上播放待推送或者已推送的媒体流的音频。
       *
       * 支持版本：3.0.0 及以上
       *
       * 详情描述：SDK 将根据需要创建媒体流播放待推送或者正在推流中的媒体流的音频。在调用[startPublishingStream]推流前，媒体播放内容会同步当前最新采集的音频；推流成功后，ZegoLocalStream再次调用采集麦克风、屏幕共享或者第三方音频源，新采集的音频并不会同步更新到正在推流的音频，如需要更新，需要调用[updatePublishingStream]更新。
       *
       * 业务场景：播放待推送或者正在推流中的媒体流的音频。
       *
       * 调用时机：创建 ZegoLocalStream 实例，且开始采集音视频流后。
       *
       * 相关回调：调用 [playAudio] 接口播放视频失败时会触发 ZegoLocalStream 的自动播放失败事件回调 [autoplayFailed]。
       *
       * 相关接口：停止播放媒体流播放接口 [stopAudio] 。调用 [destroyStream] 也会卸载播放组件。
       *
       * @param options 设置播放选项参数。
       */
    playAudio(config?: ZegoLocalAduioOptions): void;
    /**
       * 播放最新正在采集的媒体流音频。
       *
       * 支持版本：3.0.0 及以上
       *
       * 详情描述：SDK 将根据需要创建媒体流播放最新正在采集的媒体流音频。
       *
       * 业务场景：播放最新正在采集的媒体流音频。
       *
       * 调用时机：创建 ZegoLocalStream 实例，且开始采集音频流后。
       *
       * 相关回调：调用 [playCaptureAudio] 接口播放音频失败时，会触发 ZegoLocalStream 的自动播放失败事件回调 [autoplayCaptureFailed]。
       *
       * 相关接口：停止播放媒体流播放接口 [stopPlayCaptureAudio] 。调用 [destroyStream] 也会卸载播放组件。
       *
       * @param options 设置播放选项参数
       */
    playCaptureAudio(config?: ZegoLocalAduioOptions): void;
    /**
       * 在页面上播放待推送或者已推送的媒体流的视频。
       *
       * 支持版本：3.0.0 及以上
       *
       * 详情描述：指定一个 DOM 元素作为容器，SDK 将根据需要在元素下创建媒体流播放待推送或者已推送的媒体流的视频。在执行[startPublishingStream]推流前，媒体播放内容会同步当前最新采集的视频内容；推流成功后，ZegoLocalStream再次调用采集摄像头、屏幕共享或者第三方视频源，新采集的视频并不会同步更新到正在推流的视频源，如需要更新，需要调用[updatePublishingStream]更新。
       *
       * 业务场景：在界面上显示媒体流内容。
       *
       * 调用时机：创建 ZegoLocalStream 实例，且开始采集音视频流后。
       *
       * 注意事项：一个 ZegoLocalStream 实例只能通过 playVideo 方法挂载在一个容器上，不能同时挂载多个。
       *
       * 相关回调：调用 [playVideo] 接口播放视频失败时会触发 ZegoLocalStream 的自动播放失败事件回调 [autoplayFailed]。
       *
       * 相关接口：停止播放媒体流播放接口 [stopVideo] 。调用 [destroyStream] 也会卸载播放组件。
       *
       * @param container 容器 DOM 元素，可以直接传入一个 DOM 元素对象。
       * @param options 设置播放选项参数（镜像、显示模式等）。
       */
    playVideo(view: HTMLElement, config?: ZegoLocalViewOptions): void;
    /**
       * 在页面上播放最新正在采集的媒体流的视频。
       *
       * 支持版本：3.0.0 及以上
       *
       * 详情描述：指定一个 DOM 元素作为容器，SDK 将根据需要在元素下创建媒体播放最新正在采集的媒体流的视频。
       *
       * 业务场景：在界面上显示最新正在采集的媒体流内容。
       *
       * 调用时机：执行[createZegoStream]创建 ZegoLocalStream 实例，且开始采集视频流后。
       *
       * 注意事项：一个 ZegoLocalStream 实例，若[createZegoStream]配置参数[multiplacePreview]默认为false。[multiplacePreview]为false时，只能通过[playCaptureVideo] 方法挂载在一个容器上，不可多次挂载；[multiplacePreview]为true时，调用一次[playCaptureVideo] 则执行一次挂载。
       *
       * 相关回调：调用 [playCaptureVideo] 接口播放视频失败时会触发 ZegoLocalStream 的自动播放失败事件回调 [autoplayCaptureFailed]。
       *
       * 相关接口：停止播放媒体流播放接口 [stopPlayCaptureVideo] ，[stopPlayCaptureVideo]会卸载所有播放最新采集流的播放组件。调用 [destroyStream] 也会卸载播放组件。
       *
       * @param container 容器 DOM 元素，可以直接传入一个 DOM 元素对象。
       * @param options 设置播放选项参数（镜像、显示模式等）。
       */
    playCaptureVideo(view: HTMLElement, config?: ZegoLocalViewOptions): void;
    /**
       * 客户端截图
       *
       * 支持版本：3.0.0 及以上。
       *
       * 详情描述：获取当前播放的待推流或者正在推流中的视频帧数据。
       *
       * 业务场景：对当前播放的待推流或者正在推流中的视频画面进行截图。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例，已经开始采集流且执行[playVideo]后。
       *
       * @param option? 截图相关配置选项
       *
       * @return 包含 data URI 的 DOMString。
       */
    takeStreamSnapshot(option?: ZegoSnapshotOptions): string;
    /**
       * 恢复播放页面上待推送或者正在推流中的视频。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：当视频浏览器限制而阻止播放时，可以在 DOM 点击事件中调用该接口恢复播放页面上的视频。
       *
       * 业务场景：在界面上显示媒体流内容。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例，且已经开始采集流以及执行[playVideo]后。
       */
    resumeVideo(): Promise<void> | void;
    /**
       * 恢复播放页面上待推送或者正在推流中的音频。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：当视频浏览器限制而阻止播放时，可以在 DOM 点击事件中调用该接口恢复播放页面上的音频。
       *
       * 业务场景：播放页面上待推送或者正在推流中的音频。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例，且已经开始采集流以及执行[playAudio]后。
       */
    resumeAudio(): Promise<void> | void;
    /**
       * 停止播放待推流或者正在推流中的视频。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：停止播放待推流或者正在推流中的视频。
       *
       * 业务场景：停止播放待推流或者正在推流中的视频。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例，且已经开始采集流以及执行[playVideo]后。
       *
       * 相关接口：调用 [destroyStream] 则卸载播放组件。
       */
    stopVideo(): void;
    /**
       * 停止播放待推流或者正在推流中的音频。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：停止播放待推流或者正在推流中的音频。
       *
       * 业务场景：停止播放待推流或者正在推流中的音频。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例，且已经开始采集流以及执行[playAudio]后。
       *
       * 相关接口：调用 [destroyStream] 则卸载播放组件。
       */
    stopAudio(): void;
    /**
       * 停止页面所有最新正在采集的媒体流视频的播放。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：停止页面所有最新正在采集的媒体流视频的播放。
       *
       * 业务场景：在界面上不显示最新正在采集的媒体流内容。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例，且已经开始采集流以及执行[playCaptureVideo]后。
       *
       * 相关接口：调用 [destroyStream] 也可以卸载播放组件。
       */
    stopPlayCaptureVideo(): void;
    /**
       * 停止播放最新正在采集的媒体流的音频。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：停止播放最新正在采集的媒体流的音频。
       *
       * 业务场景：停止播放最新正在采集的媒体流的音频。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例，且已经开始采集流以及执行[playCaptureAudio]后。
       *
       * 相关接口：调用 [destroyStream] 也可以卸载播放组件。
       */
    stopPlayCaptureAudio(): void;
    /**
       * 设置播放待推送或者正在推流中的音频的音量。
       *
       * 支持版本：3.0.0及以上
       *
       * 详情描述：设置播放待推送或者正在推流中的音频的音量。
       *
       * 调用时机：通过[createZegoStream]创建ZegoLocalStream 实例，且已经开始采集流以及执行[playAudio]后。
       *
       * @param volume 音量大小，取值范围 [0,100] 。
       *
       * @return 接口是否调用成功。
       */
    setVolume(volume: number): boolean;
}
