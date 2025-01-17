/**
 * 变声器预设值
 *
 * 详情描述：变声器预设值
 *
 */
export declare enum ZegoVoiceChangerPreset {
    /**
     * 无变声
     */
    NONE = 0,
    /**
     * 男声变童声
     */
    MEN_TO_CHILD = 1,
    /**
     * 男声变女声
     */
    MEN_TO_WOMEN = 2,
    /**
     * 女声变童声
     */
    WOMEN_TO_CHILD = 3,
    /**
     * 女声变男声
     */
    WOMEN_TO_MEN = 4,
    /**
     * 外国人音效
     */
    FOREIGNER = 5,
    /**
     * 汽车人擎天柱声效
     */
    OPTIMUS_PRIME = 6,
    /**
     * 机器人声效
     */
    ANDROID = 7,
    /**
     * 空灵声效
     */
    ETHEREAL = 8,
    /**
     * 磁性男声效
     */
    MALE_MAGNETIC = 9,
    /**
     * 清新女声效
     */
    FEMALE_FRESH = 10,
    /**
     * C大调电音音效
     */
    MAJOR_C = 11,
    /**
     * A小调电音音效
     */
    MINOR_A = 12,
    /**
     * 和声小调电音音效
     */
    HARMONIC_MINOR = 13,
    /**
     * 女活力音效
     */
    FEMALE_ENERGETIC = 14,
    /**
     * 浑厚音效
     */
    RICHNESS = 15,
    /**
     * 低沉音效
     */
    MUFFLED = 16,
    /**
     * 圆润音效
     */
    ROUNDNESS = 17,
    /**
     * 假音音效
     */
    FALSETTO = 18,
    /**
     * 饱满音效
     */
    FULLNESS = 19,
    /**
     * 清澈音效
     */
    CLEAR = 20,
    /**
     * 高亢音效
     */
    HIGHLY_RESONANT = 21,
    /**
     * 嘹亮音效
     */
    LOUD_CLEAR = 22
}
/**
 * 混响预设值。
 *
 * 详情描述：混响预设值。
 *
 */
export declare enum ZegoReverbPreset {
    /**
     * 无混响。
     */
    None = 0,
    /**
     * 小房间混响效果
     */
    SoftRoom = 1,
    /**
     * 大房间混响效果
     */
    LargeRoom = 2,
    /**
     * 音乐厅混响效果
     */
    ConcertHall = 3,
    /**
     * 山谷混响效果
     */
    Valley = 4,
    /**
     * 录音棚混响效果
     */
    RecordingStudio = 5,
    /**
     * 地下室混响效果
     */
    Basement = 6,
    /**
     * KTV 混响效果
     */
    KTV = 7,
    /**
     * 流行混响效果
     */
    Popular = 8,
    /**
     * 摇滚混响效果
     */
    Rock = 9,
    /**
     * 演唱会混响效果
     */
    VocalConcert = 10,
    /**
     * 留声机混响效果
     */
    GramoPhone = 11,
    /**
     * 加强的 KTV 混响效果，提供人声更加集中、亮度更好的 KTV 效果。相比原有 KTV 音效缩短了混响时长，提高了干湿比。
     */
    EnhancedKTV = 12
}
/**
 * 音质增强生效模式。
 *
 * 详情描述：音质增强生效模式。
 *
 */
export declare enum ZegoLiveAudioEffectMode {
    /**
     * 都关闭。
     */
    None = 0,
    /**
     * 仅本地生效。
     */
    Local = 1,
    /**
     * 仅推流生效。
     */
    Publish = 2,
    /**
     * 本地和推流都生效。
     */
    All = 3
}
export declare enum AiDenoiseMode {
    AI = 0,
    AIBalanced = 1
}
