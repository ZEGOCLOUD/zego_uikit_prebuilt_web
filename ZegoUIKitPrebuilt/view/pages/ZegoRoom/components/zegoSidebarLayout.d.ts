import React from "react";
import { ZegoSidebarLayoutProps } from "../../../../model";
import ShowPCManageContext, { ShowPCManageType } from "../context/showManage";
export declare class ZegoSidebarLayout extends React.PureComponent<ZegoSidebarLayoutProps> {
    get pinUser(): import("../../../../modules/tools/UserListManager").ZegoCloudUser;
    static contextType?: React.Context<ShowPCManageType>;
    context: React.ContextType<typeof ShowPCManageContext>;
    render(): React.ReactNode;
}
