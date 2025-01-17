export declare const PROTO_VERSION: string;
export declare enum ModelType {
    Normal = 0,
    Private = 1
}
export interface AppInfo {
    appID: number;
    env: number;
    mode?: number;
    deviceID?: string;
    connVer?: number;
    geoFencing?: {
        type: number;
        list: number[];
    };
    model?: ModelType;
}
export interface ISettingConfig {
    enableHttp3?: boolean;
}
export declare enum LinkType {
    WebSocket = 0,
    WebTransport = 1
}
export declare enum SocketState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3
}
export declare enum ENUM_NETWORK_STATE {
    offline = 0,
    online = 1
}
export interface ConnectEvent {
    url: string;
    time_consumed: number;
    connect_type: number;
    error: number;
}
export interface HttpReq {
    service: BusinessService;
    headers?: {
        name: string;
        val: string;
    }[];
    body: any;
    idName: string;
    ack?: boolean;
    stick?: string;
    location: string;
    method_no: Method;
    disableLog?: boolean;
    reduceRspHeaders?: boolean;
}
export declare enum DataFormat {
    PB = 0,
    JSON = 1
}
export interface HttpReq2 {
    interfaceID: number;
    resID?: string;
    urlParams?: string;
    headers?: {
        name: string;
        val: string;
    }[];
    body: any;
    idName: string;
    token: string;
    ack?: boolean;
    method: Method;
    format?: DataFormat;
    mode?: Mode;
    reduceRspHeaders?: boolean;
}
export interface PCOption {
    encode?: boolean;
    path?: string;
    query?: string;
    messageType?: number;
    isMsgCache?: boolean;
}
export declare enum AccessHubMessageType {
    MSG_TYPE_STREAM_CLOSED = 2,
    MSG_TYPE_CLOSE_CONNECTION = 3,
    MSG_TYPE_HTTP_REQUEST = 4,
    MSG_TYPE_HTTP_RESPONSE = 5,
    MSG_TYPE_HB_REQUEST = 12,
    MSG_TYPE_HB_RESPONSE = 13,
    MSG_TYPE_GET_CONFIG_REQUEST = 14,
    MSG_TYPE_GET_CONFIG_RESPONSE = 15,
    MSG_TYPE_HTTP_REQUEST_ACK = 16,
    MSG_TYPE_PC_UPWARD_MESSAGE = 17,
    MSG_TYPE_PC_UPWARD_MESSAGE_ACK = 18,
    MSG_TYPE_PC_ESTABLISHED = 19,
    MSG_TYPE_PC_BROKEN = 20,
    MSG_TYPE_PC_DOWNWARD_MESSAGE = 21,
    MSG_TYPE_REDIRECT = 22,
    MSG_TYPE_GET_APPCONFIG_REQUEST = 23,
    MSG_TYPE_GET_APPCONFIG_RESPONSE = 24,
    MSG_TYPE_PUSH_APPCONFIG = 25,
    MSG_TYPE_ACCESSHUB_DISPATCH_REQUEST = 26,
    MSG_TYPE_ACCESSHUB_DISPATCH_RESPONSE = 27,
    MSG_TYPE_PUSH_EXCEPTION = 30,
    MSG_TYPE_HTTP_REQUEST2 = 33,
    MSG_TYPE_REDIRECT2 = 34,
    MSG_TYPE_ACCESSHUB_DISPATCH_REQUEST2 = 35,
    MSG_TYPE_ACCESSHUB_DISPATCH_RESPONSE2 = 36,
    MSG_TYPE_GET_SVRADDR_REQUEST = 39,
    MSG_TYPE_GET_SVRADDR_RESPONSE = 40
}
export declare enum AccessHub_Error_Code {
    ACCESSHUB_INVALID_FRAME = 20000,
    ACCESSHUB_NEED_ENCRYPT = 20001,
    ACCESSHUB_DECRYPT = 20002,
    ACCESSHUB_MSGTYPE = 20003,
    ACCESSHUB_UNMARSHAL = 20004,
    ACCESSHUB_TIMEOUT = 20005,
    ACCESSHUB_CONNECT = 20006,
    ACCESSHUB_BROKEN = 20007,
    ACCESSHUB_INTERNAL_ERROR = 20008,
    ACCESSHUB_MARSHAL = 20009,
    ACCESSHUB_UNSUPPORTED_SERVICE = 20010,
    ACCESSHUB_TOO_FREQUENTLY = 20011,
    ACCESSHUB_INVALID_APPID = 20012,
    ACCESSHUB_HB_TIMEOUT = 20013,
    ACCESSHUB_INVALID_SIGNATURE = 20014
}
export declare enum BusinessService {
    SERVICE_UNSET = 0,
    SERVICE_MEDIAGW = 1,
    SERVICE_LIVEROOM = 2,
    SERVICE_MIX = 3,
    SERVICE_ZEUS = 4,
    SERVICE_ZPUSH = 5,
    SERVICE_L3 = 6,
    SERVICE_TALKLINE = 7,
    SERVICE_EDUSUITE = 8,
    SERVICE_ZIM = 9,
    SERVICE_ClOUD_SETTING = 10,
    SERVICE_ZEUSHB = 11,
    SERVICE_USER_LOGIC = 12,
    SERVICE_UNIFYDISPATCH = 13,
    SERVICE_QUALITY = 14,
    SERVICE_SECURITY = 15,
    SERVICE_KTVCPR = 16,
    SERVICE_SWITCH4LIVEROOM = 17,
    SERVICE_WEBRTC_SIGNAL = 18,
    SERVICE_L3_WEBRTC_SIGNAL = 19,
    SERVICE_VIDEOCPR = 20,
    SERVICE_CDN = 21,
    SERVICE_CLOUDRECORD = 22,
    SERVICE_INNER_ECHO = 23,
    SERVICE_OUTER_ECHO = 24,
    SERVICE_LOCALHOST_ECHO = 25,
    SERVICE_ECHO = 26,
    SERVICE_DOCSERVICE = 27,
    SERVICE_AUTHSVR = 28
}
export declare enum ZegoconnRunEnv {
    ZEGOCONN_RUN_ENV_UNSET = 0,
    ZEGOCONN_RUN_ENV_BROWSER = 1,
    ZEGOCONN_RUN_ENV_APPLET = 2
}
export declare enum Mode {
    Mode_UNSET = 0,
    MODE_ONLINE = 1,
    MODE_TEST = 2,
    MODE_ALPHA = 3
}
export declare const ModeMap: {
    1: string;
    2: string;
    3: string;
};
export declare enum StreamType {
    HTTP = 0,
    PC = 1,
    OTHER = 2
}
export declare enum DestroyType {
    NONE = 0,
    BROKEN = 1,
    DISCONNECT = 2
}
export interface ZegoError {
    code: number;
    msg: string;
}
export declare const ENUM_CONNECT_STATE: {
    disconnect: number;
    connecting: number;
    connected: number;
};
export declare enum PcConnectState {
    CONNECTED = 0,
    DISCONNECT = 1,
    BROKEN = 2
}
export declare const Stick: {
    DISPATCH: string;
    RETRY: string;
    ABORT: string;
    NEXT_GROUP: string;
    PUSH_APP_CONFIG: string;
};
export declare const externalErrorList: AccessHub_Error_Code[];
export declare enum NetWorkState {
    offline = 0,
    online = 1
}
export declare enum ConnectionClosedAction {
    ACTION_RESERVED = 0,
    ACTION_DISPATCH = 1,
    ACTION_RETRY = 2,
    ACTION_NEXT_NODE = 3,
    ACTION_ABORT = 4,
    ACTION_NEXT_GROUP = 5,
    ACTION_IDLE = 6
}
export declare enum Method {
    METHOD_UNSET = 0,
    METHOD_GET = 1,
    METHOD_POST = 2,
    METHOD_PUT = 3,
    METHOD_PATCH = 4,
    METHOD_DELETE = 5,
    METHOD_HEAD = 6,
    METHOD_OPTIONS = 7
}
export declare enum DisconnectedType {
    CLOSE = 0,
    TEMP = 1,
    TIMEOUT = 2
}
export declare enum ConnectedType {
    AUTO = 0,
    MANUAL = 1
}
export declare enum BrokenType {
    EMPTY = 0,
    CLOSE = 1
}
export interface ERROR {
    code: number;
    msg: string;
}
export declare const typeMap: {
    2: string;
    3: string;
    4: string;
    5: string;
    12: string;
    13: string;
    14: string;
    15: string;
    16: string;
    17: string;
    18: string;
    19: string;
    20: string;
    21: string;
    22: string;
    23: string;
    24: string;
    25: string;
    26: string;
    27: string;
    30: string;
    33: string;
    34: string;
    35: string;
    36: string;
    39: string;
    40: string;
};
