/// <reference types="node" />
import React from "react";
import { SoundLevelMap, ZegoBroadcastMessageInfo2, ZegoBrowserCheckProp, ZegoNotification } from "../../../model";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudUserList } from "../../../modules/tools/UserListManager";
export declare class ZegoRoomMobile extends React.Component<ZegoBrowserCheckProp> {
    static contextType: React.Context<import("./context/showManage").ShowManageType>;
    state: {
        localStream: undefined | MediaStream;
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE" | "LAYOUT" | "MANAGE";
        userLayoutStatus: "Default" | "Grid" | "Sidebar";
        zegoCloudUserList: ZegoCloudUserList;
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
        soundLevel: SoundLevelMap;
    };
    micStatus: -1 | 0 | 1;
    cameraStatus: -1 | 0 | 1;
    localUserPin: boolean;
    faceModel: 0 | 1 | -1;
    notifyTimer: NodeJS.Timeout | null;
    footerTimer: NodeJS.Timeout;
    userUpdateCallBack: () => void;
    localStreamID: string;
    componentDidMount(): void;
    componentDidUpdate(preProps: ZegoBrowserCheckProp, preState: {
        localStream: undefined | MediaStream;
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
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
    toggleLayOut(layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE" | "LAYOUT"): void;
    sendMessage(msg: string): Promise<void>;
    onblur: (e: {
        path?: any[];
    }) => void;
    openMore(): void;
    leaveRoom(): void;
    getShownUser(forceShowNonVideoUser?: boolean): ZegoCloudUserList;
    private _selectedUser;
    getListScreen(): JSX.Element | undefined;
    getLayoutScreen(): JSX.Element | undefined;
    render(): React.ReactNode;
}
