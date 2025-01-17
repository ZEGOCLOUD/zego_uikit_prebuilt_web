import { ZegoServerResponse, ZegoUser, ZegoRoomConfig, ZegoRTMEvent, ZegoLogConfig, ZegoInitOptions, ZegoProxyInfo, ZegoSwitchRoomConfig } from "./ZegoExpressEntity.rtm";
import { ZegoExpressWebRTM } from "../../src/rtm";
import { ZegoGeoFenceType, ZegoLocalProxyConfig } from "../../src/rtm/zego.entity";
import { ZReporter } from "../../src/rtm/zego.reporter";
import { ZegoLogger, ZegoDataReport } from "../../src/common/zego.entity";
export declare class ZegoExpressWebRTMEngine {
    /**
     * 是否开启多房间模式
     *
     * 支持版本：2.8.0 及以上。
     *
     * 详情描述：是否需要开启多房间，同一个用户可以同时加入多个房间，并同时在多个房间内推流、拉流、发送实时消息和接收消息回调。
     *
     * 业务场景：用于跨房间连麦和在线教育的超级小班场景。
     *
     * 默认值：默认不开启多房间。
     *
     * 调用时机：需要在初始化 SDK 后，第一次登录房间 loginRoom 前调用。
     *
     * 使用限制：一次完整的生命周期内只能调用一次。
     *
     * 相关接口：可调用 loginRoom 登录房间，调用  logoutRoom 退出房间，调用 startPublishingStream 开始推流。
     *
     * @param enable 是否开启，true 为开启，false 为关闭。
     */
    enableMultiRoom(enable: boolean): boolean;
    /**
     * 登录房间
     *
     * Note: 支持版本：1.0.0 及以上。
     *
     * Note: 详情描述：登录房间，同房间用户共享流、消息、用户等信息变化。
     *
     * Note: 业务场景：通过登录房间来获取与其他用户进行音视频或消息互动的接口权限。
     *
     * Note: 调用时机：初始化且获取到 token 之后。
     *
     * Note: 注意事项：
     * 1. token 是使用登录房间的钥匙，需要开发者自行实现，为保证安全，一定要在开发者自己的服务端生成 token，参考文章 [登录房间鉴权](https://doc-zh.zego.im/article/7646)。
     * 2. 默认为单房间模式，同一个用户（即 userID 相同）不能同时登录两个及以上房间。
     * 3. 若想监听房间内其他用户的变化，则 config 对象下的 “userUpdate” 参数必须设置为 “true”。
     *
     * Note: 隐私保护声明:  请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 影响范围：大部分接口都需要在登录房间后才能调用。
     *
     * Note: 相关回调：房间状态回调 roomStateUpdate。
     *
     * Note: 相关接口：可调用 logoutRoom 接口退出房间。
     *
     * @param roomID 房间 ID，最大长度为 128 字节的字符串。仅支持数字，英文字符 和 '~', '!', '@', '#', '$', '', '^', '&', '*', '(', ')', '_', '+', '=', '-', ', ';', '’', ',', '.', '<', '>', '/',
     * @param token 登录验证 token，是通过在即构控制台注册项目获得密钥，加上指定算法获得。测试阶段可以通过 ZEGO 提供的接口获取，正式环境一定要用户自己实现。
     * @param user 登录用户信息。
     * @param config? 房间相关配置，可选。
     *
     * @return promise 异步返回登录结果，true 表示登录成功，false 表示登录失败。
     */
    loginRoom(roomID: string, token: string, user: ZegoUser, config?: ZegoRoomConfig): Promise<boolean>;
    /**
     * 切换房间
     *
     * Note: 支持版本：3.7.0 及以上。
     *
     * Note: 详情描述：切换房间，快速的从当前房间切换到另外的房间。
     *
     * Note: 业务场景：便捷的实现不同房间之间的切换，比如从直播切换到1v1房间。
     *
     * Note: 调用时机：登录房间成功后。
     *
     * Note: 注意事项：
     * 1. token 是登录 toRoomID 房间的钥匙，需要开发者自行实现，为保证安全，一定要在开发者自己的服务端生成 token，参考文章 [登录房间鉴权](https://doc-zh.zego.im/article/7646)。
     *
     * Note: 隐私保护声明:  请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 影响范围：大部分接口都需要在登录房间后才能调用。
     *
     * Note: 相关回调：房间状态回调 roomStateUpdate。
     *
     * @param fromRoomID 当前已经登录过的房间 ID
     * @param toRoomID 需要切换的房间 ID（必须是未登录的房间 ID）。
     * @param config 房间相关配置，token 必填。
     *
     * @return promise 异步返回登录结果，true 表示登录成功，false 表示登录失败。
     */
    switchRoom(fromRoomID: string, toRoomID: string, config: ZegoSwitchRoomConfig): Promise<boolean>;
    /**
     * 退出房间，不再接受各种房间内状态
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：退出房间,，结束同房间用户共享流、消息、用户等信息变化。
     *
     * Note: 业务场景：结束音视频通话或其他功能后需要调用该接口退出房间，以保证对端能及时同步本端当前状态。调用该接口后会向 ZEGO 服务器发送退出房间信令，然后重置当前房间中用户与 ZEGO 服务器进行交互所需的关键数据，并置空 websocket 对象。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：登录房间成功后。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项： 无
     *
     * Note: 影响范围：大部分接口都在退出房间后，不能再调用。
     *
     * Note: 相关回调：房间状态回调 roomStateUpdate。
     *
     * Note: 相关接口：可调用 loginRoom 接口登录号房间。
     *
     * Note: 平台差异：无
     *
     * @param roomID? 和登录房间的roomID保持一致，可选
     */
    logoutRoom(roomID?: string): void;
    /**
     * 更新房间权限token
     *
     * 支持版本：2.6.0
     *
     * 详情描述：token权限变更,或者token过期时调用,更新token权限
     *
     * 业务场景：登录权限和推流权限隔离时使用, 利用token控制权限
     *
     * 默认值：无
     *
     * 调用时机：登录房间后,主动变更用户在房间内的权限; 登录房间后,收到token将要过期回调;
     *
     * 使用限制：无
     *
     * 注意事项：token是使用登录房间的钥匙, 这个是需要客户自己实现,为保证安全,一定要在自己的服务端生成token
     *
     * 影响范围：token内包含的过期时间,在过期前30s会触发tokenWillExpire回调
     *
     * 相关回调：房间token将要过期回调tokenWillExpire
     *
     * 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param token 指定算法生成的token, 即构提供生成token的不同语言版SDK;
     * @param roomID 房间 ID，最大长度为 128 字节的字符串。仅支持数字，英文字符 和 '~', '!', '@', '#', '$', '', '^', '&', '*', '(', ')', '_', '+', '=', '-', ', ';', '’', ',', '.', '<', '>', '/',
     *
     * @return true: 调用成功, false: 调用失败 (SDK 初步格式校验)
     */
    renewToken(token: string, roomID?: string): boolean;
    /**
     * 发送房间弹幕消息（消息不保证可靠）
     *
     * Note: 支持版本：1.0.0 及以上。
     *
     * Note: 详情描述：向 roomID 对应的房间内所有用户发送弹幕消息，消息不保证可靠。
     *
     * Note: 业务场景：房间内用户发送弹幕消息互动。
     *
     * Note: 调用时机：调用接口 loginRoom 登录房间成功之后。
     *
     * Note: 使用限制：关于此接口的使用限制，请参考 https://doc-zh.zego.im/article/7584 或联系 ZEGO 技术支持。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 相关回调：房间内用户可以通过房间弹幕消息通知回调 IMRecvBarrageMessage 来接收消息。
     *
     * @param roomID 房间Id
     * @param message 消息内容，长度不超过1024字节
     */
    sendBarrageMessage(roomID: string, message: string): Promise<ZegoServerResponse>;
    /**
     * 发送房间广播消息（消息保证可靠）
     *
     * Note: 支持版本：1.0.0 及以上。
     *
     * Note: 详情描述：向 roomID 对应的房间内所有用户发送文本消息。
     *
     * Note: 业务场景：房间内用户发送消息聊天互动，例如语聊房。
     *
     * Note: 调用时机：调用接口 loginRoom 登录房间成功之后。
     *
     * Note: 使用限制：关于此接口的使用限制，请参考 https://doc-zh.zego.im/article/7584 或联系 ZEGO 技术支持。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 影响范围：需要在登录房间后才能调用。
     *
     * Note: 相关回调：其他房间用户可以通过广播消息通知回调 IMRecvBroadcastMessage 来接收消息。
     *
     * @param roomID 房间 ID。
     * @param message 消息内容，长度不超过1024 字节。
     */
    sendBroadcastMessage(roomID: string, message: string): Promise<ZegoServerResponse>;
    /**
     * 发送自定义信令（消息可靠）
     *
     * Note: 支持版本：1.0.0 及以上。
     *
     * Note: 详情描述：向 roomID 对应的房间内指定用户发送自定义消息，消息保证可靠。
     *
     * Note: 业务场景：私聊个别用户。
     *
     * Note: 调用时机：登录房间成功之后。
     *
     * Note: 使用限制：关于此接口的使用限制，请参考 https://doc-zh.zego.im/article/7584 或联系 ZEGO 技术支持。
     *
     * Note: 安全性提醒：请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 影响范围：大部分接口都需要在登录房间后才能调用。
     *
     * Note: 相关回调：房间内用户可以通过监听自定义命令信令回调 IMRecvCustomCommand 来接收消息。
     *
     * @param roomID 房间 ID。
     * @param message 自定义消息内容，长度不超过 1024 字节。
     * @param toUserIDList 目标用户uerId 数组。
     */
    sendCustomCommand(roomID: string, message: string, toUserIDList: string[]): Promise<ZegoServerResponse>;
    /**
     * 设置房间附加消息
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：该功能可以设置一个以房间为单位的附加消息，该消息跟随整个房间的生命周期，每个登录到房间的用户都能够同步消息。
     *
     * Note: 业务场景：开发者可用于实现各种业务逻辑，如房间公告等等。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：登录房间成功之后。
     *
     * Note: 使用限制：关于此接口的使用限制，请参考 https://doc-zh.zego.im/article/7584 或 联系 ZEGO 技术支持。
     *
     * Note: 注意事项： 目前房间附加消息只允许设置一个键值对，且 key 最大长度为 10 字节，value 最大长度为 100 字节。
     *
     * Note: 安全性提醒:  请勿在此接口填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     *
     * Note: 影响范围：大部分接口都需要在登录房间后才能调用。
     *
     * Note: 相关回调：房间附加信息回调 roomExtraInfoUpdate。
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param roomID 房间 ID
     * @param key 附加消息键
     * @param value 附加消息值
     */
    setRoomExtraInfo(roomID: string, key: string, value: string): Promise<ZegoServerResponse>;
    /**
     * 日志高级配置
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：配置客户端打印日志级别和远端日志上传级别，日志是定位问题的重要手段。
     *
     * Note: 业务场景：在多数场景下，客户不用调用该接口，使用默认配置即可。
     *
     * Note: 默认值：本地日志和上传级别均为 info。
     *
     * Note: 调用时机：在初始化之后，其他任何接口之前调用。
     *
     * Note: 使用限制：无，但建议整个生命周期内只调用一次。
     *
     * Note: 注意事项：除非有明确的特殊需求，否则请勿调用该接口更改默认配置。
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：无
     *
     * @param config 日志相关高级配置
     *
     * @return 调用是否成功; 失败情况: 输入参数格式有误
     */
    setLogConfig(config: ZegoLogConfig): boolean;
    /**
     * 预先设置日志等级等配置。
     *
     * 支持版本：3.7.0
     *
     * 详情描述：支持在初始化 SDK 实例之前预先设置日志等级等配置。
     *
     * Note: 默认值：本地日志和上传级别均为 info。
     *
     * 调用时机：创建引擎实例之前调用。
     *
     * @param config 日志配置
     *
     * @return 调用是否成功; 失败情况: 输入参数格式有误
     */
    static presetLogConfig(config: ZegoLogConfig): boolean;
    /**
     * 错误日志信息 alert 提示，默认测试环境下都是开启状态
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：打开或关闭错误弹窗提示。
     *
     * Note: 业务场景：用于开发环节提示错误。
     *
     * Note: 默认值：测试环境默认值为 “true“， 可以手动关闭。
     *
     * Note: 调用时机：初始化后，立刻调用。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：建议保持默认行为，尽量不使用该接口。
     *
     * Note: 影响范围：所有 SDK 内部错误，都会弹框提示，中断整个进程。
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @param enable 是否打开 debug 模式;默认sdk会自动判断
     */
    setDebugVerbose(enable: boolean): void;
    /**
     * 注册回调事件
     *
     * Note: 支持版本：1.0.0 及以上。
     *
     * Note: 详情描述：用于处理 SDK 主动通知开发者回调的接口，通过注册不同 event 的事件，可以收到不同功能的回调。
     *
     * Note: 业务场景：通用接口，必选。
     *
     * Note: 调用时机：初始化之后，登录房间之前。
     *
     * Note: 注意事项：同样的事件可以注册多个，相同的注册事件，会根据注册的先后顺序依次触发。
     *
     * Note: 相关接口：调用接口 off 来注销对应回调事件处理。
     *
     * @param event 监听事件名。
     * @param callBack 回调函数。
     *
     * @return 注册是否成功。
     */
    on<K extends keyof ZegoRTMEvent>(event: K, callBack: ZegoRTMEvent[K]): boolean;
    /**
     * 获取当前SDK版本
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：需要查看当前版本时调用。
     *
     * Note: 业务场景：日志收集时建议使用。
     *
     * Note: 默认值：无
     *
     * Note: 调用时机：初始化后任意时机可调用。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：无
     *
     * Note: 影响范围：无
     *
     * Note: 相关回调：无
     *
     * Note: 相关接口：无
     *
     * Note: 平台差异：无
     *
     * @return 为 string 字符串，例如“1.0.0.标识”
     */
    getVersion(): string;
    /**
     * 删除注册过的回调事件
     *
     * Note: 支持版本：1.0.0
     *
     * Note: 详情描述：用于处理SDK主动通知开发者回调的接口，用于删除注册的同一类回调事件。
     *
     * Note: 业务场景：通用接口，必选。
     *
     * Note: 支默认值：无
     *
     * Note: 调用时机：初始化之后，登录房间之前。
     *
     * Note: 使用限制：无
     *
     * Note: 注意事项：同样的事件可以注册多个，的注册事件，会根据注册的先后顺序依次触发。
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
     * @param callBack? 回调函数，可选
     */
    off<K extends keyof ZegoRTMEvent>(event: K, callBack?: ZegoRTMEvent[K]): boolean;
    protected logger: ZegoLogger;
    protected dataReport: ZegoDataReport;
    protected reporter: ZReporter;
    zegoWebRTM: ZegoExpressWebRTM;
    /**
     * 初始化Engine
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
     * @param appID 用于区分不同客户和项目的唯一标识（必须是number类型）; 一个appID对应一个客户项目，不同端共有一个appID实现互通 ;一个客户可以申请多个appID,
     *              必须从即构控制台获取
     * @param server 表示SDK连接的即构服务器地址（支持备用域名）;SDK内的大多数功能由它交互 ; 同一个appID可以填写多个server; 必须从控制台获取
     * @param ENV 表示sdk 环境，rtc或是小程序
     */
    constructor(appID: number, server: string | string[], ENV?: number, options?: ZegoInitOptions);
    static use(module: any): void;
    static setGeoFence(geoFenceType: ZegoGeoFenceType, geoFenceAreaList: number[]): void;
    static setEngineOptions(options: any): void;
    /**
     * 设置云代理配置。
     *
     * Note: 支持版本：3.1.0
     *
     * Note: 详情描述：设置云代理配置。
     *
     * Note: 业务场景：处于如医院、政府、公司内部等有内网等限制性的网络环境下时，希望使用公有云 RTC 或 L3 服务。
     *
     * Note: 调用时机：在初始化实例之前调用。
     *
     * Note: 使用限制：该接口在初始化实例后不可再调用修改配置，避免产生非预期的错误。
     *
     * @param proxyList 代理服务器信息列表。
     * @param token 鉴权信息。
     * @param enable 是否开启代理。
     */
    static setCloudProxyConfig(proxyList: ZegoProxyInfo[], token: string, enable: boolean): void;
    static setLocalProxyConfig(proxyConfig: ZegoLocalProxyConfig, enable: boolean): void;
}
