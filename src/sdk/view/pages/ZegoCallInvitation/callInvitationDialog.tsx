import React, { RefObject } from "react";
import { ZegoUser } from "zego-express-engine-webrtc/sdk/src/common/zego.entity";
import { getNameFirstLetter } from "../../../util";
import DialogCss from "./callInvitationDialog.module.scss";
export class CallInvitationDialog extends React.Component<{
  inviter: ZegoUser;
  isPc: boolean;
  refuse: Function;
  accept: Function;
  incomingCallUrl?: string;
}> {
  audioRef: HTMLAudioElement | null = null;
  componentWillUnmount(): void {
    this.audioRef && (this.audioRef.src = "");
  }
  render(): React.ReactNode {
    return (
      <div
        className={`${
          this.props.isPc ? DialogCss.wrapper : DialogCss.mobileWrapper
        }`}
      >
        <div className={DialogCss.centerBox}>
          <div className={DialogCss.infoWrapper}>
            <div className={DialogCss.avatar}>
              {getNameFirstLetter(this.props.inviter.userName || "")}
            </div>
            <p className={DialogCss.userName}>{this.props.inviter.userName}</p>
            <p className={DialogCss.tip}>Incoming call...</p>
          </div>

          <div className={DialogCss.btnWrapper}>
            <div
              className={DialogCss.declinedBtn}
              onClick={() => {
                this.props.refuse && this.props.refuse();
              }}
            >
              Declined
            </div>
            <div
              className={DialogCss.acceptBtn}
              onClick={() => {
                this.props.accept && this.props.accept();
              }}
            >
              Accept
            </div>
          </div>
        </div>
        {this.props.incomingCallUrl && (
          <audio
            style={{ width: "1px", height: "1px" }}
            src={this.props.incomingCallUrl}
            ref={(el) => {
              if (el) {
                !this.audioRef && (this.audioRef = el);
                !el.src && (el.src = this.props.incomingCallUrl || "");
              }
            }}
            autoPlay
            loop
          ></audio>
        )}
      </div>
    );
  }
}
