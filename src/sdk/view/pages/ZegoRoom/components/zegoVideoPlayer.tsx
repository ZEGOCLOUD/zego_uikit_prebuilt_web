import React, { RefObject } from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import { getNameFirstLetter, userNameColor } from "../../../../util";
import ShowManageContext, { ShowManageType } from "../../context/showManage";
import ZegoVideoPlayerCss from "./zegoVideoPlayer.module.scss";
import ZegoVideo from "../../../components/zegoMedia/video";
import { UserListMenuItemType, UserTypeEnum } from "../../../../model";
import { FormattedMessage } from "react-intl";
import { ZegoCloudRTCCore } from "../../../../modules";
import ZegoLocalStream from "zego-express-engine-webrtc/sdk/code/zh/ZegoLocalStream.web";
export class VideoPlayer extends React.PureComponent<{
  core: ZegoCloudRTCCore
  userInfo: ZegoCloudUser;
  muted: boolean;
  volume?: {
    [streamID: string]: number;
  };
  handleMenuItem?: (type: UserListMenuItemType) => void;
  onPause?: Function;
  onCanPlay?: Function;
  myClass?: string;
  hiddenName?: boolean;
  hiddenMore?: boolean;
}> {
  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;
  localVideoRef: RefObject<HTMLDivElement> = React.createRef();
  state = {
    hovered: false,
  };
  get avatarConfig() {
    const videoViewConfig = this.props.core._config.videoViewConfig || []
    const { avatar, userID } = this.props.userInfo
    const _avatarConfig = videoViewConfig.find((config) => config.userID === userID)
    const visiblity = _avatarConfig?.showAvatarWhenCameraOff !== false
    return {
      visiblity,
      url: avatar,
    }
  }

  get isCameraOpen() {
    return this.props.userInfo?.streamList?.[0]?.cameraStatus === "OPEN";
  }

  get hideUsersById() {
    const { hideUsersById } = this.props.core._config
    return hideUsersById || []
  }

  get isHiddenVideo() {
    return this.hideUsersById.includes(this.props.userInfo.userID)
  }

  get isWaitingUser() {
    return this.props.userInfo.type === UserTypeEnum.CALLING_WAITTING
  }

  cancelCall() {
    this.props.core._zimManager?.cancelInvitation(void 0, [this.props.userInfo], false)
  }

  render(): React.ReactNode {
    const volume =
      this.props.volume?.[this.props.userInfo?.streamList?.[0]?.streamID];
    const height = volume === undefined ? 0 : Math.ceil((volume * 7) / 100);
    let {
      showRemoveButton,
      showTurnOffCameraButton,
      showTurnOffMicrophoneButton,
      isShownPin,
      showRemoveCohostButton,
    } = this.context;

    const { formatMessage } = this.props.core.intl;
    return (
      <div
        className={`${ZegoVideoPlayerCss.videoPlayerWrapper} ${this.props.myClass} ${this.isHiddenVideo && ZegoVideoPlayerCss.hidden}`}
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
          core={this.props.core}
          muted={this.props.muted}
          classList={`${ZegoVideoPlayerCss.videoCommon}`}
          userInfo={this.props.userInfo}
          onPause={() => {
            this.props.onPause && this.props.onPause();
          }}
          onCanPlay={() => {
            this.props.onCanPlay && this.props.onCanPlay();
          }}
        ></ZegoVideo>
        {this.avatarConfig.visiblity &&
          <div
            className={ZegoVideoPlayerCss.cameraMask}
            style={{
              display:
                this.isCameraOpen
                  ? "none"
                  : "flex",
            }}
          >

            {this.avatarConfig.url && (
              <img
                src={this.avatarConfig.url}
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
        }

        {
          this.isWaitingUser && (
            <div className={ZegoVideoPlayerCss.cancelBtn} onClick={() => this.cancelCall()}>
              <FormattedMessage id="call.cancelCall" />
            </div>
          )
        }

        {!this.props.hiddenName && (
          <div id="ZegoVideoPlayerName" className={ZegoVideoPlayerCss.name}>
            {!this.props.userInfo?.streamList?.[0]?.urlsHttpsFLV && (
              <span
                className={`${ZegoVideoPlayerCss.micIcon} ${this.props.userInfo?.streamList?.[0]?.micStatus !== "OPEN" &&
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
              <span className={ZegoVideoPlayerCss.nameTag}>(<FormattedMessage id="global.you" />)</span>
            )}
          </div>
        )}
        {(!this.props.hiddenMore && !this.isWaitingUser) &&
          (showTurnOffMicrophoneButton!(this.props.userInfo) ||
            showTurnOffCameraButton!(this.props.userInfo) ||
            isShownPin!(this.props.userInfo) ||
            showRemoveButton!(this.props.userInfo) ||
            showRemoveCohostButton!(this.props.userInfo)) &&
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
                          this.props.handleMenuItem(
                            UserListMenuItemType.MuteMic
                          );
                      }}
                    >
                      <span
                        className={ZegoVideoPlayerCss.moreMenuMicIcon}
                      ></span>
                      <p><FormattedMessage id="global.mute" /></p>
                    </div>
                  )}
                  {showTurnOffCameraButton!(this.props.userInfo) && (
                    <div
                      className={ZegoVideoPlayerCss.moreMenuItem}
                      onClick={() => {
                        this.props.handleMenuItem &&
                          this.props.handleMenuItem(
                            UserListMenuItemType.MuteCamera
                          );
                      }}
                    >
                      <span
                        className={ZegoVideoPlayerCss.moreMenuCameraIcon}
                      ></span>
                      <p><FormattedMessage id="global.turnOffCamera" /></p>
                    </div>
                  )}
                  {isShownPin!(this.props.userInfo) && (
                    <div
                      className={ZegoVideoPlayerCss.moreMenuItem}
                      onClick={() => {
                        this.props.handleMenuItem &&
                          this.props.handleMenuItem(
                            UserListMenuItemType.ChangePin
                          );
                      }}
                    >
                      <span
                        className={ZegoVideoPlayerCss.moreMenuPinIcon}
                      ></span>
                      <p>{this.props.userInfo.pin ? formatMessage({ id: "room.removePin" }) : "Pin"}</p>
                    </div>
                  )}
                  {showRemoveCohostButton!(this.props.userInfo) && (
                    <div
                      className={ZegoVideoPlayerCss.moreMenuItem}
                      onClick={() => {
                        this.props.handleMenuItem &&
                          this.props.handleMenuItem(
                            UserListMenuItemType.RemoveCohost
                          );
                      }}
                    >
                      <span
                        className={ZegoVideoPlayerCss.moreMenuConnectIcon}
                      ></span>
                      <p>{formatMessage({ id: "room.endConnection" })}</p>
                    </div>
                  )}
                  {showRemoveButton!(this.props.userInfo) && (
                    <div
                      className={ZegoVideoPlayerCss.moreMenuItem}
                      onClick={() => {
                        this.props.handleMenuItem &&
                          this.props.handleMenuItem(
                            UserListMenuItemType.RemoveUser
                          );
                      }}
                    >
                      <span
                        className={ZegoVideoPlayerCss.moreMenuRemoveIcon}
                      ></span>
                      <p>{formatMessage({ id: "room.remove" })}</p>
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
