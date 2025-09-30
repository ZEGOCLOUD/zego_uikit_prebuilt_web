export declare class Queue<T> {
    items: T[];
    byteLength: number;
    enCallback: Function | undefined;
    deCallback: Function | undefined;
    constructor();
    isEmpty(): boolean;
    enqueue(element: T): void;
    dequeue(): T | "Underflow" | undefined;
    front(): T | "No elements in Queue";
    size(): number;
    clear(): void;
    reset(): void;
    setListener(callBackList: {
        enCallback?: Function;
        deCallback?: Function;
    }): void;
}
