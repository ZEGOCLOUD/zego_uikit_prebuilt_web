export declare const ROOMVERSION: "V1" | "V2";
export declare const CUSTOMER: string;
export declare enum LIVEROOM_VER {
    SWITCH_ONE = 1,
    SWITCH_TWO = 2
}
/**
 * 地理围栏类型。
 */
export declare enum ZegoGeoFenceType {
    /**
     * 不使用地理围栏。
     */
    ZegoGeoFenceTypeNone = 0,
    /**
     * 包括指定的地理围栏信息。
     */
    ZegoGeoFenceTypeInclude = 1,
    /**
     * 排除指定的地理围栏信息。
     */
    ZegoGeoFenceTypeExclude = 2
}
export interface GeoItem {
    id: number;
    relative_geofencings: number[];
    accesshub: string;
    logreport: string;
    detaillog: string;
    http3Accesshub: string;
}
export declare const ERROR_CODES: {
    ROOM_SESSION_ID_ERR: number;
};
export interface DataStatisticsItemEvent {
    event: string;
    event_time: number;
    time_consumed?: number;
    msg_ext?: {
        [index: string]: string | number;
    };
}
export declare enum TermType {
    TT_NONE = 0,
    TT_PC = 1,
    TT_IOS = 2,
    TT_ANDROID = 3,
    TT_MAC = 4,
    TT_LINUX = 5,
    TT_WEB = 6,
    TT_MINIPROGRAM = 7,
    TT_UNKNOWN = 32
}
export interface DataStatisticsItem {
    event_time: number;
    time_consumed: number;
    error: number;
    message: string;
    events: DataStatisticsItemEvent[];
    seq?: number;
    event_id?: string;
    msg_ext?: any;
    itemtype?: string;
    event?: string;
    client_type?: E_CLIENT_TYPE;
}
export interface DataStatistics {
    [index: string]: DataStatisticsItem;
}
export declare enum ENUM_SIGNAL_STATE {
    disconnected = 0,
    connecting = 1,
    connected = 2
}
export declare const MAX_TRY_CONNECT_COUNT = 1;
export declare const SEND_MSG_RESET = 2;
export declare const SEND_MSG_TIMEOUT = 1;
export declare const MAX_TRY_HEARTBEAT_COUNT = 5;
export declare const MAX_STREAM_ID_LENGTH = 256;
export declare const MAX_USER_ID_LENGTH = 64;
export declare const MAX_USER_NAME_LENGTH = 256;
export declare const MAX_ROOM_ID_LENGTH = 128;
export declare const MAX_MIX_TASK_ID_LENGTH = 256;
export declare enum ENUM_RUN_STATE {
    logout = 0,
    trylogin = 1,
    login = 2
}
export declare enum TRACER_LEVEL {
    I = 0,
    H = 10,
    M = 100,
    L = 1000
}
export declare enum ENUM_NETWORK_STATE {
    offline = 0,
    online = 1
}
export declare enum NetType {
    NT_NONE = 0,
    NT_LINE = 1,
    NT_WIFI = 2,
    NT_2G = 3,
    NT_3G = 4,
    NT_4G = 5,
    NT_UNKNOWN = 32
}
export declare const MINIUM_HEARTBEAT_INTERVAL = 3000;
export declare const ENUM_STREAM_UPDATE_CMD: {
    added: number;
    deleted: number;
    updated: number;
};
export declare const SERVER_ERROR_CODE = 10000;
export interface ChatInfo {
    id_name: string;
    nick_name: string;
    role: number;
    msg_id: string;
    msg_category: number;
    msg_type: number;
    msg_content: string;
    send_time: number;
}
export interface UserInfo {
    userID: string;
    userName: string;
}
export declare enum E_CLIENT_TYPE {
    ClientType_None = 0,
    ClientType_H5 = 1,
    ClientType_SmallProgram = 2,
    ClientType_Webrtc = 3
}
export declare const REPORT_ACTION: {
    eventStart: string;
    eventEndWithMsgInfo: string;
    addEventMsg: string;
    addEvent: string;
    eventEnd: string;
    addMsgInfo: string;
};
export interface LiveRoomHeader {
    Protocol: string;
    cmd: string;
    appid: number;
    seq: number;
    user_id: string;
    session_id: string;
    room_id: string;
    room_session_id: string;
    biz_version: string;
}
type RoomStateUpdateCallBack = (roomID: string, state: "DISCONNECTED" | "CONNECTING" | "CONNECTED", errorCode: number, extendedData: string, reason: string, isSwitchRoom?: boolean) => void;
export interface ZegoInnerEvent {
    /**
     * 房间和服务期之间的连接状态发生变化时触发
     */
    _roomStateUpdate: RoomStateUpdateCallBack;
    roomLoginResponse: (msg: any) => void;
    _roomLogin: (roomID: string, token: string) => void;
    _appConfigRsp: () => void;
    _netAppConfigRsp: (appConfig: any) => void;
    _connectChanged: (state: string, options: any) => void;
    HBResponse: (msg: any, roomID: string) => void;
    _getAnchorInfo: (anchorID: string, anchorName: string) => void;
    _tokenRenewed: (token: string, roomID: string) => void;
    _protobufResponse: (result: ArrayBuffer) => {};
    _stopStream: (stopStreamList: string[], reason: {
        code: number;
        message: string;
    }) => void;
    _cloudSettingNotify: (file: string, setting: any) => void;
    _settingCanFetch: (msg: any) => void;
    _userTransUpdate: (roomID: string, transChannel: string, transResults: any) => void;
    _uaHeartBeatTimeout: () => void;
    _beforeSwitchRoom: (fromRoomID: string) => void;
    _afterSwitchRoom: (toRoomID: string, isLoginSuccess: boolean) => void;
}
export declare const MODULE_TIPS: {
    MESSAGE: string;
};
export interface ZegoError {
    code: number;
    msg: string;
}
export interface ZegoProxyInfo {
    ip?: string;
    port?: number;
    hostName: string;
    userName?: string;
    password?: string;
}
export interface ZegoLocalProxyConfig {
    accesshubProxy: string;
    loggerProxy?: string;
    detaillogProxy?: string;
}
export {};
