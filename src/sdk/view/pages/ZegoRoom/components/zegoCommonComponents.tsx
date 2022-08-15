import { userNameColor } from "../../../../util";
import ZegoCommonCss from "./zegoCommonComponents.module.scss";

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
