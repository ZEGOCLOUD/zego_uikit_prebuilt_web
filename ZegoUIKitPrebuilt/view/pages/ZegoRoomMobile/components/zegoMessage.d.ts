import React, { ChangeEvent, RefObject } from "react";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoBroadcastMessageInfo2 } from "../../../../model";
export declare class ZegoMessage extends React.PureComponent<{
    messageList: ZegoBroadcastMessageInfo2[];
    sendMessage: (msg: string) => void;
    userID: string;
    closeCallBac: () => void;
    getAvatar: (userID: string) => string;
}> {
    state: {
        message: string;
        isFocus: boolean;
    };
    sendTime: number;
    msgContentListRef: RefObject<HTMLDivElement>;
    isIOS: boolean;
    isFireFox: boolean;
    constructor(props: {
        messageList: ZegoBroadcastMessageInfo2[];
        sendMessage: (msg: string) => void;
        userID: string;
        closeCallBac: () => void;
        getAvatar: (userID: string) => string;
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
    onFocus: (ev: ChangeEvent<HTMLInputElement>) => void;
    onBlur: (ev: ChangeEvent<HTMLInputElement>) => void;
    render(): React.ReactNode;
}
