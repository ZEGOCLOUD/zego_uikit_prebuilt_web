import React from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { userNameColor } from "../../../../util";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import ZegoUserListCss from "./zegoUserList.module.scss";
export class ZegoUserList extends React.Component<{
  core: ZegoCloudRTCCore;
  userList: ZegoUser[];
  selfUserID: string;
}> {
  expandMemberMenu(userID: string | null) {
    const members = document.querySelectorAll(
      `.${ZegoUserListCss.memberMenuWrapper}`
    );
    members.forEach((m: any) => {
      if (m?.dataset.id === userID) {
        m.style.display = m.style.display === "block" ? "none" : "block";
      } else {
        m.style.display = "none";
      }
    });
  }

  render(): React.ReactNode {
    return (
      <div className={ZegoUserListCss.memberListWrapper}>
        {this.props.userList.map((user) => {
          return (
            <div
              className={ZegoUserListCss.member}
              onClick={() => this.expandMemberMenu(user.userID)}
            >
              <span style={{ color: userNameColor(user.userName || "") }}>
                {user.userName?.slice(0, 1)?.toUpperCase()}
              </span>
              <div
                className={`${ZegoUserListCss.memberNameWrapper} ${ZegoUserListCss.memberGuestNameWrapper}`}
              >
                <p>{user.userName}</p>
                {user.userID === this.props.selfUserID && "(You)"}
              </div>
              {user.userID === this.props.selfUserID ? (
                <div className={ZegoUserListCss.selfStatusWrapper}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                <div className={ZegoUserListCss.memberStatusWrapper}>
                  <span
                    className={`${ZegoUserListCss.memberMicIcon} ${ZegoUserListCss.memberMicIconOpen}`}
                  ></span>
                  <span
                    className={`${ZegoUserListCss.memberCameraIcon} ${ZegoUserListCss.memberCameraIconOpen}`}
                  ></span>
                  <span
                    className={`${ZegoUserListCss.memberPinIcon} ${ZegoUserListCss.memberPinIconOpen}`}
                  ></span>
                </div>
              )}

              <div
                className={ZegoUserListCss.memberMenuWrapper}
                data-id={user.userID}
              >
                <div className={ZegoUserListCss.memberMenuItem}>Pin</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
