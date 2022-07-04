import React from "react";
import { ZegoBrowserCheckProp, ZegoCloudRemoteMedia } from "../../../model";
import { ZegoUser, ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
export declare class ZegoRoom extends React.Component<ZegoBrowserCheckProp> {
    state: {
        localStream: undefined | MediaStream;
        remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
        userList: ZegoUser[];
        messageList: ZegoBroadcastMessageInfo[];
        notificationList: string[];
    };
    micOpen: boolean | undefined;
    cameraOpen: boolean | undefined;
    componentDidMount(): void;
    initSDK(): Promise<void>;
    createStream(video: boolean, audio: boolean): Promise<boolean>;
    toggleMic(): Promise<void>;
    toggleCamera(): Promise<void>;
    toggleLayOut(layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE"): void;
    sendMessage(msg: string): void;
    openSettings(): void;
    leaveRoom(): void;
    getListScreen(): JSX.Element | undefined;
    render(): React.ReactNode;
}
