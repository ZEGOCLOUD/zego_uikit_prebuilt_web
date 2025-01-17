import { SpanContext } from './entity';
import { NoopSpan } from './NoopSpan';
import { Span } from './Span';
export declare function createContextKey(description: string): symbol;
export interface Context {
    /**
     * Get a value from the context.
     *
     * @param key key which identifies a context value
     */
    getValue(key: symbol): unknown;
    /**
     * Create a new context which inherits from this context and has
     * the given key set to the given value.
     *
     * @param key context key for which to set the value
     * @param value value to set for the given key
     */
    setValue(key: symbol, value: unknown): Context;
    /**
     * Return a new context which inherits from this context but does
     * not contain a value for the given key.
     *
     * @param key context key for which to clear a value
     */
    deleteValue(key: symbol): Context;
}
export declare function getSpan(context: Context): Span | undefined;
export declare function getSpanContext(context: Context): SpanContext | undefined;
/**
 * Set the span on a context
 *
 * @param context context to use as parent
 * @param span span to set active
 */
export declare function setSpan(context: Context, span: Span | NoopSpan): Context;
/**
 * Wrap span context in a NoopSpan and set as span in a new
 * context
 *
 * @param context context to set active span on
 * @param spanContext span context to be wrapped
 */
export declare class BaseContext implements Context {
    private _currentContext;
    /**
     * Construct a new context which inherits values from an optional parent context.
     *
     * @param parentContext a context from which to inherit values
     */
    constructor(parentContext?: Map<symbol, unknown>);
    /**
     * Get a value from the context.
     *
     * @param key key which identifies a context value
     */
    getValue: (key: symbol) => unknown;
    /**
     * Create a new context which inherits from this context and has
     * the given key set to the given value.
     *
     * @param key context key for which to set the value
     * @param value value to set for the given key
     */
    setValue: (key: symbol, value: unknown) => Context;
    /**
     * Return a new context which inherits from this context but does
     * not contain a value for the given key.
     *
     * @param key context key for which to clear a value
     */
    deleteValue: (key: symbol) => Context;
}
/** The root context is used as the default parent context when there is no active context */
export declare const ROOT_CONTEXT: Context;
export declare function suppressInstrumentation(context: Context): Context;
/**
 * Singleton object which represents the entry point to the OpenTelemetry Context API
 */
export declare class ContextAPI {
    private _name;
    private static _instance?;
    private _contextManager;
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor(_name: string);
    /** Get the singleton instance of the Context API */
    static getInstance(name?: string): ContextAPI;
    /**
     * Set the current context manager. Returns the initialized context manager
     */
    /**
     * Get the currently active context
     */
    active(): Context;
    /**
     * Execute a function with an active context
     *
     * @param context context to be active during function execution
     * @param fn function to execute in a context
     * @param thisArg optional receiver to be used for calling fn
     * @param args optional arguments forwarded to fn
     */
    with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(context: Context, fn: F, thisArg?: ThisParameterType<F>, ...args: A): ReturnType<F>;
    /**
     * Bind a context to a target function or event emitter
     *
     * @param target function or event emitter to bind
     * @param context context to bind to the event emitter or function. Defaults to the currently active context
     */
    private _getContextManager;
}
