export declare class Stack<T> {
    items: T[];
    constructor();
    push(...element: T[]): void;
    pop(): T;
    peek(): T;
    size(): number;
    isEmpty(): boolean;
    clear(): void;
    print(): void;
}
