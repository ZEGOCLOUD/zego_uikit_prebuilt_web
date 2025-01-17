import { ZegoRangeAudioMode, ZegoRangeAudioEvent, ZegoRangeAudioUserUpdateCheckConfig, ZegoRangeAudioSpeakMode, ZegoRangeAudioListenMode } from "./ZegoRangeAudioEntity.web";
import { ZegoStreamView } from "./ZegoStreamView.web";
import { AiDenoiseMode, ZegoVoiceChangerPreset } from "./ZegoVoiceChangerEntity.web";
/**
 * 范围语音
 *
 * 详情描述: 常用于语音游戏场景中，用户可通过创建的范围语音实例对象使用范围语音相关功能。
 *
 */
export declare class ZegoExpressRangeAudio {
    private static instance;
    private _zgp_zegoAudioListener;
    /**
     * @param engine -
     */
    static getInstance(engine: any, _zgp_logger: any): ZegoExpressRangeAudio;
    /**
     * 范围语音开启或关闭 AI 降噪。
     *
     * 支持版本：2.21.0。
     *
     * 详情描述：对麦克风声音进行 AI 降噪处理。
     *
     * 业务场景：推流前或推流中切换 AI 降噪。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 createStream 创建流成功后。
     *
     * 注意事项：
     * 1. 目前使用 AI 降噪功能需要联系 ZEGO 技术支持进行特殊编包；
     * 2. 目前仅支持 PC 端使用，移动端暂不支持；
     *
     * @param enable 开启/关闭 AI 降噪
     *
     * @return 标识接口是否调用成功。失败原因可能是浏览器不支持或没有使用特殊编包。
     */
    enableAiDenoise(enable: boolean): boolean;
    setAiDenoiseMode(mode: AiDenoiseMode): boolean;
    /**
     * 是否检查范围内用户的变更。
     *
     * 支持版本：2.22.0 及以上
     *
     * 详情描述：是否检查范围内用户的变更。
     *
     * 调用时机/通知时机：调用接口 createRangeAudioInstance 创建 ZegoExpressRangeAudio 实例后。
     *
     * 相关回调：audioSourceWithinRangeUpdate。
     *
     * @param update 是否开启。
     * @param config? 检查范围内用户变更的配置。
     */
    enableAudioSourceUpdateChecker(update: boolean, config?: ZegoRangeAudioUserUpdateCheckConfig): void;
    /**
     * 注册回调事件。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：用于处理 SDK 主动通知开发者回调的接口，通过注册不同 event 的事件，可以收到不同功能的回调。可监听的事件回调可以通过 ZegoRangeAudioEvent 查看。
     *
     * Note: 业务场景：用于注册范围语音功能相关的业务事件的回调处理。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 创建实例之后并且在调用接口 loginRoom 登录房间之前。
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
    on<K extends keyof ZegoRangeAudioEvent>(event: K, callBack: ZegoRangeAudioEvent[K]): boolean;
    /**
     * 注销回调事件。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：用于处理 SDK 主动通知开发者回调的接口，通过注册不同 event 的事件，可以收到不同功能的回调。用于删除注册的同一类回调事件。
     *
     * Note: 业务场景：用于注销范围语音功能相关的业务事件的回调处理。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 创建实例之后。
     *
     * Note: 注意事项：如果没有传要注销的回调方法，将会注销所有该事件的回调。
     *
     * @param event 监听事件名。
     * @param callBack 回调函数。
     *
     * @return 注销回调是否成功。
     */
    off<K extends keyof ZegoRangeAudioEvent>(event: K, callBack?: ZegoRangeAudioEvent[K]): boolean;
    /**
     * 设置音频接收距离的最大范围。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：设置音频接收最大距离范围，超过该范围的音源声音会听不见，不设置的情况默认是无限范围。
     *
     * Note: 业务场景：范围语音中设置收听者的听觉范围。
     *
     * Note: 默认值：没有调用接口时默认是无距离限制，即听见房间内所有人的声音。
     *
     * Note: 注意事项: 该范围只对非同小队的发声者生效。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 创建 ZegoExpressRangeAudio 实例后。
     *
     * @param range 音频范围, 取值必须大于等于 0。
     */
    setAudioReceiveRange(range: number): void;
    /**
     * 更新听者的位置和朝向。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述: 自身的位置和朝向，以便 SDK 计算出用户与音源距离以及左右耳立体声效果。
     *
     * Note: 业务场景：当用户在游戏中操作的角色在世界地图中移动时，更新角色的位置信息以及头部朝向。
     *
     * Note: 注意事项：在调用 enableSpeaker 打开扬声器之前，如果没有调用 updateSelfPosition 设置位置信息，则无法接收除小队以外其他人的声音。
     *
     * Note: 调用时机：创建 ZegoExpressRangeAudio 实例后和调用接口，调用接口 enableSpeaker 之前。
     *
     * @param position 自身在世界坐标系中的坐标，参数是长度为 3 的 number 数组，三个值依次表示前、右、上的坐标值。
     * @param axisForward 自身坐标系前轴的单位向量，参数是长度为 3 的 number 数组，三个值依次表示前、右、上的坐标值。
     * @param axisRight 自身坐标系右轴的单位向量，参数是长度为 3 的 number 数组，三个值依次表示前、右、上的坐标值。
     * @param axisUp 自身坐标系上轴的单位向量，参数是长度为 3 的 number 数组，三个值依次表示前、右、上的坐标值。
     */
    updateSelfPosition(position: number[], axisForward: number[], axisRight: number[], axisUp: number[]): void;
    /**
     * 添加或更新音源位置信息。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：设置 userID 对应的音源在世界地图位置，以便 SDK 计算听者与音源的距离和方位。
     *
     * Note: 业务场景：更新发声用户在游戏地图坐标中的位置。
     *
     * Note: 调用时机：调用 loginRoom 登录房间后调用，登出房间后会清空记录的音源信息。
     *
     * @param userID 发声者用户 ID。
     * @param position 发声者在世界坐标系中的坐标，参数是长度为 3 的 number 数组，三个值依次表示前、右、上的坐标值。
     */
    updateAudioSource(userID: string, position: number[]): void;
    /**
     * 开关 3D 音效。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：开启 3D 音效后将根据发声者相当于听者的位置模拟实际空间中的声音效果，可直观感受到就是音源远近和方位发生变化时，声音大小和左右声音差所产生的变化。enable 为true 时开启 3D 音效，为 false 时关闭 3D 音效。
     *
     * Note: 业务场景：第一人称射击游戏或社交场景游戏中听声辨位功能。
     *
     * Note: 默认值：在没有调用该接口前，默认是关闭3D音效。
     *
     * Note: 使用限制: 3D 音效只对小队以外的人的声音起作用。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 初始化实例后。
     *
     * Note: 相关接口:  开启 3D 音效后，可以调用 updateSelfPositon 和 updateAudioSource 更新位置和朝向来改变立体声效果。
     *
     * @param enable 是否开启，默认值是 true
     */
    enableSpatializer(enable: boolean): void;
    /**
     * 开关麦克风。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：enable 为 true 时开启麦克风并推送音频流，为 false 时关闭麦克风并停止推送音频流。
     *
     * Note: 业务场景：用户在房间内打开或关闭麦克风交流。
     *
     * Note: 默认值：在没有调用接口前，默认是关闭麦克风。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 创建实例和调用接口 loginRoom 登录房间成功后。
     *
     * Note: 相关回调：通过回调 microphoneStateUpdate 来获取麦克风开关状态变化。
     *
     * @param enable 是否开启，默认值是 true
     */
    enableMicrophone(enable: boolean): void;
    /**
     * 指定麦克风设备。
     *
     * Note: 支持版本：2.17.0 及以上
     *
     * Note: 详情描述：通过传入麦克风设备的 deviceID 来指定开启麦克风时使用的设备，deviceID 可以通过 ZegoExpressEngine.getMicrophones 接口获取。
     *
     * Note: 业务场景：切换使用的麦克风设备。
     *
     * Note: 默认值：在没有调用接口前，使用的是系统默认指定的麦克风设备。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 创建实例后。
     *
     * Note: 相关接口：获取麦克风设备列表接口 getMicrophones。
     *
     * @param deviceID 麦克风设备 ID。
     *
     * @return 异步返回布尔值，表示切换设备是否成功。
     */
    selectMicrophone(deviceID: string): Promise<boolean>;
    /**
     * 指定扬声器设备。
     *
     * Note: 支持版本：2.19.0 及以上
     *
     * Note: 详情描述：通过传入扬声器设备的 deviceID 来指定范围语音播放音频使用的设备，deviceID 可以通过 ZegoExpressEngine.getSpeakers 接口获取。
     *
     * Note: 业务场景：范围语音切换使用的扬声器设备。
     *
     * Note: 默认值：在没有调用接口前，使用的是系统默认指定的扬声器设备。
     *
     * Note: 注意事项：该接口当前只支持 PC 端 Google Chrome 浏览器使用。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 创建实例后。
     *
     * Note: 相关接口：获取扬声器设备列表接口 getSpeakers。
     *
     * @param deviceID 扬声器设备 ID。
     */
    selectSpeaker(deviceID: string): void;
    /**
     * 开关扬声器。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：开启扬声器后会接收房间内其他开启麦克风的音源声音，enable 为 true 时开始拉取和播放可拉取的音频流，为 false 时停止拉取和播放音频流。
     *
     * Note: 业务场景：用户选择是否接收其他人的音频。
     *
     * Note: 默认值：在没有调用接口前，默认是关闭接收音频。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 创建实例和调用接口 loginRoom 登录房间成功后。
     *
     * @param enable 是否开启，默认值是 true
     */
    enableSpeaker(enable: boolean): void;
    /**
     * 设置范围语音的高阶自定义模式。
     *
     * Note: 支持版本：2.24.0 及以上
     *
     * Note: 详情描述：可以分别设置发声模式和收听模式，以控制在世界和小队中的发声和收听行为。
     *
     * Note: 业务场景：用户可通过选择发声模式来决定谁能收听到他的声音，也可通过选择收听模式来决定收听谁的声音。
     *
     * Note: 默认值：没有调用该接口时，默认使用 “发声到所有” 模式和 “收听所有” 模式，也就是旧范围语音模式的 “全世界” 模式。
     *
     * Note: 调用时机：通过 createRangeAudioInstance 初始化实例后。
     *
     * Note: 相关接口：当希望收听来自世界的声音时，需要设置声音接收范围 [setAudioReceiveRange]。当希望在小队中发声和收听时，需要设置 [setTeamID] 加入对应小队。
     *
     * Note: 使用限制：1. 不能与 [setRangeAudioMode] 混用；2. 与2.24.0之前的版本无法兼容。
     *
     * @param speakMode 范围语音发声模式，mode 为 0 表示发送所有人，为 1 表示仅范围内，为 2 表示仅小队。
     * @param listenMode 范围语音收听模式，mode 为 0 表示收听所有人，为 1 表示仅范围内，为 2 表示仅小队。
     */
    setRangeAudioCustomMode(speakMode: ZegoRangeAudioSpeakMode, listenMode: ZegoRangeAudioListenMode): void;
    /**
     * 设置范围语音模式。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：设置收听模式，可设置为“全世界”模式或“仅小队”模式。
     *
     * Note: 业务场景：用户想要只在小队范围交流或与可与房间内所有人交流。
     *
     * Note: 默认值：在不调接口设置时默认是“全世界”，可以与所有人交流。
     *
     * Note: 调用时机：通过 createRangeAudioInstance 初始化实例后。
     *
     * Note: 相关接口：要调接口 setTeamID 加入对应小队才能听到小队内的声音。
     *
     * @param mode 收听模式，mode 为 0 表示收听所有人，为 1 表示仅小队
     */
    setRangeAudioMode(mode: ZegoRangeAudioMode): void;
    /**
     * 设置队伍 ID。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：设置队伍 ID 后，将能与同一队伍其他用户交流，且声音不会随距离方向产生变化。
     *
     * Note: 业务场景：用户想要加入队伍交流或退出队伍。
     *
     * Note: 默认值：默认值是 undefined , 表示不加入队伍。
     *
     * Note: 调用时机：通过 createRangeAudioInstance 初始化实例后。
     *
     * Note: 注意事项：参数 teamID 的最大长度为 64 字节。
     *
     * Note: 相关接口：调接口 etRangeAudioMode 设置为”仅小队“模式时只有队伍内进行交流。
     *
     * @param teamID 队伍 ID，最大长度为 64 字节的字符串。
     */
    setTeamID(teamID?: string): void;
    /**
     * 设置 SDK 内部实时更新位置的频率。
     *
     * Note: 支持版本：2.19.0 及以上
     *
     * Note: 详情描述：设置 SDK 内部实时更新位置的频率最小 15ms。
     *
     * Note: 业务场景：更新位置后，对音频渐变灵敏度要求很高。
     *
     * Note: 默认值：默认 100ms。
     *
     * Note: 调用时机：通过 createRangeAudioInstance 初始化实例后。
     *
     * @param frequency 更新频率，取值必须大于 15ms。
     */
    setPositionUpdateFrequency(frequency: number): void;
    /**
     * 设置范围语音本地播放音量。
     *
     * Note: 支持版本：2.19.0 及以上
     *
     * Note: 详情描述：设置范围语音本地播放音量。
     *
     * Note: 默认值：100。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 创建 ZegoExpressRangeAudio 实例后。
     *
     * @param volume 音量大小，取值范围 [0,200] 。
     */
    setRangeAudioVolume(volume: number): void;
    /**
     * 传入媒体流，设置变声
     *
     * 支持版本：2.24.0
     *
     * 详情描述：将推送的媒体流进行变声处理。
     *
     * 业务场景：推流前或推流中切换变声处理。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 createStream 创建流成功后。
     *
     * 注意事项：
     * 1. 目前使用变声功能需要联系 ZEGO 技术支持进行特殊编包；
     * 2. 目前仅支持 PC 端使用，移动端暂不支持；
     * 3. 目前仅支持对特定的一条流进行变声处理，不支持同时对多条流同时变声；
     * @param preset 变声模式
     */
    setVoiceChangerPreset(preset: ZegoVoiceChangerPreset): boolean;
    /**
     * 传入媒体流，设置变声
     *
     * 支持版本：3.0.0
     *
     * 详情描述：将推送的媒体流进行变声自定义参数设置。
     *
     * 业务场景：推流前或推流中切换变声自定义参数设置。
     *
     * 默认值：无
     *
     * 调用时机：调用接口 createStream 创建流成功后。
     *
     * 注意事项：
     * 1. 目前使用变声功能需要联系 ZEGO 技术支持进行特殊编包；
     * 2. 目前仅支持 PC 端使用，移动端暂不支持；
     * 3. 目前仅支持对特定的一条流进行变声处理，不支持同时对多条流同时变声；
     * @param voiceParam 变声参数
     */
    setVoiceChangerParam(voiceParam: number): boolean;
    /**
     * 判断 AudioContext 对象是否已启用。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：该接口主要是为了处理浏览器对自动播放策略的兼容性问题。通过接口 isAudioContextRunning 检测当前的 AudioContext 对象是否启用，如果没有启用将不支持自动播放声音。
     *
     * Note: 调用时机：调用 createRangeAudioInstance 创建实例后。
     *
     * Note: 相关接口：如果 AudioContext 对象没有启用，可以通过接口 resumeAudioContext 重新启用 AudioContext 对象。
     *
     * @return AudioContext 对象是否启用
     */
    isAudioContextRunning(): boolean;
    /**
     * 重新启用内部的 AudioContext 对象。
     *
     * Note: 支持版本：2.10.0 及以上
     *
     * Note: 详情描述：该接口主要是为了处理浏览器对自动播放策略的兼容性问题。若通过接口 isAudioContextRunning 检测当前的 AudioContext 对象没有启用，可以通过该接口重新启用。
     *
     * Note: 调用时机：调用 createRangeAudioInstance 创建实例后。
     *
     * Note: 注意事项：该接口必须要在 JavaScript 的点击事件中调用才会生效。
     *
     * Note: 相关接口：通过接口 isAudioContextRunning 检测当前的 AudioContext 对象没有启用。
     *
     * @return 是否重启成功
     */
    resumeAudioContext(): Promise<boolean>;
    /**
     * 设置拉流音频发送范围。
     *
     * Note: 支持版本：2.20.2 及以上
     *
     * Note: 详情描述：设置音频发送最大距离范围，超过该范围的音源声音会听不见。
     *
     * Note: 业务场景：范围语音中设置拉流发声源的发声范围。
     *
     * Note: 默认值：默认为 0。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 创建 ZegoExpressRangeAudio 实例后。
     *
     * @param view 拉流播放组件。
     * @param range 发送范围, 取值必须大于等于 0。
     */
    setStreamVocalRange(view: ZegoStreamView, range: number): void;
    /**
     * 更新拉流的位置。
     *
     * Note: 支持版本：2.21.0 及以上
     *
     * Note: 详情描述：设置拉流发声源对应的音源在世界地图位置，以便 SDK 计算听者与音源的距离和方位。
     *
     * Note: 业务场景：更新自定义发声源在游戏地图坐标中的位置。
     *
     * Note: 调用时机：调用 loginRoom 登录房间后调用，登出房间后会清空记录的音源信息。
     *
     * @param view 发声源，传播放 RTC 拉流的 ZegoStreamView。
     * @param position 发声者在世界坐标系中的坐标，参数是长度为 3 的 number 数组，三个值依次表示前、右、上的坐标值。
     */
    updateStreamPosition(view: ZegoStreamView, position: number[]): void;
    /**
     * 设置自定义发声源发送范围。
     *
     * Note: 支持版本：2.20.2 及以上
     *
     * Note: 详情描述：设置音频发送最大距离范围，超过该范围的音源声音会听不见。
     *
     * Note: 业务场景：范围语音中设置自定义发声源的发声范围。
     *
     * Note: 默认值：默认为 0。
     *
     * Note: 调用时机：调用接口 createRangeAudioInstance 创建 ZegoExpressRangeAudio 实例后。
     *
     * @param media <video> 或 <audio> 标签对象。
     * @param range 发送范围, 取值必须大于等于 0。
     */
    setCustomSourceVocalRange(media: HTMLMediaElement, range: number): void;
    /**
     * 添加或更新自定义发声源位置信息。
     *
     * Note: 支持版本：2.21.0 及以上
     *
     * Note: 详情描述：设置自定义发声源对应的音源在世界地图位置，以便 SDK 计算听者与音源的距离和方位。
     *
     * Note: 业务场景：更新自定义发声源在游戏地图坐标中的位置。
     *
     * Note: 调用时机：调用 loginRoom 登录房间后调用，登出房间后会清空记录的音源信息。
     *
     * @param media 发声源，传播放本地或在线音频文件 <video> 或 <audio> 标签对象。
     * @param position 发声者在世界坐标系中的坐标，参数是长度为 3 的 number 数组，三个值依次表示前、右、上的坐标值。
     */
    updateCustomSourcePosition(media: HTMLMediaElement, position: number[]): void;
}
