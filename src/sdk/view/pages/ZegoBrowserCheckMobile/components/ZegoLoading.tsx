import React from "react";

import ZegoLoadingCss from "./ZegoLoading.module.scss";
export class ZegoLoading extends React.Component<{
  content: string;
}> {
  render(): React.ReactNode {
    return (
      <div className={ZegoLoadingCss.container}>
        <i className={ZegoLoadingCss.loading}></i>
        <p>{this.props.content}</p>
      </div>
    );
  }
}
