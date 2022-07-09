import React from "react";
import { formatTime } from "../../../../modules/util";
export class ZegoTimer extends React.Component {
  state: {
    time: number;
  } = {
    time: 0,
  };

  startTimer() {
    setTimeout(() => {
      this.setState(
        (state: { time: number }) => {
          return {
            time: ++state.time,
          };
        },
        () => {
          this.startTimer();
        }
      );
    }, 1000);
  }

  componentDidMount() {
    this.startTimer();
  }

  render(): React.ReactNode {
    // @ts-ignore
    return <div>{formatTime(this.state.time)}</div>;
  }
}
