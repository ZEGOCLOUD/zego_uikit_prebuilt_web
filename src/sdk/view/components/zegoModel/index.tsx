import React, { ChangeEvent } from "react";
import ReactDOM from "react-dom/client";

import ZegoModelCss from "./index.module.scss";

export interface ZegoModelProps {
  header: string;
  contentText: string;
  okText?: string;
  cancelText?: string;
  onOk?: Function;
  onCancel?: Function;
}
export class ZegoModel extends React.Component<ZegoModelProps> {
  render(): React.ReactNode {
    const {
      header,
      contentText,
      okText,
      cancelText,
      onOk,
      onCancel,
    } = this.props;
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

const div = document.createElement("div");
document.body.appendChild(div);

export const ZegoModelShow = (props: ZegoModelProps) => {
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
