import { ZegoLogger } from "../common/zego.entity";
export declare class TracerHandler {
    private _zgp_logger;
    private _zgp_tracer;
    private _zgp_product;
    private _zgp_commonAttrs;
    private _zgp_commonStates;
    isUnload: boolean;
    private _zgp_osType;
    static reportCustomerContext: number;
    constructor(_zgp_logger: ZegoLogger);
    init(appID: number, ENV: number, deviceID: string): void;
    setConfig(cfg: {
        bps?: number;
        totalDBSize?: number;
        serverUrl?: string;
    }): void;
    loadScript(isRemote: boolean, url: string, key: string, hash: string): Promise<void>;
    setReporterInfo(userID: string, token: string): void;
    flush(cfg?: {
        bps: number;
    }): void;
    destroy(): void;
    setCommonStates(_zgp_commonStates: any): void;
    setResource(resource: any): void;
    setCommonAttributes(attributes: any): void;
    deleteCommonAttributes(attr: string[]): void;
    createSpan(level: number, name: string, parentSpan?: any): any;
    spanEnd(span: any, attributes?: any): void;
    spanSetAttributes(span: any, attributes: any): void;
    spanAppendAttribute(span: any, key: string, value: any): void;
    setError(span: any, error: any, externalMsg?: string): void;
    setLogger(_zgp_logger: any): void;
    setTimeOffset(offset: number): void;
    setUnloadState(level: number): void;
    setNetStateCheck(): void;
}
