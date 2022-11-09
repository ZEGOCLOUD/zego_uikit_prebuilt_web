import React from "react";
import { getNameFirstLetter, userNameColor } from "../../../../util";
import zegoUserVideoCss from "./zegoUserVideo.module.scss";
import { ZegoMore } from "./zegoMore";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ShowManageContext, { ShowManageType } from "../context/showManage";
import ZegoVideo from "../../../components/zegoMedia/video";
import ZegoAudio from "../../../components/zegoMedia/audio";
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
  bigVideo?: boolean;
}> {
  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;
  render(): React.ReactNode {
    const volume =
      this.props.volume?.[this.props.user?.streamList?.[0]?.streamID];
    const height = volume === undefined ? 7 : Math.ceil((volume * 7) / 100);
    let { userInfo } = this.context;
    return (
      <div className={`${zegoUserVideoCss.container} zegoUserVideo_click`}>
        {this.props.user.streamList &&
          this.props.user.streamList[0] &&
          (this.props.user.streamList[0].media ||
            this.props.user.streamList[0].urlsHttpsFLV) && (
            <ZegoVideo
              muted={this.props.muted}
              userInfo={this.props.user}
              classList={`${
                zegoUserVideoCss.videoCommon
              } zegoUserVideo_videoCommon ${
                this.props.user.streamList[0].cameraStatus === "MUTE"
                  ? zegoUserVideoCss.hideVideo
                  : ""
              }`}
              onCanPlay={() => {
                this.props.onCanPlay && this.props.onCanPlay();
              }}
            ></ZegoVideo>
          )}
        {(!this.props.user.streamList ||
          !this.props.user.streamList[0] ||
          this.props.user.streamList[0].cameraStatus === "MUTE") && (
          <div
            className={`${
              zegoUserVideoCss.noVideoWrapper
            }  zegoUserVideo_click ${
              this.props.bigVideo ? zegoUserVideoCss.bigVideo : ""
            }`}
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
                {getNameFirstLetter(this.props.user.userName || "")}
                {this.props.user.avatar && (
                  <img
                    src={this.props.user.avatar}
                    onError={(e: any) => {
                      e.target.style.display = "none";
                    }}
                    alt=""
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {!this.props.hiddenName && (
          <div className={zegoUserVideoCss.name}>
            <div>
              <p
                className={
                  this.props.user.overScreenMuteVideo
                    ? "muteVideo"
                    : "unmuteVideo"
                }
              >
                {this.props.user.userName}
              </p>
              {userInfo.userID === this.props.user.userID && (
                <span>（You）</span>
              )}
              {!this.props.user.streamList[0].urlsHttpsFLV && (
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
              )}
            </div>
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
        {this.props.user.streamList && this.props.user.streamList[0] && (
          <ZegoAudio
            muted={false}
            classList={zegoUserVideoCss.videoCommon}
            userInfo={this.props.user}
            key={this.props.user.streamList[0].streamID}
          ></ZegoAudio>
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
              {getNameFirstLetter(this.props.user.userName || "")}
              {this.props.user.avatar && (
                <img
                  src={this.props.user.avatar}
                  onError={(e: any) => {
                    e.target.style.display = "none";
                  }}
                  alt=""
                />
              )}
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
              {getNameFirstLetter(this.props.nextUser.userName || "")}
              {this.props.nextUser.avatar && (
                <img
                  src={this.props.nextUser.avatar}
                  onError={(e: any) => {
                    e.target.style.display = "none";
                  }}
                  alt=""
                />
              )}
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
