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
  handleMenuItem?: (type: "Pin" | "Mic" | "Camera" | "Remove") => void;
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
    let {
      showRemoveButton,
      showTurnOffCameraButton,
      showTurnOffMicrophoneButton,
      isShownPin,
    } = this.context;
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
        {!this.props.hiddenMore &&
          (showTurnOffMicrophoneButton!(this.props.userInfo) ||
            showTurnOffCameraButton!(this.props.userInfo) ||
            isShownPin!(this.props.userInfo) ||
            showRemoveButton!(this.props.userInfo)) &&
          this.state.hovered && (
            <div className={ZegoVideoPlayerCss.moreWrapperMask}>
              <div className={ZegoVideoPlayerCss.moreWrapper}>
                <span className={ZegoVideoPlayerCss.moreIcon}></span>
                <div className={ZegoVideoPlayerCss.moreMenu}>
                  {showTurnOffMicrophoneButton!(this.props.userInfo) && (
                    <div
                      className={ZegoVideoPlayerCss.moreMenuItem}
                      onClick={() => {
                        this.props.handleMenuItem &&
                          this.props.handleMenuItem("Mic");
                      }}
                    >
                      <span
                        className={ZegoVideoPlayerCss.moreMenuMicIcon}
                      ></span>
                      <p>Mute</p>
                    </div>
                  )}
                  {showTurnOffCameraButton!(this.props.userInfo) && (
                    <div
                      className={ZegoVideoPlayerCss.moreMenuItem}
                      onClick={() => {
                        this.props.handleMenuItem &&
                          this.props.handleMenuItem("Camera");
                      }}
                    >
                      <span
                        className={ZegoVideoPlayerCss.moreMenuCameraIcon}
                      ></span>
                      <p>Turn off camera</p>
                    </div>
                  )}
                  {isShownPin!(this.props.userInfo) && (
                    <div
                      className={ZegoVideoPlayerCss.moreMenuItem}
                      onClick={() => {
                        this.props.handleMenuItem &&
                          this.props.handleMenuItem("Pin");
                      }}
                    >
                      <span
                        className={ZegoVideoPlayerCss.moreMenuPinIcon}
                      ></span>
                      <p>{this.props.userInfo.pin ? "Remove Pin" : "Pin"}</p>
                    </div>
                  )}
                  {showRemoveButton!(this.props.userInfo) && (
                    <div
                      className={ZegoVideoPlayerCss.moreMenuItem}
                      onClick={() => {
                        this.props.handleMenuItem &&
                          this.props.handleMenuItem("Remove");
                      }}
                    >
                      <span
                        className={ZegoVideoPlayerCss.moreMenuRemoveIcon}
                      ></span>
                      <p>Remove participant</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
    );
  }
}
