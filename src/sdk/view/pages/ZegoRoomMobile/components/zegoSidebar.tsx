import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import { userNameColor } from "../../../../util";
import ZegoSidebarCss from "./zegoGrid.module.scss";
import clsx from "clsx";
export class ZegoSidebar extends React.Component<ZegoGridLayoutProps> {
  render(): React.ReactNode {
    let wrapClassName = clsx({
      [ZegoSidebarCss.gridWrapper]: true,
      [ZegoSidebarCss.double]: this.props.userList.length <= 2,
      [ZegoSidebarCss.three]:
        this.props.userList.length === 4 || this.props.userList.length === 3,
      [ZegoSidebarCss.six]: this.props.userList.length >= 5,
    });

    return (
      <div className={wrapClassName}>
        {this.props.userList.map((value, index, arr) => {
          if (arr.length > this.props.videoShowNumber) {
            if (index === this.props.videoShowNumber - 1) {
              return (
                <div>
                  <audio
                    muted
                    className={ZegoSidebarCss.videoCommon}
                    ref={(el) => {
                      el &&
                        value.streamList &&
                        value.streamList[0] &&
                        value.streamList[0] &&
                        el.srcObject !== value.streamList[0].media &&
                        (el.srcObject = value.streamList[0].media);
                    }}
                  ></audio>
                  <div className={ZegoSidebarCss.noVideoWrapper}>
                    <div className={ZegoSidebarCss.nameWrapper}>
                      <div
                        className={ZegoSidebarCss.nameCircle}
                        key={value.userID}
                        style={{
                          color: userNameColor(value.userName!),
                        }}
                      >
                        {value.userName!.slice(0, 1)?.toUpperCase()}
                      </div>
                      <div
                        className={ZegoSidebarCss.nameCircle}
                        key={arr[index + 1].userID}
                        style={{
                          color: userNameColor(arr[index + 1].userName!),
                        }}
                      >
                        {arr[index + 1].userName!.slice(0, 1)?.toUpperCase()}
                      </div>
                    </div>

                    <p className={ZegoSidebarCss.othersNumber}>
                      {arr.length - this.props.videoShowNumber + 1} others
                    </p>
                  </div>
                </div>
              );
            }
            if (index > this.props.videoShowNumber - 1) {
              return (
                <audio
                  ref={(el) => {
                    el &&
                      value.streamList &&
                      value.streamList[0] &&
                      value.streamList[0] &&
                      el.srcObject !== value.streamList[0].media &&
                      (el.srcObject = value.streamList[0].media);
                  }}
                ></audio>
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
                    className={ZegoSidebarCss.videoCommon}
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
                <div className={ZegoSidebarCss.noVideoWrapper}>
                  <div className={ZegoSidebarCss.nameWrapper}>
                    <div
                      className={ZegoSidebarCss.nameCircle}
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

              <div className={ZegoSidebarCss.name}>
                <p>{value.userName}</p>
                <span
                  className={
                    value.streamList[0] &&
                    value.streamList[0].micStatus === "OPEN"
                      ? ZegoSidebarCss.micOpen
                      : ""
                  }
                ></span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
