import { ZegoExpressWebRTMEngine } from "./zego.client.rtm";
import { ZegoExpressRangeAudio } from "./ZegoExpressRangeAudio.web";
import { ZegoRealTimeSequentialDataManager } from "./ZegoExpressDataChannel.web";
import { ZegoAudioEffectPlayer } from "./ZegoAudioEffectPlayer.web";
import { ZegoStreamView } from "./ZegoStreamView.web";
import { AiDenoiseMode, ZegoLiveAudioEffectMode, ZegoReverbPreset, ZegoVoiceChangerPreset } from "./ZegoVoiceChangerEntity.web";
import { ZegoEvent, ZegoCapabilityDetection, ZegoDeviceInfos, ZegoDeviceInfo, ZegoLocalStreamConfig, ZegoMixStreamAdvance, ZegoMixStreamConfig, ZegoPublishStreamAudioConfig, ZegoPublishStreamConfig, ZegoServerResponse, ZegoWebPlayOption, ZegoWebPublishOption, ZegoCheckSingleType, ZegoElectronScreenSource, ZegoEffectsBeautyParam, ZegoSEIConfig, ZegoPublishStats, ZegoPlayStats, SoundLevelDelegateOptions, ZegoLowlightEnhancementMode, ZegoAutoSwitchDeviceConfig, BackgroundBlurOptions, BackgroundVirtualOptions, Segmentation, ZegoGeoFenceType, ZegoStreamUpdateType, AudioFrameCallback, AudioFrameOptions, ZegoAutoMixerTask } from "./ZegoExpressEntity.web";
import { ZegoScenario, ZegoStreamOptions } from "../../src/common/zego.entity";
import { ZegoCopyrightedMusic } from "./ZegoCopyrightedMusic.web";
import { ZegoStreamCompositor } from "./ZegoStreamCompositor.web";
import ZegoLocalStream from "./ZegoLocalStream.web";
/**
 * 实时音视频引擎
 *
 * Note: 详情描述：该类用于初始化 Express SDK 引擎实例。
 *
 */
export declare class ZegoExpressEngine extends ZegoExpressWebRTMEngine {
    /**
       * 初始化 Engine
       *
       * Note: 支持版本：1.0.0
       *
       * Note: 详情描述：实例化对象。
       *
       * Note: 业务场景：所有场景必须。
       *
       * Note: 默认值：无默认值，所有参数必须填写。
       *
       * Note: 调用时机：第一个调用。
       *
       * Note: 使用限制：无
       *
       * Note: 注意事项：server 建议填写数组，备用域名抗弱网能力更强。
       *
       * Note: 影响范围：无
       *
       * Note: 相关回调：无
       *
       * Note: 相关接口：无
       *
       * Note: 平台差异：无
       *
       * @param appID 用于区分不同客户和项目的唯一标识（必须为 number 类型），且必须从即构控制台获取。一个 appID 对应一个客户项目，不同端共有一个 appID 实现互通 ，一个客户可以申请多个 appID。
  
       * @param server 表示 SDK 连接的即构服务器地址（支持备用域名），必须从控制台获取，SDK 内的大多数功能都通过该服务器地址交互 。同一个 appID 可以填写多个 server。
       */
    constructor(appID: number, server: string | string[], options?: {
        scenario: number;
    });
    /**
     * 设置引擎进阶配置。
     *
     * Note: 支持版本：2.21.0 及以上。
     *
     * Note: 详情描述：设置引擎进阶配置。
     *
     * Note: 业务场景：需要对SDK引擎进行特殊的配置操作时使用，详情可咨询 ZEGO 技术支持。
     *
     * @param config 引擎进阶配置。
     */
    setEngineConfig(config: any): void;
    /**
     * 设置引擎进阶配置。
     *
     * 支持版本：2.26.0
     *
     * 详情描述：设置引擎进阶配置。
     *
     * 业务场景：需要对SDK引擎进行特殊的配置操作时使用，详情可咨询 ZEGO 技术支持。
     *
     * 调用时机：在调用 new 创建引擎之前调用。
     *
     * @param options 引擎进阶配置。
     */
    static setEngineOptions(options: any): void;
    /**
     * 设置地理围栏。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：开发者需要使用地理围栏功能时，需要调用此函数来完成配置。
     *
     * 调用时机：必须在调用 new 之前设置才生效，否则会失败。
     *
     * 使用限制：如果需要使用地理围栏功能，请联系 ZEGO 技术支持。
     *
     * @param type 地理围栏类型。详情描述：用于设置地理围栏类型。
     * @param areaList 地理围栏区域列表。详情描述：用于描述地理围栏范围。
     */
    static setGeoFence(type: ZegoGeoFenceType, areaList: number[]): void;
    /**
     * 设置房间场景
     *
     * 支持版本：2.21.0及以上。
     *
     * 详情描述：开发者可设置房间的使用场景，SDK 会针对不同的场景采取不同的优化策略，以便获取更优的效果；此函数的作用与初始化引擎实例 [options] 配置中的 [scenario] 参数完全一致。
     *
     * 业务场景：此函数适用于多种音视频业务场景的设置修改，例如有 1v1 音视频通话场景和秀场直播场景；通过此函数可以实现在同一个引擎实例的前提下切换场景。
     *
     * 默认值：无
     *
     * 调用时机/通知时机：必须在调用 [loginRoom] 之前设置，生效于后面调用的 [createStream] ，对于已经创建生成的流不生效。
     *
     * 使用限制：一旦登录了房间就不再允许修改房间场景，若需要修改场景需要先退出房间，若登录了多个房间则需要退出所有房间后才能修改。
     *
     * 注意事项：
     * 同一个房间内的用户建议使用同一种房间场景以获得最佳效果。
     * 设置场景会影响音视频码率、帧率、分辨率、编码类型、3A、耳返等音视频配置，若开发者有特殊需求可以在设置房间场景后再调用其他各种 API 来设置上述配置。
     * 调用此函数将覆盖 [new ZegoExpressEngine] 时指定的场景或上一次调用此函数设置的场景。
     *
     * @param scenario 场景值
     *
     * @return true 为设置成功，false 为设置失败。
     */
    setRoomScenario(scenario: ZegoScenario): boolean;
    /**
     * 设置 SEI 相关配置信息
     *
     * Note: 支持版本：2.16.0 及以上。
     *
     * Note: 详情描述：设置 SEI 额外的配置信息。
     *
     * Note: 业务场景：开启 SEI 功能时若需要配置。
     *
     * Note: 调用时机：初始化后。
     *
     * Note: 注意事项： 无。
     *
     * Note: 相关回调：无。
     *
     * @param config SEI 功能相关配置。
     */
    setSEIConfig(config: ZegoSEIConfig): void;
    /**
     * 引入模块，可以通过该接口按需引入其他模块。
     *
     * Note: 支持版本：2.10.0 及以上。
     *
     * Note: 详情描述：可以通过该接口来按需引入其他功能模块，如背景虚化、AI 降噪等功能模块。该方法是静态方法。
     *
     * Note: 调用时机：初始化 ZegoExpressEngine 实例后。
     *
     * @param module 功能模块。
     */
    static use(module: any): void;
    /**
     * 支持能力检测接口
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：检测浏览器兼容性。
     *
     * Note: 业务场景：音视频中很多功能只有较新版本的主流浏览器才支持，可以通过该接口来检测。
     *
     * Note: 默认值：none
     *
     * Note: 调用时机：初始化之后，创建流之前调用。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：
     * 1. 真实支持度除了依赖浏览器外，还依赖系统， 因此有较低概率监测不准的情况。
     * 2. 选择检查摄像头或麦克风能力时浏览器会弹框提示要求允许设备权限。
     * 3. 在仅使用拉流不推流的情况下不需要检查设备能力，只需要检查  "webRTC", "H264" 或 "VP8"。示例：`const result = await zg.checkSystemRequirements("webRTC")`。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param checkType 指定检查一项浏览器所能支持能力，如: webRTC, VP8 等，该参数不传默认检查所有可支持的能力。
     * @param checkLevel 检测编码格式的等级，0 表示快速检测，准确率高。1 表示精准检测但可能消耗时间长，准确率更高。
     */
    checkSystemRequirements<T extends keyof ZegoCheckSingleType>(checkType?: T, checkLevel?: 0 | 1): Promise<ZegoCapabilityDetection>;
    /**
     * 删除注册过的回调事件
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：ZegoEvent 包括了 [ZegoRTCEvent](https://doc-zh.zego.im/article/api?doc=Express_Video_SDK_API~javascript_web~interface~ZegoRTCEvent)  与 [ZegoRTMEvent](https://doc-zh.zego.im/article/api?doc=Express_Video_SDK_API~javascript_web~interface~ZegoRTMEvent)  ，用于处理 SDK 主动通知开发者回调的接口，用于删除注册的同一类回调事件。
     *
     * Note: 业务场景：通用接口，必选。
     *
     * Note: 调用时机：注册之后，退出房间之前。
     *
     * Note: 默认值：无
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：同类事件有多个时，都会被删除。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param event 监听事件名
     * @param callBack 回调函数，可选
     */
    off<K extends keyof ZegoEvent>(event: K, callBack?: ZegoEvent[K]): boolean;
    /**
     * 注册回调事件
     *
     * Note: 支持版本：1.0.0 及以上
     *
     * Note: 详情描述：ZegoEvent 包括了 [ZegoRTCEvent](https://doc-zh.zego.im/article/api?doc=Express_Video_SDK_API~javascript_web~interface~ZegoRTCEvent) 与 [ZegoRTMEvent](https://doc-zh.zego.im/article/api?doc=Express_Video_SDK_API~javascript_web~interface~ZegoRTMEvent) ，用于处理 SDK 主动通知开发者回调的接口，通过注册不同 event 的事件，可以收到不同功能的回调。
     *
     * Note: 业务场景：通用接口，用于监听 SDK 的业务事件。
     *
     * Note: 调用时机：初始化实例之后，调用接口 loginRoom 登录房间之前。
     *
     * Note: 注意事项：同样的事件可以注册多个, 相同的注册事件，会根据注册的先后顺序依次触发。
     *
     * Note: 相关接口：调用接口 off 来注销对应回调事件处理。
     *
     * @param event 监听事件名。
     * @param callBack 回调函数。
     *
     * @return 注册是否成功。
     */
    on<K extends keyof ZegoEvent>(event: K, callBack: ZegoEvent[K]): boolean;
    /**
     * 创建推流数据源，包括摄像头麦克风采集源数据，屏幕共享数据，第三方源数据（能在页面播放的其他源数据）
     *
     * Note: 支持版本：1.0.0 及以上。
     *
     * Note: 详情描述：创建媒体流并设置推流相关参数，包括摄像头采集流、屏幕共享捕捉流、本地或者在线媒体流等多种类型。
     *
     * Note: 业务场景：用于获取摄像头画面或者当前屏幕画面。
     *
     * Note: 默认值：默认为摄像头采集流，默认为高清格式。
     *
     * Note: 调用时机：初始化且调用接口 checkSystemRequirements 检测返回的结果支持后可调用。
     *
     * Note: 注意事项：
     * 1. 移动端和 pc 端对视频宽高的理解不一样，两者恰好相反，同样的分辨率在 pc 端是横屏，在移动端就是竖屏。
     * 2. 必须在安全域名下（https,localhost,127.0.0.1）调用该接口。
     * 3. 推第三方流时，传入的  <video>  标签对应资源，必须加载成功后（媒体标签的 oncanplay 回调）才能调用该接口。
     * 4. 设置开始码率参数 startBitrate 为 “target” (仅 chrome 内核支持)，推流时码率将快速上升，网络较差的情况可能会出现卡顿或花屏，所以建议使用默认缓慢上升的方式。
     * 5. 如果有临时开闭音频或视频的需求，建议先推音视频流，再将对应不需要的音轨或视轨的 enable 设为 false, 推流后要开启音轨或视轨可以调用 replaceTrack 接口。
     * 6. 屏幕共享设置 source.screen.audio 为 true 时（仅windows 支持），只推送系统声音，不推送麦克风声音。
     * 7. 虽然 API 支持设置分辨率，但是很多设备对于自定义的分辨率并不支持，推荐使用参数 source.camera.videoQuality 或 source.screen.videoQuality 预设的几种分辨率。
     * 8. camera.channelCount 和 custom.channelCount 仅 chrome 内核浏览器支持。
     *
     * Note: 相关回调：推流质量回调 publishQualityUpdate 的质量报文内容会跟设置参数相关；屏幕共享中断回调 screenSharingEnded 触发时会自动将媒体流销毁。
     *
     * Note: 相关接口：销毁创建的媒体流接口 destroyStream，开始推流接口 startPublishingStream。
     *
     * @param source 创建媒体流的来源相关参数配置，不传默认是创建摄像头的媒体流
     *
     * @return Promise 异步返回流媒体对象。创建失败返回错误码，1103064：表示媒体流相关设备权限限制，可能是系统没有给浏览器摄像头、麦克风或屏幕采集权限。1103065：表示指定设备不可用于采集媒体流，可能是摄像头或麦克风被其他应用占用。1103066：表示创建流的相关配置参数错误，可能是指定的设备 ID 无效。1103061：表示获取媒体流失败，具体失败原因可以参考文档 ”getUserMedia 异常“ (https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia#%E5%BC%82%E5%B8%B8)。
     */
    createStream(source?: ZegoLocalStreamConfig): Promise<MediaStream>;
    /**
     * 创建推流数据源，包括摄像头麦克风采集源数据，屏幕共享数据，第三方源数据（能在页面播放的其他源数据）
     *
     * Note: 支持版本：3.0.0 及以上。
     *
     * Note: 详情描述：创建媒体流并设置推流相关参数，包括摄像头采集流、屏幕共享捕捉流、本地或者在线媒体流等多种类型。
     *
     * Note: 业务场景：用于获取摄像头画面或者当前屏幕画面。
     *
     * Note: 默认值：默认为摄像头采集流，默认为高清格式。
     *
     * Note: 调用时机：初始化且调用接口 checkSystemRequirements 检测返回的结果支持后可调用。
     *
     * Note: 注意事项：
     * 1. 移动端和 pc 端对视频宽高的理解不一样，两者恰好相反，同样的分辨率在 pc 端是横屏，在移动端就是竖屏。
     * 2. 必须在安全域名下（https,localhost,127.0.0.1）调用该接口。
     * 3. 推第三方流时，传入的  <video>  标签对应资源，必须加载成功后（媒体标签的 oncanplay 回调）才能调用该接口。
     * 4. 设置开始码率参数 startBitrate 为 “target” (仅 chrome 内核支持)，推流时码率将快速上升，网络较差的情况可能会出现卡顿或花屏，所以建议使用默认缓慢上升的方式。
     * 5. 如果有临时开闭音频或视频的需求，建议先推音视频流，再将对应不需要的音轨或视轨的 enable 设为 false, 推流后要开启音轨或视轨可以调用 replaceTrack 接口。
     * 6. 屏幕共享设置 source.screen.audio 为 true 时（仅windows 支持），只推送系统声音，不推送麦克风声音。
     * 7. 虽然 API 支持设置分辨率，但是很多设备对于自定义的分辨率并不支持，推荐使用参数 source.camera.videoQuality 或 source.screen.videoQuality 预设的几种分辨率。
     * 8. camera.channelCount 和 custom.channelCount 仅 chrome 内核浏览器支持。
     *
     * Note: 相关回调：推流质量回调 publishQualityUpdate 的质量报文内容会跟设置参数相关；屏幕共享中断回调 screenSharingEnded 触发时会自动将媒体流销毁。
     *
     * Note: 相关接口：销毁创建的媒体流接口 destroyStream，开始推流接口 startPublishingStream。
     *
     * @param source 创建媒体流的来源相关参数配置，不传默认是创建摄像头的媒体流
     *
     * @return Promise 异步返回流媒体对象。创建失败返回错误码，1103064：表示媒体流相关设备权限限制，可能是系统没有给浏览器摄像头、麦克风或屏幕采集权限。1103065：表示指定设备不可用于采集媒体流，可能是摄像头或麦克风被其他应用占用。1103066：表示创建流的相关配置参数错误，可能是指定的设备 ID 无效。1103061：表示获取媒体流失败，具体失败原因可以参考文档 ”getUserMedia 异常“ (https://developer.mozilla.org/zh-CN/docs/Web/API/MediaDevices/getUserMedia#%E5%BC%82%E5%B8%B8)。
     */
    createZegoStream(options?: ZegoStreamOptions): Promise<ZegoLocalStream>;
    /**
     * 获取推流质量。
     *
     * 支持版本：2.15.0 及以上
     *
     * 详情描述：主动获取正在推流的流质量。
     *
     * 业务场景：获取当前推流的分辨率、帧率、码率等质量参数。
     *
     * 调用时机：[startPublishingStream] 推流成功后。
     *
     * 使用限制：由于 SDK 的流质量参数每 3 秒更新一次，所以该接口的调用间隔建议不要小于 3 秒。
     *
     * 相关回调：推流质量回调 [publishQualityUpdate]。
     *
     * @param streamID 流 ID
     *
     * @return 推流质量报文，如果获取失败会返回 null。
     */
    getPublishingStreamQuality(streamID: string): ZegoPublishStats | null;
    /**
     * 在 Electron 框架下，需要使用屏幕共享功能时调用，返回屏幕列表数据
     *
     * Note: 支持版本：2.11.0
     *
     * Note: 详情描述：在 Electron 框架下，需要使用屏幕共享功能时调用，返回屏幕列表数据。
     *
     * Note: 业务场景：在 Electron 框架下，需要使用屏幕共享功能时调用。
     *
     * Note: 调用时机：初始化之后。
     *
     * Note: 注意事项：无。
     *
     * Note: 相关回调：无。
     *
     * Note: 相关接口：createStream。
     *
     * @return electron 屏幕源列表数据
     */
    getElectronScreenSources(): Promise<ZegoElectronScreenSource[]>;
    /**
     * 销毁创建的流数据
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：销毁流后对应的相关设备也会关闭，如摄像头、麦克风。
     *
     * Note: 业务场景：本地预览和推流必选。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：创建流后才能调用。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 推流过程中，销毁流会导致推流中断，销毁流之前请先停止推流，否则对端画面会卡住。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：创建推流数据源 createStream。
     *
     * Note: 平台差异：无
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     */
    destroyStream(localStream: MediaStream | ZegoLocalStream): void;
    /**
     * 开始推流
     *
     * Note: 支持版本：1.0.0 及以上。
     *
     * Note: 详情描述：将本地流推送到远端（即构服务器），推流状态回调通知推流成功后同一房间的其他用户可以通过 streamID 进行拉流。
     *
     * Note: 业务场景：推流时必选。
     *
     * Note: 默认值：publishOption.videoCodec 默认使用 H.264 推流，如果有特殊需求可选择 VP8，更多场景选择方案请先咨询 ZEGO 售前工程师。
     *
     * Note: 调用时机：调用接口 createStream 创建流成功后。
     *
     * Note: 相关回调：推流质量回调 publishQualityUpdate，推流状态回调 publisherStateUpdate（可通过该接口来判断推流是否成功）。
     *
     * Note: 相关接口：通过调用接口 stopPublishingStream 结束推流。
     *
     * @param streamID 推流 ID，长度不超过256的字符串，仅支持数字，英文字符 和 '-', '_'。
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param publishOption 推拉附加参数（鉴权、视频编码），可选。
     *
     * @return true 表示客户端发送请求成功，流成功推送到服务器需要通过流状态回调接口判断。
     */
    startPublishingStream(streamID: string, localStream: MediaStream | ZegoLocalStream, publishOption?: ZegoWebPublishOption): boolean;
    /**
     * 开始推流
     *
     * Note: 支持版本：3.0.0 及以上。
     *
     * Note: 详情描述：用于更新推流中的流的音视轨。
     *
     * Note: 业务场景：推流时必选。
     *
     * Note: 调用时机：调用接口 loginRoom 登录房间成功后。
     *
     * Note: 相关接口：通过调用接口 stopPublishingStream 结束推流，通过createZegoStream创建流。
     *
     * @param zegoStream 通过createZegoStream创建的ZegoLocalStream流。
     * @param publishType 更新推流音视轨类型
     * @return true 表示客户端发送请求成功，流成功推送到服务器需要通过流状态回调接口判断。
     */
    updatePublishingStream(zegoStream: ZegoLocalStream, updateType: ZegoStreamUpdateType): Promise<ZegoServerResponse>;
    /**
     * 停止将本地流推送到远端（即构服务器）
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：停止推流。
     *
     * Note: 业务场景：推流时必选。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：推流成功后。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 停止推流不会导致渲染的 <video> 画面暂停，开发者需自行销毁 <video>。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：推流质量回调 publishQualityUpdate，推流状态回调 publisherStateUpdate。
     *
     * Note: 相关接口：开始推流 startPublishingStream。
     *
     * Note: 平台差异：无
     *
     * @param streamID 推流 ID,和推流streamID保持一致
     */
    stopPublishingStream(streamID: string): boolean;
    /**
     * 发送媒体增强补充信息
     *
     * Note: 支持版本：2.16.0 及以上。
     *
     * Note: 详情描述：在推流传输音视频流数据同时，发送流媒体增强补充信息来同步一些其他附加信息。
     *
     * Note: 业务场景：一般用于如同步音乐歌词或视频画面精准布局等场景，可选择使用发送 SEI。
     *
     * Note: 调用时机：在开始推流 [startPublishingStream] 后。
     *
     * Note: 使用限制：1 秒钟不要超过30次，SEI 数据长度限制为 4096 字节。
     *
     * Note: 注意事项：
     * 1. SEI 目前仅支持 Chrome 浏览器 86 及以上版本。
     * 2. 由于 SEI 信息跟随视频帧，由于网络问题有可能丢帧，因此 SEI 信息也有可能丢，为解决这种情况，可以在限制频率内多发几次。
     * 3. SEI 对性能的要求较高，同时对多路流进行 SEI 操作可能会有影响。
     *
     * Note: 相关接口：当推流方发送 SEI 后，拉流方可通过监听 [on] 方法监听事件 [playerRecvSEI] 的回调获取 SEI 内容。
     *
     * Note: 相关回调：无。
     *
     * @param streamID 流 ID
     * @param inData SEI 内容
     */
    sendSEI(streamID: string, inData: Uint8Array): boolean;
    /**
     * 修改推流参数
     *
     * Note: 支持版本：1.14.0
     *
     * Note: 详情描述：推流中修改推流相关参数，不建议频繁修改。
     *
     * Note: 业务场景：推流不是主 C 位时，降低分辨率节省带宽。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：调用接口 createStream 创建流成功后。2.15.0 及以前版本要推流成功后才能调用该接口。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 被修改的 localStream 必须是通过 SDK 调用 createStream 方法得到的。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：推流质量回调 publishQualityUpdate。
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param constraints 流的约束
     */
    setVideoConfig(localStream: MediaStream | ZegoLocalStream, constraints: ZegoPublishStreamConfig): Promise<ZegoServerResponse>;
    /**
     * 修改推流音频相关参数
     *
     * Note: 支持版本：1.14.0
     *
     * Note: 详情描述：推流中修改推流相关参数，不建议频繁修改。
     *
     * Note: 业务场景：主播外放背景音乐时，暂时关闭3A，防止被当做噪声消除。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：调用接口 createStream 创建流成功后。 2.15.0 及之前的版本只有在推流成功后才能调用该接口。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 被修改的 localStream 必须是通过 SDK 调用 createStream 方法得到的。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：推流质量回调 publishQualityUpdate。
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param constraints 流的约束
     */
    setAudioConfig(localStream: MediaStream | ZegoLocalStream, constraints: ZegoPublishStreamAudioConfig): Promise<ZegoServerResponse>;
    /**
     * 替换媒体流的音视频轨道
     *
     * Note: 支持版本：1.13.0
     *
     * Note: 详情描述：替换已经创建的推流视轨或音轨
     *
     * Note: 业务场景：例如可以在摄像头、屏幕共享或视频之间切换视频轨道，在麦克风和 mp3 之间切换音频轨道。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：创建流成功后才能调用该接口。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：被替换的 localStream 必须是通过 SDK 调用 createStream 方法得到的。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param mediaStreamTrack 音视频轨道
     */
    replaceTrack(localStream: MediaStream, mediaStreamTrack: MediaStreamTrack): Promise<ZegoServerResponse>;
    /**
     * 给媒体流添加视频轨道。
     *
     * Note: 支持版本：2.22.0
     *
     * Note: 详情描述：给媒体流添加视频轨道。
     *
     * Note: 业务场景：只创建音频单轨道时只获取麦克风权限，后续需要打开摄像头时才获取摄像头权限创建视频轨道，通过 addTrack 添加到纯音频媒体流上。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：创建流成功后才能调用该接口。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：被替换的 localStream 必须是通过 SDK 调用 createStream 方法得到的。
     *
     * Note: 相关接口：removeTrack 移除视轨。
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。。
     * @param track 视频轨道。
     */
    addTrack(localStream: MediaStream, track: MediaStreamTrack): Promise<ZegoServerResponse>;
    /**
     * 给媒体流移除音视频轨道。
     *
     * Note: 支持版本：2.22.0
     *
     * Note: 详情描述：给媒体流移除视频轨道。
     *
     * Note: 调用时机：创建流成功后才能调用该接口。
     *
     * Note: 注意事项：被替换的 localStream 必须是通过 SDK 调用 createStream 方法得到的。
     *
     * Note: 相关接口：addTrack 添加媒体轨。
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。。
     * @param track 视频轨道。
     */
    removeTrack(localStream: MediaStream, track: MediaStreamTrack): Promise<ZegoServerResponse>;
    /**
     * 创建流后可通过该接口调节采集音量
     *
     * Note: 支持版本：2.3.0
     *
     * Note: 详情描述：调节当前采集的音量大小。
     *
     * Note: 业务场景：需要中途动态控制推流声音大小时。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：创建流成功后。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 创建流成功后才能调用该接口，进行混音后仅对采集的音轨有效，混音部分音量请使用setMixingAudioVolume 接口进行调节。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param localStream 需要修改音量的流对象或者 createZegoStream创建得到的 ZegoLocalStream实例对象
     * @param volume 音量大小，0-100
     */
    setCaptureVolume(localStream: MediaStream | ZegoLocalStream, volume: number): Promise<ZegoServerResponse>;
    /**
     * 设置关闭视频流时所推静态图片的路径
     *
     * Note: 支持版本：2.15.0
     *
     * Note: 详情描述：设置关闭视频流时所推静态图片的路径。
     *
     * Note: 业务场景：需要关闭视频画面时推一个特定的背景图片。
     *
     * Note: 调用时机：创建流成功后。
     *
     * Note: 注意事项： 创建流成功后才能调用该接口，静态图片分辨率越高越消耗性能，所以建议根据所需推流分辨率来选择所需图片大小。
     *
     * @param filePath 图片路径
     * @param localStream 需要在该流关闭时发送图片的流对象或者 createZegoStream创建得到的 ZegoLocalStream实例对象
     */
    setDummyCaptureImagePath(filePath: string, localStream: MediaStream | ZegoLocalStream): Promise<boolean>;
    /**
     * 设置流的附加信息
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述： 更改流附加信息。
     *
     * Note: 业务场景：需要对推流进行更丰富的描述，且希望拉流端能接受到这些信息时使用。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：推流成功后。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 只支持字符串。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：初次登录房间用户可通过 roomStreamUpdate 获取流附加信息，已经在房间拉流的用户通过流附加信息更新回调 streamExtraInfoUpdate 获取更新后的流附加消息。
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param streamID 推流 ID
     * @param extraInfo 流附加信息; extraInfo为json格式字符串
     */
    setStreamExtraInfo(streamID: string, extraInfo: string): Promise<ZegoServerResponse>;
    /**
     * 开/关视频采集设备。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述： 开启或关闭视频采集设备。
     *
     * Note: 业务场景：主播在某一时段画面，不希望被拉流端看到摄像头画面也不希望摄像头设备一直被占用时调用。
     *
     * Note: 调用时机：创建流成功后。
     *
     * Note: 注意事项：
     * 1. 打开/关闭流画面的前提是媒体流必须为摄像头流。
     * 2. 如果通过 replaceTrack 或 addTrack 接口做了替换视轨，则不支持调用该接口进行关闭摄像头采集，可以自行调用 MediaStreamTrack.stop 方法进行停止摄像头采集。
     *
     * Note: 使用限制：硬件上关闭或打开摄像头是耗时操作，用户频繁操作时有一定的性能开销，一般推荐使用 [mutePublishStreamVideo]。
     *
     * Note: 相关回调：调用停止采集摄像头接口会触发拉流端对应流的摄像头状态回调 [remoteCameraStatusUpdate]。
     *
     * Note: 相关接口：相较于该接口，打开/关闭发送流视频数据接口 [mutePublishStreamVideo] 响应速度更快且不影响视频采集状态。
     *
     * @param localStream 创建流获取的摄像头媒体流或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param enable 标识开启或停止采集；true 表示开启采集；false 表示关闭采集；默认为 true。
     *
     * @return Promise 返回 boolean 标识是否调用成功。
     */
    enableVideoCaptureDevice(localStream: MediaStream | ZegoLocalStream, enable?: boolean): Promise<boolean>;
    /**
     * 通知即构服务器将流转推到CDN
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：当需要将音视频流转推到其它指定的 CDN 时，需要调用此接口进行设置（调用前请先联系 ZEGO 技术支持配置转推 CDN 功能）。
     *
     * Note: 业务场景：单向直播场景，拉流端使用 CDN 拉流。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：推流成功后。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：
     *      建议使用服务端动态转推 CDN 中的增加转推 CDN 地址 API 替代该客户端 API。
     *      该接口调用有可能会失败，若返回成功，仅代表通知即构服务器成功，无法判断即构服务器是否转推 CDN 成功。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：通知即构服务器停止将流转推到 CDN removePublishCdnUrl。
     *
     * Note: 平台差异：无
     *
     * @param streamID 推流 ID
     * @param targetURL CDN 转推地址，支持的转推地址格式有 rtmp
     */
    addPublishCdnUrl(streamID: string, targetURL: string): Promise<ZegoServerResponse>;
    /**
     * 通知即构服务器停止将流转推到 CDN
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述： 当已经添加了某个 CDN 转推地址，需要停止将流转推至该 CDN 时调用此接口（调用前请先联系 ZEGO 技术支持配置转推 CDN 功能）。
     *
     * Note: 业务场景：单向直播场景，拉流端使用 CDN 拉流。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：转推成功后
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：
     *      建议使用服务端动态转推 CDN 中的增加转推 CDN 地址 API 替代该客户端 API。
     *      该接口调用有可能会失败，若返回成功，仅代表通知即构服务器成功，无法判断即构服务器是否转推 CDN 成功。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：通知即构服务器将流转推到 CDN addPublishCdnUrl。
     *
     * Note: 平台差异：无
     *
     * @param streamID 推流 ID
     * @param targetURL CDN 转推地址，支持的转推地址格式有 rtmp
     */
    removePublishCdnUrl(streamID: string, targetURL: string): Promise<ZegoServerResponse>;
    /**
     * 关闭/打开正在推流的流画面
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述： 推流时可调用此函数实现不推视频流，本地摄像头仍能正常工作，能正常采集和处理视频画面且不向网络发送视频数据。
     *
     * Note: 业务场景：主播在某一时段画面，不希望被拉流端看到时调用。
     *
     * Note: 调用时机：创建流成功后。
     *
     * Note: 注意事项：打开/关闭流画面的前提是原始流必须有视频轨道，创建流时不能为纯音频。
     *
     * Note: 相关回调：拉流摄像头状态回调 remoteCameraStatusUpdate。
     *
     * Note: 相关接口： 打开/关闭正在推流的流声音 mutePublishStreamAudio。
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param mute 是否停止发送视频流；true 表示不发送视频流；false 表示发送视频流；默认为 true。
     * @param retain 是否保留预览画面，布尔值，true 保留， false 不保留，默认为 false
     *
     * @return 标识是否成功关闭推流画面
     */
    mutePublishStreamVideo(localStream: MediaStream | ZegoLocalStream, mute: boolean, retain?: boolean): boolean;
    /**
     * 打开/关闭正在推流的流声音，包括麦克风、混音背景音乐的声音
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述： 打开/关闭正在推流的流所有声音，包括麦克风、混音背景音乐的声音，音频轨依旧保留。
     *
     * Note: 业务场景：主播在某一时段不想让观众端听到声音。
     *
     * Note: 调用时机：创建流成功后。
     *
     * Note: 注意事项：
     * 1. 打开/关闭流声音的前提是原始流必须有音频轨道，创建流时不能为纯视频。
     * 2. 该接口会关闭所有流声音，包括麦克风、混流的背景音乐等声音，而 muteMicrophone 只会关闭麦克风的声音。
     *
     * Note: 相关回调：拉流麦克风状态回调 remoteMicStatusUpdate。
     *
     * Note: 相关接口： 关闭/打开正在推流的流画面 mutePublishStreamVideo；关闭/打开麦克风声音接口 muteMicrophone。
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param mute 是否停止发送音频流；true 表示不发送音频流；false 表示发送音频流；默认为 true。
     */
    mutePublishStreamAudio(localStream: MediaStream | ZegoLocalStream, mute: boolean): boolean;
    /**
     * 开启或关闭美颜
     *
     * Note: 支持版本：2.13.0 及以上。
     *
     * Note: 详情描述：可以通过该接口开关美颜和调整美颜参数，实现自然的美颜效果。
     *
     * Note: 业务场景：摄像头画面进行人像美颜。
     *
     * Note: 调用时机：调用接口 createStream 获取到媒体流后。
     *
     * Note: 注意事项：
     * 1. 美颜效果与对应的 MediaStream 绑定，当调用 useVideoDevice、replaceTrack 时不改变对应 MediaStream 的美颜效果。
     * 2. 美颜处理占用资源并消耗性能，当不需要使用美颜时需要及时调用 setEffectsBeauty(localStream,false) 关闭。
     * 3. 当调用 destroyStream 销毁流的同时 SDK 会关闭美颜效果, 其他情况 SDK 不会主动关闭美颜处理，需要自行调用 setEffectsBeauty(localStream,false) 关闭。
     * 4. 移动端设备的浏览器不支持开启美颜。
     * 5. 开启美颜是一个异步的接口，在开启过程中不能开始推流，如果需要在推流前开启美颜需要等美颜接口异步完成后再调用 startPublishingStream 接口。
     *
     * Note: 相关回调：无。
     *
     * @param localStream 创建流得到的 MediaStream 对象或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param enable 是否开启美颜，true 表示开启，false 表示关闭。
     * @param options 美颜选项，包含 smoothIntensity（磨皮）、whitenIntensity（美白）、rosyIntensity（红润）、sharpenIntensity（锐化）四个参数，可用来实现美颜效果。四个强度参数范围 [0,100]，默认值为 50, options 参数非必填。
     */
    setEffectsBeauty(localStream: MediaStream | ZegoLocalStream, enable: boolean, options?: ZegoEffectsBeautyParam): Promise<ZegoServerResponse>;
    /**
     * 设置低照度增强。
     *
     * 支持版本：2.18.0 及以上。
     *
     * 详情描述：根据设置的低照度增强模式，对摄像头采集的画面亮度进行增强，兼容美颜功能。用户可以在预览时观看效果，并实时切换低照度增强模式。
     *
     * 业务场景：推流端环境较暗，或者摄像头设置的帧率较高导致画面偏暗，无法正常显示或识别主体。
     *
     * 默认值：关闭。
     *
     * 调用时机：调用 createStream 创建预览流之后。
     *
     * 注意事项：接口兼容性同 setEffectsBeauty，不兼容移动端浏览器。
     *
     * @param localStream 媒体流对象或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param mode 低照度增强模式。
     */
    setLowlightEnhancement(localStream: MediaStream | ZegoLocalStream, mode: ZegoLowlightEnhancementMode): Promise<ZegoServerResponse>;
    /**
     * 开启大小流
     *
     * Note: 支持版本：2.18.0 及以上。
     *
     * Note: 详情描述：可以通过该接口开关大小流。
     *
     * Note: 业务场景：需要不同终端显示不同质量的视频流或需要在较差的网络环境中保持连麦的流畅。
     *
     * Note: 调用时机：在成功调用创建流接口后，推流接口前。
     *
     * Note: 注意事项：无。
     *
     * Note: 相关回调：无。
     *
     * @param localStream 创建流得到的 MediaStream 对象或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     */
    enableDualStream(localStream: MediaStream | ZegoLocalStream): void;
    /**
     * 设置小流参数
     *
     * Note: 支持版本：2.18.0 及以上。
     *
     * Note: 详情描述：可以通过该接口设置小流参数。
     *
     * Note: 业务场景： 需要不同终端显示不同质量的视频流或需要在较差的网络环境中保持连麦的流畅。
     *
     * Note: 调用时机：在成功调用创建流接口后，推流接口前。
     *
     * Note: 注意事项：无。
     *
     * Note: 相关回调：无。
     *
     * @param localStream 创建流得到的 MediaStream 对象或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param param 小流参数，分辨率宽高，帧率及码率。
     */
    setLowStreamParameter(localStream: MediaStream | ZegoLocalStream, param: {
        width: number;
        height: number;
        frameRate: number;
        bitRate: number;
    }): void;
    /**
     * 开/关硬件编码。
     *
     * Note: 支持版本：2.20.0 及以上
     *
     * Note: 详情描述： 推流时是否采用硬件编码的开关，开启硬件编码后会使用 GPU 进行编码，降低 CPU 使用率。
     *
     * Note: 业务场景：减少视频编码对 CPU 占用。
     *
     * Note: 调用时机：在推流前设置才能生效，如果在推流后设置，停推后重新推流可以生效。
     *
     * Note: 注意事项：由于少部分机型设备硬编支持不是特别好，SDK 默认使用软件编码的方式。若开发者在某些机型测试时发现推大分辨率音视频流时设备发热严重，可考虑调用此函数开启硬编的方式。
     *
     * @param enable 是否开启硬件编码；true 表示开启硬编；false 表示关闭硬编；默认为 false。
     */
    enableHardwareEncoder(enable: boolean): void;
    /**
     * 开启或关闭相关设备的自动切换
     *
     * 支持版本：2.20.0 及以上。
     *
     * 详情描述：传入相关配置，开启或关闭相关设备的自动切换，设备被拔除之后支持自动切换当前使用的其他可用设备。SDK默认关闭自动切换设备。
     *
     * 业务场景：SDK创建初始化之后，设备拔插的兼容操作。
     *
     * @param config 设备自动切换的相关配置
     */
    enableAutoSwitchDevice(config: ZegoAutoSwitchDeviceConfig): void;
    /**
     * 初始化背景处理模块。
     *
     * 支持版本：2.24.0 及以上。
     *
     * 详情描述：初始化背景处理模块。
     *
     * 业务场景：以自定义的图片替代真实的背景。
     *
     * 默认值：无
     *
     * 调用时机：初始化 SDK 后。
     *
     * 注意事项：
     * 1. 目前仅支持 PC 端使用，移动端暂不支持。
     *
     * @param segmentation 背景分割模式。
     * @param assetsURL 资源文件路径。
     */
    initBackgroundModule(segmentation: Segmentation, assetsURL: string): Promise<ZegoServerResponse>;
    /**
     * 设置背景虚化相关参数。
     *
     * 支持版本：2.24.0 及以上。
     *
     * 详情描述：设置背景虚化相关参数。
     *
     * 业务场景：虚化用户周围的真实场景。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 initBackgroundModule 初始化背景处理模块和调用接口 createStream 创建流成功后。
     *
     * 注意事项：
     * 1. 目前仅支持 PC 端使用，移动端暂不支持；
     *
     * @param localStream 媒体流或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param options 背景虚化处理的参数。
     */
    setBackgroundBlurOptions(localStream: MediaStream | ZegoLocalStream, options: BackgroundBlurOptions): Promise<boolean>;
    /**
     * 设置透明背景相关处理参数。
     *
     * 支持版本：3.0.0 及以上版本。
     *
     * 详情描述：设置透明背景相关处理参数。
     *
     * 业务场景：对流进行透明背景相关处理。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 initBackgroundModule 初始化背景处理模块调用接口 createStream 创建流成功后。
     *
     * 注意事项：
     * 1. 目前仅支持 PC 端使用，移动端暂不支持；
     * 2. 使用前需调 ZegoExpressEngine.use 方法引入虚拟背景模块。
     *
     * @param localStream 媒体流或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     */
    setTransparentBackgroundOptions(localStream: MediaStream | ZegoLocalStream): Promise<boolean>;
    /**
     * 设置虚拟背景相关处理参数。
     *
     * 支持版本：2.24.0 及以上版本。
     *
     * 详情描述：设置虚拟背景处理相关参数。
     *
     * 业务场景：对流进行虚拟背景相关处理。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 initBackgroundModule 初始化背景处理模块调用接口 createStream 创建流成功后。
     *
     * 注意事项：
     * 1. 目前仅支持 PC 端使用，移动端暂不支持；
     * 2. 使用前需调 ZegoExpressEngine.use 方法引入虚拟背景模块。
     *
     * @param localStream 媒体流或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param options 虚拟背景处理相关参数。
     */
    setVirtualBackgroundOptions(localStream: MediaStream | ZegoLocalStream, options: BackgroundVirtualOptions): Promise<boolean>;
    /**
     * 开启背景处理功能。
     *
     * 支持版本：2.24.0 及以上。
     *
     * 详情描述：将推送的媒体流进行背景处理。
     *
     * 业务场景：对推的流进行背景的处理。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 createStream 创建流成功后。
     *
     * 注意事项：
     * 1. 目前仅支持 PC 端使用，移动端暂不支持；
     *
     * @param localStream 媒体流或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param enable 开启或关闭背景处理。
     * @param segmentation 背景处理分割模式。
     */
    enableBackgroundProcess(localStream: MediaStream | ZegoLocalStream, enable: boolean, segmentation: Segmentation): Promise<ZegoServerResponse>;
    /**
     * 支持版本：2.23.0
     *
     * 详情描述：将推送的媒体流进行变声处理。
     *
     * 业务场景：推流前或推流中切换变声。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 [createStream] 创建流成功后。
     *
     * 注意事项：
     * 1. 目前使用变声功能需要联系 ZEGO 技术支持进行特殊编包；
     * 2. 目前仅支持对特定的一条流进行变声处理，不支持同时对多条流同时变声；
     *
     * @param preset 变声预设值
     */
    setVoiceChangerPreset(preset: ZegoVoiceChangerPreset, localstream: MediaStream | ZegoLocalStream): Promise<ZegoServerResponse>;
    /**
     * 支持版本：3.0.0 及以上版本。
     *
     * 详情描述：通过参数设置自定义变声效果。
     *
     * 业务场景：推流前或推流中切换变声。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 [createStream] 创建流成功后。
     *
     * 注意事项：
     * 1. 目前仅支持对特定的一条流进行变声处理，不支持同时对多条流同时变声；
     * 2.音调参数 voiceParam，取值范围 [-12.0, 12.0]，数值越大声音越尖，设为 0.0 即关闭变声器。
     *
     * @param voiceParam 音调参数
     */
    setVoiceChangerParam(localstream: MediaStream | ZegoLocalStream, voiceParam: number): Promise<ZegoServerResponse>;
    /**
     * 通过预设枚举设置混响。
     *
     * 支持版本：2.26.0 及以上版本。
     *
     * 详情描述：可通过调用本函数设置预设混响效果。
     *
     * 业务场景：常用于直播、语聊房和 KTV 等场景。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 [createStream] 创建流成功后，且在推流前或推流成功后调用。
     *
     * 注意事项：
     * 1. 目前仅支持对特定的一条流进行混音处理，不支持同时对多条流同时混响。
     * 2. 本函数与 [setVoiceChangerPreset] 同时使用效果可能和预期有差异，如需同时使用，建议先开启变声，再开启混响。
     *
     * @param localStream 需要混响处理的媒体流或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param preset 混响预设枚举值。
     */
    setReverbPreset(localStream: MediaStream | ZegoLocalStream, preset: ZegoReverbPreset): Promise<ZegoServerResponse>;
    /**
     * 开启或关闭推流时的虚拟立体声效果。
     *
     * 支持版本：2.26.0 及以上版本。
     *
     * 详情描述：可通过调用本函数开启/关闭推流时的虚拟立体声效果。
     *
     * 业务场景：常用于直播、语聊房和 KTV 等场景。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 [createStream] 创建支持双声道的流成功后，且在推流前或推流成功后调用。
     *
     * 注意事项：
     * 1. 目前仅支持对特定的一条流进行混音处理，不支持同时对多条流同时混响。
     * 2. 需要调用 [createStream] 时参数设置双声道虚拟立体声才能生效。
     * 3. 虚拟立体声和混响功能效果有冲突，产生的效果可能不符合预期，不要进行叠加使用。
     * 4. Mac Safari 、移动端设备浏览器上暂不支持虚拟立体声功能。
     *
     * @param localStream 需要混响处理的媒体流或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param enable true 代表开启虚拟立体声，false 代表关闭虚拟立体声。
     * @param angle 虚拟立体声中声源的角度，范围为 -1 ~ 360，90 为正前方，0 / 180 / 270 分别对应最右边 / 最左边 / 正后方；特别的，设置 -1 时为全方位虚拟立体声效果。
     */
    enableVirtualStereo(localStream: MediaStream | ZegoLocalStream, enable: boolean, angle: number): Promise<ZegoServerResponse>;
    /**
     * 开启或关闭混流精准对齐功能。
     *
     * 支持版本：3.0.0 及以上。
     *
     * 详情描述：开启现场音效后，空间感增强、乐器声音增强突出。
     *
     * 业务场景：一般用于语聊房、K 歌场景下，增强伴奏的现场音效。
     *
     * 调用时机：初始化 ZegoExpresEngine 实例后。
     *
     * @param player H5 audio 或  video 标签元素对象。
     * @param enable 是否开启现场音效。
     * @param mode 现场音效生效模式。
     *
     * @return 异步返回调用结果。
     */
    enableLiveAudioEffect(player: HTMLMediaElement, enable: boolean, mode: ZegoLiveAudioEffectMode): Promise<ZegoServerResponse>;
    /**
     * 对传入的歌曲进行变调处理。
     *
     * 详情描述：通过输入不同的pitch值，实现对player进行变调处理。
     *
     * 业务场景：一般用于语聊房、K 歌场景下，实现对伴奏进行升降调处理。
     *
     * 调用时机：初始化 ZegoExpresEngine 实例后。
     *
     * @param player H5 audio 或  video 标签元素对象。
     * @param pitch 音调值，范围[-12.0, 12.0]，数值越大声音越尖，设为 0.0 即关闭变调处理。
     * @param mode 音效生效模式。0
     * @return 异步返回调用结果。
     */
    setAudioChangerParam(player: HTMLMediaElement, pitch: number, mode: ZegoLiveAudioEffectMode): Promise<ZegoServerResponse>;
    /**
     * 传入媒体流，开启或关闭 AI 降噪
     *
     * 支持版本：2.19.0
     *
     * 详情描述：将推送的媒体流进行 AI 降噪处理。
     *
     * 业务场景：推流前或推流中切换 AI 降噪。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 createStream 创建流成功后。
     *
     * 相关接口：setAiDenoiseMode
     *
     * 注意事项：
     * 1. 目前使用 AI 降噪功能需要联系 ZEGO 技术支持进行特殊编包；
     * 2. 目前仅支持 PC 端使用，移动端暂不支持；
     * 3. 目前仅支持对特定的一条流进行 AI 降噪处理，不支持同时对多条流同时降噪；
     *
     * @param localStream 需要切换 AI 降噪的媒体流或者 createZegoStream创建得到的 ZegoLocalStream实例对象
     * @param enable 开启/关闭 AI 降噪
     */
    enableAiDenoise(localStream: MediaStream | ZegoLocalStream, enable: boolean): Promise<ZegoServerResponse>;
    /**
     * 传入媒体流，设置 AI 降噪处理的模式
     *
     * 支持版本：3.3.0
     *
     * 详情描述：支持设置 AI 降噪处理的模式。
     *
     * 业务场景：需要切换AI降噪模式，从而达到更强的人声抑制效果。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 createStream 创建流成功后。
     *
     * 相关接口：enableAiDenoise
     *
     * 注意事项：
     * 1. 目前使用 setAiDenoiseMode，需要 ZEGO 技术支持进行特殊编包；
     * 2. 目前仅支持 PC 端使用，移动端暂不支持；
     *
     * @param localStream 需要切换 AI 降噪的媒体流或者 createZegoStream创建得到的 ZegoLocalStream实例对象
     * @param mode AI 降噪模式，enableAiDenoise默认为AI，AIBalanced具有更强的抑制效果。
     */
    setAiDenoiseMode(localStream: MediaStream | ZegoLocalStream, mode: AiDenoiseMode): Promise<ZegoServerResponse>;
    /**
     * 开始拉流
     *
     * Note: 支持版本：1.0.0 及以上。
     *
     * Note: 详情描述：通过流 ID 拉取远端用户的媒体流。
     *
     * Note: 业务场景：拉流时必选。
     *
     * Note: 调用时机：收到新增拉流，即 roomStreamUpdate 回调后。
     *
     * Note: 注意事项：
     * 1. 拉流前确保该条流已经推成功（推送到 ZEGO 服务器），即拉流是在 roomStreamUpdate 回调后。
     *
     * Note: 相关回调：拉流质量回调 playQualityUpdate，拉流状态回调 playerStateUpdate （可通过该回调来判断拉流是否成功）。
     *
     * Note: 相关接口：调用接口 stopPlayStream 结束拉流。
     *
     * @param streamID 流 ID，必填，仅支持数字，英文字符 和 '-', '_'。
     * @param playOption 拉流附加参数，可选。
     *
     * @return promise 异步返回流媒体对象。
     */
    startPlayingStream(streamID: string, playOption?: ZegoWebPlayOption): Promise<MediaStream>;
    /**
     * 停止拉取远端流（即构服务器）
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：停止拉流，断开和即构服务器之间的连接，不再产生带宽。
     *
     * Note: 业务场景：拉流必选。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：拉流成功后。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 停止拉流后不会销毁播放器，播放器销毁需要开发者自己实现。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：拉流质量回调 playQualityUpdate，拉流状态回调 playerStateUpdate。
     *
     * Note: 相关接口：开始拉流 startPlayStream。
     *
     * Note: 平台差异：无
     *
     * @param streamID 流 ID，必填
     */
    stopPlayingStream(streamID: string): void;
    /**
     * 停止或恢复拉取视频流
     *
     * Note: 支持版本：1.15.0
     *
     * Note: 详情描述： 只是将数据降低为很小，视频轨还在。
     *
     * Note: 业务场景：观众在某一时段画面，不想看到主播画面时调用。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：拉流成功后。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：
     * 1. 停止或恢复拉取视频流的前提是原始流必须有视频轨道，拉流时不能为纯音频。
     * 2. 只对 RTC 流或 L3 流有效，无法操作 CDN 拉流。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口： 停止或恢复拉取音频流 mutePlayStreamAudio。
     *
     * Note: 平台差异：无
     *
     * @param streamID 流ID
     * @param mute 是否拉取视频流，true 表示停止拉取；false 表示恢复拉取
     */
    mutePlayStreamVideo(streamID: string, mute: boolean): Promise<boolean>;
    /**
     * 停止或恢复拉取音频流
     *
     * Note: 支持版本：1.15.0
     *
     * Note: 详情描述： 只是将数据降低为很小，音频轨还在。
     *
     * Note: 业务场景：观众在某一时段画面，不想听到主播声音时调用。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：拉流成功后。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：
     * 1. 停止或恢复拉取音频流的前提是原始流必须有音频轨道，拉流时不能为纯视频。
     * 2. 只对 RTC 流或 L3 流有效，无法操作 CDN 拉流。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口： 停止或恢复拉取视频流 mutePlayStreamVideo。
     *
     * Note: 平台差异：无
     *
     * @param streamID 流ID
     * @param mute 是否拉取音频流，true 表示停止拉取；false 表示恢复拉取
     */
    mutePlayStreamAudio(streamID: string, mute: boolean): Promise<boolean>;
    /**
     * 设置拉流原始音频数据回调，在拉流成功后调用
     * @param streamID 拉流 ID
     * @param callback 接收音频数据的回调，设置为 null 则不再获取音频数据
     * @param options
     * @returns
     */
    setAudioFrameCallback(streamID: string, callback: AudioFrameCallback | null, options?: AudioFrameOptions): Promise<ZegoServerResponse>;
    /**
     * 获取拉流质量。
     *
     * 支持版本：2.15.0 及以上
     *
     * 详情描述：主动获取正在拉流的流质量。
     *
     * 业务场景：获取当前拉流的分辨率、帧率、码率等质量参数。
     *
     * 调用时机：[startPlayingStream] 推流成功后。
     *
     * 使用限制：由于 SDK 的流质量参数每 3 秒更新一次，所以该接口的调用间隔建议不要小于 3 秒。
     *
     * 相关回调：拉流质量回调 [playQualityUpdate]。
     *
     * @param streamID 流 ID
     *
     * @return 拉流质量报文，如果获取失败会返回 null。
     */
    getPlayingStreamQuality(streamID: string): ZegoPlayStats | null;
    /**
     * 创建本地媒体流播放器组件实例对象。
     *
     * Note: 支持版本：2.17.0 及以上
     *
     * Note: 详情描述：创建媒体流播放器组件实例对象，用于播放预览流。
     *
     * Note: 业务场景：需要在界面播放摄像头、屏幕共享等媒体流画面。
     *
     * Note: 调用时机：需要调用接口 createStream 获取媒体流对象作为入参使用。
     *
     * Note: 注意事项:  每个媒体流对象相对应只能创建一个媒体流播放器组件实例对象。
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。。
     *
     * @return 媒体流播放器组件实例对象。
     */
    createLocalStreamView(localStream: MediaStream): ZegoStreamView;
    /**
     * 创建远端媒体流播放器组件实例对象。
     *
     * Note: 支持版本：2.17.0 及以上
     *
     * Note: 详情描述：创建媒体流播放器组件实例对象，用于播放拉流。
     *
     * Note: 业务场景：需要在页面显示拉取的远端媒体流画面。
     *
     * Note: 调用时机：需要调用接口 [startPlayingStream] 获取媒体流对象作为入参使用。
     *
     * Note: 注意事项:  每个媒体流对象相对应只能创建一个媒体流播放器组件实例对象。
     *
     * @param remoteStream 远端媒体流，通过 [startPlayingStream] 接口获取。
     *
     * @return 媒体流播放器组件实例对象。
     */
    createRemoteStreamView(remoteStream: MediaStream): ZegoStreamView;
    /**
     * 开始混流任务
     *
     * Note: 支持版本：1.5.2 及以上。
     *
     * Note: 详情描述：将多条流按照调用要求合成一条流。 由那个点于实际动作是在服务端操作，没有浏览器性能上的限制，且各个流之间延迟低，可以保证被混的多条流画面和声音同步。
     *
     * Note: 业务场景：通常用于多个主播连麦PK的场景，将多个主播的音视频流混合成一条流，观众端只需要拉这一条流。
     *
     * Note: 调用时机：调用接口 startPublishingStream 推流成功后。
     *
     * Note: 使用限制：混流前需要保证流还存在，避免发起混流和流删除操作同时触发，以免混流失败。被混的流如果中止推流，需要重新做混流处理，否则对端画面会卡住。
     *
     * Note: 注意事项：1. 应用对应的 AppID 开启了混流功能；2. 被混的流必须在 ZEGO 服务器上存在；3. 混流输入流列表接口 inputList 中的 “contentType” 均为 “AUDIO” 时，ZegoMixStreamOutputConfig 类下的 outputBitrate 、outputFPS 、outputWidth 、outputHeight 属性可不设置，默认设置为 “1”。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 相关接口： 使用接口 stopMixerTask 来停止服务端混流，未及时停止混流功能会影响计费。
     *
     * @param mixStreamConfig 混流参数配置
     */
    startMixerTask(mixStreamConfig: ZegoMixStreamConfig): Promise<ZegoServerResponse>;
    /**
     * 停止服务端混流
     *
     * Note: 支持版本：1.5.2 及以上。
     *
     * Note: 详情描述：用于停止 taskID 对应的服务端混流任务。
     *
     * Note: 业务场景：通常用于多个主播连麦 PK 的场景，混流画面使用结束后停止混流。
     *
     * Note: 调用时机：调用接口 startMixerTask 混流成功之后。
     *
     * Note: 注意事项：关闭页面一定要发起停止混流，避免异常关闭导致混流没有停止，影响计费；被混的流若中止推流，需要重新做混流处理，否则对端画面会卡住。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 相关接口： 开始混流任务接口 startMixerTask
     *
     * @param taskID 混流任务 ID（客户自定义，务必保证唯一），必填，最大长度为 256 个字符，仅支持数字、英文字符 和 '~', '!', '@', '#', '$', '', '^', '&', '*', '(', ')', '_', '+', '=', '-', ', ';', '’', ',', '
     */
    stopMixerTask(taskID: string): Promise<ZegoServerResponse>;
    /**
     * 混流高级配置
     *
     * Note: 支持版本：1.5.2 及以上。
     *
     * Note: 详情描述：混流功能进阶设置，可以设置视频背景和视频编码格式。
     *
     * Note: 业务场景：1. 设置混流画面背景；2. 视频编码转换来兼容部分浏览器的播放。
     *
     * Note: 调用时机：推流成功后，而且需在使用 startMixerTask 之前调用才能生效。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 相关接口：开始混流接口 startMixerTask
     *
     * @param config 混流高级功能设置。
     */
    setMixerTaskConfig(config: ZegoMixStreamAdvance): Promise<ZegoServerResponse>;
    /**
     * 开始自动混流任务
     *
     * Note: 支持版本：3.5.0 及以上。
     *
     * Note: 详情描述：本地用户可调用该函数开始自动混流任务，对房间内的所有流进行混流，目前仅支持音频流自动混流。启动自动混流后，会自动混流该房间内所有流的音频，此房间内再发起的推流也会自动混入最后的输出流中。
     *
     * Note: 业务场景：常用于语聊房场景下，需要由客户端发起自动混流任务时。
     *
     * Note: 调用时机：在创建引擎后，如果目标房间已经创建，可调用该函数在目标房间开启自动混流。
     *
     * Note: 注意事项：在同一个房间内开启下一个自动混流任务前，请先调用 [stopAutoMixerTask] 函数结束上一次自动混流任务，以免造成当一个主播已经开启下一个自动混流任务与其他主播混流时，观众依然在一直拉上一个自动混流任务的输出流的情况。若用户未主动结束当前自动混流任务，该任务将在房间不存在之后或者输入流持续 90 秒不存在之后自动结束。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 相关接口： 使用接口 stopAutoMixerTask 来停止服务端自动混流，未及时停止混流功能会影响计费。
     *
     * @param mixStreamConfig 混流参数配置
     */
    startAutoMixerTask(task: ZegoAutoMixerTask): Promise<ZegoServerResponse>;
    /**
     * 停止服务端自动混流
     *
     * Note: 支持版本：3.5.0 及以上。
     *
     * Note: 详情描述：本地用户可调用该函数结束自动混流任务。
     *
     * Note: 业务场景：常用于语聊房场景下，需要由客户端发起自动混流任务时。
     *
     * Note: 调用时机：在调用 [startAutoMixerTask] 函数开启自动混流任务后可调用该函数。
     *
     * Note: 注意事项：在同一个房间内开启下一个自动混流任务前，请先调用 [stopAutoMixerTask] 函数结束上一次自动混流任务，以免造成当一个主播已经开启下一个自动混流任务与其他主播混流时，观众依然在一直拉上一个自动混流任务的输出流的情况。若用户未主动结束当前自动混流任务，该任务将在房间不存在之后或者输入流持续 90 秒不存在之后自动结束。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 相关接口： 开始混流任务接口 startAutoMixerTask
     *
     * @param taskID 混流任务 ID（客户自定义，务必保证唯一），必填，最大长度为 256 个字符，仅支持数字、英文字符 和 '~', '!', '@', '#', '$', '', '^', '&', '*', '(', ')', '_', '+', '=', '-', ', ';', '’', ',', '
     */
    stopAutoMixerTask(task: {
        taskID: string;
        roomID: string;
    }): Promise<ZegoServerResponse>;
    /**
     * 开始混音
     *
     * Note: 支持版本：1.7.0 及以上。
     *
     * Note: 详情描述：将 HTMLMediaElement 对象正在播放的声音混入对应 streamID 的推流中，使正在推的流中包含混入的声音。
     *
     * Note: 业务场景：通常用于背景音乐和音效。
     *
     * Note: 调用时机：调用接口 createStream 或者 createZegoStream 创建流成功后。2.15.0 及以前版本要推流成功后才能调用该接口。
     *
     * Note: 使用限制：混音不要同时包含 6 个以上，及 mediaList 长度不要大于 6，否则会出现性能问题，导致页面卡顿。
     *
     * Note: 注意事项：
     * - Chrome 浏览器自 86 版本起本地音频标签设置为静音，拉流端也无法听到混入的背景音。
     * - 受Safari浏览器策略影响，将audio标签设置为静音，会出现播放后自动暂停、无法混入多条音频的情况。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 影响范围：大部分接口都需要在登录房间后才能调用。
     *
     * Note: 相关接口：可调用接口 stopMixingAudio 来停止混音。
     *
     * @param streamID 需要混音的流 ID 或 MediaStream 对象或者ZegoLocalStream实例对象。
     * @param mediaList 1. 本地的 <audio> 或 <video> 对象数组。
     *                  2. 对音效的操作（包括暂停/恢复）需要通过操作 <audio> 或 <video> 对象来完成。
     */
    startMixingAudio(streamID: string | MediaStream | ZegoLocalStream, mediaList: Array<HTMLMediaElement>): boolean;
    /**
     * 停止混音
     *
     * Note: 支持版本：1.7.0 及以上。
     *
     * Note: 详情描述：通过传入的 mediaList ，控制对某个或多个背景音乐或音效的暂停，不传入该参数则停止该流的所有混音。
     *
     * Note: 业务场景：通常用于控制背景音乐和音效的暂停。
     *
     * Note: 调用时机：调用 startMixingAudio 后。2.16.0 及以后版本支持预览阶段操作混音。
     *
     * Note: 注意事项：通过能力检测接口 checkSystemRequirements 检查到 "customCapture" 为 false ，即浏览器不支持获取媒体元素的 MediaStream，则不能使用该接口。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 影响范围：大部分接口都需要在登录房间后才能调用。
     *
     * Note: 相关接口： 开始混音接口 startMixingAudio
     *
     * @param streamID 正在混音的流 ID 或 MediaStream 对象。
     * @param mediaList 1. 本地的 <audio> 或 <video> 对象数组，可选。
     *                  2. 对音效的操作（包括暂停/恢复）需要通过操作 <audio> 或 <video> 对象来完成。
     */
    stopMixingAudio(streamID: string | MediaStream | ZegoLocalStream, mediaList?: Array<HTMLMediaElement>): boolean;
    /**
     * 设置混音音量
     *
     * Note: 支持版本：1.18.0 及以上。
     *
     * Note: 详情描述：通过传入的音量值和媒体元素，调节指定媒体元素的混入音量。
     *
     * Note: 业务场景：通常用于调节背景音乐或音效的音量大小。
     *
     * Note: 调用时机：调用 startMixingAudio 后。2.16.0 及以后版本支持预览阶段操作混音。
     *
     * Note: 注意事项：Chrome 浏览器自 86 版本起本地音频标签设置为静音，拉流端得到的混入音频没有声音。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 影响范围：大部分接口都需要在登录房间后才能调用。
     *
     * Note: 相关接口：开始混音接口 startMixingAudio
     *
     * @param streamID 推流 ID 或 MediaStream 对象。
     * @param volume 音量值，范围为 0～100，100 表示原始音量。
     * @param media 媒体标签 <video> 或 <audio>。
     */
    setMixingAudioVolume(streamID: string | MediaStream | ZegoLocalStream, volume: number, media: HTMLMediaElement): boolean;
    /**
     * 创建音效播放器实例对象。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述：创建音效播放器实例对象，用于在媒体流对象上控制播放实时音效。
     *
     * Note: 业务场景：当需要播放简短的声音效果，比如鼓掌，欢呼声等时，可以使用音效播放器来实现。
     *
     * Note: 调用时机：需要调用接口 createStream 获取媒体流对象作为入参使用。
     *
     * Note: 注意事项:
     * 1. 每个媒体流对象相对应只能创建一个有效播放器实例对象。
     * 2. 2.15.0 版本需要先完成推流才可进行操作对应流的播放器。2.16.0 及以后版本支持在推流前操作流的音效播放器。
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。。
     *
     * @return 音效播放器实例对象。
     */
    createAudioEffectPlayer(localStream: MediaStream | ZegoLocalStream): ZegoAudioEffectPlayer;
    /**
     * 加载音效资源。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述：加载音效资源。
     *
     * Note: 业务场景：在频繁播放相同音效场景中，SDK 为了减少重复读文件并解码的网络和性能资源浪费，提供了预加载音效文件到内存中的功能。
     *
     * Note: 调用时机：在 [createAudioEffectPlayer] 之后可调用。
     *
     * Note: 相关接口：播放音效接口 [ZegoAudioEffectPlayer.start]、释放音效接口 [unloadEffect]。
     *
     * Note: 注意事项:
     * 1. 在线音频文件需要符合 [浏览器的同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)。
     * 2. 支持以下音频格式：MP3，AAC 以及浏览器支持的其他音频格式。
     *
     * @param audioEffectID 音效资源的 ID。
     * @param path 指定在线音效文件的请求路径。支持以下音频格式：MP3，AAC 以及浏览器支持的其他音频格式。
     *
     * @return 异步返回音效资源 ID。
     */
    loadAudioEffect(audioEffectID: string, path: string): Promise<string>;
    /**
     * 释放音效资源。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述：释放指定音效 ID 的音效资源。
     *
     * Note: 业务场景：在音效使用完毕之后，可以通过该接口释放相关资源。
     *
     * Note: 调用时机：在 [loadAudioEffect] 之后可调用。
     *
     * Note: 相关接口：加载音效接口 [loadAudioEffect] 。
     *
     * Note: 注意事项:  无。
     *
     * @param audioEffectID 音效资源的 ID。
     *
     * @return 接口是否调用成功。
     */
    unloadAudioEffect(audioEffectID: string): boolean;
    /**
     * 获取设备硬件信息，为操作硬件设备接口提供设备id参数。
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：获取设备硬件信息，为控制硬件设备接口，提供设备 id 参数。
     *
     * Note: 业务场景：需要指定采集设备和输出设备时使用。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：初始化之后，创建流之前调用。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：
     * 1. 需要在安全域名下（https,localhost,127.0.0.1）调用该接口。
     * 2. 调用该接口前需要获取设备权限，可以通过调用 checkSystemRequirements("camera") 来授权获取摄像头权限，通过调用 checkSystemRequirements("microphone") 来授权获取麦克风权限。
     * 3. 不能完全信赖该接口，要对获取不到设备信息的情况做降级处理，例如：提示客户更换浏览器。
     * 4. 某些平台浏览器（如：Safari，iOS）可能获取到的设备名称为空，建议再次调用此接口，即可获取到正确的设备名称。
     * 5. 页面刷新后设备 ID 可能会有变化，需要重新获取。
     * 6. 部分浏览器需要在调用 createStream 接口获取权限后，才可以获取到设备 ID。
     * 7. safari 不支持获取扬声器信息。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：createStream、useAudioDevice、useVideoDevice。
     *
     * Note: 平台差异：无
     */
    enumDevices(): Promise<ZegoDeviceInfos>;
    /**
     * 获取摄像头设备列表，为操作硬件设备接口提供设备id参数。
     *
     * Note: 支持版本：2.14.0 及以上
     *
     * Note: 详情描述：该方法枚举可用的视频输入设备，比如摄像头。
     *
     * Note: 业务场景：需要指定视频输入设备。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：初始化之后，创建流之前调用。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：
     * 1. 由于浏览器对安全和隐私的保护，页面需要在安全环境下（https,localhost,127.0.0.1）调用该接口。参考 [Privacy and security](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#privacy_and_security)。
     * 2. 在没有授予页面设备权限的情况下，调用该方法会暂时打开摄像头以触发浏览器的摄像头设备权限申请。在 Chrome 81+、Firefox、 Safari 等浏览器上，没有媒体设备权限时无法获取到准确的设备信息。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：createStream、useVideoDevice。
     *
     * Note: 平台差异：无
     *
     * @return 返回摄像头设备列表信息。
     */
    getCameras(): Promise<ZegoDeviceInfo[]>;
    /**
     * 获取麦克风设备列表，为操作硬件设备接口提供设备id参数。
     *
     * Note: 支持版本：2.14.0 及以上
     *
     * Note: 详情描述：该方法枚举可用的音频输入设备，比如麦克风。
     *
     * Note: 业务场景：需要指定采集音频设备。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：初始化之后，创建流之前调用。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：
     * 1. 由于浏览器对安全和隐私的保护，页面需要在安全环境下（https,localhost,127.0.0.1）调用该接口。参考 [Privacy and security](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#privacy_and_security)。
     * 2. 在没有授予页面设备权限的情况下，调用该方法会暂时打开麦克风以触发浏览器的麦克风设备权限申请。在 Chrome 81+、Firefox、 Safari 等浏览器上，没有媒体设备权限时无法获取到准确的设备信息。
     * 3. Windows Chrome 中会有一个 deviceID 为 'communications' 的麦克风设备，这个麦克风是 Chrome 基于真实麦克风做的一次封装，该麦克风会受 Windows 的声音通信配置受限。业务上避免使用该设备。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：createStream、useAudioDevice。
     *
     * Note: 平台差异：无
     *
     * @return 返回音频输入设备列表信息。
     */
    getMicrophones(): Promise<ZegoDeviceInfo[]>;
    /**
     * 获取扬声器设备列表，为操作硬件设备接口提供设备id参数。
     *
     * Note: 支持版本：2.14.0 及以上
     *
     * Note: 详情描述：该方法枚举可用的音频输出设备，比如耳机、音箱。
     *
     * Note: 业务场景：需要指定媒体流的音频输出设备。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：初始化之后，创建流之前调用。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：
     * 1. 由于浏览器对安全和隐私的保护，页面需要在安全环境下（https,localhost,127.0.0.1）调用该接口。参考 [Privacy and security](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia#privacy_and_security)。
     * 2. 在没有授予页面设备权限的情况下，调用该方法会暂时打开麦克风以触发浏览器的扬声器设备权限申请。在 Chrome 81+、Firefox、 Safari 等浏览器上，没有媒体设备权限时无法获取到准确的设备信息。
     * 3. Safari 不支持获取扬声器信息。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：指定音频输出设备接口 [useAudioOutputDevice]。
     *
     * Note: 平台差异：无
     *
     * @return 返回音频输出设备列表信息。
     */
    getSpeakers(): Promise<ZegoDeviceInfo[]>;
    /**
     * 切换摄像头
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：切换当前推流使用的设备。
     *
     * Note: 业务场景：主播切换摄像头设备。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：创建流成功后，且流类型必须是摄像头类型采集流。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：如果切换摄像头失败，原来的流会保留，并返回错误。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：切换麦克风 useAudioDevice。
     *
     * Note: 平台差异：无
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param deviceID 需要切换的摄像头设备 ID
     */
    useVideoDevice(localStream: MediaStream | ZegoLocalStream, deviceID: string): Promise<ZegoServerResponse>;
    /**
     * 切换麦克风
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：切换当前推流使用的麦克风设备。
     *
     * Note: 业务场景：主播切换外接麦克风，使用硬件自带的音效处理。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：创建流成功后，且流类型必须是 createStream 创建的 camera 类型的媒体流。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：如果切换麦克风失败，原来的流会保留，并返回错误。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：切换摄像头 useVideoDevice。
     *
     * Note: 平台差异：无
     *
     * @param localStream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     * @param deviceID 需要切换的麦克风设备 ID
     */
    useAudioDevice(localStream: MediaStream | ZegoLocalStream, deviceID: string): Promise<ZegoServerResponse>;
    /**
     * 切换音频输出设备。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述：设置 html 媒体元素的音频输出设备。
     *
     * Note: 调用时机：用 [getSpeakers] 获取音频输出设备列表后。
     *
     * Note: 注意事项：该接口当前只支持 Chrome 浏览器使用。
     *
     * Note: 相关接口：获取扬声器列表接口 [getSpeakers]。
     *
     * @param media 媒体标签元素，<audio> 或 <video>。
     * @param deviceID 扬声器设备 ID。
     *
     * @return Promise 返回 boolean 标识是否调用成功。
     */
    useAudioOutputDevice(media: HTMLMediaElement, deviceID: string): Promise<boolean>;
    /**
     *
     * @param localStream 为 MediaStream (createStream 创建) 或 ZegoLocalStream（createZegoStream 创建）
     * @param enable true 为前置，false 为后置
     * @returns
     */
    useFrontCamera(localStream: MediaStream | ZegoLocalStream, enable: boolean): Promise<ZegoServerResponse>;
    /**
     * 设置是否监听音浪及音浪回调间隔时间
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：设置后将通过 soundLevelUpdate 回调流的音量大小。
     *
     * Note: 业务场景：图形化显示拉流音浪时调用。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：初始化实例后。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 无
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：推拉流音浪回调 soundLevelUpdate 、本地预览流音浪回调 capturedSoundLevelUpdate。
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param bool 开启或关闭音浪回调
     * @param interval 需要回调的时间间隔，默认1000ms，可选。最低可设置500ms，最高设置3000ms。
     * @param options 设置选项。
     */
    setSoundLevelDelegate(bool: boolean, interval?: number, options?: SoundLevelDelegateOptions): void;
    /**
     * 获取麦克风静音状态
     *
     * Note: 支持版本：2.8.0 及以上。
     *
     * Note: 详情描述： 获取麦克风静音状态。
     *
     * Note: 业务场景：用于判断主播自己的麦克风是否打开了。
     *
     * Note: 调用时机：调用 loginRoom 接口登录房间成功后。
     *
     * Note: 相关接口： 调用 muteMicrophone 关闭/打开麦克风声音接口。
     *
     * @return 是否静音，true 为静音，false 为打开麦克风声音。
     */
    isMicrophoneMuted(): boolean;
    /**
     * 是否静音麦克风声音
     *
     * Note: 支持版本：2.8.0 及以上。
     *
     * Note: 详情描述：将麦克风的声音静音，推流时也不会带上麦克风采集的声音。
     *
     * Note: 业务场景：主播在某一时段内，不希望被拉流端听到麦克风声音时调用。
     *
     * Note: 调用时机：初始化实例后。
     *
     * Note: 注意事项：是否静音麦克风的前提是原始流必须有音频轨道，创建流时不能为纯视频。
     *
     * Note: 相关接口：调用 isMicrophoneMuted 接口获取麦克风静音状态；调用 mutePublishStreamAudio 接口关闭/打开正在推流的声音 。
     *
     * @param mute 是否静音麦克风；true 表示静音麦克风；false 表示打开麦克风；不设置默认为 false。
     */
    muteMicrophone(mute: boolean): boolean;
    /**
     * 创建范围语音实例对象。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：创建范围语音实例对象。
     *
     * Note: 业务场景：常用于语音游戏场景中，用户可通过创建的范围语音实例对象使用范围语音相关功能。
     *
     * Note: 调用时机：创建 ZegoExpressEngine 实例后并在调用接口 loginRoom 登录房间前调用。
     *
     * Note: 注意事项:  使用范围语音功能不能再调用 startPublishingStream 、startPlayingStream 这些推拉流接口以及相关回调。
     *
     * @return 范围语音实例对象
     */
    createRangeAudioInstance(): ZegoExpressRangeAudio;
    /**
     * 创建实时有序数据实例对象
     *
     * Note: 支持版本：2.12.2 及以上
     *
     * Note: 详情描述：实时有序数据实例对象。
     *
     * Note: 业务场景：常用于远程控制场景中，用户可通过创建的实时有序数据实例对象使用实时有序数据令相关功能。
     *
     * Note: 调用时机：创建 ZegoExpressEngine 实例后调用。
     *
     * @param roomID 房间ID
     *
     * @return 实时有序数据实例对象
     */
    createRealTimeSequentialDataManager(roomID: string): ZegoRealTimeSequentialDataManager;
    /**
     * 销毁实时有序数据实例对象
     *
     * Note: 支持版本：2.12.2 及以上
     *
     * Note: 详情描述：销毁实时有序数据实例对象。
     *
     * Note: 业务场景：常用于远程控制场景中，用户可通过创建的实时有序数据实例对象使用实时有序数据相关功能。
     *
     * Note: 调用时机：创建 ZegoExpressEngine 实例及 createRealTimeSequentialDataManager 后调用。
     *
     * @param manager 实时有序数据对象
     */
    destroyRealTimeSequentialDataManager(manager: ZegoRealTimeSequentialDataManager): void;
    /**
     * 创建版权音乐实例对象。
     *
     * Note: 支持版本：2.24.5 及以上
     *
     * Note: 详情描述：创建版权音乐实例对象。
     *
     * Note: 业务场景：常用于在线 KTV 合唱场景中，用户可通过创建版权音乐实例对象使用相关功能。
     *
     * Note: 调用时机：在初始化引擎实例之后。
     *
     * Note: 使用限制:  SDK 只支持创建一个实例，多次调用此函数返回同一个对象。
     *
     * @return 版权音乐实例，多次调用此函数返回同一个对象。
     */
    createCopyrightedMusic(): ZegoCopyrightedMusic;
    /**
     * 检查视频轨是否为工作状态
     *
     * Note: 支持版本：2.25.5
     *
     * Note: 详情描述：检查视频轨是否为工作状态。
     *
     * Note: 业务场景：本地创建预览流后，可以调用该接口检查视频轨是否为工作状态。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：创建流后才能调用。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 仅对 createStream 生成的本地采集流有效。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：创建推流数据源 createStream。
     *
     * Note: 平台差异：无
     *
     * @param stream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     *
     * @return true 为 active，false 为非 active。
     */
    checkVideoTrackIsActive(stream: MediaStream | ZegoLocalStream): Promise<boolean>;
    /**
     * 检查音轨是否为工作状态
     *
     * Note: 支持版本：2.25.5
     *
     * Note: 详情描述：检查音频轨是否为工作状态。
     *
     * Note: 业务场景：本地创建预览流后，可以调用该接口检查音频轨是否为工作状态。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：创建流后才能调用。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 仅对 createStream 生成的本地采集流有效。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：创建推流数据源 createStream。
     *
     * Note: 平台差异：无
     *
     * @param stream createStream 创建得到的 stream 或者 createZegoStream创建得到的 ZegoLocalStream实例对象。
     *
     * @return true 为 active，false 为非 active。
     */
    checkAudioTrackIsActive(stream: MediaStream | ZegoLocalStream): Promise<boolean>;
    /**
     * 销毁版权音乐实例对象。
     *
     * Note: 支持版本：2.24.5 及以上
     *
     * Note: 详情描述：销毁版权音乐实例对象。
     *
     * Note: 调用时机：在初始化引擎实例之后。
     */
    destroyCopyrightedMusic(): void;
    /**
     * 获取同步网络时间信息。
     *
     * 支持版本：3.0.0 及以上。
     *
     * 详情描述：获取当前网络时间（NTP），包括当前网络时间的时间戳和最大误差。
     *
     * 业务场景：在进行多端行为同步时，需要获取同步网络时间对当前时间进行校准。
     *
     * 调用时机：初始化 ZegoExpresEngine 实例后。
     *
     * @return 返回网络时间戳信息，timestamp 为同步后的网络时间戳，0表示尚未同步；maxDeviation 为最大误差值。
     */
    getNetworkTimeInfo(): {
        timestamp: number;
        maxDeviation: number;
    };
    /**
     * 开启或关闭混流精准对齐功能。
     *
     * Note: 支持版本：3.0.0 及以上。
     *
     * Note: 详情描述：对当前推流开启混流对齐，开启后混流会对该流与其他开启对齐的流进行对齐处理。
     *
     * Note: 业务场景：常用于 KTV 等需要混流对齐的场景。
     *
     * Note: 默认值：若未调该接口，默认为 不对齐。
     *
     * Note: 调用时机：推流成功后。
     *
     * Note: 相关接口：开始混流接口 startMixerTask，混流任务开启精准对齐功能后会将开启对齐的流进行对齐处理。
     *
     * @param streamID 推流的 streamID。
     * @param alignment 是否开启对齐，0 是关闭，1是开启。
     *
     * @return 异步返回布尔值，标识是否调用成功。
     */
    setStreamAlignmentProperty(streamID: string, alignment: number): Promise<boolean>;
    /**
     * 销毁 Engine 实例
     *
     * Note: 支持版本：2.25.1
     *
     * Note: 详情描述：销毁引擎对象
     *
     * Note: 业务场景：所有场景。
     *
     * Note: 默认值：无默认值。
     *
     * Note: 调用时机：同一个引擎实例最后一个调用的接口。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：销毁引擎后应及时将实例化对象置空，并不应再调用引擎对象的其他接口，否则可能出现意想不到的问题。
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     */
    destroyEngine(): void;
    /**
     * 上传日志
     *
     * Note: 支持版本：2.26.0 及以上
     *
     * Note: 详情描述：读取本地日志并上传，默认不开放使用，如需使用该功能请联系技术支持
     *
     * Note: 调用时机：登录房间之后
     */
    uploadLog(): Promise<{
        errorCode: number;
        extendedData: string;
    }>;
    /**
     * 创建导播台
     *
     * Note: 支持版本：3.0.0 及以上
     *
     * Note: 详情描述：创建导播台实例对象，用于将多个媒体流合成一个。
     *
     * Note: 业务场景：当需要将本地用户的多路视频流以及图片合为一路视频流，比如在线教育、远程会议、直播等场景，可以使用导播台来实现。
     *
     * Note: 调用时机：需要调用接口 createStream 获取媒体流对象后。
     *
     * Note: 注意事项:
     * 1. 每个导播台对象相对应只能输出一个混合流。
     * 2. 暂不支持移动端。
     */
    createStreamCompositor(): ZegoStreamCompositor;
    setTurnServer(turnServerList: {
        url: string;
        username: string;
        credential: string;
    }[]): void;
    /**
     * 拉流是否接收所有音频数据（包括之后在房间中新拉取的流）
     *
     * Note: 支持版本：3.3.0
     *
     * Note: 详情描述：在实时音视频互动过程中，本地用户可根据需要，通过此函数控制拉流时是否接收所有远端用户的音频数据（包括在调用该函数后新加入房间的用户所推的音频流）。默认情况下，用户加入房间后可以接收所有远端用户推送的音频数据。当开发者不接收音频收据时，可降低硬件和网络的开销。
     *
     * Note: 业务场景：当开发者需要快速关闭、恢复远端音频时，可调用此函数。相比重新拉流，能极大降低耗时，提升互动体验。
     *
     * Note: 调用时机：初始化引擎之后。
     *
     * Note: 相关接口：可调用 [mutePlayStreamAudio] 函数控制是否接收单条音频数据。
     *
     * @param mute 是否拉取所有音频流，true 表示停止拉取；false 表示恢复拉取
     */
    muteAllPlayAudioStreams(mute: boolean): Promise<boolean>;
    /**
     * 拉流是否接收所有视频数据（包括之后在房间中新拉取的流）
     *
     * Note: 支持版本：3.3.0
     *
     * Note: 详情描述：在实时音视频互动过程中，本地用户可根据需要，通过此函数控制拉流时是否接收所有远端用户的视频数据（包括在调用该函数后新加入房间的用户所推的视频流）。默认情况下，用户加入房间后可以接收所有远端用户推送的视频数据。当开发者不接收视频收据时，可降低硬件和网络的开销。
     *
     * Note: 业务场景：当开发者需要快速关闭、恢复远端视频时，可调用此函数。相比重新拉流，能极大降低耗时，提升互动体验。
     *
     * Note: 调用时机：初始化引擎之后。
     *
     * Note: 相关接口：可调用 [mutePlayStreamVideo] 函数控制是否接收单条视频数据。
     */
    muteAllPlayVideoStreams(mute: boolean): Promise<boolean>;
    /**
     * 调用实验性 API
     * ote: 支持版本：3.3.0
     *
     * Note: 详情描述：ZEGO 通过此 API 提供 RTC 业务中的部分技术预览或特别定制功能，需要获取功能的使用或详情其详情可咨询 ZEGO 技术支持。
     *
     * Note: 调用时机：初始化引擎之后。
     */
    callExperimentalAPI(params: Record<string, any>): Promise<any>;
}
export { WebRTCUtil } from "../../src/util/webrtcUtil";
