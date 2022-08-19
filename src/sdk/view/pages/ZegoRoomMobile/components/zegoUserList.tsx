import React, { ChangeEvent, RefObject } from "react";
import zegoUserListCss from "./zegoUserList.module.scss";
import { userNameColor } from "../../../../util";
import { ZegoCloudRTCCore } from "../../../../modules";
import {
  ZegoCloudUser,
  ZegoCloudUserList,
} from "../../../../modules/tools/UserListManager";
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
                  this.props.closeCallBack(user);
                }}
              >
                <div className={zegoUserListCss.memberName}>
                  <i style={{ color: userNameColor(user.userName!) }}>
                    {user.userName?.substring(0, 1)}
                  </i>
                  <a key={user.userID}>{user.userName}</a>{" "}
                </div>
                <div className={zegoUserListCss.memberHandlers}>
                  <i
                    className={
                      user.streamList &&
                      user.streamList[0] &&
                      user.streamList[0].cameraStatus === "OPEN"
                        ? zegoUserListCss.memberCameraOpen
                        : zegoUserListCss.memberCameraMute
                    }
                  ></i>
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
                      user.pin
                        ? zegoUserListCss.memberPined
                        : zegoUserListCss.memberUnPin
                    }
                  ></i>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
