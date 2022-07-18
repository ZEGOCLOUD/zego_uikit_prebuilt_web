import React from "react";
import { ZegoCloudRemoteMedia } from "../../../../model";
import { userNameColor } from "../../../../util";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
export class ZegoOne2One extends React.Component<{
  localStream: MediaStream | undefined;
  remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
  remoteUserInfo: {
    userName: string | undefined;
    userID: string | undefined;
  };
  selfUserInfo: {
    userName: string;
    micOpen: boolean;
    cameraOpen: boolean;
  };
}> {
  getVideoScreen() {
    if (this.props.remoteUserInfo.userID) {
      return (
        <>
          <div className={zegoOne2OneCss.bigVideo}>
            <video
              autoPlay
              playsInline={true}
              ref={(el) => {
                el &&
                  el.srcObject !== this.props.remoteStreamInfo?.media &&
                  (el.srcObject = this.props.remoteStreamInfo?.media!);
              }}
            ></video>
            <div
              className={zegoOne2OneCss.cameraMask}
              style={{
                display:
                  this.props.remoteStreamInfo?.cameraStatus === "OPEN"
                    ? "none"
                    : "flex",
              }}
            >
              <div
                style={{
                  color: userNameColor(
                    this.props.remoteUserInfo.userName as string
                  ),
                }}
              >
                {this.props.remoteUserInfo.userName?.slice(0, 1)?.toUpperCase()}
              </div>
            </div>
            <div className={zegoOne2OneCss.name}>
              <span
                className={`${zegoOne2OneCss.micIcon} ${this.props
                  .remoteStreamInfo?.micStatus !== "OPEN" &&
                  zegoOne2OneCss.close}`}
              ></span>
              <p>{this.props.remoteUserInfo.userName}</p>
            </div>
          </div>
          <div className={zegoOne2OneCss.smallVideo}>
            <video
              muted
              autoPlay
              playsInline={true}
              ref={(el) => {
                el &&
                  el.srcObject !== this.props.localStream! &&
                  (el.srcObject = this.props.localStream!);
              }}
            ></video>
            <div
              className={zegoOne2OneCss.cameraMask}
              style={{
                display: this.props.selfUserInfo.cameraOpen ? "none" : "flex",
              }}
            >
              <div
                style={{
                  color: userNameColor(this.props.selfUserInfo.userName),
                }}
              >
                {this.props.selfUserInfo.userName.slice(0, 1)?.toUpperCase()}
              </div>
            </div>
            <div className={zegoOne2OneCss.name}>
              <span
                className={`${zegoOne2OneCss.micIcon} ${!this.props.selfUserInfo
                  .micOpen && zegoOne2OneCss.close}`}
              ></span>
              <p>{this.props.selfUserInfo.userName} (You)</p>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <div className={zegoOne2OneCss.bigVideo}>
          <video
            muted
            autoPlay
            playsInline={true}
            ref={(el) => {
              el &&
                el.srcObject !== this.props.localStream! &&
                (el.srcObject = this.props.localStream!);
            }}
          ></video>
          <div
            className={zegoOne2OneCss.cameraMask}
            style={{
              display: this.props.selfUserInfo.cameraOpen ? "none" : "flex",
            }}
          >
            <div
              style={{
                color: userNameColor(this.props.selfUserInfo.userName),
              }}
            >
              {this.props.selfUserInfo.userName.slice(0, 1)?.toUpperCase()}
            </div>
          </div>
          <div className={zegoOne2OneCss.name}>
            <span
              className={`${zegoOne2OneCss.micIcon} ${!this.props.selfUserInfo
                .micOpen && zegoOne2OneCss.close}`}
            ></span>
            <p>{this.props.selfUserInfo.userName} (You)</p>
          </div>
        </div>
      );
    }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
