export declare const SemanticResourceAttributes: {
    PROCESS_RUNTIME_NAME: string;
    TELEMETRY_SDK_NAME: string;
    TELEMETRY_SDK_LANGUAGE: string;
    TELEMETRY_SDK_VERSION: string;
};
export declare const VERSION = "0.19.0";
export declare const SDK_INFO: {
    [x: string]: string;
};
export interface ResourceAttributes {
    [key: string]: number | string | boolean;
}
/**
 * A Resource describes the entity for which a signals (metrics or trace) are
 * collected.
 */
export declare class Resource {
    /**
     * A dictionary of attributes with string keys and values that provide
     * information about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on attributes.
     */
    readonly attributes: ResourceAttributes;
    static readonly EMPTY: Resource;
    /**
     * Returns an empty Resource
     */
    static empty(): Resource;
    /**
     * Returns a Resource that indentifies the SDK in use.
     */
    static createTelemetrySDKResource(): Resource;
    constructor(
    /**
     * A dictionary of attributes with string keys and values that provide
     * information about the entity as numbers, strings or booleans
     * TODO: Consider to add check/validation on attributes.
     */
    attributes: ResourceAttributes);
    /**
     * Returns a new, merged {@link Resource} by merging the current Resource
     * with the other Resource. In case of a collision, other Resource takes
     * precedence.
     *
     * @param other the Resource that will be merged with this.
     * @returns the newly merged Resource.
     */
    merge(other: Resource | null): Resource;
}
