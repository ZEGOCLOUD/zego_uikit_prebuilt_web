import React, { ChangeEvent } from "react";
import zegoMessageCss from "./zegoMessage.module.scss";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { DateFormat } from "../../../../util";
export class ZegoMessage extends React.Component<{
  messageList: ZegoBroadcastMessageInfo[];
  sendMessage: (msg: string) => void;
  userID: string;
  closeCallBac: () => void;
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
      <div className={zegoMessageCss.msgList}>
        <div className={zegoMessageCss.msgListHeader}>
          <div
            className={zegoMessageCss.msgHide}
            onClick={(ev) => {
              ev.stopPropagation();
              this.props.closeCallBac();
            }}
          ></div>
          Chat
        </div>

        <div className={zegoMessageCss.msgListContent}>
          {this.props.messageList.map((msg) => {
            return (
              <div
                className={`${zegoMessageCss.msgContent} ${
                  this.props.userID === msg.fromUser.userID
                    ? zegoMessageCss.self
                    : ""
                }`}
                key={msg.messageID}
              >
                <i>{msg.fromUser.userName?.substring(0, 1)}</i>
                <div className={zegoMessageCss.msgContentRight}>
                  <div className={zegoMessageCss.msgContentRightHeader}>
                    <span>{msg.fromUser.userName}</span>
                    <span>
                      {`${
                        new Date(msg.sendTime).getHours() > 12 ? "AM" : "PM"
                      }  ${DateFormat(msg.sendTime, "mm:ss")}`}
                    </span>
                  </div>
                  <p className={zegoMessageCss.msgContentRightBody}>
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className={zegoMessageCss.msgFooter}>
          <input
            value={this.state.message}
            onChange={(event) => {
              this.messageInput(event);
            }}
          />
          <button
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
