import { ENUM_NETWORK_STATE, ZegoInnerEvent } from "./zego.entity";
import { LiveRoomModules } from "./modules";
import { ZReporter } from "./zego.reporter";
import { ZegoDataReport, ZegoLogger } from "../common/zego.entity";
import { ZegoSettingConfig } from "../common/setting.config";
export declare class StateCenter {
    private _zgp_logger;
    private _dataReport;
    id: string;
    _debug: boolean;
    settingConfig: ZegoSettingConfig;
    deviceID: string;
    appConfig: any;
    appConfigEtag: number;
    appConfigFetched: boolean;
    netAppConfig: any;
    logDomain: string;
    bakLogDomain: string;
    requestList: any;
    mode: number;
    connectState: string;
    testNetPackageSize: boolean;
    geoFencing?: {
        id: number;
        accesshub: any;
        logreport: any;
        detaillog: any;
        http3Accesshub: any;
    };
    netGeoFencing: any;
    advanceConfig: {
        customDomain?: {
            accesshub?: string;
            logreport?: string;
            detaillog?: string;
        };
    };
    svrDomains: {
        accesshub?: string;
        logreport?: string;
        detaillog?: string;
    };
    sdkVerNum: number;
    userListenerList: string[];
    set debug(enable: boolean);
    get debug(): boolean;
    _testEnvironment: boolean;
    set testEnvironment(env: boolean);
    get testEnvironment(): boolean;
    _env: number;
    set ENV(env: number);
    get ENV(): number;
    type: "PUBLIC" | "PRIVATE";
    debugCustom: boolean;
    get roomid(): string;
    get serverTimeOffset(): number;
    configOK: boolean;
    role: 0 | 1 | 2;
    appid: number;
    userid: string;
    bizVersion: string;
    relateService: Array<string>;
    server: string;
    serverBak: string;
    idName: string;
    nickName: string;
    maxMemberCount: number;
    roomCreateFlag: number;
    local_time_deviation: number;
    reporter: ZReporter;
    product: string;
    roomServer: string;
    callbackList: {
        [index: string]: Function;
    };
    listenerList: {
        [index: string]: Array<Function>;
    };
    reportList: {
        [index: string]: Function;
    };
    reportSeqList: {
        login: number;
        relogin: number;
    };
    networkState: ENUM_NETWORK_STATE;
    roomRetryTime: number;
    roomModulesList: Array<LiveRoomModules>;
    isMultiRoom: boolean;
    setMultiRoom: boolean;
    protoFormat: string;
    settingFetched: boolean;
    configRoomAuth: boolean;
    configCheckToken: boolean;
    constructor(_zgp_logger: ZegoLogger, _dataReport: ZegoDataReport);
    getRequestId(): string;
    actionListener(listener: string, ...args: Array<any>): void;
    onListener<K extends keyof ZegoInnerEvent>(event: K, callBack: ZegoInnerEvent[K]): boolean;
    offListener<K extends keyof ZegoInnerEvent>(event: K, callBack: ZegoInnerEvent[K]): boolean;
    private _sdkVersion;
    set sdKVersion(version: string);
    get sdKVersion(): string;
    proxyRes(span: any, resolve: any, reject: any): any;
}
