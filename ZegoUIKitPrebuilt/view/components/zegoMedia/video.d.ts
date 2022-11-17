/// <reference types="node" />
import React from "react";
import { ZegoCloudUser } from "../../../modules/tools/UserListManager";
import ShowManageContext, { ShowManageType } from "../../pages/context/showManage";
import flvjs from "flv.js";
export default class ZegoVideo extends React.PureComponent<{
    muted: boolean;
    classList: string;
    userInfo: ZegoCloudUser;
    onPause?: Function;
    onCanPlay?: Function;
}> {
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowManageContext>;
    videoRef: HTMLVideoElement | null;
    flvPlayer: flvjs.Player | null;
    timer: NodeJS.Timer | null;
    loadTimer: NodeJS.Timer | null;
    lastDecodedFrame: number;
    retryTime: number;
    retryTimer: NodeJS.Timer | null;
    state: {
        isPaused: boolean;
    };
    componentDidMount(): void;
    componentDidUpdate(preProps: {
        userInfo: ZegoCloudUser;
    }): void;
    onloadedmetadata: () => void;
    initVideo(el: HTMLVideoElement): void;
    initFLVPlayer(videoElement: HTMLVideoElement, url: string): void;
    componentWillUnmount(): void;
    render(): React.ReactNode;
}
