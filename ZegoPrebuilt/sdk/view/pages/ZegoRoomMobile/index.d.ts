/// <reference types="node" />
import React from "react";
import { ZegoBroadcastMessageInfo2, ZegoBrowserCheckProp, ZegoCloudRemoteMedia, ZegoNotification } from "../../../model";
import { ZegoUser, ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
export declare class ZegoRoomMobile extends React.Component<ZegoBrowserCheckProp> {
    state: {
        localStream: undefined | MediaStream;
        remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
        userList: ZegoUser[];
        messageList: ZegoBroadcastMessageInfo2[];
        notificationList: ZegoNotification[];
        micOpen: boolean;
        cameraOpen: boolean;
        showMore: boolean;
        connecting: boolean;
        firstLoading: boolean;
        cameraFront: boolean;
        showFooter: boolean;
        isNetworkPoor: boolean;
    };
    micStatus: -1 | 0 | 1;
    cameraStatus: -1 | 0 | 1;
    faceModel: 0 | 1 | -1;
    notifyTimer: NodeJS.Timeout | null;
    footerTimer: NodeJS.Timeout;
    componentDidMount(): void;
    componentDidUpdate(preProps: ZegoBrowserCheckProp, preState: {
        localStream: undefined | MediaStream;
        remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
        userList: ZegoUser[];
        messageList: ZegoBroadcastMessageInfo[];
        notificationList: ZegoNotification[];
        micOpen: boolean;
        cameraOpen: boolean;
        showMore: boolean;
    }): void;
    initSDK(): Promise<void>;
    createStream(): Promise<boolean>;
    toggleMic(): Promise<void>;
    toggleCamera(): Promise<void>;
    switchCamera(): Promise<void>;
    toggleLayOut(layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE"): void;
    sendMessage(msg: string): Promise<void>;
    onblur: (e: {
        path?: any[];
    }) => void;
    openMore(): void;
    leaveRoom(): void;
    getListScreen(): JSX.Element | undefined;
    render(): React.ReactNode;
}
