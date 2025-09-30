import React from "react";
import clsx from "clsx";
import {
  UserListMenuItemType,
  ZegoScreenSharingLayoutProps,
} from "../../../../model";
import { OthersVideo } from "./zegoOthersVideo";
import ZegoSidebarCss from "./zegoSidebarLayout.module.scss";
import { VideoPlayer } from "./zegoVideoPlayer";
import ZegoAudio from "../../../components/zegoMedia/audio";
import { FormattedMessage } from "react-intl";

export class ZegoScreenSharingLayout extends React.PureComponent<ZegoScreenSharingLayoutProps> {
  state = {
    fullScreen: false,
    loadingMask: false,
    showBottomTip: false,
  };
  componentDidMount() {
    const showBottomTip = sessionStorage.getItem(
      `screen_bottom_tip_${this.props.roomID}_${this.props.selfInfo.userID}`
    );
    const isSelfScreen =
      this.props.screenSharingUser.userID === this.props.selfInfo.userID;
    if (isSelfScreen && !showBottomTip) {
      this.setState({
        showBottomTip: true,
      });
    }
  }
  componentWillUnmount(): void {
    this.props?.handleFullScreen?.(false);
  }
  onCanPlay() {
    this.setState({
      loadingMask: false,
    });
  }
  handleIgnore() {
    this.setState({
      showBottomTip: false,
    });
    sessionStorage.setItem(
      `screen_bottom_tip_${this.props.roomID}_${this.props.selfInfo.userID}`,
      "1"
    );
  }
  render(): React.ReactNode {
    let wrapClassName = clsx({
      [ZegoSidebarCss.rightWrapper]: true,
      [ZegoSidebarCss.fiveRow]: this.props.videoShowNumber === 5,
      [ZegoSidebarCss.fourRow]: this.props.videoShowNumber === 4,
      [ZegoSidebarCss.threeRow]: this.props.videoShowNumber === 3,
      [ZegoSidebarCss.twoRow]: this.props.videoShowNumber === 2,
      [ZegoSidebarCss.oneRow]: this.props.videoShowNumber === 1,
      [ZegoSidebarCss.fullScreen]:
        (this.state.fullScreen && this.props.userList.length > 0) ||
        this.props.userList.length === 0,
    });
    const { formatMessage } = this.props.core.intl;
    return (
      <div className={ZegoSidebarCss.sidebarWrapper}>
        <div className={ZegoSidebarCss.bigVideoWrapper}>
          <VideoPlayer
            core={this.props.core}
            key={"screen_" + this.props.screenSharingUser.userID}
            myClass={ZegoSidebarCss.screenVideo}
            userInfo={this.props.screenSharingUser}
            handleMenuItem={(type: UserListMenuItemType) => {
              this.props.handleMenuItem!(type, this.props.screenSharingUser);
            }}
            muted={
              this.props.screenSharingUser.userID === this.props.selfInfo.userID
            }
            volume={{}}
            hiddenMore={true}
            hiddenName={true}
            onCanPlay={this.onCanPlay.bind(this)}
          ></VideoPlayer>
          {this.state.loadingMask && (
            <div className={ZegoSidebarCss.screenVideoLoading}>
              <i></i>
              <p>
                {this.props.screenSharingUser.userID ===
                  this.props.selfInfo.userID
                  ? "You are presenting your screen"
                  : `${this.props.screenSharingUser.userName} is presenting the screen`}
              </p>
            </div>
          )}
          <div
            className={`${ZegoSidebarCss.fullScreenBtn} ${this.state.fullScreen ? ZegoSidebarCss.expend : ""
              }`}
            onClick={() => {
              this.props.handleFullScreen &&
                this.props.handleFullScreen(!this.state.fullScreen);
              this.setState({
                fullScreen: !this.state.fullScreen,
              });
            }}
          >
            <p>{this.state.fullScreen ? formatMessage({ id: "room.exitFullScreen" }) : formatMessage({ id: "room.fullScreen" })}</p>
          </div>
          {this.state.showBottomTip && (
            <div className={ZegoSidebarCss.screenTipWrapper}>
              <div className={ZegoSidebarCss.bottomWrapper}>
                <p>
                  <FormattedMessage id="room.presentingMirrorTip" />
                </p>
                <div onClick={this.handleIgnore.bind(this)}><FormattedMessage id="room.ignore" /></div>
              </div>
            </div>
          )}
        </div>

        <div className={wrapClassName}>
          {this.props.userList.map((user, index, arr) => {
            if (arr.length > this.props.videoShowNumber) {
              if (index === this.props.videoShowNumber - 1) {
                return (
                  <div key={"screen_container_" + user.userID}>
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
              ></VideoPlayer>
            );
          })}
        </div>
      </div>
    );
  }
}
