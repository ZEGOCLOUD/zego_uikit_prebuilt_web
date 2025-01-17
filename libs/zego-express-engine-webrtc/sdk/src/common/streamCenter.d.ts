import { ZegoRoomInfo } from "./zego.entity";
export declare abstract class ZegoStreamCenter {
    publisherList: {
        [index: string]: any;
    };
    playerList: {
        [index: string]: any;
    };
    static worker: any;
    constructor();
    abstract getRoomByStreamID(streamID: string): ZegoRoomInfo | undefined;
}
