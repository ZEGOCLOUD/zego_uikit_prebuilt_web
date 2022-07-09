import React, { ChangeEvent } from "react";
import ReactDOM from "react-dom/client";

import ZegoSupportsCss from "./index.module.scss";
export class ZegoSupports extends React.Component {
  render(): React.ReactNode {
    return (
      <div className={ZegoSupportsCss.ZegoBrowserCheckNotSupport}>
        <div className={ZegoSupportsCss.content}>
          <p className={ZegoSupportsCss.tipsHeader}>Browser not supported</p>
          <p className={ZegoSupportsCss.tipsText}>
            The current browser is not available for you to join the room.
          </p>
        </div>
      </div>
    );
  }
}

const div = document.createElement("div");
document.body.appendChild(div);

export const ZegoSupportsAlert = () => {
  const root = ReactDOM.createRoot(div);
  root.render(<ZegoSupports></ZegoSupports>);
};
