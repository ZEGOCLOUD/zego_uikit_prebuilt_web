import React from "react";
import clsx from "clsx";
import { ZegoScreenSharingLayoutProps } from "../../../../model";
import { OthersVideo } from "./zegoOthersVideo";
import ZegoSidebarCss from "./zegoSidebarLayout.module.scss";
import { VideoPlayer } from "./zegoVideoPlayer";

export class ZegoScreenSharingLayout extends React.Component<ZegoScreenSharingLayoutProps> {
  state = {
    fullScreen: false,
  };
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
          <div className={ZegoSidebarCss.bigVideoWrapper}>
            <VideoPlayer
              myClass={ZegoSidebarCss.bigVideo}
              userInfo={this.props.screenSharingUser}
              handlePin={() =>
                this.props.handleSetPin!(this.props.screenSharingUser.userID)
              }
              muted={
                this.props.screenSharingUser.userID ===
                this.props.selfInfo.userID
              }
              volume={{}}
            ></VideoPlayer>
            <div
              className={ZegoSidebarCss.fullScreenBtn}
              onClick={() => {
                this.props.handleFullScreen &&
                  this.props.handleFullScreen(!this.state.fullScreen);
                this.setState({
                  fullScreen: !this.state.fullScreen,
                });
              }}
            >
              {!this.state.fullScreen ? "Full screen" : "Exit full screen"}
            </div>
          </div>

          {!this.state.fullScreen && (
            <div className={wrapClassName}>
              {this.props.userList.map((user, index, arr) => {
                if (arr.length > this.props.videoShowNumber) {
                  if (index === this.props.videoShowNumber - 1) {
                    return (
                      <OthersVideo
                        key={user.userID}
                        users={[
                          arr[index].userName!,
                          arr[index + 1]?.userName!,
                        ]}
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
          )}
        </div>
      </>
    );
  }
}
