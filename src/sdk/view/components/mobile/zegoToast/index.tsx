import React, { ChangeEvent } from "react";
import ReactDOM from "react-dom/client";

import ZegoToastCss from "./index.module.scss";
export class ZegoToastComponents extends React.Component<{
  closeCallBack: () => void;
  content?: string;
  duration: number;
}> {
  render(): React.ReactNode {
    return (
      <div className={`${ZegoToastCss.ZegoToast} ${ZegoToastCss.show}`}>
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
      ></ZegoToastComponents>
    );
  };
})();
