export declare class AudioNodeQueue {
    private source;
    private destination;
    private audioNodeList;
    constructor(source: AudioNode, destination: MediaStreamAudioDestinationNode);
    get destinationNode(): MediaStreamAudioDestinationNode;
    private get lastNode();
    private get secondToLastNode();
    private get firstNode();
    private get secondNode();
    pushBack(node: AudioNode): void;
    popBack(): void;
    pushFront(node: AudioNode): void;
    popFront(): void;
    remove(node: AudioNode): void;
    isConnected(node: AudioNode): boolean;
    isEmpty(): boolean;
    replaceSource(source: AudioNode): void;
    replaceDestination(destination: MediaStreamAudioDestinationNode): void;
}
