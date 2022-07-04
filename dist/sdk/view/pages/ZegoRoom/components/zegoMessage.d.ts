import React, { ChangeEvent } from "react";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
export declare class ZegoMessage extends React.Component<{
    messageList: ZegoBroadcastMessageInfo[];
    sendMessage: (msg: string) => void;
}> {
    state: {
        message: string;
    };
    messageInput(event: ChangeEvent<HTMLInputElement>): void;
    render(): React.ReactNode;
}
