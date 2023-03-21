import React from "react";
import ReactDOM from "react-dom/client";

import ZegoModelCss from "./index.module.scss";

export interface ZegoModelProps {
  header: string;
  contentText: string;
  okText?: string;
  cancelText?: string;
  onOk?: Function;
  onCancel?: Function;
  countdown?: number;
}
export class ZegoModel extends React.Component<ZegoModelProps> {
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
          this.props.onCancel?.();
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
    const { header, contentText, okText, cancelText, onOk, onCancel } =
      this.props;
    return (
      <div className={ZegoModelCss.ZegoBrowserCheckNotSupport}>
        <div className={ZegoModelCss.content}>
          <p className={ZegoModelCss.tipsHeader}>{header}</p>
          <p className={ZegoModelCss.tipsText}>{contentText}</p>
          <div className={ZegoModelCss.buttonWrapper}>
            {cancelText && (
              <button
                className={ZegoModelCss.cancelButton}
                onClick={() => {
                  onCancel && onCancel();
                }}
              >
                {cancelText}
                {this.props.countdown && `(${this.state.countdownNum}s)`}
              </button>
            )}
            {okText && (
              <button
                className={ZegoModelCss.okButton}
                onClick={() => {
                  onOk && onOk();
                  onCancel && onCancel(false);
                }}
              >
                {okText}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export const ZegoModelShow = (
  props: ZegoModelProps,
  parentDom?: Element | null | undefined
) => {
  const div = document.createElement("div");
  const parent = parentDom || document.body;
  parent.appendChild(div);
  const root = ReactDOM.createRoot(div);
  root.render(
    <ZegoModel
      {...props}
      onCancel={(confirm: boolean) => {
        root.unmount();
        !confirm && props.onCancel && props.onCancel();
      }}
    ></ZegoModel>
  );
};
