import React, { ChangeEvent } from "react";
import ReactDOM from "react-dom/client";

import ZegoConfirmCss from "./index.module.scss";
export class ZegoConfirmComponents extends React.Component<{
  closeCallBack: (confirm: boolean) => void;
  title: string;
  content?: string;
}> {
  render(): React.ReactNode {
    return (
      <div className={ZegoConfirmCss.ZegoConfirm}>
        <div className={ZegoConfirmCss.content}>
          <p className={ZegoConfirmCss.tipsHeader}>{this.props.title}</p>
          <p className={ZegoConfirmCss.tipsText}>{this.props.content}</p>
          <div className={ZegoConfirmCss.handler}>
            <button
              onClick={() => {
                this.props.closeCallBack(false);
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                this.props.closeCallBack(true);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const div = document.createElement("div");
document.body.appendChild(div);

export const ZegoConfirm = (config?: {
  closeCallBack?: (confirm: boolean) => void;
  title?: string;
  content?: string;
}) => {
  const root = ReactDOM.createRoot(div);
  root.render(
    <ZegoConfirmComponents
      closeCallBack={(confirm: boolean) => {
        root.unmount();
        config && config.closeCallBack && config.closeCallBack(confirm);
      }}
      title={config?.title || ""}
      content={config?.content || ""}
    ></ZegoConfirmComponents>
  );
};
