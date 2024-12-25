import { Context } from './context';
/**
 * Stack Context Manager for managing the state in web
 * it doesn't fully support the async calls though
 */
export declare class StackContextManager {
    /**
     * whether the context manager is enabled or not
     */
    private _enabled;
    /**
     * Keeps the reference to current context
     */
    _currentContext: Context;
    constructor();
    /**
     *
     * @param target Function to be executed within the context
     * @param context
     */
    private _bindFunction;
    /**
     * Returns the active context
     */
    active(): Context;
    /**
     * Binds a the certain context or the active one to the target function and then returns the target
     * @param target
     * @param context
     */
    bind<T>(target: T, context?: Context): T;
    /**
     * Disable the context manager (clears the current context)
     */
    disable(): this;
    /**
     * Enables the context manager and creates a default(root) context
     */
    enable(): this;
    /**
     * Calls the callback function [fn] with the provided [context]. If [context] is undefined then it will use the window.
     * The context will be set as active
     * @param context
     * @param fn Callback function
     * @param thisArg optional receiver to be used for calling fn
     * @param args optional arguments forwarded to fn
     */
    with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(context: Context | null, fn: F, thisArg?: ThisParameterType<F>, ...args: A): ReturnType<F>;
}
