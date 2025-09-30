import React from "react";
import clsx from "clsx";
import {
  UserListMenuItemType,
  ZegoSidebarLayoutProps,
} from "../../../../model";
import { OthersVideo } from "./zegoOthersVideo";
import ZegoSidebarCss from "./zegoSidebarLayout.module.scss";
import { VideoPlayer } from "./zegoVideoPlayer";
import ZegoAudio from "../../../components/zegoMedia/audio";

export class ZegoSidebarLayout extends React.PureComponent<ZegoSidebarLayoutProps> {
  get pinUser() {
    const index = this.props.userList.findIndex((item) => item.pin);
    return this.props.userList[
      index > -1 ? index : this.props.userList.length - 1
    ];
  }
  get moreBtnVisible() {
    return !!this.props.core._config.showMoreButton;
  }
  get userNameVisible() {
    return !!this.props.core._config.showUserName
  }
  render(): React.ReactNode {
    let wrapClassName = clsx({
      [ZegoSidebarCss.rightWrapper]: true,
      [ZegoSidebarCss.fiveRow]: this.props.videoShowNumber === 5,
      [ZegoSidebarCss.fourRow]: this.props.videoShowNumber === 4,
      [ZegoSidebarCss.threeRow]: this.props.videoShowNumber === 3,
      [ZegoSidebarCss.twoRow]: this.props.videoShowNumber === 2,
      [ZegoSidebarCss.oneRow]: this.props.videoShowNumber === 1,
    });
    return (
      <div className={ZegoSidebarCss.sidebarWrapper}>
        <VideoPlayer
          core={this.props.core}
          key={this.pinUser.userID}
          myClass={ZegoSidebarCss.bigVideo}
          userInfo={this.pinUser}
          handleMenuItem={(type: UserListMenuItemType) => {
            this.props.handleMenuItem!(type, this.pinUser);
          }}
          muted={this.pinUser.userID === this.props.selfInfo.userID}
          volume={this.props.soundLevel![this.pinUser.userID] || {}}
          hiddenMore={!this.moreBtnVisible}
          hiddenName={!this.userNameVisible}
        ></VideoPlayer>
        <div className={wrapClassName}>
          {this.props.userList
            .filter((u) => u.userID !== this.pinUser.userID)
            .map((user, index, arr) => {
              if (arr.length > this.props.videoShowNumber) {
                if (index === this.props.videoShowNumber - 1) {
                  return (
                    <div key={"container_" + user.userID}>
                      <OthersVideo
                        users={[arr[index]!, arr[index + 1]!]}
                        others={arr.length - this.props.videoShowNumber + 1}
                      ></OthersVideo>
                      <ZegoAudio
                        muted={user.userID === this.props.selfInfo.userID}
                        userInfo={user}
                      ></ZegoAudio>
                    </div>
                  );
                }
                if (index > this.props.videoShowNumber - 1) {
                  return (
                    <ZegoAudio
                      muted={user.userID === this.props.selfInfo.userID}
                      key={user.userID}
                      userInfo={user}
                    ></ZegoAudio>
                  );
                }
              }
              return (
                <VideoPlayer
                  core={this.props.core}
                  key={user.userID}
                  userInfo={user}
                  muted={user.userID === this.props.selfInfo.userID}
                  handleMenuItem={(type: UserListMenuItemType) => {
                    this.props.handleMenuItem!(type, user);
                  }}
                  volume={this.props.soundLevel![user.userID] || {}}
                  hiddenMore={!this.moreBtnVisible}
                  hiddenName={!this.userNameVisible}
                ></VideoPlayer>
              );
            })}
        </div>
      </div>
    );
  }
}
