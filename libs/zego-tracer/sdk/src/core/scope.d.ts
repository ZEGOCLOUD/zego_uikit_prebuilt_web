import { Stack } from './stack';
import { ZegoSpan } from './zego-span';
export declare class Scope {
    private span;
    private stack;
    constructor(span: ZegoSpan, stack: Stack<ZegoSpan>);
    release(): boolean;
}
