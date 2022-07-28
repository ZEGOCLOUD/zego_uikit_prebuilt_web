import React, { ChangeEvent } from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
export declare class ZegoUserList extends React.Component<{
    userList: ZegoUser[];
    core: ZegoCloudRTCCore;
    closeCallBack: () => void;
}> {
    state: {
        message: string;
    };
    messageInput(event: ChangeEvent<HTMLInputElement>): void;
    render(): React.ReactNode;
}
