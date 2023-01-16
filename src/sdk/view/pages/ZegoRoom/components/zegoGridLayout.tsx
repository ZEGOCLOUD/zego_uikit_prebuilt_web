import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import ZegoGridCss from "./zegoGridLayout.module.scss";
import clsx from "clsx";
import { OthersVideo } from "./zegoOthersVideo";
import { VideoPlayer } from "./zegoVideoPlayer";

import ZegoAudio from "../../../components/zegoMedia/audio";
export class ZegoGridLayout extends React.PureComponent<ZegoGridLayoutProps> {
  get wrapClassName() {
    if (this.props.gridRowNumber === 3) {
      return clsx({
        [ZegoGridCss.gridWrapper]: true,
        [ZegoGridCss.double]: this.props.userList.length <= 2,
        [ZegoGridCss.three]:
          this.props.userList.length === 4 || this.props.userList.length === 3,
        [ZegoGridCss.six]:
          this.props.userList.length === 6 || this.props.userList.length === 5,
        [ZegoGridCss.night]: this.props.userList.length >= 7,
      });
    }
    if (this.props.gridRowNumber === 2) {
      const col = this.props.videoShowNumber / 2;
      const half = Math.ceil(this.props.userList.length / 2);
      let n =
        this.props.userList.length >= this.props.videoShowNumber ? col : half;
      return clsx({
        [ZegoGridCss.gridWrapper]: true,
        [ZegoGridCss.twoRow]: n === 5,
        [ZegoGridCss.twoRowFourCol]: n === 4,
        [ZegoGridCss.twoRowThreeCol]: n === 3,
        [ZegoGridCss.twoRowTwoCol]: n === 2,
        [ZegoGridCss.twoRowOneCol]: this.props.userList.length <= 2,
      });
    }
    return clsx({
      [ZegoGridCss.gridWrapper]: true,
      [ZegoGridCss.singleRow]: true,
    });
  }
  render(): React.ReactNode {
    return (
      <>
        <div className={this.wrapClassName}>
          {this.props.userList.map((user, index, arr) => {
            if (arr.length > this.props.videoShowNumber) {
              if (index === this.props.videoShowNumber - 1) {
                return (
                  <OthersVideo
                    key={user.userID}
                    users={[arr[index]!, arr[index + 1]!]}
                    others={arr.length - this.props.videoShowNumber + 1}
                  ></OthersVideo>
                );
              }
              if (index > this.props.videoShowNumber - 1) {
                return (
                  <ZegoAudio
                    muted={false}
                    key={user.userID}
                    userInfo={user}
                  ></ZegoAudio>
                );
              }
            }
            return (
              <VideoPlayer
                key={user.userID}
                userInfo={user}
                muted={user.userID === this.props.selfInfo!.userID}
                handleMenuItem={(type: "Pin" | "Mic" | "Camera" | "Remove") => {
                  this.props.handleMenuItem!(type, user);
                }}
                volume={this.props.soundLevel![user.userID] || {}}
              ></VideoPlayer>
            );
          })}
        </div>
      </>
    );
  }
}
