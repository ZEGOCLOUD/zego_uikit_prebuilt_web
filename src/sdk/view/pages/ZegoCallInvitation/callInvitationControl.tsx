import { CallInvitationWaiting } from "./callInvitationWaiting";
import { CallInvitationDialog } from "./callInvitationDialog";
import ReactDOM, { Root } from "react-dom/client";
import { ZegoInvitationType, ZegoUser } from "../../../model";

class CallInvitationControl {
  isWaitingPageShow = false;
  isDialogShow = false;
  container: Element;
  root: Root | undefined;
  constructor(container: Element) {
    this.container = container;
  }
  callInvitationWaitingPageShow(
    invitee: ZegoUser,
    type: ZegoInvitationType,
    cancel: () => void
  ) {
    this.root = ReactDOM.createRoot(this.container);
    this.root.render(
      <CallInvitationWaiting
        invitee={invitee}
        type={type}
        cancel={cancel}
      ></CallInvitationWaiting>
    );
    this.isWaitingPageShow = true;
  }
  callInvitationWaitingPageHide() {
    if (this.isWaitingPageShow) {
      this.root?.unmount();
      this.root = undefined;
      this.isWaitingPageShow = false;
    }
  }
  callInvitationDialogShow(
    inviter: ZegoUser,
    refuse: Function,
    accept: Function
  ) {
    this.root = ReactDOM.createRoot(this.container);
    this.root.render(
      <CallInvitationDialog
        inviter={inviter}
        refuse={refuse}
        accept={accept}
      ></CallInvitationDialog>
    );
    this.isDialogShow = true;
  }
  callInvitationDialogHide() {
    if (this.isDialogShow) {
      this.root?.unmount();
      this.root = undefined;
      this.isDialogShow = false;
    }
  }
}
export const callInvitationControl = (function () {
  const callInvitationContainer = document.createElement("div");
  document.body.insertBefore(callInvitationContainer, document.body.firstChild);
  return new CallInvitationControl(callInvitationContainer);
})();
