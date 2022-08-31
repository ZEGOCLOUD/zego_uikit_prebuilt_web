import React, { RefObject } from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
export declare class ZegoRoomInvite extends React.Component<{
    core: ZegoCloudRTCCore;
}> {
    inviteRef: RefObject<HTMLInputElement>;
    handleCopy(): void;
    render(): React.ReactNode;
}
