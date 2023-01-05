import React from "react";
import { ZegoUser } from "zego-express-engine-webrtc/sdk/src/common/zego.entity";
import { ZegoInvitationType } from "../../../model";
export declare class CallInvitationWaiting extends React.PureComponent<{
    invitee: ZegoUser;
    type: ZegoInvitationType;
    isPc: boolean;
    cancel: () => void;
    outgoingCallUrl?: string;
}> {
    audioRef: HTMLAudioElement | null;
    componentWillUnmount(): void;
    render(): React.ReactNode;
}
