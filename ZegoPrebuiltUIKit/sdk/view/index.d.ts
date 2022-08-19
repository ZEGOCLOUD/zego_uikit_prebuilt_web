import React from "react";
import { ZegoCloudRTCCore } from "../modules";
export declare class ZegoCloudRTCKitComponent extends React.Component<{
    core: ZegoCloudRTCCore;
}> {
    state: {
        step: number;
    };
    nextPage(): void;
    render(): React.ReactNode;
}
