import React, { ChangeEvent } from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { ZegoCloudUser, ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import ShowManageContext, { ShowManageType } from "../context/showManage";
export declare class ZegoUserList extends React.PureComponent<{
    userList: ZegoCloudUserList;
    core: ZegoCloudRTCCore;
    closeCallBack: (user?: ZegoCloudUser) => void;
}> {
    state: {
        message: string;
    };
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowManageContext>;
    messageInput(event: ChangeEvent<HTMLInputElement>): void;
    isShownPin(user: ZegoCloudUser): boolean;
    render(): React.ReactNode;
}
