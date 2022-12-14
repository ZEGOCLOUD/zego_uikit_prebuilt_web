import React from "react";
import DialogCss from "./callInvitationDialog.module.scss";
export class CallInvitationDialog extends React.Component<{}> {
  //   constructor(props: any) {
  //     super(props);
  //   }
  render(): React.ReactNode {
    return (
      <div className={DialogCss.wrapper}>
        <div className={DialogCss.centerBox}>
          <div className={DialogCss.avatar}>D</div>
          <p className={DialogCss.userName}>Jack</p>
          <p className={DialogCss.tip}>Incoming call...</p>
          <div className={DialogCss.btnWrapper}>
            <div className={DialogCss.declinedBtn}>Declined</div>
            <div className={DialogCss.acceptBtn}>Accept</div>
          </div>
        </div>
      </div>
    );
  }
}
