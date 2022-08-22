import { userNameColor } from "../../../../util";
import ZegoOthersVideo from "./zegoOthersVideo.module.scss";

export function OthersVideo(props: { users: string[]; others: number }) {
  return (
    <div>
      <video muted className={ZegoOthersVideo.videoCommon}></video>
      <div className={ZegoOthersVideo.otherVideoWrapper}>
        <div className={ZegoOthersVideo.nameWrapper}>
          {props.users.map((value, i) => (
            <div
              className={ZegoOthersVideo.nameCircle}
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
          <p className={ZegoOthersVideo.othersNumber}>{props.others} others</p>
        )}
      </div>
    </div>
  );
}
