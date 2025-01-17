/**
 * 麦克风发送声音状态。
 *
 * 详情描述：麦克风发送声音状态。
 *
 * 业务场景：获取麦克风开关状态。
 *
 */
export declare enum ZegoRangeAudioMicrophoneState {
    /**
     * 关闭状态
     */
    Off = 0,
    /**
     * 开启中
     */
    TurningOn = 1,
    /**
     * 开启状态
     */
    On = 2
}
/**
 * 范围语音模式
 *
 * 详情描述：范围语音模式。
 *
 */
export declare enum ZegoRangeAudioMode {
    /**
     * 所有人模式，可以与房间内所有人交流
     */
    World = 0,
    /**
     * 仅小队模式，只与小队内的成员交流
     */
    Team = 1,
    /**
     * 隐秘小队模式，可与小队内的成员交流（不受范围限制），并且可以听到范围内的其他玩家（非队伍内）声音。
     */
    SecretTeam = 2
}
/**
 * 范围语音发声模式。
 *
 */
export declare enum ZegoRangeAudioSpeakMode {
    /**
     * 发声到所有人模式，房间内的所有人都能听到他的声音。
     */
    All = 0,
    /**
     * 发声到世界模式，只有处于范围内的人才能听到他的声音。
     */
    World = 1,
    /**
     * 发声到所属小队模式，只有小队内的成员才能听到他的声音（不受范围限制）。
     */
    Team = 2
}
/**
 * 范围语音收听模式。
 *
 */
export declare enum ZegoRangeAudioListenMode {
    /**
     * 收听所有人模式，可以收听到房间内所有人的声音。
     */
    All = 0,
    /**
     * 只收听世界的人模式，只收听处于范围内的人员的声音。
     */
    World = 1,
    /**
     * 只收听所属小队模式，只收听所属小队内的成员的声音（不受范围限制）。
     */
    Team = 2
}
/**
 * 详情描述：检查范围内用户变更配置。
 *
 */
export interface ZegoRangeAudioUserUpdateCheckConfig {
    /**
     * 详情描述：检查范围内用户变更的频率。
     */
    frequency: number;
}
/**
 * 范围语音功能相关事件集合。
 *
 * Note: 详情描述：描述事件名及其对应的回调参数。
 *
 * Note: 业务场景：用于约束注册事件接口 on 和注销事件接口 off 的参数。
 *
 */
export interface ZegoRangeAudioEvent {
    /**
     * 麦克风状态更新事件。
     */
    microphoneStateUpdate: MicrophoneStateUpdateCallBack;
    /**
     * 音频发送质量。
     */
    publishQualityUpdate: RangeAudioPublishQualityUpdateCallBack;
    /**
     * 音频接收质量。
     */
    playQualityUpdate: RangeAudioPlayQualityUpdateCallBack;
    /**
     * AI 降噪功能错误回调。
     */
    aiDenoiseError: AiDenoiseErrorCallBack;
    /**
     * 范围内用列表回调
     */
    audioSourceWithinRangeUpdate: AudioSourceWithinRangeUpdateCallBack;
}
/**
 * 范围语音推流质量。
 *
 */
export interface RangeAudioPublishStats {
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
     * 推流音频质量，-1 表示未知，0 表示 极好,1 表示好，2 表示中等，3 表示 差，4 表示极差
     */
    audioQuality: number;
}
/**
 * 范围语音拉流质量。
 *
 */
export interface RangeAudioPlayStats {
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
     * 拉流音频质量，-1 表示未知，0 表示 极好,1 表示好，2 表示中等，3 表示 差，4 表示极差
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
    /**
     * 音频发送能量
     */
    audioSendLevel: number;
    /**
     * 音频编码格式
     */
    googCodecName: string;
    /**
     * 详情描述: 累计音频解码时长，单位为毫秒 （2.19.0 及以上版本支持）。
     */
    audioCumulativeDecodeTime: number;
    /**
     * 详情描述: 累计视频卡顿时长，单位为毫秒 （2.19.0 及以上版本支持）。
     */
    audioCumulativeBreakTime: number;
    /**
     * 详情描述: 累计视频卡顿率，单位为 1，取值范围 [0,1]（2.19.0 及以上版本支持）。
     */
    audioCumulativeBreakRate: number;
    /**
     * 端到端延迟，单位为 ms。
     */
    peerToPeerDelay: number;
    /**
     * 端到端丢包率，单位 1。
     */
    peerToPeerPacketLostRate: number;
}
/**
 * 详情描述：范围内用户回调。
 *
 * @param userID 用户 ID
 * @param position 位置信息
 */
type AudioSourceWithinRangeUpdateCallBack = (userID: string, position: number[]) => void;
/**
 * 麦克风和音频上行状态更新回调
 *
 * Note: 详情描述：麦克风和音频上行的状态通知，开启发送音频是异步过程，中间的状态切换都通过该接口回调。
 *
 * Note: 触发条件：调用 ZegoExpressRangeAudio 的 enableMicrophone 接口。
 *
 * Note: 重点提示：必须在 enableMicrophone 接口调用前监听。
 *
 * Note: 支持版本：2.10.0
 *
 * @param state 麦克风更新状态
 * @param errorCode 错误码
 * @param extendedData 描述信息
 */
type MicrophoneStateUpdateCallBack = (state: ZegoRangeAudioMicrophoneState, errorCode: number, extendedData?: string) => void;
/**
 * 音频接收质量。
 *
 * Note: 详情描述：音频下行的质量通知。
 *
 * Note: 触发条件：调用 ZegoExpressRangeAudio 的 enableMicrophone 接口。
 *
 * Note: 支持版本：2.20.0
 *
 * @param userID 用户 ID。
 * @param stats 音频接收质量相关指标集合。
 */
type RangeAudioPlayQualityUpdateCallBack = (userID: string, stats: RangeAudioPlayStats) => void;
/**
 * 音频发送质量。
 *
 * Note: 详情描述：音频上行的质量通知。
 *
 * Note: 触发条件：调用 ZegoExpressRangeAudio 的 enableMicrophone 接口。
 *
 * Note: 支持版本：2.20.0
 *
 * @param userID 用户 ID。
 * @param stats 音频发送质量相关指标集合。
 */
type RangeAudioPublishQualityUpdateCallBack = (userID: string, stats: RangeAudioPublishStats) => void;
/**
 * AI 降噪错误回调。
 *
 * Note: 详情描述：AI 降噪错误回调。
 *
 * Note: 触发条件：调用 ZegoExpressRangeAudio 的 enableAiDenoise 或  enableMicrophone 接口使用 AI 降噪功能出现异常。
 *
 * Note: 支持版本：2.21.0
 *
 * @param errorCode 错误码。
 * @param extendedData 错误描述信息。
 */
type AiDenoiseErrorCallBack = (errorCode: number, extendedData: string) => void;
export {};
