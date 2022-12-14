import React from "react";
import WaitingCss from "./callInvitationWaiting.module.scss";
export class CallInvitationWaiting extends React.PureComponent {
  render(): React.ReactNode {
    return (
      <div className={WaitingCss.wrapper}>
        <p className={WaitingCss.tip}>Initiating a voice call…</p>
        <div className={WaitingCss.userWrapper}>
          <div className={WaitingCss.avatar}>D</div>
          <p className={WaitingCss.userName}>Jack</p>
        </div>
        <div className={WaitingCss.endBtn}>End call</div>
      </div>
    );
  }
}
