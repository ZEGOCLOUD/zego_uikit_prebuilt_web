import React from "react";
import { ZegoCloudRemoteMedia } from "../../../../model";
export declare class ZegoOne2One extends React.Component<{
    localStream: MediaStream | undefined;
    remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
}> {
    getVideoScreen(): JSX.Element | undefined;
    render(): React.ReactNode;
}
