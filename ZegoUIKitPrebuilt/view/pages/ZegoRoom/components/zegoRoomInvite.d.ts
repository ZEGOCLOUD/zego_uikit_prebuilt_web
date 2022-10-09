import React from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
export declare class ZegoRoomInvite extends React.PureComponent<{
    core: ZegoCloudRTCCore;
}> {
    handleCopy(url: string): void;
    render(): React.ReactNode;
}
