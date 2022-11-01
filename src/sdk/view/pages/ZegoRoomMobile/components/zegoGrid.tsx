import React from "react";
import { ZegoGridLayoutProps } from "../../../../model/index";
import ZegoGridCss from "./zegoGrid.module.scss";
import clsx from "clsx";
import { ZegoUserOtherVideo, ZegoUserVideo } from "./zegoUserVideo";
import ZegoAudio from "../../../components/zegoMedia/audio";
export class ZegoGrid extends React.PureComponent<ZegoGridLayoutProps> {
  render(): React.ReactNode {
    let wrapClassName = clsx({
      [ZegoGridCss.gridWrapper]: true,
      [ZegoGridCss.double]: this.props.userList.length <= 2,
      [ZegoGridCss.three]:
        this.props.userList.length === 4 || this.props.userList.length === 3,
      [ZegoGridCss.six]: this.props.userList.length >= 5,
    });

    return (
      <div className={`${wrapClassName} zegoUserVideo_click`}>
        {this.props.userList.map((value, index, arr) => {
          if (arr.length > this.props.videoShowNumber) {
            if (index === this.props.videoShowNumber - 1) {
              return (
                <ZegoUserOtherVideo
                  key={index}
                  user={value}
                  circleSize="GRID"
                  nextUser={arr[index + 1]}
                  othersNumber={arr.length - this.props.videoShowNumber + 1}
                ></ZegoUserOtherVideo>
              );
            }
            if (index > this.props.videoShowNumber - 1) {
              return (
                value.streamList &&
                value.streamList[0] && (
                  <ZegoAudio
                    muted={false}
                    classList={ZegoGridCss.videoCommon}
                    userInfo={value}
                    key={index + "_audio_" + value.userID}
                  ></ZegoAudio>
                )
              );
            }
          }
          return (
            <ZegoUserVideo
              muted={this.props?.selfInfo?.userID === value.userID}
              volume={this.props.soundLevel![value.userID] || {}}
              user={value}
              key={value.userID + "_video"}
            ></ZegoUserVideo>
          );
        })}
      </div>
    );
  }
}
