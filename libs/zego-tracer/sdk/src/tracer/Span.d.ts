import { ZegoDataReport } from '../reporter/zego.datareport';
import { Context } from './context';
import { InstrumentationLibrary, Link, SpanAttributes, SpanAttributeValue, SpanContext, SpanKind, SpanProcessor, SpanStatus, TimedEvent, TimeInput } from './entity';
import { ReadableSpan } from './ReadableSpan';
import { Resource } from './Resource';
import { Tracer } from './Tracer';
/**
 * This class represents a span.
 */
export declare class Span implements ReadableSpan {
    readonly spanContext: SpanContext;
    readonly kind: SpanKind;
    readonly parentSpanId?: string;
    readonly attributes: SpanAttributes;
    readonly links: Link[];
    readonly events: TimedEvent[];
    readonly startTime: number;
    readonly resource: Resource;
    readonly instrumentationLibrary: InstrumentationLibrary;
    name: string;
    level: number;
    status: SpanStatus;
    endTime: number;
    private _ended;
    private _duration;
    private _idGenerator;
    private _contextAPI;
    private readonly _traceParams;
    exported: boolean;
    reporter: ZegoDataReport;
    spanProcessor: SpanProcessor;
    parentTracer: Tracer;
    /** Constructs a new Span instance. */
    constructor(parentTracer: Tracer, context: Context, spanName: string, spanLevel: number, spanContext: SpanContext, kind: SpanKind, parentSpanId?: string, links?: Link[]);
    context(): SpanContext;
    setAttribute(key: string, value?: SpanAttributeValue): this;
    appendAttribute(key: string, value: unknown): this;
    setAttributes(attributes: SpanAttributes): this;
    /**
     *
     * @param name Span Name
     * @param [attributesOrStartTime] Span attributes or start time
     *     if type is {@type TimeInput} and 3rd param is undefined
     * @param [startTime] Specified start time for the event
     */
    addEvent(name: string, attributesOrStartTime?: SpanAttributes | TimeInput, startTime?: TimeInput): this;
    setStatus(status: SpanStatus): this;
    updateName(name: string): this;
    end(immediately?: boolean): void;
    spanReport(): void;
    isRecording(): boolean;
    get duration(): number;
    get ended(): boolean;
    private _isSpanEnded;
    private _toReporterSpan;
}
