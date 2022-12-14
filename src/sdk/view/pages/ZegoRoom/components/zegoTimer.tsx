import React from "react";
import { formatTime } from "../../../../modules/tools/util";
export class ZegoTimer extends React.PureComponent {
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
