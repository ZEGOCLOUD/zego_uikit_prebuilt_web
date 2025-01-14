import type { ZegoLogger } from "../../common/zego.entity";
interface InsertableProcessor {
    bufferSize: number;
    processFn: Function;
    output: Array<number>;
}
export declare class InsertableAudio {
    private _zgp_logger;
    private maxBufferSize;
    private _zgp_processor?;
    track: any;
    tProcessorSource: any;
    tProcessorSourceReader: any;
    waittingQueue: Array<number>;
    private processorNum;
    private _zgp_delayCount;
    private _zgp_maxDelayCount;
    private _zgp_allDelayCount;
    private _zgp_isStartCount;
    num: number;
    handleQueue: {
        [index: string]: InsertableProcessor;
    };
    constructor(track: MediaStreamTrack, _zgp_logger: ZegoLogger, maxBufferSize?: number, _zgp_processor?: any);
    enableStartCount(enable: boolean): void;
    onoverload(): void;
    getInsertableStreamTrack(track: MediaStreamTrack): any;
    static get isSupported(): boolean;
    transformHandle(): any;
    getOutputBuffer(input: Float32Array, channel: number, sampleRate: number): Float32Array;
    stopTransformHandle(): Promise<void>;
    createProcessor(key: string, insertableProcessor: InsertableProcessor): void;
    deleteProcessor(key: string): void;
}
export {};
