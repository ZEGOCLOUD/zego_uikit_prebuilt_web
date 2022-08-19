import React from "react";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
import { VideoPlayer } from "./zegoCommonComponents";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import { SoundLevelMap } from "../../../../model";
export class ZegoOne2One extends React.Component<{
  remoteUserInfo: ZegoCloudUser;
  selfInfo: ZegoCloudUser;
  onLocalStreamPaused: () => void;
  handleSetPin: Function;
  soundLevel?: SoundLevelMap;
}> {
  getVideoScreen() {
    if (this.props.remoteUserInfo.userID) {
      return (
        <>
          <VideoPlayer
            myClass={zegoOne2OneCss.bigVideo}
            userInfo={this.props.remoteUserInfo}
            muted={false}
            handlePin={() =>
              this.props.handleSetPin(this.props.remoteUserInfo.userID)
            }
            volume={
              this.props.soundLevel![this.props.remoteUserInfo.userID] || {}
            }
          ></VideoPlayer>
          <VideoPlayer
            onPause={this.props.onLocalStreamPaused}
            myClass={zegoOne2OneCss.smallVideo}
            userInfo={this.props.selfInfo}
            muted={true}
            handlePin={() =>
              this.props.handleSetPin(this.props.selfInfo.userID)
            }
            volume={this.props.soundLevel![this.props.selfInfo.userID] || {}}
          ></VideoPlayer>
        </>
      );
    } else {
      return (
        <VideoPlayer
          myClass={zegoOne2OneCss.bigVideo}
          onPause={this.props.onLocalStreamPaused}
          userInfo={this.props.selfInfo}
          handlePin={() => this.props.handleSetPin(this.props.selfInfo.userID)}
          muted={true}
          volume={this.props.soundLevel![this.props.selfInfo.userID] || {}}
        ></VideoPlayer>
      );
    }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
