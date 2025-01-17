import { ZegoLogger } from "../../../common/zego.entity";
export declare class AudioPCMDataProcessor {
    private ac;
    private _zgp_logger;
    useScript: boolean;
    _zgp_scriptNode: ScriptProcessorNode | null;
    _zgp_workletNode: AudioWorkletNode | null;
    _zgp_srcNode: MediaStreamAudioSourceNode | null;
    _zgp_bufferSize: number;
    constructor(ac: AudioContext, _zgp_logger: ZegoLogger);
    setAudioFrameCallback(stream: MediaStream, enable: boolean, callback: Function | null, options?: {
        frameSize?: number;
    }): void;
    replaceSource(stream: MediaStream): void;
    destroy(): void;
}
