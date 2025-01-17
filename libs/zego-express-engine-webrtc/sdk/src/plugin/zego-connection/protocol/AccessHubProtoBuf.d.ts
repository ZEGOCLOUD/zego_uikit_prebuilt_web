import { AccessHubMessageType, LinkType } from '../entity/AccessHubDefine';
import { StateCenter } from '../impl/stateCenter';
export declare class AccessHubProtoBuf {
    protected stateCenter: StateCenter;
    constructor(stateCenter: StateCenter);
    private _protoInstance;
    private _protoMap;
    encodeRequest(msgType: AccessHubMessageType, body: any, streamID: number, linkType: LinkType): Uint8Array;
    decodeResponse(uint8: Uint8Array, linkType: LinkType): [number, number, any, number];
    decodeBody(uint8_body: Uint8Array, msgType: number): any;
    decodeConfigMessage(buffer: Uint8Array): any;
    private _encode;
    private _decode;
}
