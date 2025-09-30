import React, { ChangeEvent, RefObject } from "react";
import zegoMessageCss from "./zegoMessage.module.scss";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { DateFormat, isFireFox, isIOS, userNameColor } from "../../../../util";
import { ZegoBroadcastMessageInfo2 } from "../../../../model";
import { ZegoToast } from "../../../components/mobile/zegoToast";
import { ZegoCloudRTCCore } from "../../../../modules";
import { FormattedMessage } from "react-intl";
export class ZegoMessage extends React.PureComponent<{
  core: ZegoCloudRTCCore
  messageList: ZegoBroadcastMessageInfo2[];
  sendMessage: (msg: string) => void;
  userID: string;
  closeCallBac: () => void;
  getAvatar: (userID: string) => string;
}> {
  state: {
    message: string;
    isFocus: boolean;
  } = {
      message: "",
      isFocus: false,
    };
  sendTime = 0;
  msgContentListRef: RefObject<HTMLDivElement>;
  isIOS = isIOS();
  isFireFox = isFireFox();
  constructor(props: {
    core: ZegoCloudRTCCore
    messageList: ZegoBroadcastMessageInfo2[];
    sendMessage: (msg: string) => void;
    userID: string;
    closeCallBac: () => void;
    getAvatar: (userID: string) => string;
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
      message: event.target.value.substring(0, 300),
    });
  }

  handleSend() {
    if (!this.state.message.length) return;
    if (this.props.core._zimManager?.banList.some((id) => id === this.props.core._expressConfig.userID)) {
      ZegoToast({ content: '你已被禁言' })
      return;
    }
    const timestamp = new Date().getTime();
    if (this.sendTime > 0 && this.sendTime + 900 > timestamp) {
      ZegoToast({
        content: "Message sent too fast, please send again later",
      });
      return false;
    }
    this.props.sendMessage(this.state.message);
    this.setState({
      message: "",
    });
    this.sendTime = timestamp;
  }
  onFocus = (ev: ChangeEvent<HTMLInputElement>) => {
    if (!this.isIOS) return;
    if (this.isFireFox) {
      setTimeout(() => {
        ev.target.scrollIntoView({
          block: "start",
        });
        window.scrollTo(0, 0);
      }, 50);
    } else {
      this.setState(
        {
          isFocus: true,
        },
        () => {
          this.msgContentListRef.current?.scroll(
            0,
            this.msgContentListRef.current.scrollHeight -
            this.msgContentListRef.current.clientHeight
          );
        }
      );
    }
  };
  onBlur = (ev: ChangeEvent<HTMLInputElement>) => {
    if (!this.isIOS) return;
    if (this.isFireFox) {
      setTimeout(() => {
        ev.target.scrollIntoView(false);
        window.scrollTo(0, 0);
      }, 50);
    } else {
      this.setState({
        isFocus: false,
      });
    }
  };
  render(): React.ReactNode {
    const { formatMessage } = this.props.core.intl;
    return (
      <div
        className={`${zegoMessageCss.msgList} ${this.state.isFocus ? zegoMessageCss.msgListExpend : ""
          }`}
      >
        <div className={zegoMessageCss.msgListHeader}>
          <div
            className={zegoMessageCss.msgHide}
            onClick={(ev) => {
              ev.stopPropagation();
              this.props.closeCallBac();
            }}
          ></div>
          <FormattedMessage id="mobileRoom.chat" />
        </div>

        <div
          className={zegoMessageCss.msgListContent}
          ref={this.msgContentListRef}
        >
          {this.props.messageList.map((msg) => {
            return (
              <div
                className={`${zegoMessageCss.msgContent} ${this.props.userID === msg.fromUser.userID
                  ? zegoMessageCss.self
                  : ""
                  }`}
                key={msg.messageID}
              >
                <i style={{ color: userNameColor(msg.fromUser.userName!) }}>
                  {msg.fromUser.userName?.substring(0, 1)}
                  {this.props.getAvatar(msg.fromUser.userID) && (
                    <img
                      src={this.props.getAvatar(msg.fromUser.userID)}
                      onError={(e: any) => {
                        e.target.style.display = "none";
                      }}
                      alt=""
                    />
                  )}
                </i>
                <div className={zegoMessageCss.msgContentRight}>
                  <div className={zegoMessageCss.msgContentRightHeader}>
                    <span>{msg.fromUser.userName}</span>
                    <span>
                      {`${new Date(msg.sendTime).getHours() >= 12 ? "PM" : "AM"
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
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            placeholder={formatMessage({ id: "global.send" })}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                this.handleSend();
              }
            }}
          />
          <button
            className={this.state.message ? zegoMessageCss.readySend : ""}
            onClick={() => {
              this.handleSend();
            }}
          ></button>
        </div>
      </div>
    );
  }
}
