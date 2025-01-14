import { ZegoSnapshotOptions, ZegoStreamViewOptions } from "./ZegoExpressEntity.web";
/**
 * 媒体流播放器组件
 *
 * 详情描述：媒体流播放器组件类。
 *
 * 业务场景：在界面上播放媒体流。
 *
 */
export declare class ZegoStreamView {
    constructor(view: any);
    /**
     * 客户端截图
     *
     * 支持版本：2.18.0 及以上。
     *
     * 详情描述：获取当前渲染的视频帧数据。
     *
     * 业务场景：对当前（推流/拉流）渲染的视频画面进行截图。
     *
     * 调用时机：创建 view.play 之后。
     *
     * @return 包含 data URI 的DOMString
     */
    takeStreamSnapshot(option?: ZegoSnapshotOptions): string;
    /**
     * 在页面上播放媒体流的音视频。
     *
     * 支持版本：2.17.0 及以上
     *
     * 详情描述：指定一个 DOM 元素作为容器，SDK 将根据需要在元素下创建媒体流播放组件播放音视频。
     *
     * 业务场景：在界面上显示媒体流内容。
     *
     * 调用时机：创建 ZegoStreamView 实例后。
     *
     * 注意事项：一个 ZegoStreamView 播放组件只能通过 play 方法挂载在一个容器上，不能同时挂载多个。
     *
     * 相关回调：调用 play 接口播放视频失败时会触发 ZegoStreamView 的自动播放失败事件回调 [autoplayFailed]。
     *
     * 相关接口：卸载媒体流播放组件接口 [stop] 。调用 [stopPlayingStream] 或 [destroyStream] 也会卸载播放组件。
     *
     * @param container 容器 DOM 元素，可以直接传入一个 DOM 元素对象或传 DOM 元素的 ID 值。
     * @param options 设置播放选项参数（镜像、显示模式、静音等）。
     */
    play(container: string | HTMLElement, options?: ZegoStreamViewOptions): void;
    /**
     * 停止在页面上播放音视频。
     *
     * 支持版本：2.17.0 及以上
     *
     * 详情描述：卸载媒体流播放组件来结束显示音视频。
     *
     * 业务场景：结束在界面上展现媒体流内容。
     *
     * 调用时机：创建 ZegoStreamView 实例后。
     *
     * 相关接口：调用 [stopPlayingStream] 或 [destroyStream] 也会卸载播放组件。
     */
    stop(): void;
    /**
     * 恢复播放页面上的音视频。
     *
     * 支持版本：2.17.0 及以上
     *
     * 详情描述：当视频浏览器限制而阻止播放时，可以在 DOM 点击事件中调用该接口恢复播放页面上的音视频。
     *
     * 业务场景：在界面上显示媒体流内容。
     *
     * 调用时机：创建 ZegoStreamView 实例后。
     */
    resume(): void;
    /**
     * 开关音频的播放。
     *
     * 支持版本：2.17.0 及以上
     *
     * 详情描述：开关音频的播放。
     *
     * 业务场景：停止或恢复播放媒体流的音频。
     *
     * 调用时机：调用 ZegoStreamView 实例的 [play] 方法进行挂载组件后调用。
     *
     * 注意事项：该接口只会停止播放媒体流的音频，不会影响媒体流的音频传输内容。停止发送音频需要调用 [mutePublishStreamAudio] 接口，停止接收音频调用 [mutePlayStreamAudio] 接口。
     *
     * @param muted 是否禁止，true 表示禁止，false 表示恢复开启。
     *
     * @return 标识接口是否调用成功。
     */
    setAudioMuted(muted: boolean): boolean;
    /**
     * 开关视频的播放。
     *
     * 支持版本：2.17.0 及以上
     *
     * 详情描述：开关视频播放。
     *
     * 业务场景：停止或恢复播放媒体流的视频。
     *
     * 调用时机：调用 ZegoStreamView 实例的 [play] 方法进行挂载组件后调用。
     *
     * 注意事项：该接口只会停止播放媒体流的视频，不会影响媒体流的视频传输内容。停止发送视频需要调用 [mutePublishStreamVideo] 接口，停止接收视频调用 [mutePlayStreamVideo] 接口。
     *
     * @param muted 是否禁止，true 表示禁止，false 表示恢复开启。
     *
     * @return 标识接口是否调用成功。
     */
    setVideoMuted(muted: boolean): boolean;
    /**
     * 切换音频输出设备。
     *
     * Note: 支持版本：2.17.0 及以上。
     *
     * Note: 详情描述：设置音频输出设备。
     *
     * Note: 调用时机：用 [getSpeakers] 获取音频输出设备列表后。
     *
     * Note: 注意事项：该接口当前只支持 Chrome 浏览器使用。
     *
     * Note: 相关接口：获取扬声器列表接口 [getSpeakers]。
     *
     * @param deviceID 扬声器设备 ID。
     */
    useAudioOutputDevice(deviceID: string): Promise<void>;
    /**
     * 设置音频播放音量。
     *
     * 支持版本：2.17.0 及以上
     *
     * 详情描述：设置音频播放音量。
     *
     * 调用时机：创建 ZegoStreamView 实例后。
     *
     * @param volume 音量大小，取值范围 [0,100] 。
     *
     * @return 接口是否调用成功。
     */
    setVolume(volume: number): boolean;
    /**
     * 注册回调事件。
     *
     * Note: 支持版本：2.17.0 及以上
     *
     * Note: 详情描述：用于处理 SDK 主动通知开发者回调的接口，通过注册不同 event 的事件，可以收到不同功能的回调。可监听的事件回调可以通过 StreamViewEvent 查看。
     *
     * Note: 业务场景：用于注册媒体流组件功能相关的业务事件的回调处理。
     *
     * Note: 调用时机：创建 ZegoStreamView 实例之后。
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
    on<K extends keyof StreamViewEvent>(event: K, callback: StreamViewEvent[K]): boolean;
    /**
     * 注销回调事件。
     *
     * Note: 支持版本：2.17.0 及以上
     *
     * Note: 详情描述：用于处理 SDK 主动通知开发者回调的接口，通过注册不同 event 的事件，可以收到不同功能的回调。用于删除注册的同一类回调事件。
     *
     * Note: 业务场景：用于媒体流播放组件的业务事件的回调处理。
     *
     * Note: 调用时机：创建 ZegoStreamView 实例之后。
     *
     * Note: 注意事项：如果没有传要注销的回调函数参数 [callback]，将会注销所有该事件的回调函数。
     *
     * @param event 监听事件名。
     * @param callback 回调函数。
     *
     * @return 注销回调是否成功。
     */
    off<K extends keyof StreamViewEvent>(event: K, callback?: StreamViewEvent[K]): boolean;
}
/**
 * 媒体流播放组件相关事件集合。
 *
 * Note: 详情描述：描述事件名及其对应的回调参数。
 *
 * Note: 业务场景：用于约束注册事件接口 on 和注销事件接口 off 的参数。
 *
 */
export interface StreamViewEvent {
    /**
     * 自动播放失败事件。
     */
    autoplayFailed: () => void;
    /**
     * 在用户可以开始播放视频时触发。
     */
    canPlayVideo: () => void;
    /**
     * 在用户可以开始播放音频时触发。
     */
    canPlayAudio: () => void;
}
