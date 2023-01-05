import React from "react";
import { ZegoUser } from "zego-express-engine-webrtc/sdk/src/common/zego.entity";
export declare class CallInvitationDialog extends React.Component<{
    inviter: ZegoUser;
    isPc: boolean;
    refuse: Function;
    accept: Function;
    incomingCallUrl?: string;
}> {
    audioRef: HTMLAudioElement | null;
    componentWillUnmount(): void;
    render(): React.ReactNode;
}
