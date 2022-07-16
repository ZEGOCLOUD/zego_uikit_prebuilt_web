import React, { ChangeEvent, RefObject } from "react";
import zegoUserListCss from "./zegoUserList.module.scss";
import { DateFormat, userNameColor } from "../../../../util";
import { ZegoCloudRTCCore } from "../../../../modules";
import {
  ZegoUser,
  ZegoBroadcastMessageInfo,
} from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
export class ZegoUserList extends React.Component<{
  userList: ZegoUser[];
  core: ZegoCloudRTCCore;
  closeCallBack: () => void;
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
          <div>
            <i
              style={{
                color: userNameColor(this.props.core._expressConfig.userName!),
              }}
            >
              {this.props.core._expressConfig.userName.substring(0, 1)}
            </i>
            <a>{this.props.core._expressConfig.userName}(Me)</a>
          </div>

          {this.props.userList.map((user) => {
            return (
              <div>
                <i style={{ color: userNameColor(user.userName!) }}>
                  {user.userName?.substring(0, 1)}
                </i>
                <a key={user.userID}>{user.userName}</a>{" "}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
