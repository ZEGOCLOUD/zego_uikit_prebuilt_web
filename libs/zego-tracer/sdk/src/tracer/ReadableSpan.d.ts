import { InstrumentationLibrary, Link, SpanAttributes, SpanContext, SpanKind, SpanStatus, TimedEvent } from './entity';
import { Resource } from './Resource';
export interface ReadableSpan {
    readonly name: string;
    readonly kind: SpanKind;
    readonly spanContext: SpanContext;
    readonly parentSpanId?: string;
    readonly startTime: number;
    readonly endTime: number;
    readonly status: SpanStatus;
    readonly attributes: SpanAttributes;
    readonly links: Link[];
    readonly events: TimedEvent[];
    readonly duration: number;
    readonly ended: boolean;
    readonly resource: Resource;
    readonly instrumentationLibrary: InstrumentationLibrary;
}
