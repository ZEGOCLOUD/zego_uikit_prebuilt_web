import React from "react";
import ZegoTimerCss from "./zegoTimer.module.scss";

export class ZegoTimer extends React.PureComponent<{ time: string }> {
  render(): React.ReactNode {
    return (
      <div className={ZegoTimerCss.timer}>
        <i></i>
        <span>{this.props.time}</span>
      </div>
    );
  }
}
