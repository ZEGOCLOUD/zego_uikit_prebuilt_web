import React, { ChangeEvent } from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { ZegoCloudUser, ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
export declare class ZegoUserList extends React.Component<{
    userList: ZegoCloudUserList;
    core: ZegoCloudRTCCore;
    closeCallBack: (user?: ZegoCloudUser) => void;
}> {
    state: {
        message: string;
    };
    messageInput(event: ChangeEvent<HTMLInputElement>): void;
    render(): React.ReactNode;
}
