/// <reference types="node" />
import React, { RefObject } from "react";
import { ZegoBroadcastMessageInfo2, ZegoBrowserCheckProp, ZegoCloudRemoteMedia, ZegoNotification } from "../../../model";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
export declare class ZegoRoom extends React.Component<ZegoBrowserCheckProp> {
    state: {
        localStream: undefined | MediaStream;
        remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
        userList: ZegoUser[];
        messageList: ZegoBroadcastMessageInfo2[];
        notificationList: ZegoNotification[];
        micOpen: boolean;
        cameraOpen: boolean;
        showSettings: boolean;
        isNetworkPoor: boolean;
        connecting: boolean;
        firstLoading: boolean;
        seletMic: string | undefined;
        seletSpeaker: string | undefined;
        seletCamera: string | undefined;
        seletVideoResolution: string;
    };
    inviteRef: RefObject<HTMLInputElement>;
    settingsRef: RefObject<HTMLDivElement>;
    moreRef: RefObject<HTMLDivElement>;
    micStatus: -1 | 0 | 1;
    cameraStatus: -1 | 0 | 1;
    notifyTimer: NodeJS.Timeout;
    msgDelayed: boolean;
    componentDidMount(): void;
    componentDidUpdate(preProps: ZegoBrowserCheckProp, preState: {
        localStream: undefined | MediaStream;
        remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
        userList: ZegoUser[];
        messageList: ZegoBroadcastMessageInfo2[];
        notificationList: ZegoNotification[];
        micOpen: boolean;
        cameraOpen: boolean;
        showMore: boolean;
    }): void;
    componentWillUnmount(): void;
    initSDK(): Promise<void>;
    createStream(): Promise<boolean>;
    toggleMic(): Promise<void>;
    toggleCamera(): Promise<boolean>;
    toggleLayOut(layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE"): void;
    sendMessage(msg: string): Promise<void>;
    openSettings(): void;
    onOpenSettings: (event: any) => void;
    handleSetting(): void;
    handleLeave(): void;
    leaveRoom(): void;
    handleCopy(): void;
    getListScreen(): JSX.Element | undefined;
    render(): React.ReactNode;
}
