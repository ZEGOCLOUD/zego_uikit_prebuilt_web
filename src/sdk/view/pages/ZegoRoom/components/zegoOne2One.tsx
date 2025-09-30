import React from "react";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
import { VideoPlayer } from "./zegoVideoPlayer";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import { SoundLevelMap, UserListMenuItemType } from "../../../../model";
import { ZegoCloudRTCCore } from "../../../../modules";

export class ZegoOne2One extends React.PureComponent<{
  core: ZegoCloudRTCCore
  selfInfo: { userID: string };
  onLocalStreamPaused: () => void;
  handleMenuItem?: Function;
  soundLevel?: SoundLevelMap;
  userList: ZegoCloudUser[];
}> {
  componentDidMount(): void {
    console.warn('[ZegoOne2One]componentDidMount', this.props.userList);
  }
  componentDidUpdate(prevProps: Readonly<{ core: ZegoCloudRTCCore; selfInfo: { userID: string; }; onLocalStreamPaused: () => void; handleMenuItem?: Function; soundLevel?: SoundLevelMap; userList: ZegoCloudUser[]; }>, prevState: Readonly<{}>, snapshot?: any): void {
  }
  getVideoScreen() {
    const { showMoreButton, showUserName } = this.props.core._config;
    if (this.props.userList.length > 1) {
      return (
        <>
          <VideoPlayer
            core={this.props.core}
            myClass={zegoOne2OneCss.bigVideo}
            userInfo={this.props.userList[1]}
            muted={false}
            handleMenuItem={(type: UserListMenuItemType) => {
              this.props.handleMenuItem!(type, this.props.userList[1]);
            }}
            volume={this.props.soundLevel![this.props.userList[1].userID] || {}}
            hiddenMore={!showMoreButton || this.props.userList.length === 2}
            hiddenName={!showUserName}
          ></VideoPlayer>
          <VideoPlayer
            core={this.props.core}
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
            hiddenMore={!showMoreButton || this.props.userList.length === 2}
            hiddenName={!showUserName}
          ></VideoPlayer>
        </>
      );
    } else if (this.props.userList.length > 0) {
      return (
        <VideoPlayer
          core={this.props.core}
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
          hiddenMore={!showMoreButton}
          hiddenName={!showUserName}
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
