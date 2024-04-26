import React from "react";
import ZegoVideo from "../../../components/zegoMedia/video";
import ZegoAudio from "../../../components/zegoMedia/audio";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import zegoUserVideoCss from "./zegoUserVideo.module.scss";
export class ZegoMixPlayer extends React.PureComponent<{
  userInfo: ZegoCloudUser;
  showFullScreen?: boolean;
  isPureAudio?: boolean;
  isPureVideo?: boolean;
}> {
  state: {
    // videoUser: ZegoCloudUser;
    // audioUser: ZegoCloudUser;
    isFullScreen: boolean;
  } = {
    // videoUser: this.props.userInfo,
    // audioUser: this.props.userInfo,
    isFullScreen: false,
  };
  videoEl: HTMLVideoElement | null = null;
  //   componentDidMount(): void {}
  //   componentDidUpdate(
  //     prevProps: Readonly<{ userInfo: ZegoCloudUser }>,
  //     prevState: Readonly<{}>,
  //     snapshot?: any
  //   ): void {
  //     if (prevProps.userInfo !== this.props.userInfo) {
  //       this.updateUser();
  //     }
  //   }
  //   updateUser() {
  //     if (this.props.userInfo.streamList?.[0]?.media) {
  //       const videoTracks =
  //         this.props.userInfo.streamList[0].media?.getVideoTracks() || [];
  //       const audioTracks =
  //         this.props.userInfo.streamList[0].media?.getAudioTracks() || [];
  //       const videoMedia = new MediaStream(videoTracks);
  //       const audioMedia = new MediaStream(audioTracks);
  //       const videoUser: ZegoCloudUser = {
  //         ...this.props.userInfo,
  //         streamList: [
  //           { ...this.props.userInfo.streamList[0], media: videoMedia },
  //         ],
  //       };
  //       const audioUser: ZegoCloudUser = {
  //         ...this.props.userInfo,
  //         streamList: [
  //           { ...this.props.userInfo.streamList[0], media: audioMedia },
  //         ],
  //       };
  //       this.setState({
  //         videoUser,
  //         audioUser,
  //       });
  //     } else {
  //       this.setState({
  //         videoUser: this.props.userInfo,
  //         audioUser: this.props.userInfo,
  //       });
  //     }
  //   }
  enterFullScreen() {
    if (!this.videoEl) return;
    // 进入全屏
    if (this.videoEl.requestFullscreen) {
      // 最新标准
      this.videoEl.requestFullscreen();
    } else if ((this.videoEl as any).webkitRequestFullscreen) {
      (this.videoEl as any).webkitRequestFullscreen();
    } else {
      // iOS进入全屏
      //@ts-ignore
      this.videoEl?.webkitEnterFullscreen?.();
    }
  }
  render() {
    return (
      <div className={`${zegoUserVideoCss.container} zegoUserVideo_click`}>
        <ZegoVideo
          muted={false}
          userInfo={this.props.userInfo}
          classList={`${zegoUserVideoCss.videoCommon}`}
          videoRefs={(el: HTMLVideoElement) => {
            this.videoEl = el;
          }}
          isMixing={true}
          //   isPureAudio={this.props.isPureAudio}
          //   isPureVideo={this.props.isPureVideo}
        ></ZegoVideo>
        {/* {this.props.userInfo.streamList?.[0]?.media && (
          <ZegoAudio muted={false} userInfo={this.state.audioUser}></ZegoAudio>
        )} */}
        {this.props.showFullScreen && (
          <div
            className={`${zegoUserVideoCss.fullScreenBtn}`}
            onClick={this.enterFullScreen.bind(this)}></div>
        )}
      </div>
    );
  }
}
