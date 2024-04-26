import React from "react";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
import { VideoPlayer } from "./zegoVideoPlayer";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import { SoundLevelMap, UserListMenuItemType } from "../../../../model";
export class ZegoOne2One extends React.PureComponent<{
  selfInfo: { userID: string };
  onLocalStreamPaused: () => void;
  handleMenuItem?: Function;
  soundLevel?: SoundLevelMap;
  userList: ZegoCloudUser[];
}> {
  getVideoScreen() {
    if (this.props.userList.length > 1) {
      return (
        <>
          <VideoPlayer
            myClass={zegoOne2OneCss.bigVideo}
            userInfo={this.props.userList[1]}
            muted={false}
            handleMenuItem={(type: UserListMenuItemType) => {
              this.props.handleMenuItem!(type, this.props.userList[1]);
            }}
            volume={this.props.soundLevel![this.props.userList[1].userID] || {}}
          ></VideoPlayer>
          <VideoPlayer
            onPause={() => {
              if (
                this.props.selfInfo.userID === this.props.userList[0].userID
              ) {
                this.props.onLocalStreamPaused();
              }
            }}
            myClass={zegoOne2OneCss.smallVideo}
            userInfo={this.props.userList[0]}
            muted={this.props.selfInfo.userID === this.props.userList[0].userID}
            handleMenuItem={(type: UserListMenuItemType) => {
              this.props.handleMenuItem!(type, this.props.userList[0]);
            }}
            volume={this.props.soundLevel![this.props.userList[0].userID] || {}}
          ></VideoPlayer>
        </>
      );
    } else if (this.props.userList.length > 0) {
      return (
        <VideoPlayer
          myClass={zegoOne2OneCss.bigVideo}
          onPause={() => {
            if (this.props.selfInfo.userID === this.props.userList[0].userID) {
              this.props.onLocalStreamPaused();
            }
          }}
          userInfo={this.props.userList[0]}
          handleMenuItem={(type: UserListMenuItemType) =>
            this.props.handleMenuItem!(type, this.props.userList[0])
          }
          muted={this.props.selfInfo.userID === this.props.userList[0].userID}
          volume={this.props.soundLevel![this.props.userList[0].userID] || {}}
        ></VideoPlayer>
      );
    } else {
      return null;
    }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
