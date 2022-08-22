import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import ZegoSidebarCss from "./zegoSidebar.module.scss";
import { ZegoUserOtherVideo, ZegoUserVideo } from "./zegoUserVideo";

export class ZegoSidebar extends React.Component<ZegoGridLayoutProps> {
  get userList(): ZegoCloudUserList {
    return this.props.userList.filter((item) => {
      return item.userID !== this.pinUser.userID;
    });
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
                  <ZegoUserOtherVideo
                    user={value}
                    nextUser={arr[index + 1]}
                    othersNumber={arr.length - this.props.videoShowNumber + 1}
                  ></ZegoUserOtherVideo>
                );
              }
              if (index > this.props.videoShowNumber - 2) {
                return (
                  value.streamList &&
                  value.streamList[0] &&
                  value.streamList[0].media && (
                    <audio
                      key={index}
                      muted
                      className={ZegoSidebarCss.videoCommon}
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
              <ZegoUserVideo
                user={value}
                key={value + "_video"}
                volume={this.props.soundLevel![value.userID] || {}}
              ></ZegoUserVideo>
            );
          })}
        </div>
        <div className={ZegoSidebarCss.bottomWrapper}>
          <ZegoUserVideo
            user={this.pinUser}
            key={this.pinUser.userID + "_video"}
            volume={this.props.soundLevel![this.pinUser.userID] || {}}
          ></ZegoUserVideo>
          ;
        </div>
      </div>
    );
  }
}
