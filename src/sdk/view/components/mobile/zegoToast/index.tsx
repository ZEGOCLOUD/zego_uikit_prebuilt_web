import React from "react";
import ReactDOM from "react-dom/client";

import ZegoToastCss from "./index.module.scss";
export class ZegoToastComponents extends React.Component<{
  closeCallBack: () => void;
  content?: string;
  duration: number;
  top: boolean;
}> {
  render(): React.ReactNode {
    return (
      <div
        className={`${ZegoToastCss.ZegoToast} ${ZegoToastCss.show} ${
          this.props.top ? ZegoToastCss.top : ""
        }`}
      >
        <div className={ZegoToastCss.content}>{this.props.content}</div>
      </div>
    );
  }
}

export const ZegoToast = (function () {
  const div = document.createElement("div");
  document.body.appendChild(div);
  let root: ReactDOM.Root | null;
  let timer: NodeJS.Timeout | undefined;
  return (config?: {
    closeCallBack?: () => void;
    content?: string;
    duration?: number;
    top?: boolean;
  }) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      config && config.closeCallBack && config.closeCallBack();
      root?.unmount();
      root = null;
    }, config?.duration || 3000);

    if (root) {
      root.unmount();
      config && config.closeCallBack && config.closeCallBack();
    }

    root = ReactDOM.createRoot(div);
    root.render(
      <ZegoToastComponents
        closeCallBack={() => {}}
        content={config?.content || ""}
        duration={config?.duration || 3}
        top={config?.top || false}
      ></ZegoToastComponents>
    );
  };
})();
