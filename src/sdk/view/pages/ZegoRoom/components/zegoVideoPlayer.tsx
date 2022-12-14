import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import { getNameFirstLetter, userNameColor } from "../../../../util";
import ShowManageContext, { ShowManageType } from "../../context/showManage";
import ZegoVideoPlayerCss from "./zegoVideoPlayer.module.scss";
import ZegoVideo from "../../../components/zegoMedia/video";
export class VideoPlayer extends React.PureComponent<{
  userInfo: ZegoCloudUser;
  muted: boolean;
  volume?: {
    [streamID: string]: number;
  };
  handlePin?: Function;
  onPause?: Function;
  onCanPlay?: Function;
  myClass?: string;
  hiddenName?: boolean;
  hiddenMore?: boolean;
}> {
  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;
  state = {
    hovered: false,
  };
  render(): React.ReactNode {
    const volume =
      this.props.volume?.[this.props.userInfo?.streamList?.[0]?.streamID];
    const height = volume === undefined ? 5 : Math.ceil((volume * 7) / 100);
    let { showPinButton } = this.context;
    return (
      <div
        className={` ${ZegoVideoPlayerCss.videoPlayerWrapper} ${this.props.myClass}`}
        onMouseEnter={() => {
          this.setState({
            hovered: true,
          });
        }}
        onMouseLeave={() => {
          this.setState({
            hovered: false,
          });
        }}
      >
        <ZegoVideo
          muted={this.props.muted}
          classList={ZegoVideoPlayerCss.videoCommon}
          userInfo={this.props.userInfo}
          onPause={() => {
            this.props.onPause && this.props.onPause();
          }}
          onCanPlay={() => {
            this.props.onCanPlay && this.props.onCanPlay();
          }}
        ></ZegoVideo>
        <div
          className={ZegoVideoPlayerCss.cameraMask}
          style={{
            display:
              this.props.userInfo?.streamList?.[0]?.cameraStatus === "OPEN"
                ? "none"
                : "flex",
          }}
        >
          {this.props.userInfo.avatar && (
            <img
              src={this.props.userInfo.avatar}
              onError={(e: any) => {
                e.target.style.display = "none";
              }}
              alt=""
            />
          )}
          <div
            style={{
              color: userNameColor(this.props.userInfo?.userName as string),
            }}
          >
            {getNameFirstLetter(this.props.userInfo?.userName || "")}
          </div>
        </div>

        {!this.props.hiddenName && (
          <div className={ZegoVideoPlayerCss.name}>
            {!this.props.userInfo?.streamList?.[0]?.urlsHttpsFLV && (
              <span
                className={`${ZegoVideoPlayerCss.micIcon} ${
                  this.props.userInfo?.streamList?.[0]?.micStatus !== "OPEN" &&
                  ZegoVideoPlayerCss.close
                }`}
              >
                {this.props.userInfo?.streamList?.[0]?.micStatus === "OPEN" && (
                  <span style={{ height: height + "px" }}></span>
                )}
              </span>
            )}
            <p
              className={
                this.props.userInfo.overScreenMuteVideo
                  ? "muteVideo"
                  : "unmuteVideo"
              }
            >
              {this.props.userInfo.userName}
            </p>
            {this.props.muted && (
              <span className={ZegoVideoPlayerCss.nameTag}>(You)</span>
            )}
          </div>
        )}
        {!this.props.hiddenMore && showPinButton && this.state.hovered && (
          <div className={ZegoVideoPlayerCss.moreWrapperMask}>
            <div className={ZegoVideoPlayerCss.moreWrapper}>
              <span className={ZegoVideoPlayerCss.moreIcon}></span>
              <div className={ZegoVideoPlayerCss.moreMenu}>
                <div
                  className={ZegoVideoPlayerCss.moreMenuItem}
                  onClick={() => {
                    this.props.handlePin &&
                      this.props.handlePin(this.props.userInfo.userID);
                  }}
                >
                  <span className={ZegoVideoPlayerCss.moreMenuPinIcon}></span>
                  <p>{this.props.userInfo.pin ? "Remove Pin" : "Pin"}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
