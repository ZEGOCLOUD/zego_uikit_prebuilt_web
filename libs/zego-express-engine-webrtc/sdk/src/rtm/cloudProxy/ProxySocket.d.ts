export declare enum SocketState {
    CONNECTING = 0,
    OPEN = 1,
    CLOSING = 2,
    CLOSED = 3
}
type BinaryType = 'arraybuffer' | 'blob';
/**
 * 云代理
 */
export declare class ProxySocket {
    private servers;
    private params;
    private activeServer?;
    private isConnecting;
    socket?: WebSocket;
    _binaryType: BinaryType;
    id: number;
    get binaryType(): BinaryType;
    set binaryType(val: BinaryType);
    constructor(servers: string[], params: {
        target: string;
        appid: number;
        token: string;
        userID: string;
    }, activeServer?: string | undefined);
    eventMap: any;
    addEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | AddEventListenerOptions | undefined): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions | undefined): void;
    removeEventListener<K extends keyof WebSocketEventMap>(type: K, listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any, options?: boolean | EventListenerOptions | undefined): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions | undefined): void;
    dispatchEvent(event: Event): boolean;
    get readyState(): SocketState;
    createSocket(): Promise<void>;
    private authProxy;
    setParams(params: any): void;
    open(): void;
    close(): void;
    send(data: any): void;
    onopen(): void;
    onclose(reason?: CloseEvent): void;
    onerror(err?: Event): void;
    onmessage(e: MessageEvent | any): void;
    get bufferedAmount(): number;
    get extensions(): string;
    get protocol(): string;
    url: string;
    CONNECTING: 0;
    OPEN: 1;
    CLOSING: 2;
    CLOSED: 3;
    onActiveServer?: (url: string) => void;
}
export {};
