import { ZegoAudioEffectPlayOptions } from "./ZegoExpressEntity.web";
import ZegoLocalStream from "./ZegoLocalStream.web";
/**
 * 音效播放器
 *
 * 详情描述: 当需要播放简短的声音效果，比如鼓掌，欢呼声等时，可以使用音效播放器来实现。
 *
 */
export declare class ZegoAudioEffectPlayer {
    private _zgp_zegoWebRTC;
    private _zgp_stream;
    constructor(_zgp_zegoWebRTC: any, _zgp_stream: MediaStream | ZegoLocalStream);
    /**
     * 开始播放音效。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述：开始播放指定音效 ID 上的音效。音效 ID 可以是 [loadAudioEffect] 预加载好的音效或者通过提供参数 [option.path] 指定在线音频资源来加载和播放。
     *
     * Note: 业务场景：当需要播放简短的声音效果，比如鼓掌，欢呼声等时，可以使用该接口实现。
     *
     * Note: 调用时机：在 [createAudioEffectPlayer] 之后可调用。
     *
     * Note: 相关接口：调用停止播放音效接口 [stop] 或者音效播放结束会触发 [onEnd] 回调。
     *
     * Note: 注意事项:
     * 1. 音效 ID 的音效没有播放结束即触发 [onEnd] 回调前，不能重复播放同一个音效 ID。
     * 2. 暂停音效接口 [pause] 不会结束音效播放，不会触发 [onEnd] 回调。
     *
     * @param audioEffectID 音效资源的 ID。
     * @param options 音效播放的选项设置。
     * @param onStart 音效播放开始的回调方法。
     * @param onEnd 音效播放结束的回调方法。
     */
    start(audioEffectID: string, options?: ZegoAudioEffectPlayOptions, onStart?: Function, onEnd?: Function): void;
    /**
     * 结束播放音效。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述：结束播放音效。
     *
     * Note: 调用时机：指定的 [audioEffectID] 已经 [start] 。
     *
     * Note: 相关接口：结束播放音效会触发开始播放音效接口 [start] 的 [onEnd] 回调方法。
     *
     * Note: 注意事项:  无。
     *
     * @param audioEffectID 音效资源的 ID , 不传参则停止所有可停止的音效。
     *
     * @return 接口是否调用成功。
     */
    stop(audioEffectID?: string): boolean;
    /**
     * 暂停播放音效。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述： 暂停播放指定的音效 [audioEffectID]。
     *
     * Note: 调用时机：指定的 [audioEffectID] 已经 [start]。
     *
     * Note: 相关接口：开始播放音效接口  [start] 、恢复播放接口 [resume]。
     *
     * @param audioEffectID 音效资源的 ID，不传参数则暂停所有可暂停的音效。
     *
     * @return 接口是否调用成功。
     */
    pause(audioEffectID?: string): boolean;
    /**
     * 恢复播放音效。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述： 恢复播放指定的音效 [audioEffectID]。
     *
     * Note: 调用时机：指定的 [audioEffectID] 处于 [pause] 状态。
     *
     * Note: 相关接口：开始播放音效接口  [start] 、恢复播放接口 [pause]。
     *
     * @param audioEffectID 音效资源的 ID，不传参数则恢复所有可恢复的音效。
     *
     * @return 接口是否调用成功。
     */
    resume(audioEffectID?: string): boolean;
    /**
     * 设置单个音效的播放音量，会同时设置本地播放音量和推流音量。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述：设置单个音效的播放音量，会同时设置本地播放音量和推流音量。
     *
     * Note: 业务场景：调节播放音效的声音大小。
     *
     * Note: 调用时机：在 [createAudioEffectPlayer] 之后可调用。
     *
     * @param audioEffectID 音效资源的 ID。
     * @param volume 音量值，取值范围：范围为 [0,100]， 默认值：100。
     *
     * @return 接口是否调用成功。
     */
    setVolume(audioEffectID: string, volume: number, delay?: number): boolean;
    /**
     * 获取指定音效资源的总时长。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述：获取指定音效资源的总长度，单位为毫秒。
     *
     * Note: 调用时机：必须在加载资源完成后才能调用，否则返回值为 0。
     *
     * Note: 相关接口：开始播放音效接口  [start] 、加载音效接口 [loadAudioEffect]。
     *
     * @param audioEffectID 音效资源的 ID。
     *
     * @return 音频总时长，单位为毫秒。
     */
    getTotalDuration(audioEffectID: string): number;
    /**
     * 获取当前播放进度。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述：获取指定音效的当前播放进度。单位为毫秒。
     *
     * Note: 调用时机：音效需要已经通过 [start] 播放，否则返回值为 0。
     *
     * Note: 相关接口：开始播放音效接口  [start] 。
     *
     * @param audioEffectID 音效资源的 ID。
     *
     * @return 音效播放进度，单位为毫秒。
     */
    getCurrentProgress(audioEffectID: string): number;
    /**
     * 设置播放进度。
     *
     * Note: 支持版本：2.15.0 及以上
     *
     * Note: 详情描述：设置指定音效的播放进度，单位为毫秒。
     *
     * Note: 业务场景：加载一个拥有多个音效的音频资源，通过该接口来播放对应位置的音效。
     *
     * Note: 调用时机：指定的 [audioEffectID] 已经 [start]，且还没有播完。
     *
     * Note: 相关接口：开始播放音效接口  [start] 。
     *
     * @param audioEffectID 音效资源的 ID。
     * @param time 指定的播放进度的时长。取值范围 [0, 音效总时长] 。
     *
     * @return 标识是否调用成功。
     */
    seekTo(audioEffectID: string, time: number): boolean;
}
