import React, { ChangeEvent, RefObject } from "react";
import zegoUserListCss from "./zegoUserList.module.scss";
import { getNameFirstLetter, userNameColor } from "../../../../util";
import { ZegoCloudRTCCore } from "../../../../modules";
import {
  ZegoCloudUser,
  ZegoCloudUserList,
} from "../../../../modules/tools/UserListManager";
import { ScenarioModel } from "../../../../model";
import { ShowPCManageType } from "../../ZegoRoom/context/showManage";
import ShowManageContext, { ShowManageType } from "../context/showManage";
export class ZegoUserList extends React.PureComponent<{
  userList: ZegoCloudUserList;
  core: ZegoCloudRTCCore;
  closeCallBack: (user?: ZegoCloudUser) => void;
}> {
  state: {
    message: string;
  } = {
    message: "",
  };

  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;

  messageInput(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      message: event.target.value,
    });
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
                    {getNameFirstLetter(user.userName || "")}
                    {user.avatar && (
                      <img
                        src={user.avatar}
                        onError={(e: any) => {
                          e.target.style.display = "none";
                        }}
                        alt={user.userName}
                      />
                    )}
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
