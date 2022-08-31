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
        seletMic: undefined;
        seletSpeaker: undefined;
        seletCamera: undefined;
        seletVideoResolution: string;
        isJoining: boolean;
        showNonVideo: boolean | undefined;
    };
    videoRef: RefObject<HTMLVideoElement>;
    inviteRef: RefObject<HTMLInputElement>;
    audioRefuse: boolean;
    videoRefuse: boolean;
    constructor(props: ZegoBrowserCheckProp);
    componentDidMount(): Promise<void>;
    getDevices(): Promise<{
        seletMic: string | undefined;
        seletSpeaker: string | undefined;
        seletCamera: string | undefined;
        seletVideoResolution: string;
    }>;
    createStream(videoOpen: boolean, audioOpen: boolean): Promise<MediaStream>;
    toggleStream(type: "video" | "audio"): Promise<void>;
    joinRoom(): Promise<void>;
    handleChange(event: ChangeEvent<HTMLInputElement>): void;
    handleCopy(): void;
    openSettings(): void;
    render(): React.ReactNode;
}
