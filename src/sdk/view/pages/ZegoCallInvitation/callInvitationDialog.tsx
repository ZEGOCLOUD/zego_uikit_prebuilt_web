import React from "react";
// import { ZegoUser } from "zego-express-engine-webrtc/sdk/src/common/zego.entity";
import { getNameFirstLetter } from "../../../util";
import DialogCss from "./callInvitationDialog.module.scss";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity";
export class CallInvitationDialog extends React.Component<{
  inviter: ZegoUser;
  isPc: boolean;
  refuse: Function;
  accept: Function;
  languageManager: any,
  incomingCallUrl?: string;
}> {
  audioRef: HTMLAudioElement | null = null;
  componentWillUnmount(): void {
    this.audioRef && (this.audioRef.src = "");
  }
  render(): React.ReactNode {
    const { formatMessage } = this.props.languageManager
    return (
      <div
        className={`${this.props.isPc ? DialogCss.wrapper : DialogCss.mobileWrapper
          }`}
      >
        <div className={DialogCss.centerBox}>
          <div className={DialogCss.infoWrapper}>
            <div className={DialogCss.avatar}>
              {getNameFirstLetter(this.props.inviter.userName || "")}
            </div>
            <p className={DialogCss.userName}>{this.props.inviter.userName}</p>
            <p className={DialogCss.tip}>{formatMessage({ id: "call.incoming" })}</p>
          </div>

          <div className={DialogCss.btnWrapper}>
            <div
              className={DialogCss.declinedBtn}
              onClick={() => {
                this.props.refuse && this.props.refuse();
              }}
            >
              {formatMessage({ id: "call.decline" })}
            </div>
            <div
              className={DialogCss.acceptBtn}
              onClick={() => {
                this.props.accept && this.props.accept();
              }}
            >
              {formatMessage({ id: "call.accept" })}
            </div>
          </div>
        </div>
        {this.props.isPc && this.props.incomingCallUrl && (
          <audio
            style={{ width: "1px", height: "1px" }}
            src={this.props.incomingCallUrl}
            ref={(el) => {
              if (el) {
                !this.audioRef && (this.audioRef = el);
                !el.src && (el.src = this.props.incomingCallUrl || "");
              }
            }}
            onCanPlay={() => {
              this.audioRef?.play();
            }}
            autoPlay
            loop
          ></audio>
        )}
      </div>
    );
  }
}
