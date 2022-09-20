/// <reference types="node" />
import React from "react";
import { SoundLevelMap, ZegoBroadcastMessageInfo2, ZegoBrowserCheckProp, ZegoNotification } from "../../../model";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoDeviceInfo } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { ZegoCloudUser, ZegoCloudUserList } from "../../../modules/tools/UserListManager";
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
        liveCountdown: number;
        liveStatus: 1 | 0;
        screenSharingUserList: ZegoCloudUserList;
    };
    micStatus: -1 | 0 | 1;
    cameraStatus: -1 | 0 | 1;
    localUserPin: boolean;
    faceModel: 0 | 1 | -1;
    notifyTimer: NodeJS.Timeout | null;
    footerTimer: NodeJS.Timeout;
    cameraDevices: ZegoDeviceInfo[];
    userUpdateCallBack: () => void;
    localStreamID: string;
    safariLimitationNoticed: -1 | 0 | 1;
    componentDidMount(): void;
    componentDidUpdate(preProps: ZegoBrowserCheckProp, preState: {
        localStream: undefined | MediaStream;
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
        messageList: ZegoBroadcastMessageInfo[];
        notificationList: ZegoNotification[];
        micOpen: boolean;
        cameraOpen: boolean;
        showMore: boolean;
        screenSharingUserList: ZegoCloudUserList;
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
    getAllUser(): (ZegoCloudUser | {
        userID: string;
        userName: string;
        pin: boolean;
        streamList: {
            media: MediaStream;
            fromUser: {
                userID: string;
                userName: string;
            };
            micStatus: string;
            cameraStatus: string;
            state: string;
            streamID: string;
        }[];
    })[];
    getShownUser(forceShowNonVideoUser?: boolean): ZegoCloudUserList;
    getHiddenUser(): JSX.Element;
    private _selectedUser;
    handleLayoutChange(selectLayout: "Default" | "Grid" | "Sidebar"): Promise<boolean>;
    getListScreen(): JSX.Element | undefined;
    getLayoutScreen(): JSX.Element | undefined;
    clickVideo(e: MouseEvent): void;
    setLive(): Promise<void>;
    liveCountdownTimer(): void;
    render(): React.ReactNode;
}
