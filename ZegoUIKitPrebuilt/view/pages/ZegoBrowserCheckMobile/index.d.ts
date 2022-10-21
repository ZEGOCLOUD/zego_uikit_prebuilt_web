import React, { ChangeEvent, RefObject } from "react";
import { ZegoBrowserCheckProp } from "../../../model";
export declare class ZegoBrowserCheckMobile extends React.Component<ZegoBrowserCheckProp> {
    state: {
        localStream: undefined;
        localVideoStream: undefined;
        localAudioStream: undefined;
        userName: string;
        videoOpen: boolean;
        audioOpen: boolean;
        copied: boolean;
        isVideoOpening: boolean;
        isJoining: boolean;
        sharedLinks: {
            name: string | undefined;
            url: string | undefined;
            copied: boolean;
        }[] | undefined;
    };
    videoRef: RefObject<HTMLVideoElement>;
    inviteRef: RefObject<HTMLInputElement>;
    audioRefuse: boolean;
    videoRefuse: boolean;
    constructor(props: ZegoBrowserCheckProp);
    componentDidMount(): Promise<void>;
    componentWillUnmount(): void;
    createStream(videoOpen: boolean, audioOpen: boolean): Promise<MediaStream>;
    toggleStream2(type: "video" | "audio"): Promise<void>;
    toggleStream1(type: "video" | "audio"): Promise<void>;
    toggleStream(type: "video" | "audio"): Promise<void>;
    joinRoom(): Promise<void>;
    handleChange(event: ChangeEvent<HTMLInputElement>): void;
    render(): React.ReactNode;
}
