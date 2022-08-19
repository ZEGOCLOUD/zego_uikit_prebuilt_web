import { ZegoCloudRemoteMedia } from "../../../../model";
import { userNameColor } from "../../../../util";
import ZegoCommonCss from "./zegoCommonComponents.module.scss";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";

export function OthersVideo(props: { users: string[]; others: number }) {
  return (
    <div>
      <video muted className={ZegoCommonCss.videoCommon}></video>
      <div className={ZegoCommonCss.otherVideoWrapper}>
        <div className={ZegoCommonCss.nameWrapper}>
          {props.users.map((value, i) => (
            <div
              className={ZegoCommonCss.nameCircle}
              key={i}
              style={{
                color: userNameColor(value),
              }}
            >
              {value.slice(0, 1)?.toUpperCase()}
            </div>
          ))}
        </div>
        {props.others > 0 && (
          <p className={ZegoCommonCss.othersNumber}>{props.others} others</p>
        )}
      </div>
    </div>
  );
}

export function VideoPlayer(props: {
  userInfo: ZegoUser & {
    pin: boolean;
    streamList: ZegoCloudRemoteMedia[];
  };
  muted: boolean;
  volume?: {
    [streamID: string]: number;
  };
  handlePin?: Function;
  onPause?: Function;
  myClass?: string;
}) {
  const volume = props.volume?.[props.userInfo?.streamList?.[0]?.streamID];
  const height = volume === undefined ? 5 : Math.ceil((volume * 7) / 100);

  return (
    <div className={` ${ZegoCommonCss.videoPlayerWrapper} ${props.myClass}`}>
      <video
        muted={props.muted}
        autoPlay
        className={ZegoCommonCss.videoCommon}
        playsInline={true}
        ref={(el) => {
          el &&
            el.srcObject !== props.userInfo?.streamList[0]?.media &&
            (el.srcObject = props.userInfo?.streamList[0]?.media);
        }}
        onPause={() => {
          props.onPause && props.onPause();
        }}
      ></video>
      <div
        className={ZegoCommonCss.cameraMask}
        style={{
          display:
            props.userInfo?.streamList[0]?.cameraStatus === "OPEN"
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

      <div className={ZegoCommonCss.name}>
        <span
          className={`${ZegoCommonCss.micIcon} ${
            props.userInfo?.streamList[0]?.micStatus !== "OPEN" &&
            ZegoCommonCss.close
          }`}
        >
          {props.userInfo?.streamList[0]?.micStatus === "OPEN" && (
            <span style={{ height: height + "px" }}></span>
          )}
        </span>
        <p>{props.userInfo.userName}</p>
        {props.muted && <span className={ZegoCommonCss.nameTag}>(You)</span>}
      </div>
      <div className={ZegoCommonCss.moreWrapperMask}>
        <div className={ZegoCommonCss.moreWrapper}>
          <span className={ZegoCommonCss.moreIcon}></span>
          <div className={ZegoCommonCss.moreMenu}>
            <div
              className={ZegoCommonCss.moreMenuItem}
              onClick={() => {
                props.handlePin && props.handlePin(props.userInfo.userID);
              }}
            >
              <span className={ZegoCommonCss.moreMenuPinIcon}></span>
              <p>{props.userInfo.pin ? "Remove Pin" : "Pin"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
