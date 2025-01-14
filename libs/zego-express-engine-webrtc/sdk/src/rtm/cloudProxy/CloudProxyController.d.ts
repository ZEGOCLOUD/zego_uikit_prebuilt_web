import { ZegoProxyInfo } from '../zego.entity';
import { ProxySocket } from './ProxySocket';
export declare class ProxyController {
    private proxyList;
    private token;
    /**
 * "/proxy/http"
"/proxy/ws"  get
"/turn/info"
"/intranet/check"
 */
    constructor(proxyList: ZegoProxyInfo[], token: string);
    userID: string;
    enable: boolean;
    get urls(): string[];
    private activeServer?;
    private _zgp_updateActiveServer;
    destroy(): void;
    appID: number;
    init(parmas: {
        appID: number;
    }): void;
    createSocket(target: string, service: number): ProxySocket;
    turnExpireTime?: number;
    handleFetch(path: string | undefined, content: Uint8Array): Promise<ArrayBuffer | never[]>;
}
