import React from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { getNameFirstLetter, userNameColor } from "../../../../util";
import ZegoUserListCss from "./zegoUserList.module.scss";
import {
  ZegoCloudUser,
  ZegoCloudUserList,
} from "../../../../modules/tools/UserListManager";
import { LiveRole, ScenarioModel, SoundLevelMap } from "../../../../model";
import ShowManageContext, { ShowManageType } from "../../context/showManage";
export class ZegoUserList extends React.PureComponent<{
  core: ZegoCloudRTCCore;
  userList: ZegoCloudUserList;
  selfUserID: string;
  handleMenuItem: (
    type: "Pin" | "Mic" | "Camera" | "Remove",
    user: ZegoCloudUser
  ) => void;
  soundLevel?: SoundLevelMap;
}> {
  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;
  micInOption = false;
  cameraInOption = false;
  hoverEl: HTMLDivElement | null = null;
  get hostAndCohostList() {
    return this.props.userList.filter((u) => u.streamList.length > 0);
  }
  get audienceList() {
    return this.props.userList.filter((u) => u.streamList.length === 0);
  }
  showTurnOffMicrophoneButton(user: ZegoCloudUser) {
    if (!this.props.core._config.showTurnOffRemoteMicrophoneButton)
      return false;

    return (
      this.props.core._config.scenario?.config?.role === LiveRole.Host ||
      (user.userID === this.props.selfUserID &&
        this.props.core._config.scenario?.config?.role === LiveRole.Cohost)
    );
  }
  showTurnOffCameraButton(user: ZegoCloudUser) {
    if (!this.props.core._config.showTurnOffRemoteCameraButton) return false;
    return (
      this.props.core._config.scenario?.config?.role === LiveRole.Host ||
      (user.userID === this.props.selfUserID &&
        this.props.core._config.scenario?.config?.role === LiveRole.Cohost)
    );
  }
  showRemoveButton(user: ZegoCloudUser) {
    if (!this.props.core._config.showRemoveUserButton) return false;
    return (
      this.props.core._config.scenario?.config?.role === LiveRole.Host &&
      (user.userID !== this.props.selfUserID || user.streamList.length === 0)
    );
  }
  isShownPin(user: ZegoCloudUser): boolean {
    if (this.props.core._config.scenario?.mode === ScenarioModel.OneONoneCall) {
      return false;
    }
    let { showPinButton } = this.context;
    return (
      showPinButton &&
      !!(
        this.props.core._config.showNonVideoUser ||
        (user.streamList &&
          user.streamList[0] &&
          user.streamList[0].cameraStatus === "OPEN") ||
        (user.streamList &&
          user.streamList[0] &&
          user.streamList[0].micStatus === "OPEN" &&
          !!this.props.core._config.showOnlyAudioUser)
      )
    );
  }
  showMenu(user: ZegoCloudUser) {
    return (
      this.isShownPin(user) ||
      this.showRemoveButton(user) ||
      this.showTurnOffCameraButton(user) ||
      this.showTurnOffMicrophoneButton(user)
    );
  }
  getHeight(userID: string, streamID: string): number {
    const volume = this.props.soundLevel![userID]?.[streamID];
    return volume === undefined ? 5 : Math.ceil((volume * 9) / 100);
  }
  onMouseEnter(e: React.MouseEvent) {
    const el = e.target as HTMLDivElement;
    this.hoverEl = el;

    if (!el.className?.includes(`${ZegoUserListCss.haveMenu}`)) return;
    const menu = document.querySelector(
      `.${ZegoUserListCss.memberMenuWrapper}`
    );
    if (!menu) return;
    const menuHeight = menu.clientHeight;
    const offsetTop = el.offsetTop;
    const wrapperHeight =
      document.querySelector(`.${ZegoUserListCss.memberListWrapper}`)
        ?.parentElement?.clientHeight || 0;
    if (!this.hoverEl) return;
    const top = offsetTop - menuHeight + 12; //
    const bottom = wrapperHeight - menuHeight - offsetTop - 40;

    let className = null;
    if (bottom >= 0) {
      className = null;
    } else if (top >= 0) {
      className = `${ZegoUserListCss.bottomMenu}`;
    } else {
      if (Math.abs(top) >= Math.abs(bottom)) {
        className = null;
      } else {
        className = `${ZegoUserListCss.bottomMenu}`;
      }
    }

    el.classList.add(`${ZegoUserListCss.showMenu}`, `${className}`);
  }
  onMouseLeave(e: React.MouseEvent) {
    const el = this.hoverEl || (e.target as HTMLDivElement);
    el.classList.remove(
      `${ZegoUserListCss.showMenu}`,
      `${ZegoUserListCss.bottomMenu}`
    );
    this.hoverEl = null;
  }
  render(): React.ReactNode {
    return (
      <div className={ZegoUserListCss.memberListWrapper}>
        {this.hostAndCohostList.map((user) => {
          return (
            <div
              className={`${ZegoUserListCss.member} ${
                this.showMenu(user) ? ZegoUserListCss.haveMenu : ""
              }`}
              key={user.userID}
              data-id={user.userID}
              onMouseEnter={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                this.onMouseEnter(e);
              }}
              onMouseLeave={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                this.onMouseLeave(e);
              }}
            >
              <div
                className={`${ZegoUserListCss.memberNameWrapper} ${ZegoUserListCss.memberGuestNameWrapper}`}
              >
                {user.avatar && (
                  <img
                    src={user.avatar}
                    onError={(e: any) => {
                      e.target.style.display = "none";
                    }}
                    alt=""
                  />
                )}
                <span style={{ color: userNameColor(user.userName || "") }}>
                  {getNameFirstLetter(user.userName || "")}
                </span>

                <p>{user.userName}</p>
                {user.userID === this.props.selfUserID && "(You)"}
              </div>

              {user.streamList[0].media && (
                <>
                  <div className={ZegoUserListCss.memberStatusWrapper}>
                    {this.isShownPin(user) && user.pin && (
                      <span
                        className={`${ZegoUserListCss.memberPinIcon}`}
                      ></span>
                    )}
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
                  </div>
                  <div className={ZegoUserListCss.selfStatusWrapper}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div className={ZegoUserListCss.memberMenuWrapper}>
                    {this.showTurnOffMicrophoneButton(user) && (
                      <div
                        className={ZegoUserListCss.memberMenuItem}
                        onClick={() => this.props.handleMenuItem("Mic", user)}
                      >
                        Mute
                      </div>
                    )}
                    {this.showTurnOffCameraButton(user) && (
                      <div
                        className={ZegoUserListCss.memberMenuItem}
                        onClick={() =>
                          this.props.handleMenuItem("Camera", user)
                        }
                      >
                        Turn off camera
                      </div>
                    )}

                    {this.isShownPin(user) && (
                      <div
                        className={ZegoUserListCss.memberMenuItem}
                        onClick={() => this.props.handleMenuItem("Pin", user)}
                      >
                        {user.pin ? "Remove Pin" : "Pin"}
                      </div>
                    )}
                    {this.showRemoveButton(user) && (
                      <div
                        className={ZegoUserListCss.memberMenuItem}
                        onClick={() =>
                          this.props.handleMenuItem("Remove", user)
                        }
                      >
                        Remove participant
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
        {this.audienceList.map((user) => {
          return (
            <div
              className={`${ZegoUserListCss.member} ${
                this.showRemoveButton(user) ? ZegoUserListCss.haveMenu : ""
              }`}
              key={user.userID}
              data-id={user.userID}
            >
              <div
                className={`${ZegoUserListCss.memberNameWrapper} ${ZegoUserListCss.memberGuestNameWrapper}`}
              >
                {user.avatar && (
                  <img
                    src={user.avatar}
                    onError={(e: any) => {
                      e.target.style.display = "none";
                    }}
                    alt=""
                  />
                )}
                <span style={{ color: userNameColor(user.userName || "") }}>
                  {getNameFirstLetter(user.userName || "")}
                </span>

                <p>{user.userName}</p>
                {user.userID === this.props.selfUserID && "(You)"}
              </div>
              <div className={ZegoUserListCss.selfStatusWrapper}>
                <span></span>
                <span></span>
                <span></span>
              </div>

              {this.showRemoveButton(user) && (
                <div className={ZegoUserListCss.memberMenuWrapper}>
                  <div
                    className={ZegoUserListCss.memberMenuItem}
                    onClick={() => this.props.handleMenuItem("Remove", user)}
                  >
                    Remove participant
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}
