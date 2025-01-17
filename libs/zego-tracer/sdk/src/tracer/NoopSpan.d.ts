import { Exception, SpanAttributes, SpanContext, SpanStatus, TimeInput } from './entity';
/**
 * The NoopSpan is the default {@link Span} that is used when no Span
 * implementation is available. All operations are no-op including context
 * propagation.
 */
export declare class NoopSpan {
    private readonly _spanContext;
    constructor(_spanContext?: SpanContext);
    context(): SpanContext;
    setAttribute(_key: string, _value: unknown): this;
    appendAttribute(_key: string, _value: unknown): this;
    setAttributes(_attributes: SpanAttributes): this;
    addEvent(_name: string, _attributesOrStartTime?: SpanAttributes | TimeInput, _startTime?: TimeInput): this;
    setStatus(_status: SpanStatus): this;
    updateName(_name: string): this;
    end(immediately?: boolean): void;
    isRecording(): boolean;
    spanReport(): void;
    recordException(_exception: Exception, _time?: TimeInput): void;
}
