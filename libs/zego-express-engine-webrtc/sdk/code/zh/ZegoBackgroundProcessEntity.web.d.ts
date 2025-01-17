/**
 * 背景处理分割模式
 *
 */
export declare enum Segmentation {
    /**
     * 人像分割
     */
    PortraitSegmentation = 0
}
/**
 * 背景虚化相关参数
 *
 */
export interface BackgroundBlurOptions {
    /**
     * 背景虚化等级
     */
    blurDegree?: number;
}
/**
 * 虚拟背景处理相关参数
 *
 */
export interface BackgroundVirtualOptions {
    source?: HTMLImageElement;
    /**
     * 图片视图处理模式，'contain', 'cover', 'fill'
     */
    objectFit?: string;
}
