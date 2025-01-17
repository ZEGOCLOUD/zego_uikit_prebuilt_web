import { StateCenter } from "../stateCenter";
import { LiveRoomModules } from ".";
import { LiveRoomHandler } from "./liveroomHandler";
import { ZegoDataReport, ZegoLogger } from "../../common/zego.entity";
export declare class UserHandler {
    private _zgp_logger;
    private _zgp_stateCenter;
    private _dataReport;
    private _zgp_liveRoomHandler;
    private _zgp_room;
    private _zgp_userQuerying;
    private _zgp_lastUserQueryTime;
    private _zgp_userTempList;
    private _zgp_userSeq;
    private _zgp_minUserSeq;
    private _zgp_userList;
    private _zgp_userSeqMergeMap;
    private _zgp_userSeqMergeTimer;
    private _zgp_userQueryTimer;
    private _zgp_userListInterval;
    private _zgp_userListMergeInterval;
    private _zgp_anchor_info;
    constructor(_zgp_logger: ZegoLogger, _zgp_stateCenter: StateCenter, _dataReport: ZegoDataReport, _zgp_liveRoomHandler: LiveRoomHandler, _zgp_room: LiveRoomModules);
    loginRsp(msg: any, lastRunState: number): void;
    patchUserList(msg: any): void;
    resetUserHandler(): void;
    private _zgp_fetchUserList;
    private _zgp_fetchUserListWithPage;
    /**
     * 主动获取用户列表信息
     * @param msg
     * @param lastRunState
     * @returns
     */
    private _zgp_handleFetchUserListRsp;
    /**
     * 服务端推送用户更新信息
     * @param msg
     * @returns
     */
    handlePushUserStateUpdateMsg(msg: {
        body: {
            user_actions: any;
            user_list_seq: number;
            room_id: any;
        };
    }): void;
    onUserStateUpdate(roomID: string, updateType: "DELETE" | "ADD", userList: {
        userID: string;
        userName: string;
        role: number;
    }[]): void;
    private _zgp_mergeUserByUserSeq;
    private _zgp_mergeUser;
    private _zgp_handleMergeTimeout;
}
