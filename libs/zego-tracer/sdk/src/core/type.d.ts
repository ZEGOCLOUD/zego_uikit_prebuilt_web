import { SpanAttributes, SpanKind } from '../tracer/entity';
import { ZegoSpan } from './zego-span';
export declare const readSpanKeys: string[];
export declare const DEFAULT_MAX_SPAN_SIZE = 1000;
export declare const SCHEDULED_DELAY_MILLIS = 3000;
export declare const NOOP_SPAN_ID = "noop";
export interface SampleConfig {
    level: number;
}
export interface ExporterConfig {
    [index: string]: number[];
}
export interface ZegoExporter {
    type: string;
    callBack?: Function;
    instance?: Record<string, any>;
    params?: Record<string, any>;
}
export interface ZSpanOptions {
    /**
     * The SpanKind of a span
     * @default {@link SpanKind.INTERNAL}
     */
    kind?: SpanKind;
    attributes?: SpanAttributes;
    linkSpans?: ZegoSpan[];
    parent?: ZegoSpan;
}
export interface InitOptions {
    product: string;
    version?: string;
    env?: number;
    appID: number;
    deviceID: string;
    importantLevel: number;
    levels: number[];
    bps?: number;
    serverUrl?: string;
    resources?: Record<string, any>;
    spanStart?: Function;
    spanBeforeEnd?: Function;
    spanEnd?: Function;
}
