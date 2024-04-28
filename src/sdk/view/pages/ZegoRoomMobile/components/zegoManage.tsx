import React from "react";
import { UserListMenuItemType } from "../../../../model";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import zegoManageCss from "./zegoManage.module.scss";
import { FormattedMessage } from "react-intl";
export class ZegoManage extends React.PureComponent<{
  showPinButton: boolean;
  showMicButton: boolean;
  showCameraButton: boolean;
  showRemoveButton: boolean;
  showRemoveCohostButton: boolean;
  showInviteToCohostButton: boolean;
  selectedUser: ZegoCloudUser;
  closeCallback: () => void;
  selectCallback: (type: UserListMenuItemType, value?: boolean) => void;
}> {
  async select(type: UserListMenuItemType, value?: boolean) {
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
                <span><FormattedMessage id="global.mute" /></span>
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
                <span><FormattedMessage id="global.turnOffCamera" /></span>
              </div>
            </div>
          )}
          {this.props.showPinButton && (
            <div
              className={zegoManageCss.manageContent}
              onClick={() => {
                this.select(
                  UserListMenuItemType.ChangePin,
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
                className={`${this.props.selectedUser.pin ? zegoManageCss.selected : ""
                  } ${zegoManageCss.selectIcon}`}
              ></div>
            </div>
          )}
          {this.props.showInviteToCohostButton && (
            <div
              className={zegoManageCss.manageContent}
              onClick={() => {
                this.select(UserListMenuItemType.InviteCohost);
              }}
            >
              <div
                className={`${zegoManageCss.manageContentLeft} ${zegoManageCss.inviteItem}`}
              >
                <i></i>
                <span>Invite to connect</span>
              </div>
            </div>
          )}
          {this.props.showRemoveCohostButton && (
            <div
              className={zegoManageCss.manageContent}
              onClick={() => {
                this.select(UserListMenuItemType.RemoveCohost);
              }}
            >
              <div
                className={`${zegoManageCss.manageContentLeft} ${zegoManageCss.inviteItem}`}
              >
                <i></i>
                <span>End the connect</span>
              </div>
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
