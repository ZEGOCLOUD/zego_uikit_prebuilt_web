import { AppInfo, ENUM_NETWORK_STATE, ISettingConfig } from '../entity/AccessHubDefine';
export declare class StateCenter {
    networkState: ENUM_NETWORK_STATE;
    userId: string;
    appInfo: AppInfo;
    useNetAgent: boolean;
    specified: boolean;
    clientIP: string;
    timeOffset: number;
    networkRTT: number;
    ntpTimeInfo?: {
        performanceTime: number;
        ntp: number;
    };
    enableHttp3: boolean;
    isDestroyed: boolean;
    customConfig: ISettingConfig;
    lastRecvMsgTime: number;
    constructor();
    get appID(): number;
    get env(): number;
    updateNTP(org: number, xmt: number, now: number): void;
}
