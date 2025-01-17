import { ZegoInnerEvent, ZegoError, ZegoGeoFenceType, ZegoProxyInfo, ZegoLocalProxyConfig } from "./zego.entity";
import { LogConfig } from "../../src/common/zego.entity";
import { ZegoRTMEvent, ZegoRoomConfig, ZegoUser, ZegoInitOptions, ZegoSwitchRoomConfig } from "../../code/zh/ZegoExpressEntity.rtm";
import { StateCenter } from "./stateCenter";
import { LiveRoomModules } from "./modules";
import { CloudSetting } from "./cloudSetting";
import { ZReporter } from "./zego.reporter";
import { ProxyController } from "./cloudProxy/CloudProxyController";
import { LocalProxyController } from "./cloudProxy/LocalProxyController";
import ZegoConnectionAgent from "../plugin/zegoConnection";
import { ZegoLogger, ZegoDataReport } from "zego-express-logger";
export declare class ZegoExpressWebRTM {
    private _zgp_logger;
    private _dataReport;
    private _zgp_reporter;
    private _zgp_options?;
    static customDomain: {};
    static proxyCtrl: ProxyController | LocalProxyController | null;
    private _zgp_stateCenter;
    liveRoomHandler: any;
    get logger(): ZegoLogger;
    get stateCenter(): StateCenter;
    module: LiveRoomModules;
    getReportSeq: Function;
    proxyRes: (dataReport: ZegoDataReport, reportSeq: number, resolve: any, reject: any) => any;
    getServerError: (code: number) => ZegoError;
    getSeq: Function;
    actionSuccessCallback: (fName: string, callbackList: {
        [index: string]: Function;
    }) => Function;
    actionErrorCallback: (fName: string, callbackList: {
        [index: string]: Function;
    }) => Function;
    unregisterCallback: (fName: string, callbackList: {
        [index: string]: Function;
    }) => void;
    netAgent: ZegoConnectionAgent;
    dispatchServers: string[];
    dispatchHttp3Servers: string[];
    cloudSettingTimer?: any;
    _zgp_timeOffsetUpdateTimer?: any;
    private _zgp_NetworkOnlineDetectTimer;
    private _zgp_NetworkOnlineDetectIntervalMs;
    static geoFenceType: ZegoGeoFenceType;
    static geoFenceAreaList: number[];
    static engineOptions: any;
    cloudSetting?: CloudSetting;
    get modules(): {
        service: any;
    };
    get isUseNetAgent(): boolean;
    get isUaConnect(): boolean;
    private _zgp_getSetting;
    private _zgp_setSetting;
    version: any;
    /** tabs id */
    static pageID: string;
    id: string;
    get reporter(): ZReporter;
    constructor(appID: number, server: string | string[], _zgp_logger: ZegoLogger, _dataReport: ZegoDataReport, _zgp_reporter: ZReporter, ENV: number, _zgp_options?: ZegoInitOptions | undefined);
    setEngineConfig(config: any): void;
    destroyRTM(): void;
    private _zgp_initCallback;
    /**
     * 取 sdk 版本号的前三位 A.B.C 作转换处理 A<<20|B<<8|C
     * 自 2.25.0 起，取产品号及 sdk 版本号的前三位 A.B.C 作转换处理 productType<<28|A<<20|B<<8|C，所有数字版本号统一
     * @param sdkVersion sdk 版本号
     */
    private _zgp_getSDKVersionNum;
    private _zgp_initSpans;
    private _zgp_handleZipLogUrl;
    getStoreAppConfig(): void;
    private _zgp_createNetAgent;
    private _zgp_getMainDomain;
    private _zgp_getConfigDomains;
    private _replaceMainDomain;
    private hashMainDomain;
    /**
     * SDK hardcode 3个域名，根据 app hash 获取对应域名，
     * 同时另外两个域名作为备用域名
     * @returns
     */
    private _zgp_getHardcodeDomains;
    private _zgp_getDispatchUrl;
    private _zgp_getServerDomains;
    private _zgp_makeupAccesshubServer;
    private _bindWindowListener;
    retryRoom(retryNow?: boolean, roomID?: string, needResetSession?: boolean): void;
    private _zgp_netOnLineHandle;
    private _zgp_StopNetworkOnlineDetection;
    private _zgp_StartNetworkOnlineDetection;
    private _zgp_netOffLineHandle;
    setLogConfig(option: LogConfig): boolean;
    setDebugVerbose(enable: boolean): void;
    renewToken(token: string, roomID?: string): boolean;
    protected setCloudSettingURLs(urls: string[]): void;
    private _roomLoginResponseListener;
    loginRoom(roomID: string, token: string, user: ZegoUser, config?: ZegoRoomConfig): Promise<boolean>;
    /**
     * @description  客户可能参数不传，所以内部方法要将参数设置为可选的，逻辑上再做参数校验
     * @param {string} [fromRoomID] 必填
     * @param {string} [toRoomID] 必填
     * @param {ZegoSwitchRoomConfig} [config] 必填Token
     * @returns {*}  {Promise<boolean>}
     */
    switchRoom(fromRoomID?: string, toRoomID?: string, config?: ZegoSwitchRoomConfig): Promise<boolean>;
    handleLogUpload(): void;
    fetchAppConfigByTargetToken(token: string, userID: string): Promise<any>;
    fetchAppConfig(token?: string): Promise<void>;
    private _zgp_getCloudSetting;
    private _zgp_cloudReportNotify;
    private _zgp_loginReport;
    logoutRoom(roomID?: string, isSwitchRoom?: boolean): void;
    uploadLog(): Promise<{
        errorCode: number;
        extendedData: string;
    }>;
    sendCustomCommand(roomID: string, command: string | Record<string, any>, toUserList: string[]): Promise<{
        errorCode: number;
        extendedData: string;
    }>;
    _sendCustomCommand(roomID: string, command: string | Record<string, any>, toUserList: string[]): Promise<{
        seq: number;
        errorCode: number;
        extendedData: string;
    }>;
    sendBroadcastMessage(roomID: string, message: string): Promise<{
        errorCode: number;
        messageID: number;
        extendedData: string;
    }>;
    _sendBroadcastMessage(roomID: string, message: string, category?: 1 | 2, type?: 1 | 2 | 3): Promise<{
        seq: number;
        errorCode: number;
        messageID: number;
        extendedData: string;
    }>;
    setRoomExtraInfo(roomID: string, type: string, data: string): Promise<{
        errorCode: number;
    }>;
    _setRoomExtraInfo(roomID: string, type: string, data: string): Promise<{
        seq: number;
        errorCode: number;
    }>;
    sendBarrageMessage(roomID: string, message: string): Promise<{
        errorCode: number;
        messageID: string;
        extendedData: string;
    }>;
    _sendBarrageMessage(roomID: string, message: string, category?: 1 | 2, type?: 1 | 2 | 3): Promise<{
        seq: number;
        errorCode: number;
        messageID: string;
        extendedData: string;
    }>;
    sendRelayMessage(type: string, data: string, success: (seq: number) => void, error: (err: ZegoError, seq: number) => void, roomID?: string): void;
    requestJoinLive(destIdName: string, success: (seq: number) => void, error: (err: ZegoError, seq: number) => void, resultCallback: (result: boolean, fromUserId: string, fromUserName: string) => void, roomID?: string): boolean;
    inviteJoinLive(destIdName: string, success: (seq: number) => void, error: (err: ZegoError, seq: number) => void, resultCallback: (result: boolean, fromUserId: string, fromUserName: string) => void, roomID?: string): boolean;
    endJoinLive(destIdName: string, success: (seq: number) => void, error: (err: ZegoError, seq: number) => void, roomID?: string): boolean;
    respondJoinLive(requestId: string, respondResult: boolean, success?: (seq: number) => void, error?: (err: ZegoError, seq: number) => void, roomID?: string): boolean;
    getVersion(): string;
    setSdkBizVersion(bizVersion: string): void;
    on<K extends keyof ZegoRTMEvent>(event: K, callBack: ZegoRTMEvent[K]): boolean;
    off<K extends keyof ZegoRTMEvent>(event: K, callBack?: ZegoRTMEvent[K]): boolean;
    _on<K extends keyof ZegoInnerEvent>(event: K, callBack: ZegoInnerEvent[K]): boolean;
    _off<K extends keyof ZegoInnerEvent>(event: K, callBack?: ZegoInnerEvent[K]): boolean;
    isTestEnvironment(): boolean;
    isLogin(roomID?: string): boolean;
    getMultiRoom(): boolean;
    getAppID(): number;
    getUserID(): string;
    getUserName(): string;
    getToken(roomID?: string): string;
    setRoomCreateFlag(flag: number): void;
    setRole(role: 1 | 2): void;
    getSessionId(roomID?: string): string;
    getRoomSessionID(roomID?: string): string;
    getAppConfig(): any;
    setTestPackageSize(test: boolean): void;
    setAccess(isAccess: boolean): void;
    enableMultiRoom(isMulti: boolean): boolean;
    getRoomModules(roomID: string): LiveRoomModules | undefined;
    private _onAppConfigUpdate;
    private _onBeforePageUnload;
    static use(module: any): void;
    static setGeoFence(geoFenceType: ZegoGeoFenceType, geoFenceAreaList: number[]): void;
    static setEngineOptions(options: {
        geoFenceType?: number;
        geoFenceAreaList?: number[];
        customDomain?: {
            accesshub?: string;
            logreport?: string;
            detaillog?: string;
        };
        dataReportCustomerContext?: number;
    }): void;
    static logConfigForPreset: LogConfig | undefined;
    static presetLogConfig(option: LogConfig): boolean;
    resetRoomTokenTimer(roomID: string, remainTime?: number): void;
    isDisConnect(): boolean;
    sendMessage(cmd: string, body: any, suc: Function, err: Function): void;
    getNetworkInfo(): {
        timestamp: number;
        maxDeviation: number;
    };
    setProtoFormat(format?: string): void;
    setSdkLoginRelateService(relateService: Array<string>): void;
    getRoomID(): string;
    getServerTimeOffset(): number;
    getReqHead(roomID?: string): any;
    sendSwitchMessage(cmd: string, body: Uint8Array): number;
    onSwitchMessage(callback: (header: any, body: Uint8Array) => {}): any;
    onAppConfigUpdate(callback: (appConfig: any) => void): void;
    onBeforePageUnload(callback: () => void): void;
    getProtoVer(): number;
    sendBusinessMessage(cmd: number, body: Uint8Array, params?: {
        roomID?: string;
    }): number;
    private _zgp_logoutSpan;
    getMsgSpan(spanName: string, roomID: string, isMap?: boolean): any;
    private _zgp_updateTimeOffsetInterval;
    setNetAgentHBMode(mode: "periodic" | "lazy"): void;
    setLocalGeoFencing(): void;
    getLocalGeoFencing(): any;
    /**
     * 开启地理围栏
     * 1、sdk 本地 hardcode 数据
     * 2、根据传入配置选择符合的地理围栏 id
     * 3、首次本地无缓存，直接在符合的地理围栏里选取一个作为当前使用的地理围栏id
     * 4、连接上之后 getConfig 获取地理围栏 id，同时发起调度服务端根据 sdk 配置和服务端配置选取真正使用的地理围栏 id，返回 accesshub，隔离域名则不调度
     * 5、非首次连接则判断缓存的地理围栏 id 是否在传入的地理围栏 id 列表中，若在，则使用缓存的 accesshub 和缓存 id 对应的 log，同时把 id 对应的 accesshub 作为备用域名；若不在，则和首次一样
     * 6、设置了域名隔离则将前面选取的 accesshub 和 log 替换隔离主域名
     */
    private getGeoDomains;
    private _getGeoFencingIDAndDomain;
    static setCloudProxyConfig(proxyList: ZegoProxyInfo[], token: string, enable: boolean): void;
    static setLocalProxyConfig(proxyConfig: ZegoLocalProxyConfig, enable: boolean): void;
    private setAPIReports;
}
