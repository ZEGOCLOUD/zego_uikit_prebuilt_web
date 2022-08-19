import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import { userNameColor } from "../../../../util";
import { ZegoMore } from "./zegoMore";
import ZegoGridCss from "./zegoGrid.module.scss";
import clsx from "clsx";
export class ZegoGrid extends React.Component<ZegoGridLayoutProps> {
  render(): React.ReactNode {
    let wrapClassName = clsx({
      [ZegoGridCss.gridWrapper]: true,
      [ZegoGridCss.double]: this.props.userList.length <= 2,
      [ZegoGridCss.three]:
        this.props.userList.length === 4 || this.props.userList.length === 3,
      [ZegoGridCss.six]: this.props.userList.length >= 5,
    });

    return (
      <div className={wrapClassName}>
        {this.props.userList.map((value, index, arr) => {
          if (arr.length > this.props.videoShowNumber) {
            if (index === this.props.videoShowNumber - 1) {
              return (
                <div key={index}>
                  {value.streamList &&
                    value.streamList[0] &&
                    value.streamList[0].media && (
                      <audio
                        key={index}
                        muted
                        className={ZegoGridCss.videoCommon}
                        ref={(el) => {
                          el &&
                            el.srcObject !== value.streamList[0].media &&
                            (el.srcObject = value.streamList[0].media);
                        }}
                      ></audio>
                    )}

                  <div className={ZegoGridCss.noVideoWrapper}>
                    <div className={ZegoGridCss.nameWrapper}>
                      <div
                        className={ZegoGridCss.nameCircle}
                        key={value.userID}
                        style={{
                          color: userNameColor(value.userName!),
                        }}
                      >
                        {value.userName!.slice(0, 1)?.toUpperCase()}
                      </div>
                      <div
                        className={ZegoGridCss.nameCircle}
                        key={arr[index + 1].userID}
                        style={{
                          color: userNameColor(arr[index + 1].userName!),
                        }}
                      >
                        {arr[index + 1].userName!.slice(0, 1)?.toUpperCase()}
                      </div>
                    </div>

                    <p className={ZegoGridCss.othersNumber}>
                      {arr.length - this.props.videoShowNumber + 1} others
                    </p>
                  </div>
                </div>
              );
            }
            if (index > this.props.videoShowNumber - 1) {
              return (
                value.streamList &&
                value.streamList[0] &&
                value.streamList[0].media && (
                  <audio
                    key={index}
                    muted
                    className={ZegoGridCss.videoCommon}
                    ref={(el) => {
                      el &&
                        el.srcObject !== value.streamList[0].media &&
                        (el.srcObject = value.streamList[0].media);
                    }}
                  ></audio>
                )
              );
            }
          }
          return (
            <div key={index}>
              {value.streamList &&
                value.streamList[0] &&
                value.streamList[0] &&
                value.streamList[0].media && (
                  <video
                    muted
                    autoPlay
                    className={ZegoGridCss.videoCommon}
                    ref={(el) => {
                      el &&
                        el.srcObject !== value.streamList[0].media &&
                        (el.srcObject = value.streamList[0].media);
                    }}
                  ></video>
                )}
              {(!value.streamList ||
                !value.streamList[0] ||
                value.streamList[0].cameraStatus === "MUTE") && (
                <div className={ZegoGridCss.noVideoWrapper}>
                  <div className={ZegoGridCss.nameWrapper}>
                    <div
                      className={ZegoGridCss.nameCircle}
                      key={value.userID}
                      style={{
                        color: userNameColor(value.userName!),
                      }}
                    >
                      {value.userName!.slice(0, 1)?.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}

              <div className={ZegoGridCss.name}>
                <p>{value.userName}</p>
                <span
                  className={
                    value.streamList[0] &&
                    value.streamList[0].micStatus === "OPEN"
                      ? ZegoGridCss.micOpen
                      : ""
                  }
                ></span>
              </div>
              <ZegoMore user={value} />
            </div>
          );
        })}
      </div>
    );
  }
}
