import React, { ChangeEvent } from "react";

import ZegoReconnectCss from "./ZegoReconnect.module.scss";
export class ZegoReconnect extends React.PureComponent<{
  content: string;
}> {
  render(): React.ReactNode {
    return (
      <div className={ZegoReconnectCss.container}>
        <i className={ZegoReconnectCss.loading}></i>
        <p>{this.props.content}</p>
      </div>
    );
  }
}
