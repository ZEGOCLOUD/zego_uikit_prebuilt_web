import React from "react";
import clsx from "clsx";
import { ZegoWhiteboardSharingLayoutProps } from "../../../../model";
import { OthersVideo } from "./zegoOthersVideo";
import ZegoSidebarCss from "./zegoSidebarLayout.module.scss";
import { VideoPlayer } from "./zegoVideoPlayer";
import ShowPCManageContext, { ShowPCManageType } from "../context/showManage";

export class ZegoWhiteboardSharingLayout extends React.PureComponent<ZegoWhiteboardSharingLayoutProps> {
  state = {
    fullScreen: false,
    loadingMask: false,
    showBottomTip: false,
  };
  container: HTMLDivElement | null = null;
  containerWidth: number = 0;
  containerHeight: number = 0;
  static contextType?: React.Context<ShowPCManageType> = ShowPCManageContext;
  context!: React.ContextType<typeof ShowPCManageContext>;
  componentDidMount() {
    const showBottomTip = sessionStorage.getItem(
      `whiteboard_bottom_tip_${this.props.roomID}_${this.props.selfInfo.userID}`
    );
    if (this.props.isSelfScreen && !showBottomTip) {
      this.setState({
        showBottomTip: true,
      });
    }
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
    });
    return (
      <div className={ZegoSidebarCss.sidebarWrapper}>
        <div className={ZegoSidebarCss.bigVideoWrapper}>
          <div
            className={ZegoSidebarCss.screenVideo}
            id="ZegoCloudWhiteboardContainer"
            ref={(el: HTMLDivElement) => {
              if (el) {
                if (!this.container) {
                  this.container = el;
                  this.containerHeight = el.clientHeight;
                  this.containerWidth = el.clientWidth;
                  this.props.onShow(el);
                } else if (
                  el.clientWidth &&
                  el.clientHeight &&
                  (el.clientWidth != this.containerWidth ||
                    el.clientHeight != this.containerHeight)
                ) {
                  this.containerWidth = el.clientWidth;
                  this.containerHeight = el.clientHeight;
                  this.props.onResize(el);
                }
              }
            }}
          ></div>
          {this.state.loadingMask && (
            <div className={ZegoSidebarCss.screenVideoLoading}>
              <i></i>
              <p>
                {this.props.isSelfScreen
                  ? "You are presenting your screen"
                  : `${
                      this.props.zegoSuperBoardView
                        ?.getCurrentSuperBoardSubView()
                        ?.getModel().name
                    } is presenting the screen`}
              </p>
            </div>
          )}
          <div
            className={`${ZegoSidebarCss.fullScreenBtn} ${
              this.state.fullScreen ? ZegoSidebarCss.expend : ""
            }`}
            onClick={() => {
              this.props.handleFullScreen &&
                this.props.handleFullScreen(!this.state.fullScreen);
              this.setState({
                fullScreen: !this.state.fullScreen,
              });
            }}
          >
            <p>{this.state.fullScreen ? "Exit full screen" : "Full screen"}</p>
          </div>
          {this.state.showBottomTip && (
            <div className={ZegoSidebarCss.screenTipWrapper}>
              <div className={ZegoSidebarCss.bottomWrapper}>
                <p>
                  To avoid an infinity mirror, we suggest you not to share your
                  entire screen or browser window.
                </p>
                <div onClick={this.handleIgnore.bind(this)}>Ignore</div>
              </div>
            </div>
          )}
        </div>

        {!this.state.fullScreen && this.props.userList.length > 0 && (
          <div className={wrapClassName}>
            {this.props.userList.map((user, index, arr) => {
              if (arr.length > this.props.videoShowNumber) {
                if (index === this.props.videoShowNumber - 1) {
                  return (
                    <div key={"screen_container_" + user.userID}>
                      <OthersVideo
                        users={[
                          arr[index].userName!,
                          arr[index + 1]?.userName!,
                        ]}
                        others={arr.length - this.props.videoShowNumber + 1}
                      ></OthersVideo>
                      <audio
                        autoPlay
                        muted={user.userID === this.props.selfInfo.userID}
                        ref={(el) => {
                          el &&
                            el.srcObject !== user?.streamList?.[0]?.media &&
                            (el.srcObject = user?.streamList?.[0]?.media!);
                          el &&
                            (el as any)?.setSinkId?.(
                              this.context.speakerId || ""
                            );
                        }}
                      ></audio>
                    </div>
                  );
                }
                if (index > this.props.videoShowNumber - 1) {
                  return (
                    <audio
                      key={user.userID}
                      autoPlay
                      muted={user.userID === this.props.selfInfo.userID}
                      ref={(el: HTMLAudioElement) => {
                        el &&
                          el.srcObject !== user?.streamList?.[0]?.media &&
                          (el.srcObject = user?.streamList?.[0]?.media!);
                        el &&
                          (el as any)?.setSinkId?.(
                            this.context.speakerId || ""
                          );
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
                  handlePin={() => {
                    this.props.handleSetPin!(user.userID);
                  }}
                  volume={this.props.soundLevel![user.userID] || {}}
                ></VideoPlayer>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
