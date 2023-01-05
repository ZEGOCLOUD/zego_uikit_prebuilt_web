import React from "react";
import { ZegoCloudRTCCore } from "../modules";
export declare class ZegoCloudRTCKitComponent extends React.Component<{
    core: ZegoCloudRTCCore;
    unmount: () => void;
}> {
    state: {
        step: number;
        isSupportWebRTC: boolean;
    };
    componentDidMount(): Promise<void>;
    nextPage(): void;
    destroyNodeWhenNoView(): void;
    render(): React.ReactNode;
}
