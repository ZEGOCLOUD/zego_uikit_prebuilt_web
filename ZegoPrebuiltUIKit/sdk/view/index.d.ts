import React from "react";
import { ZegoCloudRTCCore } from "../modules";
export declare class ZegoCloudRTCKitComponent extends React.Component<{
    core: ZegoCloudRTCCore;
}> {
    state: {
        step: number;
        isSupportWebRTC: boolean;
    };
    componentDidMount(): Promise<void>;
    nextPage(): void;
    render(): React.ReactNode;
}
