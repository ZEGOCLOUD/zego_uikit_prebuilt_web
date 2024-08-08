import React from "react";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import { ZegoUserVideo } from "./zegoUserVideo";
import { SoundLevelMap } from "../../../../model";
import { ZegoCloudRTCCore } from "../../../../modules";
export class ZegoOne2One extends React.PureComponent<{
  core: ZegoCloudRTCCore
  userList: ZegoCloudUserList;
  onLocalStreamPaused: () => void;
  soundLevel?: SoundLevelMap;
  selfInfo?: {
    userID: string;
  };
  showTimerUI?: boolean;
}> {
  get moreBtnVisible() {
    return !!this.props.core._config.showMoreButton
  }

  get userNameVisible() {
    return !!this.props.core._config.showUserName
  }
  getVideoScreen() {
    if (this.props.userList.length > 1) {
      return (
        <>
          <div
            className={`${zegoOne2OneCss.bigVideo} ${this.props.showTimerUI ? zegoOne2OneCss.hasTimer : ""
              }`}
          >
            <ZegoUserVideo
              core={this.props.core}
              muted={
                this.props?.selfInfo?.userID === this.props.userList[1].userID
              }
              user={this.props.userList[1]}
              onLocalStreamPaused={() => {
                this.props.onLocalStreamPaused &&
                  this.props.onLocalStreamPaused();
              }}
              volume={
                this.props.soundLevel![this.props.userList[1].userID] || {}
              }
              bigVideo={true}
              hiddenMore={!this.moreBtnVisible}
              hiddenName={!this.userNameVisible}
            ></ZegoUserVideo>
          </div>
          <div className={zegoOne2OneCss.smallVideo}>
            <ZegoUserVideo
              core={this.props.core}
              muted={
                this.props?.selfInfo?.userID === this.props.userList[0].userID
              }
              volume={
                this.props.soundLevel![this.props.userList[0].userID] || {}
              }
              user={this.props.userList[0]}
              onLocalStreamPaused={() => {
                this.props.onLocalStreamPaused &&
                  this.props.onLocalStreamPaused();
              }}
              hiddenMore={!this.moreBtnVisible}
              hiddenName={!this.userNameVisible}
            ></ZegoUserVideo>
          </div>
        </>
      );
    } else if (this.props.userList.length > 0) {
      return (
        <div
          className={`${zegoOne2OneCss.bigVideo} ${this.props.showTimerUI ? zegoOne2OneCss.hasTimer : ""
            }`}
        >
          <ZegoUserVideo
            core={this.props.core}
            muted={
              this.props?.selfInfo?.userID === this.props.userList[0].userID
            }
            volume={this.props.soundLevel![this.props.userList[0].userID] || {}}
            user={this.props.userList[0]}
            onLocalStreamPaused={() => {
              this.props.onLocalStreamPaused &&
                this.props.onLocalStreamPaused();
            }}
            bigVideo={true}
            hiddenMore={!this.moreBtnVisible}
            hiddenName={!this.userNameVisible}
          ></ZegoUserVideo>
        </div>
      );
    }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
