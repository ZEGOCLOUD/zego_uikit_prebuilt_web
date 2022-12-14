import { CallInvitationWaiting } from "./callInvitationWaiting";
import { CallInvitationDialog } from "./callInvitationDialog";
import ReactDOM from "react-dom/client";

export const callInvitationControl = (function () {
  const callInvitationContainer = document.createElement("div");
  document.body.insertBefore(callInvitationContainer, document.body.firstChild);
  let root: any = {};
  return {
    callInvitationWaitingPageShow() {
      root = ReactDOM.createRoot(callInvitationContainer);
      root.render(<CallInvitationWaiting></CallInvitationWaiting>);
    },
    callInvitationWaitingPageHide() {
      root.unmount();
      root = null;
    },
    callInvitationDialogShow() {
      root = ReactDOM.createRoot(callInvitationContainer);
      root.render(<CallInvitationDialog></CallInvitationDialog>);
    },
    callInvitationDialogHide() {
      root.unmount();
      root = null;
    },
  };
})();
