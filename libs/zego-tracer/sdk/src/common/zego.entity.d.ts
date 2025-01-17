import { ZegoWechatMiniStore } from '../util/zego.store';
import { ZegoWeiXinMiniWebSocket } from '../util/zego.webSocket';
export declare const PROTO_VERSION: any;
export declare enum ZEGO_ENV {
    BROWSER = 0,
    WEIXINMINI = 1
}
export interface InitConfig {
    appID: number;
    env: ZEGO_ENV;
    importantLevel: number;
    levels: number[];
    token?: string;
    serverUrl?: string;
    userID?: string;
    deviceID?: string;
    reportSize?: number;
    reportNum?: number;
    bps?: number;
}
export interface LogParams {
    product: string;
    signature: string;
    appid: number;
    id_name: string;
    deviceid: string;
}
export declare enum ZEGO_BROWSER_TYPE {
    IE = 0,
    FIREFOX = 1,
    CHROME = 2,
    SAFARI = 3,
    OPERA = 4,
    WEIXIN = 5,
    WEIXINMINI = 6,
    UNKOWN = 7
}
export declare const enum ENUM_REMOTE_TYPE {
    DISABLE = 0,
    WEBSOCKET = 1,
    HTTPS = 2
}
export declare const ENUM_LOG_LEVEL: {
    DEBUG: number;
    INFO: number;
    WARN: number;
    ERROR: number;
    REPORT: number;
    DISABLE: number;
    debug: number;
    info: number;
    warn: number;
    error: number;
    report: number;
    disable: number;
};
export declare type LOG_LEVEL_STR = 'debug' | 'info' | 'warn' | 'error' | 'report' | 'disable';
export declare enum E_CLIENT_TYPE {
    ClientType_None = 0,
    ClientType_H5 = 1,
    ClientType_SmallPragram = 2,
    ClientType_Webrtc = 3
}
export interface DataStatisticsItemEvent {
    event: string;
    event_time: number;
    time_consumed?: number;
    msg_ext?: {
        [index: string]: string | number;
    };
}
export interface ReportDataItem {
    content: string;
    seq: number;
    timestamp: number;
    level: number;
    key?: string;
}
export declare const getSeq: Function;
export declare type ZegoWebSocket = ZegoWeiXinMiniWebSocket | WebSocket;
export declare type ZegoStore = LocalForage | ZegoWechatMiniStore;
export declare class Queue<T> {
    items: T[];
    constructor();
    isEmpty(): boolean;
    enqueue(element: T): void;
    dequeue(): T | "Underflow" | undefined;
    front(): T | "No elements in Queue";
    size(): number;
    clear(): void;
    all(): T[];
}
export declare const errorList: {
    TIMEOUT: {
        code: number;
        msg: string;
    };
    DATAEXIST: {
        code: number;
        msg: string;
    };
    BROKEN: {
        code: number;
        msg: string;
    };
};
export declare const SOCKET_DISCONNECT = -1;
export declare enum ENUM_NETWORK_STATE {
    offline = 0,
    online = 1
}
export declare const enum ENUM_CONNECT_STATE {
    disconnected = 0,
    connecting = 1,
    connected = 2
}
export declare class ListNode<K> {
    _id: number | null;
    _data: K | null;
    next: ListNode<K> | null;
    prev: ListNode<K> | null;
    constructor(id?: number | null, data?: K | null);
    set id(id: number | null);
    get id(): null | number;
    set data(data: K | null);
    get data(): K | null;
    hasNext(): null | number;
    hasPrev(): null | number;
}
export declare class LinkedList<T> {
    start: ListNode<T>;
    end: ListNode<T>;
    _idCounter: number;
    _numNodes: number;
    constructor();
    /**
     *   Inserts a node before another node in the linked list
     *   @param {Node} toInsertBefore
     *   @param {Node} node
     */
    insertBefore(toInsertBefore: ListNode<T>, data: T): ListNode<T>;
    /**
     *   Adds data wrapped in a Node object to the end of the linked list
     *   @param {object} data
     */
    addLast(data: T): ListNode<T>;
    /**
     *   Alias for addLast
     *   @param {object} data
     */
    add(data: T): ListNode<T>;
    /**
     *   Gets and returns the first node in the linked list or null
     *   @return {Node/null}
     */
    getFirst(): ListNode<T> | null;
    /**
     *   Gets and returns the last node in the linked list or null
     *   @return {Node/null}
     */
    getLast(): ListNode<T> | null;
    /**
     *   Gets and returns the size of the linked list
     *   @return {number}
     */
    size(): number;
    /**
     *   (Internal) Gets and returns the node at the specified index starting from the first in the linked list
     *   Use getAt instead of this function
     *   @param {number} index
     */
    getFromFirst(index: number): null | ListNode<T>;
    /**
     *   Gets and returns the Node at the specified index in the linked list
     *   @param {number} index
     */
    get(index: number): ListNode<T> | null;
    /**
     *   Removes and returns node from the linked list by rearranging pointers
     *   @param {Node} node
     *   @return {Node}
     */
    remove(node: ListNode<T>): ListNode<T>;
    /**
     *   Removes and returns the first node in the linked list if it exists, otherwise returns null
     *   @return {Node/null}
     */
    removeFirst(): ListNode<T> | null;
    /**
     *   Removes and returns the last node in the linked list if it exists, otherwise returns null
     *   @return {Node/null}
     */
    removeLast(): ListNode<T> | null;
    /**
     *   Removes all nodes from the list
     */
    removeAll(): void;
    /**
     *    Iterates the list calling the given fn for each node
     *    @param {function} fn
     */
    each(iterator: Function): void;
    find(iterator: Function): ListNode<T> | null;
    map(iterator: Function): ListNode<T>[];
    /**
     *    Alias for addLast
     *    @param {object} data
     */
    push(data: T): ListNode<T>;
    /**
     *    Performs insertBefore on the first node
     *    @param {object} data
     */
    unshift(data: T): void;
    /**
     *    Alias for removeLast
     */
    pop(): ListNode<T> | null;
    /**
     *    Alias for removeFirst()
     */
    shift(): ListNode<T> | null;
}
