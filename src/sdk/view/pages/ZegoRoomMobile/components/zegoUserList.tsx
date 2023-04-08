import React from "react";
import zegoUserListCss from "./zegoUserList.module.scss";
import { getNameFirstLetter, userNameColor } from "../../../../util";
import { ZegoCloudRTCCore } from "../../../../modules";
import {
  ZegoCloudUser,
  ZegoCloudUserList,
} from "../../../../modules/tools/UserListManager";
import { ScenarioModel, UserListMenuItemType } from "../../../../model";
import ShowManageContext, { ShowManageType } from "../../context/showManage";
export class ZegoUserList extends React.PureComponent<{
  userList: ZegoCloudUserList;
  core: ZegoCloudRTCCore;
  closeCallBack: (user?: ZegoCloudUser) => void;
  handleMenuItem: (type: UserListMenuItemType, user: ZegoCloudUser) => void;
}> {
  state: {
    message: string;
  } = {
    message: "",
  };

  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;
  get hostAndCohostList() {
    return this.props.userList.filter((u) => u.streamList.length > 0);
  }
  get audienceList() {
    return this.props.userList
      .filter((u) => u.streamList.length === 0)
      .sort((a, b) => (b.requestCohost || 0) - (a.requestCohost || 0));
  }
  isShownPin(user: ZegoCloudUser): boolean {
    if (this.props.core._config.scenario?.mode === ScenarioModel.OneONoneCall) {
      return false;
    }
    let { showPinButton } = this.context;
    return (
      showPinButton &&
      (this.props.core._config.showNonVideoUser ||
        (user.streamList &&
          user.streamList[0] &&
          user.streamList[0].cameraStatus === "OPEN") ||
        (user.streamList &&
          user.streamList[0] &&
          user.streamList[0].micStatus === "OPEN" &&
          !!this.props.core._config.showOnlyAudioUser))
    );
  }
  render(): React.ReactNode {
    return (
      <div className={zegoUserListCss.memberList}>
        <div className={zegoUserListCss.memberListHeader}>
          <div
            className={zegoUserListCss.memberHide}
            onClick={(ev) => {
              ev.stopPropagation();
              this.props.closeCallBack();
            }}
          ></div>
          Member
        </div>
        <div className={zegoUserListCss.memberListContent}>
          {this.hostAndCohostList.map((user) => {
            return (
              <div
                key={user.userID}
                className={zegoUserListCss.member}
                onClick={(ev) => {
                  ev.stopPropagation();
                  this.props.closeCallBack(user);
                }}
              >
                <div className={zegoUserListCss.memberName}>
                  <i style={{ color: userNameColor(user.userName!) }}>
                    {getNameFirstLetter(user.userName || "")}
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        onError={(e: any) => {
                          e.target.style.display = "none";
                        }}
                        alt=""
                      />
                    )}
                  </i>
                  <span
                    key={user.userID}
                    style={{
                      maxWidth:
                        this.props.core._expressConfig.userID === user.userID
                          ? "30vw"
                          : "45vw",
                    }}
                  >
                    {user.userName}
                  </span>
                  {this.props.core._expressConfig.userID === user.userID && (
                    <span key={user.userID + "_me"}> (You) </span>
                  )}
                </div>
                {(user.streamList[0].media ||
                  (this.context.liveStatus === "1" &&
                    user.streamList[0].streamID)) && (
                  <div className={zegoUserListCss.memberHandlers}>
                    {this.isShownPin(user) && user.pin && (
                      <i className={zegoUserListCss.memberUnPin}></i>
                    )}
                    <i
                      className={
                        user.streamList &&
                        user.streamList[0] &&
                        user.streamList[0].micStatus === "OPEN"
                          ? zegoUserListCss.memberMicOpen
                          : zegoUserListCss.memberMicMute
                      }
                    ></i>
                    <i
                      className={
                        user.streamList &&
                        user.streamList[0] &&
                        user.streamList[0].cameraStatus === "OPEN"
                          ? zegoUserListCss.memberCameraOpen
                          : zegoUserListCss.memberCameraMute
                      }
                    ></i>
                  </div>
                )}
              </div>
            );
          })}
          {this.audienceList.map((user) => {
            return (
              <div
                key={user.userID}
                className={zegoUserListCss.member}
                onClick={(ev) => {
                  ev.stopPropagation();
                  this.props.closeCallBack(user);
                }}
              >
                <div className={zegoUserListCss.memberName}>
                  <i style={{ color: userNameColor(user.userName!) }}>
                    {getNameFirstLetter(user.userName || "")}
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        onError={(e: any) => {
                          e.target.style.display = "none";
                        }}
                        alt=""
                      />
                    )}
                  </i>
                  <span
                    key={user.userID}
                    style={{
                      maxWidth:
                        this.props.core._expressConfig.userID === user.userID ||
                        user.requestCohost
                          ? "30vw"
                          : "45vw",
                    }}
                  >
                    {user.userName}
                  </span>
                  {this.props.core._expressConfig.userID === user.userID && (
                    <span key={user.userID + "_me"}> (You) </span>
                  )}
                </div>
                {user.invited && !user.requestCohost && (
                  <div className={zegoUserListCss.invitedState}>Invited</div>
                )}
                {user.requestCohost && (
                  <div className={zegoUserListCss.requestCohostWrapper}>
                    <div
                      className={zegoUserListCss.disagreeBtn}
                      onClick={(ev) => {
                        this.props.handleMenuItem(
                          UserListMenuItemType.DisagreeRequestCohost,
                          user
                        );
                        ev.stopPropagation();
                      }}
                    >
                      Disagree
                    </div>
                    <div
                      className={zegoUserListCss.agreeBtn}
                      onClick={(ev) => {
                        this.props.handleMenuItem(
                          UserListMenuItemType.AgreeRequestCohost,
                          user
                        );
                        ev.stopPropagation();
                      }}
                    >
                      Agree
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
