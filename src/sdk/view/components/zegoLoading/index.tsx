import React, { ChangeEvent } from "react";
import ReactDOM from "react-dom/client";
import { Root } from "react-dom/client";

import ZegoLoadingCss from "./index.module.scss";

export class ZegoLoading extends React.Component<{ contentText?: string }> {
  render(): React.ReactNode {
    return (
      <div className={ZegoLoadingCss.container}>
        <div className={ZegoLoadingCss.content}>
          <div className={ZegoLoadingCss.loadSvg}></div>
          {this.props.contentText && (
            <div className={ZegoLoadingCss.text}>{this.props.contentText}</div>
          )}
        </div>
      </div>
    );
  }
}

let root: Root;
export const ZegoLoadingShow = (
  props: { contentText?: string },
  parentDom?: Element | null | undefined
) => {
  const div = document.createElement("div");
  const parent = parentDom || document.body;
  parent.appendChild(div);
  root = ReactDOM.createRoot(div);
  root.render(<ZegoLoading {...props}></ZegoLoading>);
};

export const ZegoLoadingHide = () => {
  root && root.unmount();
};
