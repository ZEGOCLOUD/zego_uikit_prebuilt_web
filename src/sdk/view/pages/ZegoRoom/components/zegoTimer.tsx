import React from "react";
import ZegoTimerCss from "./zegoTimer.module.scss";
import { formatTime } from "../../../../modules/tools/util";
export class ZegoTimer extends React.PureComponent {
  state: {
    time: string;
  } = {
    time: "00:00:00",
  };
  timer: NodeJS.Timer | null = null;
  num = 0;
  startTimer() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.setState({ time: formatTime(++this.num) });
    }, 1000);
  }
  componentWillUnmount(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
  render(): React.ReactNode {
    return (
      <div
        className={ZegoTimerCss.timer}
        ref={(el: HTMLDivElement) => {
          if (el) {
            this.startTimer();
          }
        }}
      >
        <i></i>
        <span>{this.state.time}</span>
      </div>
    );
  }
}
