import { ZegoRTMEvent, ZegoUser } from "./ZegoExpressEntity.rtm";
/**
 * 媒体服务相关事件集合
 *
 * Note: 详情描述：描述事件名及其对应的回调参数。
 *
 * Note: 业务场景：用于约束注册事件接口 on 和注销事件接口 off 的参数。
 *
 */
export interface ZegoWechatMiniEvent {
    /**
     * 推流质量回调
     */
    publishQualityUpdate: PublishQualityUpdateCallBack;
    /**
     * 推流状态回调
     */
    publisherStateUpdate: PublisherStateUpdateCallBack;
    /**
     * 房间内流变化回调
     *
     * 收到流删除通知时，开发者可将 extendedData 由字符串转为 json 对象得到 stream_delete_reason 字段，该字段为流删除原因的数组，stream_delete_reason[].code 字段可能为如下值：1（用户主动停止推流）；  2（用户心跳超时）；  3（用户重复登录）；  4（用户被踢出）；  5（用户断线）；  6（被服务端移除）
     */
    roomStreamUpdate: RoomStreamUpdateCallBack;
    /**
     * 拉流质量回调，每次回调间隔3s
     */
    playQualityUpdate: PlayQualityUpdateCallBack;
    /**
     * 接收对端设置的流附加信息
     */
    streamExtraInfoUpdate: StreamExtraInfoUpdateCallBack;
    /**
     * 拉流状态回调
     */
    playerStateUpdate: PlayerStateUpdateCallBack;
    /**
     * 混流转推 CDN 状态回调
     */
    mixerRelayCDNStateUpdate: MixerRelayCDNStateUpdateCallBack;
}
export interface ZegoMixStreamAdvance {
    /**
     * 混流背景颜色; backgroundColor 为十六进制的 RGB，输入格式必须为 0xRRGGBBxx
     */
    backgroundColor?: number;
    /**
     * 混流背景图片; backgroundImage 需要提前在即构后台预设 imageId，输入格式为 preset-id://xxx
     */
    backgroundImage?: string;
    /**
     * 混流视频编码，'vp8'(string) 或 ' h264' (string),默认 'h264'(string)
     */
    videoCodec?: "VP8" | "H264" | "vp8" | "h264";
}
export interface ZegoMixStreamConfig {
    /**
     * 混流任务 id（客户自定义,务必保证唯一），必填，最大为256个字符,仅支持数字,英文字符 和 '~', '!', '@', '#', '$', '', '^', '&', '*', '(', ')', '_', '+', '=', '-', ', ';', '’', ',', '
     */
    taskID: string;
    /**
     * 混流输入流列表
     */
    inputList: ZegoMixStreamInput[];
    /**
     * 混流输出流列表
     */
    outputList: ZegoMixStreamOutput[];
    /**
     * 混流输出配置
     */
    outputConfig: ZegoMixStreamOutputConfig;
}
export declare enum ZegoMixStreamRenderMode {
    /**
     * 填充模式，等比填充布局，画面可能有部分被裁剪。
     */
    AspectFill = 0,
    /**
     * 适应模式，等比缩放画面，布局内可能有留白。
     */
    AspectFit = 1
}
/**
 * 混流中单条输入流的图片信息
 *
 * Note: 支持版本：2.24.0 及以上。
 *
 * Note: 详情描述：为单条输入流的内容设置图片，用于替代视频，即当使用图片时不显示视频。图片复用的 [ZegoMixerInput] 中的 layout 布局。
 *
 * Note: 业务场景：开发者在视频连麦过程中，需要暂时关闭摄像头显示图像，或音频连麦时，显示图片等。
 *
 * Note: 使用限制：图片大小限制在 1M 以内。
 *
 */
export interface ZegoMixerImageInfo {
    /**
     * 详情描述：图片路径，不为空显示图片，否则显示视频。支持 JPG 和 PNG 格式。支持 2 种使用方式：1. URI：将图片提供给 ZEGO 技术支持进行配置，配置完成后会提供图片 URI，例如：preset-id://xxx.jpg。2. URL：仅支持 HTTP 协议。
     */
    url: string;
}
/**
 * 字体类型。
 *
 */
export declare enum ZegoFontType {
    /**
     * 思源黑体。
     */
    ZegoFontTypeSourceHanSans = 0,
    /**
     * 阿里巴巴普惠体。
     */
    ZegoFontTypeAlibabaSans = 1,
    /**
     * 旁门正道标题体。
     */
    ZegoFontTypePangMenZhengDaoTitle = 2,
    /**
     * 站酷快乐体。
     */
    ZegoFontTypeHappyZcool = 3
}
/**
 * 字体风格。
 *
 * 详情描述: 字体风格配置，可用于配置字体类型、字体大小、字体颜色、字体透明度。
 *
 * 业务场景: 手动混流场景时，设置文字水印，比如多人连麦直播。
 *
 */
export interface ZegoFontStyle {
    /**
     * 是否必填: 否。
     *
     * 默认值: 思源黑体 [ZegoFontTypeSourceHanSans]。
     */
    type?: ZegoFontType;
    /**
     * 是否必填: 否。
     *
     * 默认值: 24。
     *
     * 取值范围: [12,100] 的整数。
     */
    size?: number;
    /**
     * 是否必填: 否。
     *
     * 默认值: 16777215（白色）。
     *
     * 取值范围: [0,16777215] 的整数。
     */
    color?: number;
    /**
     * 是否必填: 否。
     *
     * 默认值: 0。
     *
     * 取值范围: [0,100]，100 为完全不透明，0 为完全透明。
     */
    transparency?: number;
    /**
     * 是否必填: 否。
     * 默认值: 否。
     * 取值范围: 是/否。
     */
    border?: boolean;
    /**
     * 是否必填: 否。
     * 默认值: 0。
     * 取值范围: [0,16777215]。
     */
    borderColor?: number;
}
/**
 * 文本信息。
 *
 * 详情描述: 文本信息配置，可用于配置文本内容、文本位置、文本风格。
 *
 * 业务场景: 手动混流场景时，设置文字水印，比如多人连麦直播。
 *
 */
export interface ZegoLabelInfo {
    /**
     * 是否必填: 是。
     *
     * 取值范围: 最大支持显示100个中文字符，300 个英文字符。
     */
    text: string;
    /**
     * 是否必填: 否。
     *
     * 默认值: 0。
     */
    left?: number;
    /**
     * 是否必填: 否。
     *
     * 默认值: 0。
     */
    top?: number;
    /**
     * 是否必填: 否。
     */
    font?: ZegoFontStyle;
}
export interface ZegoMixStreamInput {
    /**
     * 输入流 ID
     */
    streamID: string;
    /**
     * 混流内容类型;contentType 取值为'VIDEO'(音视频)、'AUDIO'(纯音频),默认为'VIDEO'
     */
    contentType?: "VIDEO" | "AUDIO" | "VIDEO_ONLY";
    /**
     * 流在输出画布上的布局，当 contentType 为 “AUDIO” 时 layout 参数可不传。
     */
    layout?: ZegoMixStreamLayout;
    /**
     * 渲染模式，0 为填充模式，1 为适应模式。
     */
    renderMode?: ZegoMixStreamRenderMode;
    /**
     * 详情描述：用户图片信息。
     */
    imageInfo?: ZegoMixerImageInfo;
    /**
     * 详情描述：文字水印
     */
    label?: ZegoLabelInfo;
    /**
     * 详情描述: 视频画面圆角半径，单位 px。
     *
     * 是否必填: 否。
     *
     * 取值范围: 不超过 [layout] 参数设置的视频画面的宽高。
     *
     * 默认值: 0。
     */
    cornerRadius?: number;
    /**
     * 混流音浪 ID，用于在 [mixerSoundLevelUpdate] 中找对应输入流的音浪值。
     */
    soundLevelID?: number;
    /**
     *  输入流音量, 有效范围 [0, 200], 默认是 100。
     */
    volume?: number;
    /**
     * 当前输入流是否开启焦点语音，开启了会突出此路流的声音。
     */
    isAudioFocus?: boolean;
}
export interface ZegoMixStreamLayout {
    /**
     * 目标位置，上
     */
    top: number;
    /**
     * 目标位置，左
     */
    left: number;
    /**
     * 目标位置，下
     */
    bottom: number;
    /**
     * 目标位置，右
     */
    right: number;
}
export interface ZegoMixStreamOutput {
    /**
     * 混流输出流 ID 或 URL
     */
    target: string;
    /**
     * 混流输出视频设置。
     */
    videoConfig?: ZegoMixerOutputVideoConfig;
}
export interface ZegoMixStreamOutputConfig {
    /**
     * 混流输出视频码率，kbps
     * 数值 （必须，且大于 0）
     */
    outputBitrate: number;
    /**
     * 混流输出视频帧率
     */
    outputFPS: number;
    /**
     * 混流输出视频分辨率宽度
     */
    outputWidth: number;
    /**
     * 混流输出视频分辨率高度
     */
    outputHeight: number;
    /**
     * 混流输出音频编码
     * outputAudioCodecID 可选0：HE-AAC,1： LC-AAC,2：MP3,3: OPULS 默认为0
     * 注意：如果使用 CDN 录制，音频编码请选择 LC-AAC。这是因为部分浏览器（如 Google Chrome 和 Microsoft Edge）不兼容 HE-AAC 音频编码格式，从而导致录制文件无法播放
     */
    outputAudioCodecID?: 0 | 1 | 2 | 3;
    /**
     * 混流输出音频码率，kbps
     */
    outputAudioBitrate?: number;
    /**
     * 混流输出声道数
     */
    outputAudioChannels?: 1 | 2;
    /**
     * 多路音频流混音模式。若 [ZegoAudioMixMode] 选择为 [Focused]，SDK 将会选择 4 路已设置 [isAudioFocus] 的输入流作为焦点语音突出，若未选择或选择少于 4 路，则会自动补齐 4 路。
     */
    audioMixMode?: ZegoAudioMixMode;
}
/**
 * https://doc-zh.zego.im/article/api?doc=express-video-sdk_API~java_android~enum~ZegoAudioCodecID
 */
export declare enum ZegoAudioCodecID {
    ZegoAudioCodecIDNormal = 1,
    ZegoAudioCodecIDNormal2 = 2,
    ZegoAudioCodecIDLow3 = 6
}
export declare enum ZegoAudioMixMode {
    /**
     * 默认模式，无特殊行为
     */
    ZegoAudioMixModeRaw = 0,
    /**
     * 音频聚焦模式，可在多路音频流中突出某路流的声音
     */
    ZegoAudioMixModeFocused = 1
}
/**
 * 详情描述: 配置混流任务的音频码率、声道数、音频编码
 */
export interface ZegoMixerAudioConfig {
    /**
     * 音频码率，单位为 kbps，默认为 48 kbps，开始混流任务后不能修改
     */
    bitrate?: number;
    /**
     * 音频声道，默认为 Mono 单声道
     */
    channel?: 1 | 2;
    codecID?: ZegoAudioCodecID;
}
/**
 * 详情描述: 调用 [StartAutoMixerTask] 函数向 ZEGO RTC 服务器发起自动混流任务时，需要通过该参数配置自动混流任务，包括任务 ID、房间 ID、音频配置、输出流列表、是否开启声浪回调通知。
 * 业务场景: 当向 ZEGO RTC 服务器发起自动混流任务时，需要这个配置。
 * 注意事项: 作为调用 [StartAutoMixerTask] 函数时传入的参数。
 */
export interface ZegoAutoMixerTask {
    /**
     * 混流任务 id（客户自定义,务必保证唯一），必填，最大为256个字符,仅支持数字,英文字符 和 '~', '!', '@', '#', '$', '', '^', '&', '*', '(', ')', '_', '+', '=', '-', ', ';', '’', ',', '
     */
    taskID: string;
    /**
     * 自动混流任务的房间 ID。必填，仅支持数字，英文字符 和 '~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '\'。如果需要与 Web SDK 互通，请不要使用 '%'。
     */
    roomID: string;
    /**
     * 自动混流任务的音频配置，可配置音频码率、音频声道，编码 ID、多路音频流混音模式。
     * 如果对自动混流任务的音频有特殊需求，比如需要调整音频码率，可根据需要调整该参数，否则不用配置。
     * 默认音频码率为 "48 kbps", 默认音频声道为 "ZEGO_AUDIO_CHANNEL_MONO", 默认编码 ID 为 "ZEGO_AUDIO_CODEC_ID_DEFAULT"，默认多路音频流混音模式为 "ZEGO_AUDIO_MIX_MODE_RAW"。
     */
    audioConfig?: ZegoMixerAudioConfig;
    /**
     * 自动混流任务的输出流列表，列表中为 URL 或者流 ID，若为 URL 格式 目前只支持 RTMP URL 格式：rtmp://xxxxxxxx。
     * 当发起自动混流任务时，需要配置该参数指明混流输出目标。Mix stream output target
     * 必填
     */
    outputList: ZegoMixStreamOutput[];
    /**
     * 是否开启自动混流的声浪回调通知，开启后拉混流时可通过 [onAutoMixerSoundLevelUpdate] 回调收到每条单流的声浪信息。
     * 当发起自动混流任务时，如果需要回调流的声浪信息，需要配置该参数。
     * 可选。
     */
    enableSoundLevel?: boolean;
    /**
     * 流对齐模式，0 为关闭，1为开启。需先调用 [setStreamAlignmentProperty] 函数开启指定通道的推流网络时间校准的流对齐。
     */
    streamAlignmentMode?: number;
    /**
     * 设置混流服务器拉流缓存自适应调整的区间范围下限。在实时合唱 KTV 场景下，推流端网络轻微波动可能会导致混流的卡顿，此时观众拉混流的时候，会有比较高概率出现卡顿的问题。通过调节混流服务器拉流缓存自适应调整的区间范围下限，可优化观众端拉混流出现的卡顿问题，但会增大延迟。默认不设置，即服务端使用自身配置值。只会对新的输入流设置生效，对于已经开始混流的输入流不生效。
     *  [0,10000]，超过最大值混流会失败。
     */
    minPlayStreamBufferLength?: number;
}
export declare enum ZegoEncodeProfile {
    ZegoEncodeProfileDefault = 0,
    ZegoEncodeProfileBaseline = 1,
    ZegoEncodeProfileMain = 2,
    ZegoEncodeProfileHigh = 3
}
export interface ZegoMixerOutputVideoConfig {
    videoCodecID?: string;
    bitrate?: number;
    encodeProfile?: ZegoEncodeProfile;
    encodeLatency?: number;
    enableLowBitrateHD?: boolean;
}
export interface ZegoPlayAudioStats {
    /**
     * 音频码率
     */
    audioBitrate: number;
    /**
     * 音频编码格式"opus"
     */
    audioCodec: string;
    /**
     * 网络抖动
     */
    audioJitter: number;
    /**
     * 音量
     */
    audioLevel: number;
    /**
     * 丢包数
     */
    audioPacketsLost: number;
    /**
     * 丢包率
     */
    audioPacketsLostRate: number;
    /**
     * 拉流音频质量
     */
    audioQuality: number;
    /**
     * 采样率
     */
    audioSamplingRate: number;
    /**
     * 音轨是否被关闭
     */
    muteState: "0" | "1";
    /**
     * 音频帧率
     */
    audioFPS: number;
}
/**
 * 拉流质量回调详细信息
 *
 */
export interface ZegoPlayStats {
    /**
     * 视频相关描述
     */
    video: ZegoPlayVideoStats;
    /**
     * 音频相关描述
     */
    audio: ZegoPlayAudioStats;
}
export interface ZegoPlayVideoStats {
    /**
     * 接收视频高
     */
    frameHeight: number;
    /**
     * 接收视频宽
     */
    frameWidth: number;
    /**
     * 视频编码格式
     */
    googCodecName: string;
    /**
     * 视轨是否被关闭
     */
    muteState: "0" | "1";
    /**
     * 视频码率
     */
    videoBitrate: number;
    /**
     * 视频转码帧率
     */
    videoFPS: number;
    /**
     * 视频丢包数
     */
    videoPacketsLost: number;
    /**
     * 视频丢包率
     */
    videoPacketsLostRate: number;
    /**
     * 视频解码帧率
     */
    videoTransferFPS: number;
    /**
     * 拉流视频质量
     */
    videoQuality: number;
    /**
     * 视频解码总大小
     */
    videoFramesDecoded: number;
}
/**
 * 拉流状态
 *
 */
export interface ZegoPlayerState {
    /**
     * 流id
     */
    streamID: string;
    /**
     * NO_PLAY：未拉流状态，PLAY_REQUESTING：正在请求拉流状态，PLAYING：正在拉流状态
     */
    state: "NO_PLAY" | "PLAY_REQUESTING" | "PLAYING";
    /**
     * 错误码
     */
    errorCode: number;
    /**
     * 扩展信息
     */
    extendedData: string;
}
export interface ZegoPublishAudioStats {
    /**
     * 音频码率
     */
    audioBitrate: number;
    /**
     * 音频编码格式
     */
    audioCodec: string;
    /**
     * 音频丢包数
     */
    audioPacketsLost: number;
    /**
     * 音频丢包率
     */
    audioPacketsLostRate: number;
    /**
     * 音频编码格式
     */
    googCodecName: string;
    /**
     * 音轨是否被关闭
     */
    muteState: "0" | "1";
    /**
     * 音频帧率
     */
    audioFPS: number;
    /**
     * 推流音频质量
     */
    audioQuality: number;
}
export interface ZegoPublishStats {
    /**
     * 推流视频数据
     */
    video: ZegoPublishVideoStats;
    /**
     * 推流音频数据
     */
    audio: ZegoPublishAudioStats;
}
export interface ZegoPublishStreamAudioConfig {
    /**
     * 是否开启降噪
     */
    ANS?: boolean;
    /**
     * 是否开启自动增益
     */
    AGC?: boolean;
    /**
     * 是否开启回声消除
     */
    AEC?: boolean;
}
export interface ZegoPublishVideoStats {
    /**
     * 采集视频高
     */
    frameHeight: number;
    /**
     * 采集视频宽
     */
    frameWidth: number;
    /**
     * 视频编码格式
     */
    googCodecName: string;
    /**
     * 视轨是否被关闭
     */
    muteState: "0" | "1";
    /**
     * 视频码率
     */
    videoBitrate: number;
    /**
     * 视频转码帧率
     */
    videoFPS: number;
    /**
     * 视频丢包数
     */
    videoPacketsLost: number;
    /**
     * 视频丢包率
     */
    videoPacketsLostRate: number;
    /**
     * 视频编码帧率
     */
    videoTransferFPS: number;
    /**
     * 推流视频质量
     */
    videoQuality: number;
}
/**
 * 推流状态
 *
 */
export interface ZegoPublisherState {
    /**
     * 流ID
     */
    streamID: string;
    /**
     * NO_PUBLISH：未推流状态，PUBLISH_REQUESTING：正在请求推流状态，PUBLISHING：正在推流状态
     */
    state: "PUBLISHING" | "NO_PUBLISH" | "PUBLISH_REQUESTING";
    /**
     * 错误码
     */
    errorCode: number;
    /**
     * 扩展信息
     */
    extendedData: string;
}
export interface ZegoServerResponse {
    /**
     * 返回错误码,为0则是成功
     */
    errorCode: number;
    /**
     * 扩展信息
     */
    extendedData?: string;
}
/**
 * 音浪信息
 *
 */
export interface ZegoSoundLevelInfo {
    /**
     * 流ID
     */
    streamID: string;
    /**
     * 音浪大小
     */
    soundLevel: number;
    /**
     * 用于区分推拉流
     */
    type: string;
}
export interface ZegoStreamList {
    /**
     * 流 ID
     */
    streamID: string;
    /**
     * 流对应的用户
     */
    user: ZegoUser;
    /**
     * 流附加信息
     */
    extraInfo: string;
    /**
     * flv 播放地址
     */
    urlsFLV: string;
    /**
     * rtmp 播放地址
     */
    urlsRTMP: string;
    /**
     * hls 播放地址
     */
    urlsHLS: string;
    /**
     * https 协议的 flv 播放地址
     */
    urlsHttpsFLV: string;
    /**
     * https 协议的 hls 播放地址
     */
    urlsHttpsHLS: string;
}
export interface ZegoVideoCodec {
    /**
     * 是否支持H264编解码能力
     */
    H264: boolean;
    /**
     * 是否支持VP8编解码能力
     */
    VP8: boolean;
}
export interface ZegoWebPlayOption {
    /**
     * 是否需要拉取视频，默认为 true;
     * 通常情况下建议不填，SDK 默认会根据拉到的实际设备状态选择是否拉音视频
     */
    video?: boolean;
    /**
     * 是否需要拉取音频，默认为 true;
     * 通常情况下建议不填，SDK 默认会根据拉到的实际设备状态选择是否拉音视频
     */
    audio?: boolean;
    /**
     * 拉流额外参数;鉴权参数 streamParams 格式如下：'zg_expired=XX&zg_nonce=XX&zg_token=XX',只有需要配置鉴权时才传入，否则请忽略
     */
    streamParams?: string;
}
export interface ZegoWebPublishOption {
    /**
     * 推流备选参数 ; 备选参数 streamParams 格式如下：'zg_expired=XX&zg_nonce=XX&zg_token=XX'，只有需要配置鉴权才传入（可选功能）
     */
    streamParams?: string;
    /**
     * 流附加信息
     */
    extraInfo?: string;
    /**
     * 推流视频编码，只能传入 'VP8' (string) 或 'H264' (string)，默认值为 'H264' 。
     */
    videoCodec?: "VP8" | "H264";
    /**
     * 房间ID，开启多房间功能后必填，选择在哪个房间推流。
     */
    roomID?: string;
}
export interface ZegoWxPlayOption {
    /**
     * 拉流选项
     */
    streamParams?: string;
    /**
     * 是否拉混流
     */
    isMix?: boolean;
    /**
     * 拉流格式
     */
    sourceType?: "CDN" | "BGP";
}
export interface ZegoWxPublishOption {
    /**
     * 推流格式
     */
    sourceType?: "CDN" | "BGP";
    /**
     * 推流选项
     */
    streamParams?: string;
    /**
     * 额外信息
     */
    extraInfo?: string;
    /**
     * 房间ID，开启多房间功能后必填，选择在哪个房间推流。
     */
    roomID?: string;
    /**
     * 是否允许对该流进行审核，默认为允许， 0：允许， 1：不允许。
     */
    inspectFlag?: ZegoInspectFlagType;
}
export declare enum ZegoInspectFlagType {
    allow = 0,
    notAllow = 1
}
/**
 * 拉流质量回调,拉流成功后开始触发
 *
 * Note: 详情描述：订阅拉流质量回调
 *
 * Note: 触发条件：拉流成功后
 *
 * Note: 限制频率：无
 *
 * Note: 关注回调：无
 *
 * Note: 重点提示：每 3 秒回调一次
 *
 * Note: 支持版本：1.0.0
 *
 * Note: 废弃时间：无
 *
 * @param streamID 流 ID
 * @param stats 拉流质量回调信息
 */
type PlayQualityUpdateCallBack = (streamID: string, stats: ZegoPlayStats) => void;
/**
 * 拉流状态发生变化时回调
 *
 * Note: 详情描述：拉流的状态通知，拉流是异步过程，中间的状态切换都通过该接口回调。监听该回调，对重试依旧不能成功的情况，做错误日志收集，提示客户
 *
 * Note: 触发条件：开始拉流后
 *
 * Note: 限制频率：无
 *
 * Note: 关注回调：无
 *
 * Note: 重点提示：必须在拉流前监听
 *
 * Note: 支持版本：1.0.0
 *
 * Note: 废弃时间：无
 *
 * @param result 拉流状态结果
 */
type PlayerStateUpdateCallBack = (result: ZegoPlayerState) => void;
/**
 * 详情描述: 包括转推 CDN 的 URL、转推状态等
 */
export interface ZegoStreamRelayCDNInfo {
    url: string;
    state: "NO_RELAY" | "RELAY_REQUESTING" | "RELAYING";
    updateReason: string;
    stateTime: number;
}
/**
 * 混流转推 CDN 状态更新通知。
 * 在 ZEGO RTC 服务器的混流任务的一般情况会以 RTMP 协议将输出流向 CDN 推送，推送过程中出现的状态的变化会从该回调函数通知出来。
 * @param taskID 混流任务 ID。取值范围：长度不超过256。注意事项：该参数为字符串格式，不可以包含 URL 关键字，例如 'http', '?' 等，否则推拉流失败。仅支持数字，英文字符 和 '~', '!', '@', '$', '%', '^', '&', '*', '(', ')', '_', '+', '=', '-', '`', ';', '’', ',', '.', '<', '>', '\'。
 * @param infoList 当前 CDN 正在混流的信息列表。
 */
type MixerRelayCDNStateUpdateCallBack = (taskID: string, infoList: Array<ZegoStreamRelayCDNInfo>) => void;
/**
 * 订阅推流质量回调
 *
 * Note: 详情描述：订阅推流质量回调
 *
 * Note: 触发条件：推流成功后
 *
 * Note: 限制频率：无
 *
 * Note: 关注回调：无
 *
 * Note: 重点提示：每 3 秒回调一次
 *
 * Note: 支持版本：1.0.0
 *
 * Note: 废弃时间：无
 *
 * @param streamID 推流流ID
 * @param stats 推流质量描述
 */
type PublishQualityUpdateCallBack = (streamID: string, stats: ZegoPublishStats) => void;
/**
 * 推流状态回调
 *
 * Note: 详情描述：推流的状态通知，推流是异步过程，中间的状态切换都通过该接口回调。监听该回调，对重试依旧不能成功的情况，做错误日志收集，提示客户
 *
 * Note: 触发条件：开始推流后
 *
 * Note: 限制频率：无
 *
 * Note: 关注回调：无
 *
 * Note: 重点提示：必须在推流前监听
 *
 * Note: 支持版本：1.0.0
 *
 * Note: 废弃时间：无
 *
 * @param result 推流状态结果
 */
type PublisherStateUpdateCallBack = (result: ZegoPublisherState) => void;
/**
 * 监听已登录房间内流的变化（增加，删除）
 *
 * Note: 详情描述：监听已登录房间内流的变化（增加，删除）
 *
 * Note: 触发条件：房间内有流新增或删除
 *
 * Note: 限制频率：无
 *
 * Note: 重点提示：需要在登录房间前调用
 *
 * Note: 支持版本：1.0.0
 *
 * Note: 废弃时间：无
 *
 * @param roomID 房间ID
 * @param updateType DELETE：流删除，ADD：流新增
 * @param streamList 更新流列表
 * @param extendedData 扩展信息
 */
type RoomStreamUpdateCallBack = (roomID: string, updateType: "DELETE" | "ADD", streamList: ZegoStreamList[], extendedData: string) => void;
/**
 * 流附加消息变化时回调
 *
 * Note: 详情描述：接收对端设置的流附加信息
 *
 * Note: 触发条件：流附加消息更新
 *
 * Note: 支持版本：1.0.0
 *
 * Note: 废弃时间：无
 *
 * @param roomID 房间ID
 * @param streamList 流信息
 */
type StreamExtraInfoUpdateCallBack = (roomID: string, streamList: {
    streamID: string;
    user: ZegoUser;
    extraInfo: string;
}[]) => void;
export interface ZegoEvent extends ZegoWechatMiniEvent, ZegoRTMEvent {
}
export {};
