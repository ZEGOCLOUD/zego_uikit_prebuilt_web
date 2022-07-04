export interface SoundLevel {
    instant: number;
    slow: number;
    clip: number;
}
export declare class SoundMeter {
    instant: number;
    slow: number;
    clip: number;
    context: AudioContext;
    states: {
        [index: string]: {
            script: any;
            mic: any;
        };
    };
    constructor();
    connectToSource(dom: HTMLMediaElement, callback: (err: SoundLevel) => void): void;
    stop(dom: HTMLMediaElement): void;
}
