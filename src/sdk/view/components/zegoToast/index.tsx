import React, { ChangeEvent } from "react";
import ReactDOM from "react-dom/client";

import ZegoToastCss from "./index.module.scss";
export class ZegoToastComponents extends React.Component<{
  closeCallBack: () => void;
  content?: string;
  duration: number;
}> {
  state = {
    mounted: false,
  };
  timer: NodeJS.Timer | undefined = undefined;
  componentDidMount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.props.closeCallBack();
    }, this.props.duration * 1000 + 500);
  }
  render(): React.ReactNode {
    return (
      <div
        className={`${ZegoToastCss.ZegoToast} 
        `}
      >
        <div className={ZegoToastCss.content}>{this.props.content}</div>
      </div>
    );
  }
}

export const ZegoToast = (config?: {
  closeCallBack?: () => void;
  content?: string;
  duration?: number;
}) => {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const root = ReactDOM.createRoot(div);
  root.render(
    <ZegoToastComponents
      closeCallBack={() => {
        root.unmount();
        config && config.closeCallBack && config.closeCallBack();
      }}
      content={config?.content || ""}
      duration={config?.duration || 3}
    ></ZegoToastComponents>
  );
};
