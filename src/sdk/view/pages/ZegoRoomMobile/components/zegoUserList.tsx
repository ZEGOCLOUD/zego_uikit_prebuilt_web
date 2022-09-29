import React, { ChangeEvent, RefObject } from "react";
import zegoUserListCss from "./zegoUserList.module.scss";
import { userNameColor } from "../../../../util";
import { ZegoCloudRTCCore } from "../../../../modules";
import {
  ZegoCloudUser,
  ZegoCloudUserList,
} from "../../../../modules/tools/UserListManager";
import { ScenarioModel } from "../../../../model";
export class ZegoUserList extends React.Component<{
  userList: ZegoCloudUserList;
  core: ZegoCloudRTCCore;
  closeCallBack: (user?: ZegoCloudUser) => void;
}> {
  state: {
    message: string;
  } = {
    message: "",
  };

  messageInput(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      message: event.target.value,
    });
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
          {this.props.userList.map((user) => {
            return (
              <div
                key={user.userID}
                className={zegoUserListCss.member}
                onClick={(ev) => {
                  ev.stopPropagation();
                  this.isShownPin(user) && this.props.closeCallBack(user);
                }}
              >
                <div className={zegoUserListCss.memberName}>
                  <i style={{ color: userNameColor(user.userName!) }}>
                    {user.userName?.substring(0, 1)}
                  </i>
                  <a
                    key={user.userID}
                    style={{
                      maxWidth:
                        this.props.core._expressConfig.userID === user.userID
                          ? "30vw"
                          : "45vw",
                    }}
                  >
                    {user.userName}
                  </a>
                  {this.props.core._expressConfig.userID === user.userID && (
                    <a key={user.userID + "_me"}>（You）</a>
                  )}
                </div>
                <div className={zegoUserListCss.memberHandlers}>
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
                  {this.isShownPin(user) && (
                    <i
                      className={
                        user.pin
                          ? zegoUserListCss.memberPined
                          : zegoUserListCss.memberUnPin
                      }
                    ></i>
                  )}
                  {!this.isShownPin(user) && <i></i>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
