import React, { ChangeEvent } from "react";
import zegoMessageCss from "./zegoMessage.module.scss";
import { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
export class ZegoMessage extends React.Component<{
  messageList: ZegoBroadcastMessageInfo[];
  sendMessage: (msg: string) => void;
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
      <>
        <div className={zegoMessageCss.listHeader}>消息列表</div>
        <div className={zegoMessageCss.listContent}>
          {this.props.messageList.map((msg) => {
            return (
              <a key={msg.messageID}>
                {msg.fromUser.userName}:{msg.message}
              </a>
            );
          })}
        </div>
        <div className={zegoMessageCss.listFooter}>
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
          >
            send
          </button>
        </div>
      </>
    );
  }
}
