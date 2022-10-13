import React from "react";
import { getNameFirstLetter, userNameColor } from "../../../../util";
import ZegoOthersVideo from "./zegoOthersVideo.module.scss";

export class OthersVideo extends React.PureComponent<{
  users: string[];
  others: number;
}> {
  render(): React.ReactNode {
    return (
      <div>
        <video muted className={ZegoOthersVideo.videoCommon}></video>
        <div className={ZegoOthersVideo.otherVideoWrapper}>
          <div className={ZegoOthersVideo.nameWrapper}>
            {this.props.users.map((value, i) => (
              <div
                className={ZegoOthersVideo.nameCircle}
                key={i}
                style={{
                  color: userNameColor(value),
                }}
              >
                {getNameFirstLetter(value)}
              </div>
            ))}
          </div>
          {this.props.others > 0 && (
            <p className={ZegoOthersVideo.othersNumber}>
              {this.props.others} others
            </p>
          )}
        </div>
      </div>
    );
  }
}
