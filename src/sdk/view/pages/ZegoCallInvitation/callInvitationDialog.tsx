import React from "react";
import DialogCss from "./invitationDialog.module.scss";
export class CallInvitationDialog extends React.Component<{}> {
  //   constructor(props: any) {
  //     super(props);
  //   }
  render(): React.ReactNode {
    return (
      <div className={DialogCss.wrapper}>
        <div className={DialogCss.centerBox}>
          <div className={DialogCss.avatar}></div>
          <p className={DialogCss.userName}></p>
          <p className={DialogCss.tip}></p>
          <div className={DialogCss.btnWrapper}>
            <div className={DialogCss.declinedBtn}>Declined</div>
            <div className={DialogCss.AcceptBtn}>Accept</div>
          </div>
        </div>
      </div>
    );
  }
}
