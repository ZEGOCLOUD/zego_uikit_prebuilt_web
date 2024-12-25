/**
 * Default configuration. For fields with primitive values, any user-provided
 * value will override the corresponding default value. For fields with
 * non-primitive values (like `traceParams`), the user-provided value will be
 * used to extend the default value.
 */
export declare const DEFAULT_CONFIG: {
    traceParams: {
        numberOfAttributesPerSpan: number;
        numberOfLinksPerSpan: number;
        numberOfEventsPerSpan: number;
    };
};
