import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import ZegoAudio from "../../../components/zegoMedia/audio";
import ZegoSidebarCss from "./zegoSidebar.module.scss";
import { ZegoUserOtherVideo, ZegoUserVideo } from "./zegoUserVideo";

export class ZegoSidebar extends React.PureComponent<ZegoGridLayoutProps> {
  get userList(): ZegoCloudUserList {
    return this.props.userList.filter((item) => {
      return item.userID !== this.pinUser.userID;
    });
  }

  get pinUser() {
    const index = this.props.userList.findIndex((item) => item.pin);
    if (index > -1) {
      return this.props.userList[index];
    }
    const userList = this.props.userList.filter(
      (item) => item.userID !== this.props.selfInfo?.userID
    );
    return userList[userList.length - 1];
  }

  get moreBtnVisible() {
    return !!this.props.core._config.showMoreButton
  }

  get userNameVisible() {
    return !!this.props.core._config.showUserName
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
                    key={value.userID + "_otherVideo"}
                    user={value}
                    circleSize="SIDEBAR"
                    nextUser={arr[index + 1]}
                    othersNumber={
                      this.props.userList.length -
                      this.props.videoShowNumber +
                      1
                    }
                  ></ZegoUserOtherVideo>
                );
              }
              if (index > this.props.videoShowNumber - 2) {
                return (
                  value.streamList &&
                  value.streamList[0] && (
                    <ZegoAudio
                      muted={false}
                      classList={ZegoSidebarCss.videoCommon}
                      userInfo={value}
                      key={index + "_audio_" + value.userID}
                    ></ZegoAudio>
                  )
                );
              }
            }
            return (
              <ZegoUserVideo
                core={this.props.core}
                muted={this.props?.selfInfo?.userID === value.userID}
                user={value}
                circleSize="SIDEBAR"
                key={value.userID + "_video"}
                volume={this.props.soundLevel![value.userID] || {}}
                hiddenMore={!this.moreBtnVisible}
                hiddenName={!this.userNameVisible}
              ></ZegoUserVideo>
            );
          })}
        </div>
        <div className={ZegoSidebarCss.bottomWrapper}>
          <ZegoUserVideo
            core={this.props.core}
            muted={this.props?.selfInfo?.userID === this.pinUser.userID}
            user={this.pinUser}
            key={this.pinUser.userID + "_video"}
            volume={this.props.soundLevel![this.pinUser.userID] || {}}
            hiddenMore={!this.moreBtnVisible}
            hiddenName={!this.userNameVisible}
          ></ZegoUserVideo>
          ;
        </div>
      </div>
    );
  }
}
