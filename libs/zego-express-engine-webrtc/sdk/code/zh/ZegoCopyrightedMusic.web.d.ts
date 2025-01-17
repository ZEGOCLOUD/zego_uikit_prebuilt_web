import { ZegoCopyrightedMusicVendorID, ZegoCopyrightedMusicConfig, ZegoCopyrightedMusicSendExtendedRequestResponse, ZegoCopyrightedMusicRequestConfig, ZegoCopyrightedMusicResourceType, ZegoCopyrightedMusicRequestResourceResponse, ZegoCopyrightedMusicGetLrcLyricResponse, ZegoCopyrightedMusicDownloadResponse, ZegoCopyrightedMusicGetKrcLyricByTokenResponse, ZegoCopyrightedMusicGetStandardPitchResponse, ZegoStartScoreParams, ZegoCopyrightedMusicEvent, ZegoCopyrightedMusicRequestSharedResourceByTokenConfig } from "./ZegoCopyrightedMusicEntity.web";
/**
 * 版权音乐
 *
 * 详情描述: 常用于 KTV 唱歌场景中，用户可通过创建版权音乐实例对象使用正版音乐相关功能。
 *
 */
export declare class ZegoCopyrightedMusic {
    private static instance;
    private zcm;
    private constructor();
    /**
     * @param engine -
     */
    static getInstance(engine: any): ZegoCopyrightedMusic;
    destroyInstance(): void;
    /**
     * 初始化版权音乐模块。
     *
     * 支持版本：2.24.5 及以上
     *
     * 详情描述：初始化版权音乐，以便后续使用版权音乐的功能。
     *
     * 调用时机：在引擎实例调用登录房间[loginRoom] 之后。
     *
     * 注意事项：必须传入真实用户信息，否则无法获取歌曲资源进行播放。2. 初始化版权音乐时设置的用户 ID 和用户名需要和登录房间时设置的用户 ID 和用户名一致。
     *
     * @param config 版权音乐配置。
     *
     * @return 错误码，详情请参考 常见错误码文档。 https://doc-zh.zego.im/zh/4381.html
     */
    initCopyrightedMusic(config: ZegoCopyrightedMusicConfig): Promise<number>;
    /**
     * 发送扩展功能请求。
     *
     * 支持版本：2.24.5 及以上。
     *
     * 详情描述：发送扩展功能请求，访问版权歌曲库获取相关歌单、榜单歌曲信息。
     *
     * 业务场景：用于获取歌曲列表。
     *
     * 调用时机：在初始化版权音乐 [initCopyrightedMusic] 成功之后。
     *
     * @param command 请求命令，具体支持的命令请参考 https://doc-zh.zego.im/article/17419。
     * @param params 请求参数，每个请求命令具备对应的请求参数，请参考 https://doc-zh.zego.im/article/17419。
     *
     * @return Promise 异步返回请求结果。
     */
    sendExtendedRequest(command: string, params: any): Promise<ZegoCopyrightedMusicSendExtendedRequestResponse>;
    /**
     * 获取音乐资源。
     *
     * 支持版本：2.24.5 及以上。
     *
     * 详情描述：可以获取到歌曲的基本信息（时长、歌名、歌手等），以及最重要的可以用于本地播放的资源 id，还有相关的一些鉴权信息。
     *
     * 业务场景：获取版权歌曲，用于本地播放与分享。
     *
     * 相关接口：房间内某个用户调用此接口获取某音乐资源成功后，房间内其他用户可以调用[getSharedResource] 接口免费获取一次该音乐资源。
     *
     * 调用时机：在初始化版权音乐 [initCopyrightedMusic] 之后。
     *
     * 注意事项：该接口会触发计费。每个资源有唯一的资源 ID。
     *
     * @param config 获取分享歌曲资源的配置。
     * @param type 版权音乐资源类型。0 为普通歌曲，1 为伴奏，2 为高潮片段。
     *
     * @return Promise 异步返回请求结果。
     */
    requestResource(config: ZegoCopyrightedMusicRequestConfig, type: ZegoCopyrightedMusicResourceType): Promise<ZegoCopyrightedMusicRequestResourceResponse>;
    /**
     * 获取分享歌曲资源。
     *
     * 支持版本：2.24.5 及以上。
     *
     * 详情描述：可以获取到歌曲的基本信息（时长、歌名、歌手等），以及最重要的可以用于本地播放的资源 id，还有相关的一些鉴权信息。
     *
     * 业务场景：获取版权歌曲，用于本地播放。
     *
     * 相关接口：房间内某个用户调用 [requestResource] 接口获取某音乐资源成功后，房间内其他用户可以调用此接口免费获取一次该音乐资源。
     *
     * 调用时机：在初始化版权音乐 [initCopyrightedMusic] 之后。
     *
     * 注意事项：每个资源有唯一的资源 ID。
     *
     * @param config 获取分享歌曲资源的配置。
     * @param type 版权音乐资源类型。0 为普通歌曲，1 为伴奏，2 为高潮片段。
     *
     * @return Promise 异步返回请求结果。
     */
    getSharedResource(config: ZegoCopyrightedMusicRequestConfig, type: ZegoCopyrightedMusicResourceType): Promise<ZegoCopyrightedMusicRequestResourceResponse>;
    getSharedResourceByToken(config: ZegoCopyrightedMusicRequestSharedResourceByTokenConfig): Promise<ZegoCopyrightedMusicRequestResourceResponse>;
    /**
     * 获取 lrc 格式歌词。
     *
     * 支持版本：2.24.5 及以上。
     *
     * 详情描述：获取 lrc 格式歌词，支持逐行解析歌词。
     *
     * 业务场景：用于逐行显示歌词。
     *
     * 调用时机：在初始化版权音乐 [initCopyrightedMusic] 成功之后。
     *
     * @param songID 歌曲或伴奏的 ID，一首歌的歌曲和伴奏共用同一个 ID。
     * @param vendorID 版权方。
     *
     * @return Promise 异步返回 lrc 格式歌词结果。
     */
    getLrcLyric(songID: string, vendorID: ZegoCopyrightedMusicVendorID): Promise<ZegoCopyrightedMusicGetLrcLyricResponse>;
    /**
     * 获取 krc 格式歌词。
     *
     * 支持版本：2.24.5 及以上。
     *
     * 详情描述: 获取 krc 格式歌词，支持逐字解析歌词。
     *
     * 业务场景: 用于逐字显示歌词。
     *
     * 调用时机: 在初始化版权音乐 [initCopyrightedMusic] 成功之后。
     *
     * @param krcToken 通过获取音乐资源 [requestResource] 中获取的 krcToken。详情请参考歌词资源接口说明 https://doc-zh.zego.im/article/15563#2_2。
     *
     * @return Promise 异步返回请求结果。
     */
    getKrcLyricByToken(krcToken: string): Promise<ZegoCopyrightedMusicGetKrcLyricByTokenResponse>;
    /**
     * 下载歌曲或伴奏。
     *
     * 支持版本：2.24.5 及以上。
     *
     * 详情描述：下载歌曲或伴奏，下载成功后才能进行播放。
     *
     * 业务场景：获取版权歌曲或伴奏授权后，利用本接口加载对应的歌曲或伴奏资源。
     *
     * 调用时机：在调用获取资源接口 [requestResource] 或 [getSharedResource] 获取到 resourceID 成功之后。
     *
     * 注意事项: 加载歌曲或伴奏资源受网络影响。
     *
     * @param resourceID 歌曲或伴奏对应的资源 ID。
     *
     * @return Promise 异步返回请求结果。
     */
    download(resourceID: string): Promise<ZegoCopyrightedMusicDownloadResponse>;
    /**
     * 清除歌曲缓存。
     *
     * 支持版本：2.24.5 及以上。
     *
     * 详情描述：在使用本模块时，可能产生一些缓存文件，可以通过本接口进行清除。
     *
     * 业务场景：用于歌曲的缓存。
     *
     * 调用时机：在创建版权音乐 [createCopyrightedMusic] 之后。
     */
    clearCache(): void;
    /**
     * 开始评分。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：开始评分接口，需要指定采集麦克风的媒体流、歌曲播放器、歌曲资源的 resourceID， SDK 根据这些信息进行开启打分任务。
     *
     * 业务场景：可以用于在视图上显示唱歌评分。
     *
     * 调用时机：在获取到 krc 逐字歌词并播放版权音乐的伴奏资源之后可调用。
     *
     * 相关接口:  stopScore 结束打分接口，用于结束打分任务。每次只能进行一个打分任务，需要先结束当前任务才能进行下一个。
     *
     * @param params 开始打分任务相关参数。
     *
     * @return 异步返回调用结果状态码，0 为调用正常。
     */
    startScore(params: ZegoStartScoreParams): Promise<number>;
    /**
     * 开始评分。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：结束当前评分，将停止 [OnCurrentPitchValueUpdate] 回调，但依然可以正常获取平均分或总分。
     *
     * 业务场景：正在评分时可调用此接口结束评分。
     *
     * 调用时机：正在评分时可调用。
     *
     * 相关接口:  开始打分接口 startScore 。
     *
     * @param resourceID 伴奏或高潮片段对应的资源 ID。
     *
     * @return 状态码，0 表示调用正常。
     */
    stopScore(resourceID: string): number;
    /**
     * 暂停评分。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：暂停正在进行的评分。
     *
     * 业务场景：演唱过程中需要休停时调用。
     *
     * 调用时机：调开始评分接口 startScore 之后。
     *
     * 相关接口:   恢复打分接口 resumeScore 。
     *
     * @param resourceID 伴奏或高潮片段对应的资源 ID。
     *
     * @return 状态码，0 表示调用正常。
     */
    pauseScore(resourceID: string): number;
    /**
     * 恢复评分。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：恢复当前暂停的评分。
     *
     * 业务场景：演唱过程中需要休停后恢复继续演唱和评分。
     *
     * 调用时机：调开始评分接口 startScore 并暂停评分之后。
     *
     * 相关接口:   暂停评分接口 pauseScore 。
     *
     * @param resourceID 伴奏或高潮片段对应的资源 ID。
     *
     * @return 状态码，0 表示调用正常。
     */
    resumeScore(resourceID: string): number;
    /**
     * 恢复评分。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：重置掉本次评分任务已经打的分。
     *
     * 业务场景：本次评分任务演唱了部分但想要重头开始唱并重新评分。
     *
     * 调用时机：调开始评分接口 startScore 之后。
     *
     * @param resourceID 伴奏或高潮片段对应的资源 ID。
     *
     * @return 状态码，0 表示调用正常。
     */
    resetScore(resourceID: string): number;
    /**
     * 获取上一句的评分。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：返回值是获取上一句的评分。
     *
     * 业务场景：可以用于在视图上显示每一句的评分。
     *
     * 调用时机：在播放版权伴奏或高潮片段，并开始打分后可调用。
     *
     * @param resourceID 伴奏或高潮片段对应的资源 ID。
     *
     * @return 返回值是获取上一句的评分。
     */
    getPreviousScore(resourceID: string): Promise<number>;
    /**
     * 获取平均评分。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：获取平均评分。
     *
     * 业务场景：可以用于在视图上显示平均评分。
     *
     * 调用时机：在播放版权伴奏或高潮片段，并开始打分后可调用。
     *
     * @param resourceID 伴奏或高潮片段对应的资源 ID。
     *
     * @return 返回平均评分。
     */
    getAverageScore(resourceID: string): Promise<number>;
    /**
     * 获取总评分。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：获取总评分。
     *
     * 业务场景：可以用于在视图上显示总评分。
     *
     * 调用时机：在播放版权伴奏或高潮片段，并开始打分后可调用。
     *
     * @param resourceID 伴奏或高潮片段对应的资源 ID。
     *
     * @return 返回分数。
     */
    getTotalScore(resourceID: string): Promise<number>;
    /**
     * 获取满分。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：获取满分。
     *
     * 业务场景：可以用于在视图上显示满分。
     *
     * 调用时机：在播放版权伴奏或高潮片段，并开始打分后可调用。
     *
     * @param resourceID 伴奏或高潮片段对应的资源 ID。
     *
     * @return 返回分数。
     */
    getFullScore(resourceID: string): Promise<number>;
    /**
     * 获取标准音高数据。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：获取标准音高数据。
     *
     * 业务场景：可以用于在视图上显示标准音高线。
     *
     * 调用时机：调 requestResource 请求到对应版权伴奏或高潮片段后可调用。
     *
     * 注意事项：只有伴奏或高潮片段资源才有音高线。
     *
     * @param resourceID 伴奏或高潮片段对应的资源 ID。
     *
     * @return 返回标准音高数据结果。
     */
    getStandardPitch(resourceID: string): Promise<ZegoCopyrightedMusicGetStandardPitchResponse>;
    /**
     * 获取实时音高数据。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：获取实时音高数据。
     *
     * 业务场景：可以用于在视图上显示音高浮标位置。
     *
     * 调用时机：在播放版权伴奏或高潮片段，并开始打分后可调用。
     *
     * @param resourceID 伴奏或高潮片段对应的资源 ID。
     *
     * @return 返回实时音高数值。
     */
    getCurrentPitch(resourceID: string): Promise<number>;
    /**
     * 设置打分难度级别。
     *
     * 支持版本：2.26.0 及以上。
     *
     * 详情描述：用户可以通过该接口设置评分难度级别。
     *
     * 默认值：未调用该函数时，打分难度级别默认是 4，难度最低的级别。
     *
     * 调用时机：调用初始化版权音乐成功后，调用 [startScore] 开始打分前。
     *
     * @param level 打分难度级别。level 取值范围 0 ~ 4。打分难度由 0 到 4 逐级递减。
     */
    setScoringLevel(level: number): void;
    on<k extends keyof ZegoCopyrightedMusicEvent>(event: k, callBack: ZegoCopyrightedMusicEvent[k]): boolean;
    off<k extends keyof ZegoCopyrightedMusicEvent>(event: k, callBack?: ZegoCopyrightedMusicEvent[k]): boolean;
}
