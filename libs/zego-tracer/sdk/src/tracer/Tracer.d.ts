import { ZegoDataReport } from '../reporter/zego.datareport';
import { Context, ContextAPI } from './context';
import { InstrumentationLibrary, SpanOptions, SpanProcessor, TraceParams, TracerConfig } from './entity';
import { Resource } from './Resource';
import { Span } from './Span';
/**
 * This class represents a basic tracer.
 */
export declare class Tracer {
    private readonly _traceParams;
    private _idGenerator;
    resource: Resource;
    readonly instrumentationLibrary: InstrumentationLibrary;
    context: ContextAPI;
    spanProcessor: SpanProcessor;
    reporter: ZegoDataReport;
    /**
     * Constructs a new Tracer instance.
     */
    constructor(instrumentationLibrary: InstrumentationLibrary, config: TracerConfig, reporter: ZegoDataReport, processor?: SpanProcessor);
    /**
     * Starts a new Span or returns the default NoopSpan based on the sampling
     * decision.
     */
    startSpan(name: string, level: number, options?: SpanOptions, context?: Context): Span;
    setResource(resource: any): void;
    /** Returns the active {@link TraceParams}. */
    getActiveTraceParams(): TraceParams;
}
