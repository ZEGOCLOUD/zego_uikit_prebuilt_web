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
 * 日志配置选项
 *
 * Note: 支持版本：1.0.0
 *
 * Note: 废弃时间：无
 *
 */
export interface ZegoLogConfig {
    /**
     * 本地 log 级别,等级越高,打印日志越少
     */
    logLevel?: "debug" | "info" | "warn" | "error" | "report" | "disable";
    /**
     * 上报 log 级别，等级越高,上传日志越少
     */
    remoteLogLevel?: "debug" | "info" | "warn" | "error" | "disable";
    /**
     * 远程 log 服务器地址
     */
    logURL?: string;
}
export interface ZegoUser {
    /**
     * 请勿在此字段填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     * 用户 ID，最大 64 字节的字符串。仅支持数字，英文字符 和 '~', '!', '@', '#', '$', '', '^', '&', '*', '(', ')', '_', '+', '=', '-', ', ';', '’', ',', '.
     */
    userID: string;
    /**
     * 请勿在此字段填写用户敏感信息，包括但不限于手机号、身份证号、护照编号、真实姓名等。
     * 用户名,最大长度不超过 256 字节的字符串
     */
    userName?: string;
}
/**
 * 房间相关配置
 *
 */
export interface ZegoRoomConfig {
    /**
     * 设置 roomUserUpdate 是否回调，默认为 false 不回调
     */
    userUpdate?: boolean;
    /**
     * 房间最大用户数量，传 0 视为不限制，默认无限制; 只有第一个登录房间的用户设置生效
     */
    maxMemberCount?: number;
}
/**
 * 切换房间相关配置
 *
 */
export interface ZegoSwitchRoomConfig {
    /**
     * 登录验证 token，是通过在即构控制台注册项目获得密钥，加上指定算法获得。测试阶段可以通过 ZEGO 提供的接口获取，正式环境一定要用户自己实现。
     */
    token: string;
    /**
     * 房间最大用户数量，传 0 视为不限制，默认无限制; 只有第一个登录房间的用户设置生效
     */
    maxMemberCount?: number;
    /**
     * 设置 roomUserUpdate 是否回调，默认为 false 不回调
     */
    isUserStatusNotify?: boolean;
}
/**
 * 广播消息
 *
 */
export interface ZegoBroadcastMessageInfo {
    /**
     * 发送消息用户
     */
    fromUser: ZegoUser;
    /**
     * 消息内容
     */
    message: string;
    /**
     * 发送时间
     */
    sendTime: number;
    /**
     * 消息ID
     */
    messageID: number;
}
/**
 * 房间弹幕消息
 *
 */
export interface ZegoBarrageMessageInfo {
    /**
     * 发送消息用户
     */
    fromUser: ZegoUser;
    /**
     * 消息内容
     */
    message: string;
    /**
     * 发送时间
     */
    sendTime: number;
    /**
     * 消息ID
     */
    messageID: string;
}
export interface ZegoRoomExtraInfo {
    /**
     * 房间附加消息的键
     */
    key: string;
    /**
     * 房间附加消息的值
     */
    value: string;
    /**
     * 更新房间附加消息的用户
     */
    updateUser: ZegoUser;
    /**
     * 房间附加消息的更新时间
     */
    updateTime: number;
}
/**
 * 信令服务相关事件集合
 *
 * Note: 详情描述：描述事件名及其对应的回调参数。
 *
 * Note: 业务场景：用于约束注册事件接口 on 和注销事件接口 off 的参数。
 *
 */
export interface ZegoRTMEvent {
    /**
     * 当房间用户发生变化时触发的回调
     */
    roomUserUpdate: RoomUserUpdateCallBack;
    /**
     * 房间和服务器之间的连接状态发生变化时触发的回调
     */
    roomStateUpdate: RoomStateUpdateCallBack;
    /**
     * 房间内人数发生改变时触发
     */
    roomOnlineUserCountUpdate: RoomOnlineUserCountUpdateCallBack;
    /**
     * 房间消息通知
     */
    IMRecvBroadcastMessage: IMRecvBroadcastMessageCallBack;
    /**
     * 房间弹幕消息通知
     */
    IMRecvBarrageMessage: IMRecvBarrageMessageCallBack;
    /**
     * 自定义信令通知
     */
    IMRecvCustomCommand: IMRecvCustomCommandCallBack;
    /**
     * 监听房间附加消息通知
     */
    roomExtraInfoUpdate: roomExtraInfoUpdateCallBack;
    /**
     * token 过期时间少于30s时会触发
     */
    tokenWillExpire: tokenWillExpireCallBack;
    hallStateUpdate: HallStateUpdateCallBack;
    roomStateChanged: RoomStateChangedCallBack;
}
/**
 * 房间用户变化回调
 *
 * Note: 详情描述：当前登录的房间,如果用户发生新增,删除等,触发回调通知当前用户
 *
 * Note: 触发条件：其他用户登录,退出时触发
 *
 * Note: 限制频率：无
 *
 * Note: 关注回调：无
 *
 * Note: 重点提示：触发前提是登录时,设置了关注用户变化，即 loginRoom 的参数 config 的 userUpdate 设置为 true
 *
 * Note: 支持版本：1.0.0
 *
 * Note: 废弃时间：无
 *
 * @param roomID 发生用户变化房间的ID
 * @param updateType 用户行为，DELETE 表示离开，ADD 表示进入
 * @param userList 发生变化用户的具体信息
 */
type RoomUserUpdateCallBack = (roomID: string, updateType: "DELETE" | "ADD", userList: ZegoUser[]) => void;
/**
 * 房间状态更新回调
 *
 * Note: 详情描述：房间连接状态回调，state 分别为'DISCONNECTED'，'CONNECTING'，'CONNECTED'
 *
 * Note: 触发条件：在断开连接，重试连接及重连成功时触发
 *
 * Note: 限制频率：无
 *
 * Note: 重点提示：登录前注册才会收到回调
 *
 * Note: 支持版本：1.0.0
 *
 * Note: 废弃时间：无
 *
 * @param roomID 房间ID
 * @param state DISCONNECTED: 房间和服务期断开,并重试后仍旧失败
 *              CONNECTING:  断开并开始重连
 *              CONNECTED: 重连成功
 * @param errorCode 断开时候的具体错误码
 * @param extendedData 扩展信息
 */
type RoomStateUpdateCallBack = (roomID: string, state: "DISCONNECTED" | "CONNECTING" | "CONNECTED", errorCode: number, extendedData: string) => void;
/**
 * 房间内当前在线用户数量回调
 *
 * Note: 详情描述：回调当前房间内的在线人数
 *
 * Note: 触发条件：其他用户登录,退出时触发
 *
 * Note: 限制频率：每 30 秒回调一次
 *
 * Note: 重点提示：无
 *
 * Note: 支持版本：1.11.0
 *
 * Note: 废弃时间：无
 *
 * @param roomID 发生用户变化房间的ID
 * @param count 当前在线用户数量
 */
type RoomOnlineUserCountUpdateCallBack = (roomID: string, count: number) => void;
/**
 * 房间消息通知
 *
 * @param roomID 房间ID
 * @param chatData 房间消息信息
 */
type IMRecvBroadcastMessageCallBack = (roomID: string, chatData: ZegoBroadcastMessageInfo[]) => void;
/**
 * 房间弹幕消息通知
 *
 * @param roomID 房间ID
 * @param messageInfo 弹幕消息信息
 */
type IMRecvBarrageMessageCallBack = (roomID: string, messageInfo: ZegoBarrageMessageInfo[]) => void;
/**
 * 自定义信令通知
 *
 * @param roomID 房间ID
 * @param fromUser 发送消息用户信息
 * @param command 收到的自定义消息
 */
type IMRecvCustomCommandCallBack = (roomID: string, fromUser: ZegoUser, command: string) => void;
/**
 * 房间额外消息更新回调
 *
 * @param roomID 房间ID
 * @param roomExtraInfoList 房间附加消息数组
 */
type roomExtraInfoUpdateCallBack = (roomID: string, roomExtraInfoList: ZegoRoomExtraInfo[]) => void;
/**
 * @param roomID 房间ID
 * @param state DISCONNECTED: 房间和服务期断开,并重试后仍旧失败
 *              CONNECTING:  断开并开始重连
 *              CONNECTED: 重连成功
 * @param errorCode 断开时候的具体错误码
 * @param extendedData 扩展信息
 */
type HallStateUpdateCallBack = (state: "DISCONNECTED" | "CONNECTING" | "CONNECTED", errorCode: number, extendedData: string) => void;
/**
 * token将要过期回调
 *
 * Note: 详情描述：token 将要过期通知, 收到通知后请主动调用renewToken更新token
 *
 * Note: 触发条件：token 中包含过期时间前30s触发该回调
 *
 * Note: 限制频率：无
 *
 * Note: 关注接口：renewToken
 *
 * Note: 重点提示：token过期时间取自token, 请确保生成token的服务器时间准确
 *
 * Note: 支持版本：2.6.0
 *
 * Note: 废弃时间：无
 *
 * @param roomID token将要过期房间的ID
 */
type tokenWillExpireCallBack = (roomID: string) => void;
/**
 * 房间状态变化更新回调
 *
 * Note: 详情描述：房间连接状态回调，state 分别为'LOGINING'，'LOGINED'，'LOGIN_FAILED' ，'RECONNECTING'，'RECONNECTED'，'RECONNECT_FAILED'，'KICKOUT'，'LOGOUT'，'LOGOUT_FAILED'
 *
 * Note: 触发条件：在断开连接，重试连接及重连成功时触发
 *
 * Note: 限制频率：无
 *
 * Note: 重点提示：登录前注册才会收到回调
 *
 * Note: 支持版本：2.16.0
 *
 * Note: 废弃时间：无
 *
 * @param roomID 房间ID
 * @param reason 房间状态改变原因
 * @param errorCode 断开时候的具体错误码
 * @param extendedData 扩展信息
 */
type RoomStateChangedCallBack = (roomID: string, reason: ZegoRoomStateChangedReason, errorCode: number, extendedData: string) => void;
export interface ZegoError {
    code: number | string;
    msg: string;
}
interface ReporterData {
    version?: string;
    project?: string;
}
/**
 * 初始化相关配置
 *
 */
export interface ZegoInitOptions {
    /**
     * 统一接入domain
     */
    /**
     * 地理围栏类型
     */
    geoFenceType?: number;
    /**
     * 地理围栏 id 列表
     */
    geoFenceAreaList?: number[];
    reportData?: ReporterData;
    prefixDomain?: string;
}
export interface ZegoInitConfig {
    deviceID: string;
    deviceType: string;
    anType: 0 | 1;
    userUpdate?: boolean;
    roomFlag?: boolean;
    testEnvironment?: boolean;
}
export declare enum ZegoRoomStateChangedReason {
    Logining = "LOGINING",
    Logined = "LOGINED",
    LoginFailed = "LOGIN_FAILED",
    Reconnecting = "RECONNECTING",
    Reconnected = "RECONNECTED",
    ReconnectFailed = "RECONNECT_FAILED",
    Kickout = "KICKOUT",
    Logout = "LOGOUT",
    LogoutFailed = "LOGOUT_FAILED"
}
/**
 * 代理信息。
 *
 * Note: 详情描述: 配置代理信息。
 *
 */
export interface ZegoProxyInfo {
    /**
     * 域名。云代理下：由 ZEGO 提供的代理域名。
     */
    hostName: string;
    /**
     * 代理服务端口号。
     */
    port?: number;
}
export {};
