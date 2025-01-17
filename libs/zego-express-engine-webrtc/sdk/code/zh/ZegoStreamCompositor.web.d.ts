import ZegoLocalStream from "./ZegoLocalStream.web";
import { ZegoStreamCompositorInputOption, ZegoStreamCompositorOutputConfig } from "./ZegoStreamCompositorEntity.web";
/**
 * 导播台
 *
 */
export declare class ZegoStreamCompositor {
    private _zgp_compositor;
    constructor(compositor: any);
    /**
     * 创建导播台的图片输入图层
     *
     * Note: 支持版本：3.0.0 及以上
     *
     * Note: 详情描述：创建导播台的图片输入图层。
     *
     * Note: 业务场景：设置图片在输出画布上的显示。
     *
     * Note: 调用时机：创建导播台 ZegoStreamCompositor 后。
     *
     * @param img 输入的 image
     * @param option 输入图层的属性
     */
    addImage(img: HTMLImageElement, option: ZegoStreamCompositorInputOption): void;
    /**
     * 删除导播台的图片输入图层
     *
     * Note: 支持版本：3.0.0 及以上
     *
     * Note: 详情描述：删除导播台的图片输入图层。
     *
     * Note: 业务场景：删除图片在输出画布上的显示。
     *
     * Note: 调用时机：创建导播台的图片输入图层后。
     *
     * @param img 输入的 image
     */
    removeImage(img: HTMLImageElement): void;
    /**
     * 创建导播台的输入图层
     *
     * Note: 支持版本：3.0.0 及以上
     *
     * Note: 详情描述：创建导播台的输入图层。
     *
     * Note: 业务场景：设置输入流在输出画布上的显示。
     *
     * Note: 调用时机：创建导播台 ZegoStreamCompositor 后。
     *
     * @param stream 输入的 MediaStream
     * @param option 输入图层的属性
     */
    setInputEndpoint(stream: MediaStream | ZegoLocalStream, option: ZegoStreamCompositorInputOption): Promise<void>;
    /**
     * 设置导播台输出视频的属性
     *
     * Note: 支持版本：3.0.0 及以上
     *
     * Note: 详情描述：设置导播台输出视频的属性。
     *
     * Note: 业务场景：当需要将本地用户的多路视频流以及图片合为一路视频流，比如在线教育、远程会议、直播等场景，可以使用导播台来实现。
     *
     * Note: 调用时机：创建导播台 ZegoStreamCompositor 后。
     *
     * @param config 输出流的选项
     */
    setOutputConfig(config: ZegoStreamCompositorOutputConfig): void;
    /**
     * 开始合成流
     *
     * Note: 支持版本：3.0.0 及以上
     *
     * Note: 详情描述：导播台会对所有输入图层的内容进行合并，输出音视频。
     *
     * Note: 业务场景：当需要将本地用户的多路视频流以及图片合为一路视频流，比如在线教育、远程会议、直播等场景，可以使用导播台来实现。
     *
     * Note: 调用时机：创建导播台 ZegoStreamCompositor 后。
     */
    startComposingStream(): Promise<MediaStream>;
    /**
     * 停止合成流
     *
     * Note: 支持版本：3.0.0 及以上
     *
     * Note: 详情描述：导播台停止合成流。
     *
     * Note: 业务场景：当需要结束合成流时。
     *
     * Note: 调用时机：导播台开始合成流后。
     */
    stopComposingStream(): Promise<boolean>;
}
