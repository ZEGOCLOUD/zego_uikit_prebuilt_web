import React from "react";
import { ZegoCloudRemoteMedia } from "../../../../model";
import { ZegoCloudRTCCore } from "../../../../modules";
import { userNameColor } from "../../../../util";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
export class ZegoOne2One extends React.Component<{
  localStream: MediaStream | undefined;
  remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
  core: ZegoCloudRTCCore;
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
              style={{ width: "100%" }}
              autoPlay
              playsInline={true}
              ref={(el) => {
                el &&
                  el.srcObject !== this.props.remoteStreamInfo?.media &&
                  (el.srcObject = this.props.remoteStreamInfo?.media!);
              }}
            ></video>
            <div className={zegoOne2OneCss.name}>
              <p>{this.props.remoteStreamInfo?.fromUser.userName}</p>
              <span
                className={
                  this.props.remoteStreamInfo?.micStatus === "OPEN"
                    ? zegoOne2OneCss.bigVideoMicOpen
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
          <div className={zegoOne2OneCss.smallVideo}>
            <video
              muted
              playsInline={true}
              autoPlay
              ref={(el) => {
                el &&
                  el.srcObject !== this.props.localStream! &&
                  (el.srcObject = this.props.localStream!);
              }}
            ></video>
            <div className={zegoOne2OneCss.smallName}>
              <p> {this.props.selfUserInfo.userName} </p>
              <span
                className={
                  this.props.selfUserInfo.micOpen
                    ? zegoOne2OneCss.smallVideoMicOpen
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
          <div className={zegoOne2OneCss.name}>
            <p>{this.props.selfUserInfo.userName}</p>
            <span
              className={
                this.props.selfUserInfo.micOpen
                  ? zegoOne2OneCss.bigVideoMicOpen
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

    // else if (this.props.remoteStreamInfo) {
    //   return (
    //     <div className={zegoOne2OneCss.bigVideo}>
    //       <video
    //         autoPlay
    //         playsInline={true}
    //         className={zegoOne2OneCss.bigVideo}
    //         ref={(el) => {
    //           el &&
    //             el.srcObject !== this.props.remoteStreamInfo!.media &&
    //             (el.srcObject = this.props.remoteStreamInfo!.media);
    //         }}
    //       ></video>
    //       {/* <div className={zegoOne2OneCss.name}>
    //         {this.props.remoteStreamInfo.fromUser.userName}
    //       </div> */}
    //       {this.props.remoteStreamInfo?.media.getVideoTracks().length === 0 && (
    //         <i
    //           style={{
    //             color: userNameColor(
    //               this.props.remoteStreamInfo.fromUser.userName!
    //             ),
    //           }}
    //         >
    //           {this.props.remoteStreamInfo.fromUser.userName?.substring(0, 1)}
    //         </i>
    //       )}
    //     </div>
    //   );
    // } else {
    //   return undefined;
    // }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
