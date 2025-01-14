import { ZegoLocalProxyConfig } from '../zego.entity';
declare enum ServiceType {
    Accesshub = 0,
    Logger = 1,
    Detaillog = 2
}
export declare class LocalProxyController {
    private _zgp_serverConfig;
    constructor(_zgp_serverConfig: ZegoLocalProxyConfig);
    init(options: {
        appID: number;
    }): void;
    createSocket(target: string, serviceType: ServiceType): WebSocket;
    private _zgp_changeDestUrl;
    destroy(): void;
}
export {};
