import React from "react";
import { ScenarioModel, UserListMenuItemType } from "../../../../model";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import zegoManageCss from "./zegoManage.module.scss";
import { FormattedMessage } from "react-intl";
import { ZegoCloudRTCCore } from "../../../../modules";

export class ZegoManage extends React.PureComponent<{
  core: ZegoCloudRTCCore
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
  showForbiddenButton(): boolean {
    if (this.props.core._config.scenario?.mode !== ScenarioModel.LiveStreaming) return false;
    const currentUserID = this.props.core._expressConfig.userID;
    if (this.props.core.isHost(currentUserID)) {
      return currentUserID !== this.props.selectedUser.userID
    } else {
      return currentUserID === this.props.selectedUser.userID
    }
  }
  isBanSendingMessages() {
    if (this.props.core._zimManager?.banList) {
      const banList = this.props.core._zimManager?.banList
      return banList.some((u) => u === this.props.selectedUser.userID)
    }
  }
  render(): React.ReactNode {
    const { formatMessage } = this.props.core.intl;
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
                <span>{formatMessage({ id: "room.invite" })}</span>
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
                <span>{formatMessage({ id: "room.endConnection" })}</span>
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
                <span>{formatMessage({ id: "room.remove" })}</span>
              </div>
            </div>
          )}
          {this.showForbiddenButton() &&
            (!this.isBanSendingMessages() ? (
              <div
                className={zegoManageCss.manageContent}
                onClick={() => {
                  this.select(UserListMenuItemType.BanSendingMessages)
                }}
              >
                <div
                  className={zegoManageCss.manageContentLeft}
                >
                  <span>{formatMessage({ id: "room.banSending" })}</span>
                </div>
              </div>
            ) : (
              <div
                className={zegoManageCss.manageContent}
                onClick={() => {
                  this.select(UserListMenuItemType.CancelBanSendingMessages)
                }}
              >
                <div
                  className={zegoManageCss.manageContentLeft}
                >
                  <span>{formatMessage({ id: "room.cancelBanSending" })}</span>
                </div>
              </div>)
            )
          }
        </div>
      </div>
    );
  }
}
