import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import { userNameColor } from "../../../../util";
import ZegoVideoPlayerCss from "./zegoVideoPlayer.module.scss";
export function VideoPlayer(props: {
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
}) {
  const volume = props.volume?.[props.userInfo?.streamList?.[0]?.streamID];
  const height = volume === undefined ? 5 : Math.ceil((volume * 7) / 100);

  return (
    <div
      className={` ${ZegoVideoPlayerCss.videoPlayerWrapper} ${props.myClass}`}
    >
      <video
        muted={props.muted}
        autoPlay
        className={ZegoVideoPlayerCss.videoCommon}
        playsInline={true}
        ref={(el) => {
          el &&
            el.srcObject !== props.userInfo?.streamList?.[0]?.media &&
            (el.srcObject = props.userInfo?.streamList?.[0]?.media);
        }}
        onPause={() => {
          props.onPause && props.onPause();
        }}
        onCanPlay={() => {
          props.onCanPlay && props.onCanPlay();
        }}
      ></video>
      <div
        className={ZegoVideoPlayerCss.cameraMask}
        style={{
          display:
            props.userInfo?.streamList?.[0]?.cameraStatus === "OPEN"
              ? "none"
              : "flex",
        }}
      >
        <div
          style={{
            color: userNameColor(props.userInfo?.userName as string),
          }}
        >
          {props.userInfo?.userName?.slice(0, 1)?.toUpperCase()}
        </div>
      </div>

      {!props.hiddenName && (
        <div className={ZegoVideoPlayerCss.name}>
          <span
            className={`${ZegoVideoPlayerCss.micIcon} ${
              props.userInfo?.streamList?.[0]?.micStatus !== "OPEN" &&
              ZegoVideoPlayerCss.close
            }`}
          >
            {props.userInfo?.streamList?.[0]?.micStatus === "OPEN" && (
              <span style={{ height: height + "px" }}></span>
            )}
          </span>
          <p>{props.userInfo.userName}</p>
          {props.muted && (
            <span className={ZegoVideoPlayerCss.nameTag}>(You)</span>
          )}
        </div>
      )}
      {!props.hiddenMore && (
        <div className={ZegoVideoPlayerCss.moreWrapperMask}>
          <div className={ZegoVideoPlayerCss.moreWrapper}>
            <span className={ZegoVideoPlayerCss.moreIcon}></span>
            <div className={ZegoVideoPlayerCss.moreMenu}>
              <div
                className={ZegoVideoPlayerCss.moreMenuItem}
                onClick={() => {
                  props.handlePin && props.handlePin(props.userInfo.userID);
                }}
              >
                <span className={ZegoVideoPlayerCss.moreMenuPinIcon}></span>
                <p>{props.userInfo.pin ? "Remove Pin" : "Pin"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
