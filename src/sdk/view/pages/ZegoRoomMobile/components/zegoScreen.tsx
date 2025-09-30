import React from "react";
import { ZegoScreenSharingLayoutProps } from "../../../../model";
import ZegoAudio from "../../../components/zegoMedia/audio";
import ZegoSidebarCss from "./zegoSidebar.module.scss";
import { ZegoUserOtherVideo, ZegoUserVideo } from "./zegoUserVideo";

export class ZegoScreen extends React.PureComponent<ZegoScreenSharingLayoutProps> {
  state = {
    loading: true,
  };
  onCanPlay() {
    this.setState({
      loading: false,
    });
  }
  render(): React.ReactNode {
    return (
      <div
        className={`${ZegoSidebarCss.sidebarWrapper} ${ZegoSidebarCss.landscape
          } ${this.props.userList.length === 0 ? ZegoSidebarCss.fullScreen : ""
          } `}
      >
        <div className={ZegoSidebarCss.upWrapper}>
          {this.props.userList.map((value, index, arr) => {
            if (arr.length > this.props.videoShowNumber - 1) {
              if (index === this.props.videoShowNumber - 2) {
                return (
                  <ZegoUserOtherVideo
                    key={value.userID + "_otherVideo"}
                    user={value}
                    circleSize="SIDEBAR"
                    nextUser={arr[index + 1]}
                    othersNumber={arr.length - this.props.videoShowNumber + 2}
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
              ></ZegoUserVideo>
            );
          })}
        </div>
        <div className={ZegoSidebarCss.bottomWrapper}>
          <ZegoUserVideo
            core={this.props.core}
            muted={
              this.props?.selfInfo?.userID ===
              this.props.screenSharingUser.userID
            }
            user={this.props.screenSharingUser}
            key={this.props.screenSharingUser.userID + "_video"}
            volume={{}}
            onCanPlay={() => {
              this.onCanPlay();
            }}
            hiddenMore={true}
            hiddenName={true}
            showFullScreen={true}
          ></ZegoUserVideo>
          {this.state.loading && (
            <div className={ZegoSidebarCss.screenLoadingWrapper}>
              <span></span>
              <p>
                {this.props.screenSharingUser.userName +
                  " is presenting the screen"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
