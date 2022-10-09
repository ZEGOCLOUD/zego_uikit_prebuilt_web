import React, { ChangeEvent, RefObject } from "react";
import { ZegoBroadcastMessageInfo2 } from "../../../../model";
export declare class ZegoMessage extends React.PureComponent<{
    messageList: ZegoBroadcastMessageInfo2[];
    sendMessage: (msg: string) => void;
    selfUserID: string;
}> {
    state: {
        message: string;
    };
    sendTime: number;
    msgListRef: RefObject<HTMLInputElement>;
    componentDidMount(): void;
    componentDidUpdate(preProps: {
        messageList: ZegoBroadcastMessageInfo2[];
    }): void;
    handleSend(): false | undefined;
    scrollToBottom(): void;
    messageInput(event: ChangeEvent<HTMLInputElement>): void;
    render(): React.ReactNode;
}
