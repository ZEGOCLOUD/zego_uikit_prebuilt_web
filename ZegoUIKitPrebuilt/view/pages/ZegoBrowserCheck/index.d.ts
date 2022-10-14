import React, { ChangeEvent, RefObject } from "react";
import { ZegoBrowserCheckProp } from "../../../model";
export declare class ZegoBrowserCheck extends React.Component<ZegoBrowserCheckProp> {
    state: {
        localStream: undefined;
        localVideoStream: undefined;
        localAudioStream: undefined;
        userName: string;
        videoOpen: boolean;
        audioOpen: boolean;
        isVideoOpening: boolean;
        isCopied: boolean;
        isJoinRoomFailed: boolean;
        joinRoomErrorTip: string;
        showDeviceAuthorAlert: boolean;
        selectMic: undefined;
        selectSpeaker: undefined;
        selectCamera: undefined;
        selectVideoResolution: string;
        isJoining: boolean;
        showNonVideo: boolean | undefined;
        sharedLinks: {
            name: string | undefined;
            url: string | undefined;
            copied: boolean;
        }[] | undefined;
        showZegoSettings: boolean;
        isSmallSize: boolean;
    };
    videoRef: RefObject<HTMLVideoElement>;
    inviteRef: RefObject<HTMLInputElement>;
    audioRefuse: boolean;
    videoRefuse: boolean;
    constructor(props: ZegoBrowserCheckProp);
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    onResize(): void;
    throttleResize: () => void;
    getDevices(): Promise<{
        selectMic: string | undefined;
        selectSpeaker: string | undefined;
        selectCamera: string | undefined;
        selectVideoResolution: string;
    }>;
    createStream(videoOpen: boolean, audioOpen: boolean): Promise<MediaStream>;
    toggleStream(type: "video" | "audio"): Promise<void>;
    joinRoom(): Promise<void>;
    handleChange(event: ChangeEvent<HTMLInputElement>): void;
    openSettings(): void;
    render(): React.ReactNode;
}
