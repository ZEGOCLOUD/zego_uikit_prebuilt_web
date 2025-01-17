import { SpanAttributes, SpanAttributeValue } from './entity';
export declare function isAttributeValue(val: unknown): val is SpanAttributeValue;
export declare function sanitizeAttributes(attributes: unknown): SpanAttributes;
