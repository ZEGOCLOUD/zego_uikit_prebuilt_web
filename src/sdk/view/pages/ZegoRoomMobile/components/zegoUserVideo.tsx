import React from "react";
import { getNameFirstLetter, userNameColor } from "../../../../util";
import zegoUserVideoCss from "./zegoUserVideo.module.scss";
import { ZegoMore } from "./zegoMore";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ShowManageContext, { ShowManageType } from "../../context/showManage";
import ZegoVideo from "../../../components/zegoMedia/video";
import ZegoAudio from "../../../components/zegoMedia/audio";
import { FormattedMessage } from "react-intl";
import { ZegoCloudRTCCore } from "../../../../modules";
import { UserTypeEnum } from "../../../../model";
export class ZegoUserVideo extends React.PureComponent<{
  core: ZegoCloudRTCCore;
  user: ZegoCloudUser;
  myClass?: string;
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
  showFullScreen?: boolean;
}> {
  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;
  videoEl: HTMLVideoElement | null = null;
  state: {
    isFullScreen: boolean;
  } = {
      isFullScreen: false,
    };
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

  cancelCall() {
    this.props.core._zimManager?.cancelInvitation(void 0, [this.props.user], false)
  }

  get avatarConfig() {
    const videoViewConfig = this.props.core._config.videoViewConfig || []
    const { avatar, userID } = this.props.user
    const _avatarConfig = videoViewConfig.find((config) => config.userID === userID)
    const visiblity = _avatarConfig?.showAvatarWhenCameraOff !== false
    return {
      visiblity,
      url: avatar,
    }
  }

  get isCameraMute() {
    return this.props.user.streamList[0]?.cameraStatus === "MUTE";
  }

  get hideUsersById() {
    const { hideUsersById } = this.props.core._config
    return hideUsersById || []
  }

  get isHiddenVideo() {
    return this.hideUsersById.includes(this.props.user.userID)
  }

  get isWaitingUser() {
    return this.props.user.type === UserTypeEnum.CALLING_WAITTING
  }


  render(): React.ReactNode {
    const volume =
      this.props.volume?.[this.props.user?.streamList?.[0]?.streamID];
    const height = volume === undefined ? 7 : Math.ceil((volume * 7) / 100);
    let { userInfo } = this.context;

    return (
      <div
        className={`${zegoUserVideoCss.container} ${this.props.myClass} ${this.isHiddenVideo && zegoUserVideoCss.hidden}`}
      >
        {this.props.user.streamList &&
          this.props.user.streamList[0] &&
          (this.props.user.streamList[0].media ||
            this.props.user.streamList[0].urlsHttpsFLV) && (
            <ZegoVideo
              muted={this.props.muted}
              userInfo={this.props.user}
              classList={`${zegoUserVideoCss.videoCommon
                } zegoUserVideo_videoCommon ${this.isCameraMute
                  ? zegoUserVideoCss.hideVideo
                  : ""
                }`}
              onCanPlay={() => {
                this.props.onCanPlay && this.props.onCanPlay();
              }}
              videoRefs={(el: HTMLVideoElement) => {
                this.videoEl = el;
              }}
            ></ZegoVideo>
          )}
        {(!this.props.user.streamList ||
          !this.props.user.streamList[0] ||
          this.props.user.streamList[0].cameraStatus === "MUTE") && (
            <div
              className={`${zegoUserVideoCss.noVideoWrapper
                }  zegoUserVideo_click ${this.props.bigVideo ? zegoUserVideoCss.bigVideo : ""
                }`}
            >
              {this.avatarConfig.visiblity &&
                <div
                  className={`${zegoUserVideoCss.nameWrapper} zegoUserVideo_click`}
                >
                  <div
                    className={`${zegoUserVideoCss.nameCircle
                      }  zegoUserVideo_click  ${this.props.circleSize === "SIDEBAR"
                        ? zegoUserVideoCss.sidebarCircle
                        : ""
                      }`}
                    key={this.props.user.userID}
                    style={{
                      color: userNameColor(this.props.user.userName!),
                    }}
                  >
                    {getNameFirstLetter(this.props.user.userName || "")}
                    {this.avatarConfig.url && (
                      <img
                        className="zegoUserVideo_click"
                        src={this.avatarConfig.url}
                        onError={(e: any) => {
                          e.target.style.display = "none";
                        }}
                        alt=""
                      />
                    )}
                  </div>
                </div>
              }
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
                <span>（<FormattedMessage id="global.you" />）</span>
              )}
              {!this.props.user?.streamList?.[0]?.urlsHttpsFLV && (
                <span
                  className={`${zegoUserVideoCss.micIcon}  ${!this.props.user.streamList[0] ||
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
        {
          this.isWaitingUser && (
            <div className={zegoUserVideoCss.cancelBtn} onClick={() => this.cancelCall()}>
            </div>
          )
        }
        {(!this.props.hiddenMore && !this.isWaitingUser) && <ZegoMore user={this.props.user} />}
        {this.props.showFullScreen && (
          <div
            className={`${zegoUserVideoCss.fullScreenBtn}`}
            onClick={this.enterFullScreen.bind(this)}
          ></div>
        )}
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
              className={`${zegoUserVideoCss.nameCircle} zegoUserVideo_click  ${this.props.circleSize === "SIDEBAR"
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
                  className="zegoUserVideo_click"
                  src={this.props.user.avatar}
                  onError={(e: any) => {
                    e.target.style.display = "none";
                  }}
                  alt=""
                />
              )}
            </div>
            <div
              className={`${zegoUserVideoCss.nameCircle}  zegoUserVideo_click ${this.props.circleSize === "SIDEBAR"
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
