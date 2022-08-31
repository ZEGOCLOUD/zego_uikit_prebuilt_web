export interface SoundLevel {
    instant: number;
    slow: number;
    clip: number;
}
export declare class SoundMeter {
    context: AudioContext;
    instant: number;
    slow: number;
    clip: number;
    type: string;
    script: ScriptProcessorNode;
    mic: MediaElementAudioSourceNode | MediaStreamAudioSourceNode;
    constructor();
    connectToStreamSource(source: MediaStream, callback: Function): void;
    connectToElementSource(source: HTMLMediaElement, callback: Function): void;
    stop(): void;
}
