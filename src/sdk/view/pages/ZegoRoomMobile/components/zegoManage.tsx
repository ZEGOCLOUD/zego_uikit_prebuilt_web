import React from "react";
import { UserListMenuItemType } from "../../../../model";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import zegoManageCss from "./zegoManage.module.scss";
export class ZegoManage extends React.PureComponent<{
  showPinButton: boolean;
  showMicButton: boolean;
  showCameraButton: boolean;
  showRemoveButton: boolean;
  selectedUser: ZegoCloudUser;
  closeCallback: () => void;
  selectCallback: (type?: UserListMenuItemType, value?: boolean) => void;
}> {
  async select(type?: UserListMenuItemType, value?: boolean) {
    this.props.selectCallback && this.props.selectCallback(type, value);
  }
  render(): React.ReactNode {
    return (
      <div className={zegoManageCss.manageList}>
        <div className={zegoManageCss.manageHeader}>
          {this.props.selectedUser.userName}
          <div
            className={zegoManageCss.manageHide}
            onClick={(ev) => {
              ev.stopPropagation();
              this.props.closeCallback && this.props.closeCallback();
            }}
          ></div>
        </div>

        <div className={zegoManageCss.manageListContent}>
          {this.props.showMicButton && (
            <div
              className={zegoManageCss.manageContent}
              onClick={() => {
                this.select(UserListMenuItemType.MuteMic);
              }}
            >
              <div
                className={`${zegoManageCss.manageContentLeft} ${zegoManageCss.muteItem}`}
              >
                <i></i>
                <span>Mute</span>
              </div>
            </div>
          )}
          {this.props.showCameraButton && (
            <div
              className={zegoManageCss.manageContent}
              onClick={() => {
                this.select(UserListMenuItemType.MuteCamera);
              }}
            >
              <div
                className={`${zegoManageCss.manageContentLeft} ${zegoManageCss.cameraItem}`}
              >
                <i></i>
                <span>Turn off camera</span>
              </div>
            </div>
          )}
          {this.props.showPinButton && (
            <div
              className={zegoManageCss.manageContent}
              onClick={() => {
                this.select(
                  UserListMenuItemType.RemoveUser,
                  !this.props.selectedUser.pin
                );
              }}
            >
              <div
                className={`${zegoManageCss.manageContentLeft} ${zegoManageCss.pinItem}`}
              >
                <i></i>
                <span>Pin</span>
              </div>
              <div
                className={`${
                  this.props.selectedUser.pin ? zegoManageCss.selected : ""
                } ${zegoManageCss.selectIcon}`}
              ></div>
            </div>
          )}
          {this.props.showRemoveButton && (
            <div
              className={zegoManageCss.manageContent}
              onClick={() => {
                this.select(UserListMenuItemType.RemoveUser);
              }}
            >
              <div
                className={`${zegoManageCss.manageContentLeft} ${zegoManageCss.removeItem}`}
              >
                <i></i>
                <span>Remove participant</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
