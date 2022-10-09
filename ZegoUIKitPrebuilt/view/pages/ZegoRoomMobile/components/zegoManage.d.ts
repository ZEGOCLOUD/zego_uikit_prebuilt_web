import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export declare class ZegoManage extends React.PureComponent<{
    selectedUser: ZegoCloudUser;
    closeCallBac: () => void;
    selectCallBac: (type?: "Pin", value?: boolean) => void;
}> {
    select(type?: "Pin", value?: boolean): Promise<void>;
    render(): React.ReactNode;
}
