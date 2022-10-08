import React from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { userNameColor } from "../../../../util";
import ZegoUserListCss from "./zegoUserList.module.scss";
import {
  ZegoCloudUser,
  ZegoCloudUserList,
} from "../../../../modules/tools/UserListManager";
import { LiveRole, ScenarioModel, SoundLevelMap } from "../../../../model";
export class ZegoUserList extends React.PureComponent<{
  core: ZegoCloudRTCCore;
  userList: ZegoCloudUserList;
  selfUserID: string;
  handleSetPin: Function;
  soundLevel?: SoundLevelMap;
}> {
  componentDidMount() {
    document.addEventListener("click", this.onBodyClick.bind(this));
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.onBodyClick.bind(this));
  }
  onBodyClick(e: Event) {
    const menuElement = document.querySelector(
      `.${ZegoUserListCss.member}.${ZegoUserListCss.memberMenuShow}`
    );
    if (menuElement && !menuElement.contains(e.target as Node)) {
      menuElement.classList.remove(`${ZegoUserListCss.memberMenuShow}`);
    }
  }
  expandMemberMenu(userID: string | null) {
    const members = document.querySelectorAll(`.${ZegoUserListCss.member}`);
    members.forEach((m: any) => {
      if (m?.dataset.id === userID) {
        m.classList.toggle(`${ZegoUserListCss.memberMenuShow}`);
      } else {
        m.classList.remove(`${ZegoUserListCss.memberMenuShow}`);
      }
    });
  }
  getHeight(userID: string, streamID: string): number {
    const volume = this.props.soundLevel![userID]?.[streamID];
    return volume === undefined ? 5 : Math.ceil((volume * 9) / 100);
  }

  isShownPin(user: ZegoCloudUser): boolean {
    if (this.props.core._config.scenario?.mode === ScenarioModel.OneONoneCall) {
      return false;
    }
    return !!(
      this.props.core._config.showNonVideoUser ||
      (user.streamList &&
        user.streamList[0] &&
        user.streamList[0].cameraStatus === "OPEN") ||
      (user.streamList &&
        user.streamList[0] &&
        user.streamList[0].micStatus === "OPEN" &&
        !!this.props.core._config.showOnlyAudioUser)
    );
  }
  render(): React.ReactNode {
    return (
      <div className={ZegoUserListCss.memberListWrapper}>
        {this.props.userList.map((user) => {
          return (
            <div
              className={ZegoUserListCss.member}
              onClick={() => {
                this.isShownPin(user) && this.expandMemberMenu(user.userID);
              }}
              key={user.userID}
              data-id={user.userID}
            >
              <div
                className={`${ZegoUserListCss.memberNameWrapper} ${ZegoUserListCss.memberGuestNameWrapper}`}
              >
                <span style={{ color: userNameColor(user.userName || "") }}>
                  {user.userName?.slice(0, 1)?.toUpperCase()}
                </span>
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
                    className={`${ZegoUserListCss.memberMicIcon} ${
                      user.streamList?.[0]?.micStatus === "OPEN" &&
                      ZegoUserListCss.memberMicIconOpen
                    }`}
                  >
                    {user?.streamList?.[0]?.micStatus === "OPEN" && (
                      <span
                        style={{
                          height:
                            this.getHeight(
                              user.userID,
                              user?.streamList?.[0]?.streamID
                            ) + "px",
                        }}
                      ></span>
                    )}
                  </span>
                  <span
                    className={`${ZegoUserListCss.memberCameraIcon} ${
                      user.streamList?.[0]?.cameraStatus === "OPEN" &&
                      ZegoUserListCss.memberCameraIconOpen
                    }`}
                  ></span>
                  {this.isShownPin(user) && (
                    <span
                      className={`${ZegoUserListCss.memberPinIcon} ${
                        user.pin && ZegoUserListCss.memberPinIconOpen
                      }`}
                    ></span>
                  )}
                </div>
              )}

              <div className={ZegoUserListCss.memberMenuWrapper}>
                <div
                  className={ZegoUserListCss.memberMenuItem}
                  onClick={() => this.props.handleSetPin(user.userID)}
                >
                  {user.pin ? "Remove Pin" : "Pin"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
