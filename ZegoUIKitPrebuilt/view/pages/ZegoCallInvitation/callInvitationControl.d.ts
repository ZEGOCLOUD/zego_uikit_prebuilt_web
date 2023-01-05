import { Root } from "react-dom/client";
import { ZegoInvitationType, ZegoUser } from "../../../model";
declare class CallInvitationControl {
    isWaitingPageShow: boolean;
    isDialogShow: boolean;
    container: Element;
    root: Root | undefined;
    isPc: boolean;
    constructor(container: Element);
    callInvitationWaitingPageShow(invitee: ZegoUser, type: ZegoInvitationType, cancel: () => void, outgoingCallUrl?: string): void;
    callInvitationWaitingPageHide(): void;
    callInvitationDialogShow(inviter: ZegoUser, refuse: Function, accept: Function, incomingCallUrl?: string): void;
    callInvitationDialogHide(): void;
}
export declare const callInvitationControl: CallInvitationControl;
export {};
