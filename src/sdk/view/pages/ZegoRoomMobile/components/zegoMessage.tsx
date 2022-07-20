import React, { ChangeEvent, RefObject } from "react";
import zegoMessageCss from "./zegoMessage.module.scss";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { DateFormat, userNameColor } from "../../../../util";
import { ZegoBroadcastMessageInfo2 } from "../../../../model";
export class ZegoMessage extends React.Component<{
  messageList: ZegoBroadcastMessageInfo2[];
  sendMessage: (msg: string) => void;
  userID: string;
  closeCallBac: () => void;
}> {
  state: {
    message: string;
  } = {
    message: "",
  };

  msgContentListRef: RefObject<HTMLDivElement>;

  constructor(props: {
    messageList: ZegoBroadcastMessageInfo2[];
    sendMessage: (msg: string) => void;
    userID: string;
    closeCallBac: () => void;
  }) {
    super(props);
    this.msgContentListRef = React.createRef<HTMLDivElement>();
  }

  componentDidMount() {
    this.msgContentListRef.current?.scroll(
      0,
      this.msgContentListRef.current.scrollHeight -
        this.msgContentListRef.current.clientHeight
    );
  }

  componentDidUpdate(prevProps: {
    messageList: ZegoBroadcastMessageInfo[];
    sendMessage: (msg: string) => void;
    userID: string;
    closeCallBac: () => void;
  }) {
    if (prevProps.messageList.length !== this.props.messageList.length) {
      this.msgContentListRef.current?.scroll(
        0,
        this.msgContentListRef.current.scrollHeight -
          this.msgContentListRef.current.clientHeight
      );
    }
  }

  messageInput(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      message: event.target.value.trim().substring(0, 300),
    });
  }

  handleSend() {
    if (!this.state.message.length) return;
    this.props.sendMessage(this.state.message);
    this.setState({
      message: "",
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

        <div
          className={zegoMessageCss.msgListContent}
          ref={this.msgContentListRef}
        >
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
                <i style={{ color: userNameColor(msg.fromUser.userName!) }}>
                  {msg.fromUser.userName?.substring(0, 1)}
                </i>
                <div className={zegoMessageCss.msgContentRight}>
                  <div className={zegoMessageCss.msgContentRightHeader}>
                    <span>{msg.fromUser.userName}</span>
                    <span>
                      {`${
                        new Date(msg.sendTime).getHours() > 12 ? "PM" : "AM"
                      }  ${DateFormat(msg.sendTime, "hh:mm")}`}
                    </span>
                  </div>
                  <div className={zegoMessageCss.msgContentRightBody}>
                    {msg.status && (
                      <i
                        className={
                          msg.status === "SENDING"
                            ? zegoMessageCss.loading
                            : msg.status === "SENDED"
                            ? ""
                            : zegoMessageCss.sendFailed
                        }
                      ></i>
                    )}
                    <p>{msg.message}</p>
                  </div>
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
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                this.handleSend();
              }
            }}
          />
          <button
            onClick={() => {
              this.handleSend();
            }}
          ></button>
        </div>
      </div>
    );
  }
}
