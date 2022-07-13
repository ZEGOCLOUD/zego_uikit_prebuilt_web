import React, { ChangeEvent } from "react";
import ZegoMessageCss from "./zegoMessage.module.scss";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { DateFormat } from "../../../../util";
export class ZegoMessage extends React.Component<{
  messageList: ZegoBroadcastMessageInfo[];
  sendMessage: (msg: string) => void;
  selfUserID: string;
}> {
  state: {
    message: string;
  } = {
    message: "",
  };

  messageInput(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      message: event.target.value,
    });
  }
  render(): React.ReactNode {
    return (
      <div className={ZegoMessageCss.msgContentWrapper}>
        <div className={ZegoMessageCss.msgList}>
          {this.props.messageList.map((msg) => {
            return (
              <div
                key={msg.messageID}
                className={
                  msg.fromUser.userID === this.props.selfUserID
                    ? ZegoMessageCss.self
                    : ""
                }
              >
                <div className={ZegoMessageCss.msgNameWrapper}>
                  <span className={ZegoMessageCss.name}>
                    {msg.fromUser.userName}
                  </span>
                  <span className={ZegoMessageCss.sendTime}>
                    {`${
                      new Date(msg.sendTime).getHours() > 12 ? "PM" : "AM"
                    }  ${DateFormat(msg.sendTime, "hh:mm")}`}
                  </span>
                </div>
                <p className={ZegoMessageCss.error}>{msg.message}</p>
              </div>
            );
          })}
        </div>
        <div className={ZegoMessageCss.sendWrapper}>
          <input
            value={this.state.message}
            onChange={(event) => {
              this.messageInput(event);
            }}
          />
          <button
            disabled={!this.state.message.length}
            onClick={() => {
              this.props.sendMessage(this.state.message);
              this.setState({
                message: "",
              });
            }}
          ></button>
        </div>
      </div>
    );
  }
}
