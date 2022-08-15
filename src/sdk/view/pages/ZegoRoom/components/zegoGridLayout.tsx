import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import ZegoGridCss from "./zegoGridLayout.module.scss";
import clsx from "clsx";
import { userNameColor } from "../../../../util";

function VideoPlayer() {
  return (
    <div>
      <video
        muted
        autoPlay
        className={ZegoGridCss.videoCommon}
        src="https://resource.zegocloud.com/office/avatar.mp4"
      ></video>
    </div>
  );
}
function OthersVideo(props: { users: string[]; others: number }) {
  return (
    <div>
      <video muted className={ZegoGridCss.videoCommon}></video>
      <div className={ZegoGridCss.otherVideoWrapper}>
        <div className={ZegoGridCss.nameWrapper}>
          {props.users.map((value, i) => (
            <div
              className={ZegoGridCss.nameCircle}
              key={i}
              style={{
                color: userNameColor(value),
              }}
            >
              {value.slice(0, 1)?.toUpperCase()}
            </div>
          ))}
        </div>
        {props.others > 0 && (
          <p className={ZegoGridCss.othersNumber}>{props.others} others</p>
        )}
      </div>
    </div>
  );
}
export class ZegoGridLayout extends React.Component<ZegoGridLayoutProps> {
  render(): React.ReactNode {
    let wrapClassName;
    if (this.props.gridRowNumber === 3) {
      wrapClassName = clsx({
        [ZegoGridCss.gridWrapper]: true,
        [ZegoGridCss.double]: this.props.userList.length <= 2,
        [ZegoGridCss.three]:
          this.props.userList.length === 4 || this.props.userList.length === 3,
        [ZegoGridCss.six]:
          this.props.userList.length === 6 || this.props.userList.length === 5,
        [ZegoGridCss.night]: this.props.userList.length >= 7,
      });
    } else if (this.props.gridRowNumber === 2) {
      const col = this.props.videoShowNumber / 2;
      const half = Math.ceil(this.props.userList.length / 2);
      let n =
        this.props.userList.length >= this.props.videoShowNumber ? col : half;
      wrapClassName = clsx({
        [ZegoGridCss.gridWrapper]: true,
        [ZegoGridCss.twoRow]: n === 5,
        [ZegoGridCss.twoRowFourCol]: n === 4,
        [ZegoGridCss.twoRowThreeCol]: n === 3,
        [ZegoGridCss.twoRowTwoCol]: n === 2,
        [ZegoGridCss.twoRowOneCol]: this.props.userList.length <= 2,
      });
    } else {
      wrapClassName = clsx({
        [ZegoGridCss.gridWrapper]: true,
        [ZegoGridCss.singleRow]: true,
      });
    }

    return (
      <>
        <div className={wrapClassName}>
          {this.props.userList.map((value, index, arr) => {
            if (arr.length > this.props.videoShowNumber) {
              if (index === this.props.videoShowNumber - 1) {
                return (
                  <OthersVideo
                    users={[arr[index].userName, arr[index + 1]?.userName]}
                    others={arr.length - this.props.videoShowNumber}
                  ></OthersVideo>
                );
              }
              if (index > this.props.videoShowNumber - 1) {
                return <audio></audio>;
              }
            }
            return <VideoPlayer></VideoPlayer>;
          })}
        </div>
      </>
    );
  }
}
