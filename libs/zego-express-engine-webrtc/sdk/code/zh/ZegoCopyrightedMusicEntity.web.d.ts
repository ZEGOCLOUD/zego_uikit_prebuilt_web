import type { ZegoUser } from "../zh/ZegoExpressEntity.rtm";
import type ZegoLocalStream from "./ZegoLocalStream.web";
/**
 * 版权音乐配置。
 *
 */
export interface ZegoCopyrightedMusicConfig {
    /**
     * 用户对象实例，配置用户 ID、用户名。 注意此处设置的用户 ID 需要与登录房间时设置的用户 ID 保持一致，否则会出现请求版权音乐后台服务失败的情况。
     */
    user: ZegoUser;
}
/**
 * 音乐资源类型。用于 [ZegoCopyrightedMusicRequestConfig] 配置。
 *
 */
export declare enum ZegoCopyrightedMusicResourceType {
    /**
     * 原曲。
     */
    Song = 0,
    /**
     * 伴奏。
     */
    Accompaniment = 1,
    /**
     * 高潮片段。
     */
    AccompanimentClip = 2,
    /**
     * 抢唱片段。
     */
    AccompanimentSegment = 3
}
/**
 * 点歌计费模式。
 *
 */
export declare enum ZegoCopyrightedMusicBillingMode {
    /**
     * 按次计费。用户每获取一次歌曲资源都需要计一次费用，即根据实际调用获取歌曲资源接口（如 [requestResource] 接口）传参为按次的用户进行收费。
     */
    Count = 0,
    /**
     * 按用户包月计费。按月维度向单个用户计费，即统计调用获取歌曲资源传参为按用户包月的用户 ID，按月维度进行收费。
     */
    User = 1,
    /**
     * 按房间包月计费。按月维度向房间用户计费，即统计调用获取歌曲资源传参为按房间包月的 roomID，按月维度进行收费。
     */
    Room = 2,
    /**
     * 按房主包月计费。用户每获取一次资源，都计为房主获取资源，即根据实际调用获取歌曲资源接口传参为房间的 roomID、masterID，按房主进行收费。
     */
    Master = 3
}
/**
 * 版权方。版权方的详细信息，请联系 ZEGO 商务人员咨询。
 *
 */
export declare enum ZegoCopyrightedMusicVendorID {
    /**
     * 默认版权方。
     */
    VendorDefault = 0,
    /**
     * 版权方1。
     */
    Vendor1 = 1,
    /**
     * 版权方2。
     */
    Vendor2 = 2,
    /**
     * 版权方3。
     */
    Vendor3 = 4
}
/**
 * 下载歌曲返回结果。
 *
 */
export interface ZegoCopyrightedMusicDownloadResponse {
    /**
     * 错误码，详情请参考 常见错误码文档。
     */
    errorCode: number;
    /**
     * 歌曲链接列表，如果下载的是伴奏，第一个链接是伴奏，第二个是原曲。
     */
    urls: string[];
}
/**
 * 获取 krc 格式歌词完成回调。
 *
 */
export interface ZegoCopyrightedMusicGetKrcLyricByTokenResponse {
    /**
     * 错误码，详情请参考 常见错误码文档。
     */
    errorCode: number;
    /**
     * lrc 格式歌词，专用于逐行格式歌词场景，详情请参考 https://doc-zh.zego.im/article/15563。
     */
    lyrics: any;
}
/**
 * 获取 lrc 格式歌词完成回调结果。
 *
 */
export interface ZegoCopyrightedMusicGetLrcLyricResponse {
    /**
     * 错误码，详情请参考 常见错误码文档。
     */
    errorCode: number;
    /**
     * lrc 格式歌词，专用于逐行格式歌词场景，详情请参考 https://doc-zh.zego.im/article/15563。
     */
    lyrics: any;
}
/**
 * 获取资源的配置。
 *
 */
export interface ZegoCopyrightedMusicRequestConfig {
    /**
     *  歌曲 ID。
     */
    songID: string;
    /**
     * 版权方。
     */
    vendorID: ZegoCopyrightedMusicVendorID;
    /**
     * 计费模式。
     */
    mode: ZegoCopyrightedMusicBillingMode;
    /**
     * 房主 ID, 当计费模式为按房主计费时必传。指明按哪个房主进行点歌/点伴奏/高潮片段。
     */
    masterID?: string;
    /**
     * 场景 ID, 指明实际业务，详情可咨询 ZEGO 技术支持。
     */
    sceneID?: number;
}
export interface ZegoCopyrightedMusicRequestSharedResourceByTokenConfig {
    /**
     * 分享歌曲 token
     */
    shareToken: string;
    /**
     * 计费模式。当歌曲版权方 vendorID 为 1 时必传。
     */
    mode?: ZegoCopyrightedMusicBillingMode;
    /**
     * 房主 ID, 当计费模式为按房主计费时必传。指明按哪个房主进行点歌/点伴奏/高潮片段。
     */
    masterID?: string;
    /**
     * 场景 ID, 指明实际业务，详情可咨询 ZEGO 技术支持。
     */
    sceneID?: number;
}
/**
 * 获取标准音高线数据完成回调结果。
 *
 */
export interface ZegoCopyrightedMusicGetStandardPitchResponse {
    /**
     * 错误码，详情请参考 常见错误码文档。
     */
    errorCode: number;
    /**
     * 标准音高线数据。详情请参考 Android：https://doc-zh.zego.im/article/15148, iOS：https://doc-zh.zego.im/article/15147
     */
    pitch: any;
}
/**
 * 获取资源的结果。
 *
 */
export interface ZegoCopyrightedMusicRequestResourceResponse {
    /**
     * 错误码，详情请参考 常见错误码文档。
     */
    errorCode: number;
    /**
     * 点歌服务返回的 JSON，包含歌曲资源信息，详细请参考 https://doc-zh.zego.im/article/15563#1_1。
     */
    resource: any;
}
/**
 * 扩展请求结果。
 *
 */
export interface ZegoCopyrightedMusicSendExtendedRequestResponse {
    /**
     * 错误码，详情请参考 常见错误码文档。
     */
    errorCode: number;
    result: any;
}
/**
 * 开始打分相关参数。
 *
 */
export interface ZegoStartScoreParams {
    /**
     * 伴奏或高潮片段对应的资源 ID。
     */
    resourceID: string;
    /**
     * 采集麦克风声音的媒体流对象。
     */
    localStream: MediaStream | ZegoLocalStream;
    /**
     * 播放伴奏的 h5 播放器。
     */
    player: HTMLMediaElement;
    /**
     * 开启每行打分完成回调。
     */
    enableSongLineScoreCompleteEvent?: boolean;
}
/**
 * 版权音乐功能相关事件集合。
 *
 * Note: 详情描述：描述事件名及其对应的回调参数。
 *
 * Note: 业务场景：用于约束注册事件接口 on 和注销事件接口 off 的参数。
 *
 */
export interface ZegoCopyrightedMusicEvent {
    /**
     * 麦克风状态更新事件。
     */
    downloadProgressUpdate: DownloadProgressUpdateCallBack;
    songLineScoreComplete: SongLineScoreCompleteCallBack;
}
/**
 * 歌曲每行打分完成信息。
 *
 */
export interface ZegoSongLineScoreInfo {
    /**
     * 行的索引。
     */
    lineIndex: number;
    /**
     * 打分完成这一句分数。
     */
    previousScore: number;
    /**
     * 平均分。
     */
    averageScore: number;
    /**
     * 总分。
     */
    totalScore: number;
}
/**
 * 详情描述：加载歌曲或伴奏进度回调。
 *
 * @param resourceID 歌曲资源 ID。
 * @param progressRate 加载进度，取值范围 [0,1]。
 */
type DownloadProgressUpdateCallBack = (resourceID: string, progressRate: number) => void;
/**
 * 详情描述：歌曲每行打分完成回调。
 *
 * @param LineScoreInfo 歌曲每行回调，包含这一行结束时的分数、平均分、总分。
 */
type SongLineScoreCompleteCallBack = (LineScoreInfo: ZegoSongLineScoreInfo) => void;
export {};
