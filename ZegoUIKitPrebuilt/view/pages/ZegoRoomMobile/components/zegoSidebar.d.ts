import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
export declare class ZegoSidebar extends React.PureComponent<ZegoGridLayoutProps> {
    get userList(): ZegoCloudUserList;
    get pinUser(): import("../../../../modules/tools/UserListManager").ZegoCloudUser;
    render(): React.ReactNode;
}
