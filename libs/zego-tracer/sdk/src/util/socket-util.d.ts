import { LinkedList, ListNode } from '../common/zego.entity';
import { StateCenter } from '../common/stateCenter';
declare type MessageItem = {
    data: any;
    seq: number;
    deleted: boolean;
    sendTime: number;
    timeOut: number;
    success: Function | undefined;
    error: Function | undefined;
};
export declare class ZegoSocketService {
    private _product;
    private _pro;
    private _stateCenter;
    private _socket;
    sendCommandList: LinkedList<MessageItem>;
    sendCommandMap: {
        [index: number]: ListNode<MessageItem>;
    };
    private _sendDataCheckOnceCount;
    private _sendDataDropTimeout;
    private _sendDataCheckTimer;
    private _sendDataCheckInterval;
    ENV: number;
    constructor(ENV: number, _product: string, _pro: string, _stateCenter: StateCenter);
    createSocket(server: string): void;
    closeSocket(): void;
    isDisConnect(): boolean;
    sendMessage(header: {
        appid: number;
        seq: number;
        cmd: string;
        [index: string]: string | number;
    }, body: any[], success?: Function, error?: Function, option?: {
        timeOut: number;
    }): number;
    private _checkSendMessageList;
    private _checkMessageListTimeout;
    startCheck(): void;
    stopCheck(): void;
    openHandler(hander: (e: any) => void): void;
    _zgp_eventHandler: {
        error?: (e: any) => void;
        close?: (e: any) => void;
    };
    private responseHandler;
    closeHandler(handler: (e: any) => void): void;
    errorHandler(handler: (e: any) => void): void;
    onMessage(msg: any): void;
}
export {};
