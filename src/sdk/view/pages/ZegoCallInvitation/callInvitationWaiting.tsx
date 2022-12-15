import React from "react";
import { ZegoUser } from "zego-express-engine-webrtc/sdk/src/common/zego.entity";
import { ZegoInvitationType } from "../../../model";
import { getNameFirstLetter, userNameColor } from "../../../util";
import WaitingCss from "./callInvitationWaiting.module.scss";
export class CallInvitationWaiting extends React.PureComponent<{
  invitee: ZegoUser;
  type: ZegoInvitationType;
  cancel: () => void;
}> {
  render(): React.ReactNode {
    return (
      <div className={WaitingCss.wrapper}>
        <p className={WaitingCss.tip}>
          Initiating a {this.props.type === 0 ? "voice" : "video"} call…
        </p>
        <div className={WaitingCss.userWrapper}>
          <div
            className={WaitingCss.avatar}
            style={{ color: userNameColor(this.props.invitee.userName || "") }}
          >
            {getNameFirstLetter(this.props.invitee.userName || "")}
          </div>
          <p className={WaitingCss.userName}>{this.props.invitee.userName}</p>
        </div>
        <div
          className={WaitingCss.endBtn}
          onClick={() => {
            this.props.cancel && this.props.cancel();
          }}
        >
          End call
        </div>
      </div>
    );
  }
}
