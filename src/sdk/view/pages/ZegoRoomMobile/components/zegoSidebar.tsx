import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import { userNameColor } from "../../../../util";
import ZegoSidebarCss from "./zegoSidebar.module.scss";
import { ZegoMore } from "./zegoMore";

export class ZegoSidebar extends React.Component<ZegoGridLayoutProps> {
  get userList(): ZegoCloudUserList {
    if (this.props.userList.some((user) => user.pin)) {
      return this.props.userList.filter((user) => !user.pin);
    } else {
      return this.props.userList.slice(1);
    }
  }

  get pinUser() {
    const index = this.props.userList.findIndex((item) => item.pin);
    return this.props.userList[index > -1 ? index : 0];
  }

  render(): React.ReactNode {
    return (
      <div className={ZegoSidebarCss.sidebarWrapper}>
        <div className={ZegoSidebarCss.upWrapper}>
          {this.userList.map((value, index, arr) => {
            if (arr.length > this.props.videoShowNumber - 1) {
              if (index === this.props.videoShowNumber - 2) {
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
              if (index > this.props.videoShowNumber - 2) {
                return <audio></audio>;
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
                <ZegoMore user={value} />
              </div>
            );
          })}
        </div>
        <div className={ZegoSidebarCss.bottomWrapper}>
          {this.pinUser.streamList &&
            this.pinUser.streamList[0] &&
            this.pinUser.streamList[0].media && (
              <video
                className={ZegoSidebarCss.videoCommon}
                muted
                autoPlay
                ref={(el) => {
                  el &&
                    el.srcObject !== this.pinUser.streamList[0].media &&
                    (el.srcObject = this.pinUser.streamList[0].media);
                }}
              ></video>
            )}
          {(!this.pinUser.streamList ||
            !this.pinUser.streamList[0] ||
            this.pinUser.streamList[0].cameraStatus === "MUTE") && (
            <div className={ZegoSidebarCss.noVideoWrapper}>
              <div className={ZegoSidebarCss.nameWrapper}>
                <div
                  className={ZegoSidebarCss.nameCircle}
                  key={this.pinUser.userID}
                  style={{
                    color: userNameColor(this.pinUser.userName!),
                  }}
                >
                  {this.pinUser.userName!.slice(0, 1)?.toUpperCase()}
                </div>
              </div>
            </div>
          )}

          <div className={ZegoSidebarCss.name}>
            <p>{this.pinUser.userName}</p>
            <span
              className={
                this.pinUser.streamList[0] &&
                this.pinUser.streamList[0].micStatus === "OPEN"
                  ? ZegoSidebarCss.micOpen
                  : ""
              }
            ></span>
          </div>
          <ZegoMore user={this.pinUser} />
        </div>
      </div>
    );
  }
}
