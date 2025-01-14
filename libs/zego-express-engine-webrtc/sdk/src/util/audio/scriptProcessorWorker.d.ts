export declare class ScriptProcessorWorker {
    worker: Worker;
    ac: AudioContext;
    node: ScriptProcessorNode | null;
    sampleLength: number;
    waitingQueue: Array<number>;
    processedQueue: Array<number>;
    constructor(worker: Worker, ac: AudioContext, sampleLength: number);
    createScriptProcessor(options: {
        bufferSize?: number;
        inputChannels?: number;
        outputChannels?: number;
        handleInputData: Function;
    }): void;
    pushProcessedData(processedData: Array<number>): void;
    destroy(): void;
}
