import React from "react";
import { ZegoCloudRemoteMedia } from "../../../../model";
import { ZegoCloudRTCCore } from "../../../../modules";
import { userNameColor } from "../../../../util";
import ZegoGridCss from "./zegoGrid.module.scss";
export class ZegoGrid extends React.Component<{
  localStream: MediaStream | undefined;
  remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
  core: ZegoCloudRTCCore;
  onLocalStreamPaused: () => void;
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
          <div className={ZegoGridCss.bigVideo}>
            <video
              style={{ width: "100%" }}
              autoPlay
              playsInline={true}
              ref={(el) => {
                el &&
                  el.srcObject !== this.props.remoteStreamInfo?.media &&
                  (el.srcObject = this.props.remoteStreamInfo?.media!);
              }}
            ></video>
            <div className={ZegoGridCss.name}>
              <p>{this.props.remoteStreamInfo?.fromUser.userName}</p>
              <span
                className={
                  this.props.remoteStreamInfo?.micStatus === "OPEN"
                    ? ZegoGridCss.bigVideoMicOpen
                    : ""
                }
              ></span>
            </div>
            {this.props.remoteStreamInfo?.cameraStatus !== "OPEN" && (
              <i
                style={{
                  color: userNameColor(this.props.remoteUserInfo.userName!),
                }}
              >
                {this.props.remoteUserInfo.userName?.substring(0, 1)}
              </i>
            )}
          </div>
          <div className={ZegoGridCss.smallVideo}>
            <video
              muted
              playsInline={true}
              autoPlay
              ref={(el) => {
                el &&
                  el.srcObject !== this.props.localStream! &&
                  (el.srcObject = this.props.localStream!);
              }}
              onPause={() => {
                this.props.onLocalStreamPaused();
              }}
            ></video>
            <div className={ZegoGridCss.smallName}>
              <p> {this.props.selfUserInfo.userName + "（YOU）"} </p>
              <span
                className={
                  this.props.selfUserInfo.micOpen
                    ? ZegoGridCss.smallVideoMicOpen
                    : ""
                }
              ></span>
            </div>
            {!this.props.selfUserInfo.cameraOpen && (
              <i
                style={{
                  color: userNameColor(this.props.core._expressConfig.userName),
                }}
              >
                {this.props.core._expressConfig.userName?.substring(0, 1)}
              </i>
            )}
          </div>
        </>
      );
    } else {
      return (
        <div className={ZegoGridCss.bigVideo}>
          <video
            style={{
              top: 0,
              transform: "translateX(-50%)",
              left: "50%",
              position: "absolute",
            }}
            muted
            autoPlay
            playsInline={true}
            ref={(el) => {
              el &&
                el.srcObject !== this.props.localStream! &&
                (el.srcObject = this.props.localStream!);
            }}
            onPause={() => {
              this.props.onLocalStreamPaused();
            }}
          ></video>
          <div className={ZegoGridCss.name}>
            <p>{this.props.selfUserInfo.userName + "（YOU）"}</p>
            <span
              className={
                this.props.selfUserInfo.micOpen
                  ? ZegoGridCss.bigVideoMicOpen
                  : ""
              }
            ></span>
          </div>
          {!this.props.selfUserInfo.cameraOpen && (
            <i
              style={{
                color: userNameColor(this.props.core._expressConfig.userName),
              }}
            >
              {this.props.core._expressConfig.userName?.substring(0, 1)}
            </i>
          )}
        </div>
      );
    }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
