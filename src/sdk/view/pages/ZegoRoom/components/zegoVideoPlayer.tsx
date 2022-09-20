import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import { userNameColor } from "../../../../util";
import ShowPCManageContext, { ShowPCManageType } from "../context/showManage";
import ZegoVideoPlayerCss from "./zegoVideoPlayer.module.scss";
export class VideoPlayer extends React.Component<{
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
  static contextType?: React.Context<ShowPCManageType> = ShowPCManageContext;
  context!: React.ContextType<typeof ShowPCManageContext>;
  render(): React.ReactNode {
    const volume =
      this.props.volume?.[this.props.userInfo?.streamList?.[0]?.streamID];
    const height = volume === undefined ? 5 : Math.ceil((volume * 7) / 100);
    let { showPinButton } = this.context;
    return (
      <div
        className={` ${ZegoVideoPlayerCss.videoPlayerWrapper} ${this.props.myClass}`}
      >
        <video
          muted={this.props.muted}
          autoPlay
          className={ZegoVideoPlayerCss.videoCommon}
          playsInline={true}
          ref={(el) => {
            el &&
              el.srcObject !== this.props.userInfo?.streamList?.[0]?.media &&
              (el.srcObject = this.props.userInfo?.streamList?.[0]?.media!);
          }}
          onPause={() => {
            this.props.onPause && this.props.onPause();
          }}
          onCanPlay={() => {
            this.props.onCanPlay && this.props.onCanPlay();
          }}
        ></video>
        <div
          className={ZegoVideoPlayerCss.cameraMask}
          style={{
            display:
              this.props.userInfo?.streamList?.[0]?.cameraStatus === "OPEN"
                ? "none"
                : "flex",
          }}
        >
          <div
            style={{
              color: userNameColor(this.props.userInfo?.userName as string),
            }}
          >
            {this.props.userInfo?.userName?.slice(0, 1)?.toUpperCase()}
          </div>
        </div>

        {!this.props.hiddenName && showPinButton && (
          <div className={ZegoVideoPlayerCss.name}>
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
            <p>{this.props.userInfo.userName}</p>
            {this.props.muted && (
              <span className={ZegoVideoPlayerCss.nameTag}>(You)</span>
            )}
          </div>
        )}
        {!this.props.hiddenMore && (
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
