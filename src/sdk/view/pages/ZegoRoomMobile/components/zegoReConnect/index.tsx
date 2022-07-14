import React, { ChangeEvent } from "react";

import ZegoReconnectCss from "./index.module.scss";
export class ZegoReconnect extends React.Component {
  render(): React.ReactNode {
    return (
      <div className={ZegoReconnectCss.container}>
        <i className={ZegoReconnectCss.loading}></i>
        <p>Trying to reconnect...</p>
      </div>
    );
  }
}
