import React from "react";
import { ZegoInvitationType, ZegoUser } from "../../../model";
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

  get inviteeInfo(): ZegoUser {
    return this.props.invitee;
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
            style={{ color: userNameColor(this.inviteeInfo.userName || "") }}
          >
            {this.inviteeInfo.avatar && (
              <img
                src={this.inviteeInfo.avatar}
                onError={(e: any) => {
                  e.target.style.display = "none";
                }}
                alt=""
              />
            )}
            {getNameFirstLetter(this.inviteeInfo.userName || "")}
          </div>
          <p className={WaitingCss.userName}>{this.inviteeInfo.userName}</p>
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
