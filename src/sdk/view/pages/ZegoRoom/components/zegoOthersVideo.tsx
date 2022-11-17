import React from "react";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import { getNameFirstLetter, userNameColor } from "../../../../util";
import ZegoOthersVideo from "./zegoOthersVideo.module.scss";

export class OthersVideo extends React.PureComponent<{
  users: ZegoCloudUserList;
  others: number;
}> {
  render(): React.ReactNode {
    return (
      <div>
        <video muted className={ZegoOthersVideo.videoCommon}></video>
        <div className={ZegoOthersVideo.otherVideoWrapper}>
          <div className={ZegoOthersVideo.nameWrapper}>
            {this.props.users.map((user, i) => (
              <div
                className={ZegoOthersVideo.nameCircle}
                key={user.userID}
                style={{
                  color: userNameColor(user.userName!),
                }}
              >
                {getNameFirstLetter(user.userName!)}
                {user.avatar && (
                  <img
                    src={user.avatar}
                    onError={(e: any) => {
                      e.target.style.display = "none";
                    }}
                    alt=""
                  />
                )}
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
