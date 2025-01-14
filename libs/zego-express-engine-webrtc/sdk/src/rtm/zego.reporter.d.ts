import { ZegoLogger, ZegoDataReport } from "../../src/common/zego.entity";
import { TracerHandler } from "./tracerHandler";
declare class ReportSpan {
    private _dataReport;
    private _seq;
    constructor(_dataReport: ZegoDataReport, _seq: number);
    setAttributes(attributes: Record<string, any>): void;
    setAttribute(key: string, value: any): void;
    end(immediately?: boolean): void;
}
export declare class ZReporter {
    private _zgp_logger;
    tracerHandler: TracerHandler;
    dataReport: ZegoDataReport;
    private _zgp_reportList;
    private _zgp_publicPros;
    private _zgp_apiErrReportMap;
    private _zgp_apiReportControllerMap;
    constructor(_zgp_logger: ZegoLogger);
    static setReportCustomerContext(contextID: number): void;
    /**
     * tracer 初始化
     */
    init(appID: number, ENV: number, deviceID: string): void;
    /**
     * 设置上报相关参数，例如上报地址在初始化时尚未获取到，可在获得地址后传入
     * @param cfg
     */
    setConfig(cfg: {
        bps?: number;
        totalDBSize?: number;
        serverUrl?: string;
    }): void;
    /**
     * 加载动态脚本
     * @param isRemote 是否远端拉取的脚本
     * @param url 脚本地址
     * @param key 脚本 key
     * @param hash 脚本 hash，解密用
     * @returns
     */
    loadScript(isRemote: boolean, url: string, key: string, hash: string): Promise<void>;
    /**
     * 设置上报关键信息，userID 和 token
     * @param userID
     * @param token
     */
    setReporterInfo(userID: string, token: string): void;
    /**
     * 刷新上报
     * @param cfg
     */
    flush(cfg?: {
        bps: number;
    }): void;
    /**
     * 销毁
     */
    destroy(): void;
    /**
     * 设置持久状态数据，例如 roomID、流相关信息，以供脚本后续使用
     * @param commonStates
     */
    setCommonStates(commonStates: any): void;
    /**
     * 设置 SDK 版本信息等
     * @param resource s
     */
    setResource(resource: any): void;
    /**
     * 设置事件公共属性
     * @param attributes
     */
    setCommonAttributes(attributes: any): void;
    deleteCommonAttributes(attr: string[]): void;
    clearRoomSpans(roomIDs: string[]): void;
    /**
     * 设置 room_sid、stream_sid 等信息，在事件创建时统一加入
     * @param pros
     */
    setPublicPros(pros: Record<string, any>): void;
    /**
     * 创建 span
     * @param level 事件等级，目前分两级，流开始、完整事件为高级，会立即缓存
     * @param parent 事件树的父亲级别，key 是父 span 在数据表中的 key，bak_key 是当 key 不存在时的代替，par 则是二层 key，par1 是当 par 相同时的区分
     * @param self span 自身在事件映射表中的 key，par 和 par1 则是 key 相同时的区分，如 roomID、streamID
     * @param name span 名称，即事件的 event 字段
     * @param isMap 事件是否存入事件表
     * @returns
     */
    createSpan(level: number, parent: {
        key: string;
        bak_key?: string;
        par?: string;
        par1?: string;
    }, self: {
        key: string;
        par?: string;
        par1?: string;
    }, name: string, isMap?: boolean): ReportSpan;
    /**
     * 事件设置进事件表
     * @param span
     * @param mapParams
     */
    setSpanInMap(span: ReportSpan, mapParams: {
        key: string;
        par?: string;
        par2?: string;
    }): void;
    /**
     * 以事件表中 key 形式结束事件
     * @param self
     * @param attributes 可设置属性
     * @param reserve 是否保留在事件表中
     */
    spanEnd(self: {
        key: string;
        par?: string;
        par1?: string;
    }, attributes?: any, reserve?: boolean): void;
    /**
     * 以事件表形式设置属性
     * @param self
     * @param attributes
     */
    spanSetAttributes(self: {
        key: string;
        bak_key?: string;
        par?: string;
        par1?: string;
    }, attributes: any): void;
    /**
     * 事件表形式添加字段属性中的数组结构项，数组项类型需要一致
     * @param self
     * @param key
     * @param value
     */
    spanAppendAttribute(self: {
        key: string;
        bak_key?: string;
        par?: string;
        par1?: string;
    }, key: string, value: any): void;
    /**
     * 以 span 结束事件，可传入 error 信息
     * @param span
     * @param error
     * @param externalMsg
     */
    setError(span: any, error: any, externalMsg?: string): void;
    setLogger(_zgp_logger: any): void;
    setTimeOffset(offset: number): void;
    setUnloadState(level: number): void;
    setNetStateCheck(): void;
    setAPIErrorReport(eventName: string, freq: number): void;
    getAPIErrorReport(eventName: string): number | undefined;
    takeAPIErrorReport(eventName: string, err: {
        code: number;
        msg?: string;
        message?: string;
    }, freq?: number, attr?: any): void;
}
export {};
