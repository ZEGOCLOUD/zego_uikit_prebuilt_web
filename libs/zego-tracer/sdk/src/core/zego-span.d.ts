import { ZegoStore } from '../common/zego.entity';
import { SpanAttributes, SpanAttributeValue, SpanStatus, TimeInput } from '../tracer/entity';
import { NoopSpan } from '../tracer/NoopSpan';
import { Span } from '../tracer/Span';
import { Tracer } from '../tracer/Tracer';
export declare class ZegoSpan {
    spanId: string;
    spanInfo: any;
    span: Span | NoopSpan | null;
    activeCallback: Function;
    endCallback: Function;
    static tracer: Tracer;
    store: ZegoStore;
    constructor(spanId: string, span: Span | NoopSpan);
    /**
     * 设置 span 单个属性
     * @param key Attribute 的 key
     * @param value Attribute 的 value
     * @returns
     */
    setAttribute(key: string, value: SpanAttributeValue): this;
    /**
     *  设置多个属性
     * @param attributes { key1: val1, key2: val2 }
     * @returns
     */
    setAttributes(attributes: SpanAttributes): this;
    /**
     * 添加数组结构属性
     * @param key
     * @param value
     */
    appendAttribute(key: string, value: Record<string, any>): this;
    /**
     * 添加 event
     * @param name
     * @param attributesOrStartTime
     * @param startTime
     * @returns
     */
    addEvent(name: string, attributesOrStartTime?: SpanAttributes | TimeInput, startTime?: TimeInput): this;
    /**
     * 设置 span status
     * @param status
     * @returns
     */
    setStatus(status: SpanStatus): this;
    /**
     * 修改 span name
     * @param name
     * @returns
     */
    updateName(name: string): this;
    /**
     * span 结束
     * @param endTime
     */
    end(immediately?: boolean): void;
    setSpanActive(activeCallback: Function): void;
    setSpanEnd(endCallback: Function): void;
    spanReport(): void;
    private _spanEnd;
    private _isSpanNoop;
    private _activeSpan;
    private _removeStoreItem;
}
