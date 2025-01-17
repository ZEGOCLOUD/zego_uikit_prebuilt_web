import type { ZegoLogger } from "../../../common/zego.entity";
import { ZegoLiveAudioEffectMode } from "../../../../code/zh/ZegoVoiceChangerEntity.web";
export declare class MediaElementRenderer {
    private _zgp_logger;
    private ac;
    private _zgp_audio;
    srcNode?: MediaElementAudioSourceNode;
    private _zgp_localOutPutNode?;
    mixOutputNode?: AudioNode;
    error: boolean;
    constructor(_zgp_logger: ZegoLogger, ac: AudioContext, _zgp_audio: HTMLMediaElement);
    init(): boolean;
    getMixNode(): {
        mixOutputNode: AudioNode;
    };
    voiceChangerNode?: AudioNode | null;
    effectMode: ZegoLiveAudioEffectMode;
    get effectOnLocal(): boolean;
    get effectOnMix(): boolean;
    setVoiceChangeNode(mode: ZegoLiveAudioEffectMode, node?: AudioNode | null, force?: boolean): void;
    eventHandler: {
        volumechange: (e: Event) => void;
    };
    destroy(): void;
}
