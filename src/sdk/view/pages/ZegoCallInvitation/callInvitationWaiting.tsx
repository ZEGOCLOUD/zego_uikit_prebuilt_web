import React from "react";
import { ZegoUser } from "zego-express-engine-webrtc/sdk/src/common/zego.entity";
import { ZegoInvitationType } from "../../../model";
import { getNameFirstLetter, userNameColor } from "../../../util";
import WaitingCss from "./callInvitationWaiting.module.scss";
export class CallInvitationWaiting extends React.PureComponent<{
  invitee: ZegoUser;
  type: ZegoInvitationType;
  isPc: boolean;
  cancel: () => void;
  languageManager: any,
  outgoingCallUrl?: string;
}> {
  audioRef: HTMLAudioElement | null = null;
  componentWillUnmount(): void {
    this.audioRef && (this.audioRef.src = "");
  }
  render(): React.ReactNode {
    const { formatMessage } = this.props.languageManager;
    return (
      <div
        className={` ${this.props.isPc ? WaitingCss.wrapper : WaitingCss.mobileWrapper
          }`}
      >
        <p className={WaitingCss.tip}>{formatMessage({ id: "call.calling" })}</p>
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
          {formatMessage({ id: "call.endCall" })}
        </div>
        {this.props.isPc && this.props.outgoingCallUrl && (
          <audio
            style={{ width: "1px", height: "1px" }}
            ref={(el) => {
              if (el) {
                !this.audioRef && (this.audioRef = el);
                !el.src && (el.src = this.props.outgoingCallUrl || "");
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
