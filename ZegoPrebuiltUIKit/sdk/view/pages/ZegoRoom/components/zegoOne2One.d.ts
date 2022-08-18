import React from "react";
import { ZegoCloudRemoteMedia } from "../../../../model";
export declare class ZegoOne2One extends React.Component<{
    localStream: MediaStream | undefined;
    remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
    remoteUserInfo: {
        userName: string | undefined;
        userID: string | undefined;
    };
    selfUserInfo: {
        userName: string;
        micOpen: boolean;
        cameraOpen: boolean;
    };
    onLocalStreamPaused: () => void;
}> {
    getVideoScreen(): JSX.Element;
    render(): React.ReactNode;
}
