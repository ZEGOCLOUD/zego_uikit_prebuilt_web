import React from "react";
import { ZegoCloudRemoteMedia } from "../../../../model";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
export class ZegoOne2One extends React.Component<{
  localStream: MediaStream | undefined;
  remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
}> {
  getVideoScreen() {
    if (this.props.localStream && this.props.remoteStreamInfo) {
      return (
        <>
          <div className={zegoOne2OneCss.bigVideo}>
            <video
              autoPlay
              ref={(el) => {
                el &&
                  el.srcObject !== this.props.localStream! &&
                  (el.srcObject = this.props.localStream!);
              }}
            ></video>
            <div className={zegoOne2OneCss.name}>
              {this.props.remoteStreamInfo.fromUser.userName}
            </div>
          </div>
          <div className={zegoOne2OneCss.smallVideo}>
            <video
              muted
              autoPlay
              ref={(el) => {
                el &&
                  el.srcObject !== this.props.localStream! &&
                  (el.srcObject = this.props.localStream!);
              }}
            ></video>
            <div className={zegoOne2OneCss.name}>You</div>
          </div>
        </>
      );
    } else if (this.props.localStream) {
      return (
        <div className={zegoOne2OneCss.bigVideo}>
          <video
            muted
            autoPlay
            ref={(el) => {
              el &&
                el.srcObject !== this.props.localStream! &&
                (el.srcObject = this.props.localStream!);
            }}
          ></video>
          <div className={zegoOne2OneCss.name}>You</div>
        </div>
      );
    } else if (this.props.remoteStreamInfo) {
      return (
        <div className={zegoOne2OneCss.bigVideo}>
          <video
            autoPlay
            className={zegoOne2OneCss.bigVideo}
            ref={(el) => {
              el &&
                el.srcObject !== this.props.remoteStreamInfo!.media &&
                (el.srcObject = this.props.remoteStreamInfo!.media);
            }}
          ></video>
          <div className={zegoOne2OneCss.name}>
            {this.props.remoteStreamInfo.fromUser.userName}
          </div>
        </div>
      );
    } else {
      return undefined;
    }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
