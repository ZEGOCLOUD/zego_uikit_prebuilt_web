/// <reference types="node" />
import React, { RefObject } from "react";
import { SoundLevelMap, ZegoBroadcastMessageInfo2, ZegoBrowserCheckProp, ZegoNotification } from "../../../model";
import { ZegoCloudUserList } from "../../../modules/tools/UserListManager";
export declare class ZegoRoom extends React.Component<ZegoBrowserCheckProp> {
    state: {
        localStream: undefined | MediaStream;
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
        zegoCloudUserList: ZegoCloudUserList;
        messageList: ZegoBroadcastMessageInfo2[];
        notificationList: ZegoNotification[];
        micOpen: boolean;
        cameraOpen: boolean;
        showSettings: boolean;
        isNetworkPoor: boolean;
        connecting: boolean;
        firstLoading: boolean;
        selectMic: string | undefined;
        selectSpeaker: string | undefined;
        selectCamera: string | undefined;
        selectVideoResolution: string;
        showNonVideoUser: boolean;
        videoShowNumber: number;
        gridRowNumber: number;
        layout: "Default" | "Grid" | "Sidebar";
        showLayoutSettingsModel: boolean;
        isLayoutChanging: boolean;
        soundLevel: SoundLevelMap;
        liveCountdown: number;
        liveStatus: 1 | 0;
        isScreenSharingBySelf: boolean;
        screenSharingStream: undefined | MediaStream;
        screenSharingUserList: ZegoCloudUserList;
    };
    settingsRef: RefObject<HTMLDivElement>;
    moreRef: RefObject<HTMLDivElement>;
    micStatus: -1 | 0 | 1;
    cameraStatus: -1 | 0 | 1;
    notifyTimer: NodeJS.Timeout;
    msgDelayed: boolean;
    localUserPin: boolean;
    localStreamID: string;
    screenSharingStreamID: string;
    isCreatingScreenSharing: boolean;
    fullScreen: boolean;
    userUpdateCallBack: () => void;
    componentDidMount(): void;
    componentDidUpdate(preProps: ZegoBrowserCheckProp, preState: {
        localStream: undefined | MediaStream;
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
        zegoCloudUserList: ZegoCloudUserList;
        messageList: ZegoBroadcastMessageInfo2[];
        notificationList: ZegoNotification[];
        micOpen: boolean;
        cameraOpen: boolean;
        showMore: boolean;
        layout: string;
        videoShowNumber: number;
        liveStatus: 1 | 0;
        isScreenSharingBySelf: boolean;
        screenSharingUserList: ZegoCloudUserList;
    }): void;
    componentWillUnmount(): void;
    initSDK(): Promise<void>;
    createStream(): Promise<boolean>;
    toggleMic(): Promise<void>;
    toggleCamera(): Promise<boolean>;
    toggleScreenSharing(): Promise<void>;
    createScreenSharing(): Promise<void>;
    closeScreenSharing(): void;
    toggleLayOut(layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE"): void;
    sendMessage(msg: string): Promise<void>;
    openSettings(): void;
    onOpenSettings: (event: any) => void;
    handleSetting(): void;
    handleLeave(): void;
    leaveRoom(): void;
    computeByResize(): void;
    onWindowResize: () => void;
    showLayoutSettings(show: boolean): void;
    changeLayout(type: string): Promise<unknown>;
    getAllUser(): (import("../../../modules/tools/UserListManager").ZegoCloudUser | {
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
    get getScreenSharingUser(): ZegoCloudUserList;
    getHiddenUser(): JSX.Element;
    getLayoutScreen(): JSX.Element | undefined;
    handleSetPin(userID: string): void;
    handleFullScreen(fullScreen: boolean): void;
    setLive(): Promise<void>;
    liveCountdownTimer(): void;
    render(): React.ReactNode;
}