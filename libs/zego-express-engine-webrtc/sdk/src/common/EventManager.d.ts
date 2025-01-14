export default class EventManager {
    private static instance;
    private constructor();
    static getInstance(): EventManager;
    private _zgp_handlerListMap;
    addEventHandler(listener: string, callBack: Function): boolean;
    removeEventHandler(listener: string, callBack?: Function): boolean;
    emit(listener: string, ...args: Array<any>): void;
    reset(): void;
}
