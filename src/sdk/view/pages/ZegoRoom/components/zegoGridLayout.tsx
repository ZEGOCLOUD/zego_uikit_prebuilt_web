import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import ZegoGridCss from "./zegoGridLayout.module.scss";
import clsx from "clsx";

function VideoPlayer() {
  return <video muted className={ZegoGridCss.videoCommon}></video>;
}
function OthersVideo(props: { users: string[]; others: number }) {
  return (
    <div className={ZegoGridCss.otherVideoWrapper}>
      {props.users.map((value) => (
        <div className={ZegoGridCss.name}>{value}</div>
      ))}
    </div>
  );
}
export class ZegoGridLayout extends React.Component<ZegoGridLayoutProps> {
  showVideoNumber = 1;
  render(): React.ReactNode {
    let wrapClassName = clsx({
      [ZegoGridCss.gridWrapper]: true,
      [ZegoGridCss.double]: this.props.userList.length <= 2,
      [ZegoGridCss.three]:
        this.props.userList.length === 4 || this.props.userList.length === 3,
      [ZegoGridCss.six]:
        this.props.userList.length === 6 || this.props.userList.length === 5,
      [ZegoGridCss.night]: this.props.userList.length >= 7,
    });
    return (
      <div className={wrapClassName}>
        {this.props.userList.map((value, index, arr) => {
          if (arr.length > 9) {
            if (index === 8) {
              return (
                <OthersVideo
                  users={[arr[index].userName, arr[index + 1]?.userName]}
                  others={arr.length}
                ></OthersVideo>
              );
            }
            if (index > 8) {
              return <audio></audio>;
            }
          }
          return <VideoPlayer></VideoPlayer>;
        })}
      </div>
    );
  }
}
