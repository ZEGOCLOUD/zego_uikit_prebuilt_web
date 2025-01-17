/**
 * 本地混流输入流配置
 *
 */
export interface ZegoStreamCompositorInputOption {
    /**
     * 图层的布局项
     */
    layout?: ZegoStreamCompositorLayoutOption;
    /**
     * 视频或图片内容适应所在图层的方式，有 "cover" | "contain" | "fill"
     */
    objectFit?: string;
    /**
     * 输入流的混合类型，"VIDEO" | "AUDIO" | "ALL"
     */
    contentType?: string;
    /**
     * 输入流的输出音量，[0, 100]
     */
    volume?: number;
}
/**
 * 本地混流输入流配置
 *
 */
export interface ZegoStreamCompositorLayoutOption {
    /**
     * 输入的图层左上角相对于画布左上角的横向位移
     */
    x: number;
    /**
     * 输入的图层左上角相对于画布左上角的纵向位移。
     */
    y: number;
    /**
     * 图层的宽度 (px)
     */
    width: number;
    /**
     * 图层的高度 (px)
     */
    height: number;
    /**
     * 图层的层级
     */
    zOrder?: number;
}
/**
 * 本地混流输出流配置
 *
 */
export interface ZegoStreamCompositorOutputConfig {
    /**
     * 输出宽
     */
    width: number;
    /**
     * 输出高
     */
    height: number;
    /**
     * 输出帧率
     */
    frameRate?: number;
    /**
     * 输出码率
     */
    bitrate?: number;
}
