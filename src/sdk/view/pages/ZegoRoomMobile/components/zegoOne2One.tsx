import React from "react";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import { ZegoUserVideo } from "./zegoUserVideo";
import { SoundLevelMap } from "../../../../model";
export class ZegoOne2One extends React.PureComponent<{
  userList: ZegoCloudUserList;
  onLocalStreamPaused: () => void;
  soundLevel?: SoundLevelMap;
  selfInfo?: {
    userID: string;
  };
  showTimerUI?: boolean;
}> {
  getVideoScreen() {
    if (this.props.userList.length > 1) {
      return (
        <>
          <div
            className={`${zegoOne2OneCss.bigVideo} ${
              this.props.showTimerUI ? zegoOne2OneCss.hasTimer : ""
            }`}
          >
            <ZegoUserVideo
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
            ></ZegoUserVideo>
          </div>
          <div className={zegoOne2OneCss.smallVideo}>
            <ZegoUserVideo
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
            ></ZegoUserVideo>
          </div>
        </>
      );
    } else if (this.props.userList.length > 0) {
      return (
        <div className={zegoOne2OneCss.bigVideo}>
          <ZegoUserVideo
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
          ></ZegoUserVideo>
        </div>
      );
    }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
