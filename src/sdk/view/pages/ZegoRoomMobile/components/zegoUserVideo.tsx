import React from "react";
import { userNameColor } from "../../../../util";
import zegoUserVideoCss from "./zegoUserVideo.module.scss";
import { ZegoMore } from "./zegoMore";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ShowManageContext, { ShowManageType } from "../context/showManage";
export class ZegoUserVideo extends React.PureComponent<{
  user: ZegoCloudUser;
  onLocalStreamPaused?: () => void;
  onCanPlay?: () => void;
  volume: {
    [streamID: string]: number;
  };
  circleSize?: "GRID" | "SIDEBAR";
  muted: boolean;
  hiddenName?: boolean;
  hiddenMore?: boolean;
}> {
  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;
  video: HTMLVideoElement | null = null;
  componentWillUnmount() {
    this.video?.srcObject && (this.video.srcObject = null);
  }
  render(): React.ReactNode {
    const volume =
      this.props.volume?.[this.props.user?.streamList?.[0]?.streamID];
    const height = volume === undefined ? 7 : Math.ceil((volume * 7) / 100);
    let { userInfo } = this.context;
    return (
      <div className={`${zegoUserVideoCss.container} zegoUserVideo_click`}>
        {this.props.user.streamList &&
          this.props.user.streamList[0] &&
          this.props.user.streamList[0] &&
          this.props.user.streamList[0].media && (
            <video
              muted={this.props.muted}
              playsInline
              autoPlay
              className={`${
                zegoUserVideoCss.videoCommon
              } zegoUserVideo_videoCommon ${
                this.props.user.streamList[0].cameraStatus === "MUTE"
                  ? zegoUserVideoCss.hideVideo
                  : ""
              }`}
              ref={(el) => {
                this.video = el;
                el &&
                  el.srcObject !== this.props.user.streamList[0].media &&
                  (el.srcObject = this.props.user.streamList[0].media!);
              }}
              onCanPlay={() => {
                this.props.onCanPlay && this.props.onCanPlay();
              }}
            ></video>
          )}
        {(!this.props.user.streamList ||
          !this.props.user.streamList[0] ||
          this.props.user.streamList[0].cameraStatus === "MUTE") && (
          <div
            className={`${zegoUserVideoCss.noVideoWrapper} zegoUserVideo_click`}
          >
            <div
              className={`${zegoUserVideoCss.nameWrapper} zegoUserVideo_click`}
            >
              <div
                className={`${
                  zegoUserVideoCss.nameCircle
                }  zegoUserVideo_click  ${
                  this.props.circleSize === "SIDEBAR"
                    ? zegoUserVideoCss.sidebarCircle
                    : ""
                }`}
                key={this.props.user.userID}
                style={{
                  color: userNameColor(this.props.user.userName!),
                }}
              >
                {this.props.user.userName!.slice(0, 1)?.toUpperCase()}
              </div>
            </div>
          </div>
        )}

        {!this.props.hiddenName && (
          <div className={zegoUserVideoCss.name}>
            <p
              className={
                this.props.user.overScreenMuteVideo
                  ? "muteVideo"
                  : "unmuteVideo"
              }
            >
              {this.props.user.userName}
            </p>
            {userInfo.userID === this.props.user.userID && <p>（You）</p>}
            <span
              className={`${zegoUserVideoCss.micIcon}  ${
                !this.props.user.streamList[0] ||
                this.props.user.streamList[0].micStatus !== "OPEN"
                  ? zegoUserVideoCss.close
                  : ""
              }`}
            >
              {this.props.user?.streamList?.[0]?.micStatus === "OPEN" && (
                <span style={{ height: height + "px" }}></span>
              )}
            </span>
          </div>
        )}
        {!this.props.hiddenMore && <ZegoMore user={this.props.user} />}
      </div>
    );
  }
}
export class ZegoUserOtherVideo extends React.PureComponent<{
  user: ZegoCloudUser;
  nextUser: ZegoCloudUser;
  othersNumber: number;
  circleSize?: "GRID" | "SIDEBAR";
  onLocalStreamPaused?: () => void;
}> {
  render(): React.ReactNode {
    return (
      <div className={`${zegoUserVideoCss.container} zegoUserVideo_click`}>
        {this.props.user.streamList &&
          this.props.user.streamList[0] &&
          this.props.user.streamList[0].media && (
            <audio
              className={zegoUserVideoCss.videoCommon}
              onCanPlay={(ev) => {
                (ev.target as HTMLAudioElement).play();
              }}
              ref={(el) => {
                el &&
                  el.srcObject !== this.props.user.streamList[0].media &&
                  (el.srcObject = this.props.user.streamList[0].media!);
              }}
            ></audio>
          )}

        <div
          className={`${zegoUserVideoCss.noVideoWrapper} zegoUserVideo_click`}
        >
          <div
            className={`${zegoUserVideoCss.nameWrapper} zegoUserVideo_click`}
          >
            <div
              className={`${zegoUserVideoCss.nameCircle} zegoUserVideo_click  ${
                this.props.circleSize === "SIDEBAR"
                  ? zegoUserVideoCss.sidebarCircle
                  : zegoUserVideoCss.gridCircle
              }`}
              key={this.props.user.userID}
              style={{
                color: userNameColor(this.props.user.userName!),
              }}
            >
              {this.props.user.userName!.slice(0, 1)?.toUpperCase()}
            </div>
            <div
              className={`${zegoUserVideoCss.nameCircle}  zegoUserVideo_click ${
                this.props.circleSize === "SIDEBAR"
                  ? zegoUserVideoCss.sidebarCircle
                  : zegoUserVideoCss.gridCircle
              }`}
              key={this.props.nextUser.userID}
              style={{
                color: userNameColor(this.props.nextUser.userName!),
              }}
            >
              {this.props.nextUser.userName!.slice(0, 1)?.toUpperCase()}
            </div>
          </div>

          <p className={zegoUserVideoCss.othersNumber}>
            {this.props.othersNumber} others
          </p>
        </div>
      </div>
    );
  }
}
