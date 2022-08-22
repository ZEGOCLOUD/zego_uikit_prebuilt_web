import React from "react";
import clsx from "clsx";
import { ZegoSidebarLayoutProps } from "../../../../model";
import { OthersVideo } from "./zegoOthersVideo";
import ZegoSidebarCss from "./zegoSidebarLayout.module.scss";
import { VideoPlayer } from "./zegoVideoPlayer";

export class ZegoSidebarLayout extends React.Component<ZegoSidebarLayoutProps> {
  get pinUser() {
    const index = this.props.userList.findIndex((item) => item.pin);
    return this.props.userList[index > -1 ? index : 0];
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
      <>
        <div className={ZegoSidebarCss.sidebarWrapper}>
          <VideoPlayer
            myClass={ZegoSidebarCss.bigVideo}
            userInfo={this.pinUser}
            handlePin={() => this.props.handleSetPin!(this.pinUser.userID)}
            muted={this.pinUser.userID === this.props.selfInfo.userID}
            volume={this.props.soundLevel![this.pinUser.userID] || {}}
          ></VideoPlayer>
          <div className={wrapClassName}>
            {this.props.userList.map((user, index, arr) => {
              if (arr.length > this.props.videoShowNumber) {
                if (index === this.props.videoShowNumber - 1) {
                  return (
                    <OthersVideo
                      key={user.userID}
                      users={[arr[index].userName!, arr[index + 1]?.userName!]}
                      others={arr.length - this.props.videoShowNumber + 1}
                    ></OthersVideo>
                  );
                }
                if (index > this.props.videoShowNumber - 1) {
                  return (
                    <audio
                      key={user.userID}
                      autoPlay
                      ref={(el) => {
                        el &&
                          el.srcObject !== user?.streamList?.[0]?.media &&
                          (el.srcObject = user?.streamList?.[0]?.media);
                      }}
                    ></audio>
                  );
                }
              }
              return (
                <VideoPlayer
                  key={user.userID}
                  userInfo={user}
                  muted={user.userID === this.props.selfInfo.userID}
                  handlePin={() => this.props.handleSetPin!(user.userID)}
                  volume={this.props.soundLevel![user.userID] || {}}
                ></VideoPlayer>
              );
            })}
          </div>
        </div>
      </>
    );
  }
}
