import { ZegoDataChannelEvent } from "./ZegoExpressEntity.web";
/**
 * 实时有序数据对象
 *
 * 实时有序数据，依托于 ZEGO RTC 服务，可为开发者提供 实时、有序、高频 的数据传输与分发功能
 *
 */
export declare class ZegoRealTimeSequentialDataManager {
    private _roomID;
    private _zgp_dataChannelListener;
    constructor(zegoWebRTC: any, _roomID: string);
    reset(): void;
    get roomID(): string;
    /**
     * 开始广播
     *
     * Note: 支持版本：2.12.2 及以上
     *
     * Note: 详情描述： 开始广播名为 streamID 的实时有序数据通道。
     *
     * Note: 业务场景：远程控制场景中由控制端发送指令到受控端。
     *
     * Note: 注意事项:  可复用 RTC 推流通道。
     *
     * Note: 调用时机：调用接口 createRealTimeSequentialDataManager 创建 ZegoRealTimeSequentialDataManager实例后。
     *
     * @param streamID 推流 ID，长度不超过256的字符串，仅支持数字，英文字符 和 '~', '!', '@', '#', '$', '', '^', '&', '*', '(', ')', '_', '+', '=', '-', ', ';', '’', ',', '.', '<', '>', '/', ''
     *
     * @return true 表示客户端发送请求成功，流成功推送到服务器需要通过流状态回调接口判断。
     */
    startBroadcasting(streamID: string): Promise<boolean>;
    /**
     * 停止广播
     *
     * Note: 支持版本：2.12.2 及以上
     *
     * Note: 详情描述：停止广播 名为 streamID 的实时有序数据通道。
     *
     * Note: 业务场景：远程控制场景控制端停止传输指令到受控端。
     *
     * Note: 注意事项:  在复用 RTC 通道的情况下，停止实时有序数据的广播不会影响 RTC 通道。
     *
     * Note: 调用时机：调用接口 createRealTimeSequentialDataManager 创建 ZegoRealTimeSequentialDataManager实例后。
     *
     * @param streamID 推流 ID,和广播 streamID保持一致
     *
     * @return 布尔值
     */
    stopBroadcasting(streamID: string): boolean;
    /**
     * 发送实时有序数据
     *
     * Note: 支持版本：2.12.2 及以上
     *
     * Note: 详情描述：发送 实时有序数据。
     *
     * Note: 业务场景：远程控制场景中由控制端发送指令到受控端。
     *
     * Note: 注意事项:  在弱网下数据可能存在丢失。
     *
     * Note: 调用时机：调用接口 createRealTimeSequentialDataManager 创建 ZegoRealTimeSequentialDataManager实例后，并调用 startBroadcasting 进行广播后。
     *
     * @param streamID 流 ID
     * @param data 数据
     *
     * @return 布尔值
     */
    sendRealTimeSequentialData(streamID: string, data: ArrayBuffer): boolean;
    /**
     * 开始订阅
     *
     * Note: 支持版本：2.12.2 及以上
     *
     * Note: 详情描述：开始订阅通道为 streamID 的实时有序数据频道。
     *
     * Note: 业务场景：远程控制场景中，受控端从控制端接收指令。
     *
     * Note: 注意事项:  可复用 RTC 推流通道。
     *
     * Note: 调用时机：调用接口 createRealTimeSequentialDataManager 创建 ZegoRealTimeSequentialDataManager实例后。
     *
     * @param streamID 流 ID
     *
     * @return 布尔值
     */
    startSubscribing(streamID: string): Promise<boolean>;
    /**
     * 停止订阅
     *
     * Note: 支持版本：2.12.2 及以上
     *
     * Note: 详情描述：停止订阅名为 streamID 的实时有序数据频道。
     *
     * Note: 业务场景：远程控制场景中，受控端停止从控制端接收指令。
     *
     * Note: 注意事项:  在复用 RTC 通道的情况下，停止实时有序数据的广播不会影响 RTC 通道。
     *
     * Note: 调用时机：调用接口 createRealTimeSequentialDataManager 创建 ZegoRealTimeSequentialDataManager实例后。
     *
     * @param streamID 流 ID
     *
     * @return 布尔值
     */
    stopSubscribing(streamID: string): boolean;
    /**
     * 注册回调事件。
     *
     * Note: 支持版本：2.12.2 及以上
     *
     * Note: 详情描述：用于处理 SDK 主动通知开发者回调的接口，通过注册不同 event 的事件，可以收到不同功能的回调。可监听的事件回调可以通过 ZegoDataChannelEvent查看。
     *
     * Note: 业务场景：用于注册实时有序数据功能相关的业务事件的回调处理。
     *
     * Note: 调用时机：调用接口 createRealTimeSequentialDataManager 创建实例之后。
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
    on<K extends keyof ZegoDataChannelEvent>(event: K, callBack: ZegoDataChannelEvent[K]): void;
    /**
     * 注销回调事件。
     *
     * Note: 支持版本：2.12.2 及以上
     *
     * Note: 详情描述：用于处理 SDK 主动通知开发者回调的接口，通过注册不同 event 的事件，可以收到不同功能的回调。可监听的事件回调可以通过 ZegoDataChannelEvent查看。
     *
     * Note: 业务场景：用于注销实时有序数据功能相关的业务事件的回调处理。
     *
     * Note: 调用时机：调用接口 createRealTimeSequentialDataManager 创建实例之后。
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
    off<K extends keyof ZegoDataChannelEvent>(event: K, callBack: ZegoDataChannelEvent[K]): void;
}
