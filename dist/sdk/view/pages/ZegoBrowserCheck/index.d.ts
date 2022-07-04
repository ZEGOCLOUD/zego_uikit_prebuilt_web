import React, { ChangeEvent, RefObject } from "react";
import { ZegoBrowserCheckProp } from "../../../model";
export declare class ZegoBrowserCheck extends React.Component<ZegoBrowserCheckProp> {
    state: {
        isSupportWebRTC: boolean;
        localStream: undefined;
        userName: string;
    };
    videoRef: RefObject<HTMLVideoElement>;
    inviteRef: RefObject<HTMLInputElement>;
    videoOpen: boolean;
    audioOpen: boolean;
    constructor(props: ZegoBrowserCheckProp);
    componentDidMount(): Promise<void>;
    createStream(): Promise<boolean>;
    toggleStream(type: "video" | "audio"): Promise<void>;
    joinRoom(): Promise<void>;
    handleChange(event: ChangeEvent<HTMLInputElement>): void;
    openSettings(): void;
    render(): React.ReactNode;
}
