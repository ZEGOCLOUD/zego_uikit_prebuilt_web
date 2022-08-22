import React from "react";
import { userNameColor } from "../../../../util";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
import { ZegoMore } from "./zegoMore";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import { ZegoUserVideo } from "./zegoUserVideo";
import { SoundLevelMap } from "../../../../model";
export class ZegoOne2One extends React.Component<{
  userList: ZegoCloudUserList;
  onLocalStreamPaused: () => void;
  soundLevel?: SoundLevelMap;
}> {
  getVideoScreen() {
    if (this.props.userList.length > 1) {
      return (
        <>
          <div className={zegoOne2OneCss.bigVideo}>
            <ZegoUserVideo
              user={this.props.userList[1]}
              onLocalStreamPaused={() => {
                this.props.onLocalStreamPaused &&
                  this.props.onLocalStreamPaused();
              }}
              volume={
                this.props.soundLevel![this.props.userList[1].userID] || {}
              }
            ></ZegoUserVideo>
          </div>
          <div className={zegoOne2OneCss.smallVideo}>
            <ZegoUserVideo
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
            volume={this.props.soundLevel![this.props.userList[0].userID] || {}}
            user={this.props.userList[0]}
            onLocalStreamPaused={() => {
              this.props.onLocalStreamPaused &&
                this.props.onLocalStreamPaused();
            }}
          ></ZegoUserVideo>
        </div>
      );
    }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
