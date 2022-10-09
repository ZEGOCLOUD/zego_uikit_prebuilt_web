import React, { ChangeEvent, RefObject } from "react";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoBroadcastMessageInfo2 } from "../../../../model";
export declare class ZegoMessage extends React.PureComponent<{
    messageList: ZegoBroadcastMessageInfo2[];
    sendMessage: (msg: string) => void;
    userID: string;
    closeCallBac: () => void;
}> {
    state: {
        message: string;
    };
    sendTime: number;
    msgContentListRef: RefObject<HTMLDivElement>;
    constructor(props: {
        messageList: ZegoBroadcastMessageInfo2[];
        sendMessage: (msg: string) => void;
        userID: string;
        closeCallBac: () => void;
    });
    componentDidMount(): void;
    componentDidUpdate(prevProps: {
        messageList: ZegoBroadcastMessageInfo[];
        sendMessage: (msg: string) => void;
        userID: string;
        closeCallBac: () => void;
    }): void;
    messageInput(event: ChangeEvent<HTMLInputElement>): void;
    handleSend(): false | undefined;
    render(): React.ReactNode;
}
