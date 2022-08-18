import React from "react";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
import { VideoPlayer } from "./zegoCommonComponents";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export class ZegoOne2One extends React.Component<{
  remoteUserInfo: ZegoCloudUser;
  selfInfo: ZegoCloudUser;
  onLocalStreamPaused: () => void;
}> {
  getVideoScreen() {
    if (this.props.remoteUserInfo.userID) {
      return (
        <>
          <VideoPlayer
            myClass={zegoOne2OneCss.bigVideo}
            userInfo={this.props.remoteUserInfo}
            muted={false}
          ></VideoPlayer>
          <VideoPlayer
            onPause={this.props.onLocalStreamPaused}
            myClass={zegoOne2OneCss.smallVideo}
            userInfo={this.props.selfInfo}
            muted={true}
          ></VideoPlayer>
        </>
      );
    } else {
      return (
        <VideoPlayer
          myClass={zegoOne2OneCss.bigVideo}
          onPause={this.props.onLocalStreamPaused}
          userInfo={this.props.selfInfo}
          muted={true}
        ></VideoPlayer>
      );
    }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
