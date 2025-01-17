export declare class EventManager {
    constructor();
    private _handlerListMap;
    addEventHandler(listener: string, callBack: Function): boolean;
    removeEventHandler(listener: string, callBack?: Function): boolean;
    emit(listener: string, ...args: Array<any>): void;
}
