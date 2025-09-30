import React from "react";
import ReactDOM from "react-dom/client";

import ZegoConfirmCss from "./index.module.scss";
export class ZegoConfirmComponents extends React.Component<{
  closeCallBack: (confirm: boolean) => void;
  title: string;
  content?: string;
  cancel?: string;
  confirm?: string;
  countdown?: number;
}> {
  countdownTimer: NodeJS.Timer | null = null;
  state = {
    countdownNum: this.props.countdown,
  };
  componentDidMount() {
    if (this.props.countdown && this.props.countdown > 0) {
      this.countdownTimer = setInterval(() => {
        const num = (this.state.countdownNum as number) - 1;
        if (num <= 0) {
          this.countdownTimer && clearInterval(this.countdownTimer);
          this.countdownTimer = null;
          this.props.closeCallBack(false);
        } else {
          this.setState({
            countdownNum: num,
          });
        }
      }, 1000);
    }
  }
  componentWillUnmount(): void {
    this.countdownTimer && clearInterval(this.countdownTimer);
    this.countdownTimer = null;
  }
  render(): React.ReactNode {
    return (
      <div className={ZegoConfirmCss.ZegoConfirm}>
        <div className={ZegoConfirmCss.content}>
          <p className={ZegoConfirmCss.tipsHeader}>{this.props.title}</p>
          <p className={ZegoConfirmCss.tipsText}>{this.props.content}</p>
          <div className={ZegoConfirmCss.handler}>
            {this.props.cancel && (
              <button
                onClick={() => {
                  this.props.closeCallBack(false);
                }}
              >
                {this.props.cancel}
                {this.props?.countdown && `(${this.state.countdownNum})`}
              </button>
            )}
            {this.props.confirm && (
              <button
                onClick={() => {
                  this.props.closeCallBack(true);
                }}
              >
                {this.props.confirm}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export const ZegoConfirm = (config?: {
  closeCallBack?: (confirm: boolean) => void;
  title?: string;
  content?: string;
  cancel?: string;
  confirm?: string;
  countdown?: number;
}) => {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const root = ReactDOM.createRoot(div);
  root.render(
    <ZegoConfirmComponents
      closeCallBack={(confirm: boolean) => {
        root.unmount();
        config && config.closeCallBack && config.closeCallBack(confirm);
      }}
      title={config?.title || ""}
      content={config?.content || ""}
      confirm={config?.confirm || ""}
      cancel={config?.cancel || ""}
      countdown={config?.countdown}
    ></ZegoConfirmComponents>
  );
  return root;
};
