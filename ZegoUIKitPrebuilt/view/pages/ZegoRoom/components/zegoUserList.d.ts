import React from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { ZegoCloudUser, ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import { SoundLevelMap } from "../../../../model";
import ShowPCManageContext, { ShowPCManageType } from "../context/showManage";
export declare class ZegoUserList extends React.PureComponent<{
    core: ZegoCloudRTCCore;
    userList: ZegoCloudUserList;
    selfUserID: string;
    handleSetPin: Function;
    soundLevel?: SoundLevelMap;
}> {
    static contextType?: React.Context<ShowPCManageType>;
    context: React.ContextType<typeof ShowPCManageContext>;
    componentDidMount(): void;
    componentWillUnmount(): void;
    onBodyClick(e: Event): void;
    expandMemberMenu(userID: string | null): void;
    getHeight(userID: string, streamID: string): number;
    isShownPin(user: ZegoCloudUser): boolean;
    render(): React.ReactNode;
}
