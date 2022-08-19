import React from "react";
import { ZegoCloudRemoteMedia } from "../../../../model";
import { ZegoCloudRTCCore } from "../../../../modules";
export declare class ZegoOne2One extends React.Component<{
    localStream: MediaStream | undefined;
    remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
    core: ZegoCloudRTCCore;
    onLocalStreamPaused: () => void;
    remoteUserInfo: {
        userName: string | undefined;
        userID: string | undefined;
    };
    selfUserInfo: {
        userName: string;
        micOpen: boolean;
        cameraOpen: boolean;
    };
}> {
    getVideoScreen(): JSX.Element;
    render(): React.ReactNode;
}
