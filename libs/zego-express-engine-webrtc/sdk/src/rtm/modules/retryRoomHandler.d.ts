import { ZegoError } from '../zego.entity';
import { RoomHandler } from './roomHandler';
import { StateCenter } from '../stateCenter';
import { ZegoRoomConfig, ZegoUser } from '../../../code/zh/ZegoExpressEntity.rtm';
import { LiveRoomModules } from '.';
import { RetryHandler } from "../../common/retryHandler";
import type { ZegoLogger } from "../../common/zego.entity";
export declare class RetryRoomHandler extends RetryHandler {
    protected _zgp_logger: ZegoLogger;
    protected _zgp_stateCenter: StateCenter;
    private _zgp_room;
    roomHandler: RoomHandler;
    roomID: string;
    token: string;
    user: ZegoUser;
    config?: ZegoRoomConfig;
    private _zgp_activeStartTime;
    /**用于检测网络进行重试 */
    private _zgp_retryNetCount;
    /**用于检测网络重试最大次数 */
    private _zgp_retryNetMaxTimes;
    private _zgp_subLoginSpan;
    private _zgp_spanKey;
    private get _zgp_reporter();
    loginCompleted: boolean;
    constructor(_zgp_logger: ZegoLogger, _zgp_stateCenter: StateCenter, _zgp_room: LiveRoomModules);
    renewLocalToken(token: string, remainTime?: number): void;
    initRoom(roomHandler: RoomHandler, roomID: string, token: string, user: ZegoUser, config?: ZegoRoomConfig): void;
    active(isFirst?: boolean): void;
    startMaxTime(): void;
    stopMaxTime(): void;
    onactive(success: boolean, error?: ZegoError): void;
    retryLoginRoom(retryNow?: boolean, needResetSession?: boolean): void;
    handleError(error: ZegoError, isServerError?: boolean): boolean;
    loginRoomCallback: {
        success?: Function;
        fail?: Function;
    };
    setLoginRoomCallback(success?: Function, fail?: Function): void;
    loginFail(err: ZegoError): void;
    handleLoginFinish(success: boolean, error?: ZegoError, isServerError?: boolean): void;
    invalid(): void;
    private _zgp_handelStopRetry;
    resetCallBack(): void;
}
