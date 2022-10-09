import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ShowManageContext, { ShowManageType } from "../context/showManage";
export declare class ZegoMore extends React.PureComponent<{
    user: ZegoCloudUser;
}> {
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowManageContext>;
    render(): React.ReactNode;
}
