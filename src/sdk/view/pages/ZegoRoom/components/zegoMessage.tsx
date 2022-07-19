import React, { ChangeEvent, RefObject } from "react";
import ZegoMessageCss from "./zegoMessage.module.scss";
import { DateFormat } from "../../../../util";
import { ZegoBroadcastMessageInfo2 } from "../../../../model";
export class ZegoMessage extends React.Component<{
  messageList: ZegoBroadcastMessageInfo2[];
  sendMessage: (msg: string) => void;
  selfUserID: string;
}> {
  state: {
    message: string;
  } = {
    message: "",
  };
  msgListRef: RefObject<HTMLInputElement> = React.createRef();
  componentDidMount() {
    this.scrollToBottom();
  }
  componentDidUpdate(preProps: { messageList: ZegoBroadcastMessageInfo2[] }) {
    if (preProps.messageList.length !== this.props.messageList.length) {
      this.scrollToBottom();
    }
  }
  handleSend() {
    this.props.sendMessage(this.state.message);
    this.setState({
      message: "",
    });
  }
  scrollToBottom() {
    this.msgListRef.current!.scrollTop = this.msgListRef.current!.scrollHeight;
  }
  messageInput(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      message: event.target.value.substring(0, 300),
    });
  }
  render(): React.ReactNode {
    return (
      <div className={ZegoMessageCss.msgContentWrapper}>
        <div className={ZegoMessageCss.msgList} ref={this.msgListRef}>
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
                <p
                  className={`${msg.status === "SENDING" &&
                    ZegoMessageCss.loading} ${msg.status === "FAILED" &&
                    ZegoMessageCss.error}`}
                >
                  {msg.message}
                </p>
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
            placeholder="Send a message to everyone"
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                this.handleSend();
              }
            }}
          />
          <button
            disabled={!this.state.message.length}
            onClick={() => {
              this.handleSend();
            }}
          ></button>
        </div>
      </div>
    );
  }
}
