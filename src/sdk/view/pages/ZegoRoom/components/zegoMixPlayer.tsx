import React from "react";
import ZegoVideo from "../../../components/zegoMedia/video";
import ZegoAudio from "../../../components/zegoMedia/audio";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ZegoVideoPlayerCss from "./zegoVideoPlayer.module.scss";
export class ZegoMixPlayer extends React.PureComponent<{
  userInfo: ZegoCloudUser;
  isPureAudio: boolean;
  isPureVideo: boolean;
}> {
  state: {
    videoUser: ZegoCloudUser;
    audioUser: ZegoCloudUser;
  } = {
    videoUser: this.props.userInfo,
    audioUser: this.props.userInfo,
  };
  componentDidMount(): void {}
  componentDidUpdate(
    prevProps: Readonly<{ userInfo: ZegoCloudUser }>,
    prevState: Readonly<{}>,
    snapshot?: any
  ): void {
    if (prevProps.userInfo !== this.props.userInfo) {
      this.updateUser();
    }
  }
  updateUser() {
    if (this.props.userInfo.streamList?.[0]?.media) {
      const videoTracks =
        this.props.userInfo.streamList[0].media?.getVideoTracks() || [];
      const audioTracks =
        this.props.userInfo.streamList[0].media?.getAudioTracks() || [];
      const videoMedia = new MediaStream(videoTracks);
      const audioMedia = new MediaStream(audioTracks);
      const videoUser: ZegoCloudUser = {
        ...this.props.userInfo,
        streamList: [
          { ...this.props.userInfo.streamList[0], media: videoMedia },
        ],
      };
      const audioUser: ZegoCloudUser = {
        ...this.props.userInfo,
        streamList: [
          { ...this.props.userInfo.streamList[0], media: audioMedia },
        ],
      };
      this.setState({
        videoUser,
        audioUser,
      });
    } else {
      this.setState({
        videoUser: this.props.userInfo,
        audioUser: this.props.userInfo,
      });
    }
  }
  render() {
    return (
      <div className={ZegoVideoPlayerCss.videoPlayerWrapper}>
        <ZegoVideo
          muted={false}
          classList={ZegoVideoPlayerCss.videoCommon}
          userInfo={this.state.videoUser}
          isMixing={true}
          isPureAudio={this.props.isPureAudio}
          isPureVideo={this.props.isPureVideo}
        ></ZegoVideo>
        {this.props.userInfo.streamList?.[0]?.media && (
          <ZegoAudio muted={false} userInfo={this.state.audioUser}></ZegoAudio>
        )}
      </div>
    );
  }
}
