import React from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import ZegoInvitationListCss from "./zegoInvitationList.module.scss"
import { CallingInvitationListConfig, ZegoUser } from "../../../../model";
import { getNameFirstLetter, userNameColor } from "../../../../util";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";

type Invitation = ZegoUser & {
  checked: boolean
  canEdit: boolean
}

export class ZegoInvitationList extends React.PureComponent<{
  core: ZegoCloudRTCCore
  callingInvitationListConfig: CallingInvitationListConfig
  userList: ZegoCloudUserList
  handleInvitation: (invitees: ZegoUser[]) => void
}> {
  state: {
    waitingSelectUsers: Invitation[]
  } = {
      waitingSelectUsers: []
    };
  setWaitingSelectUsers() {
    const defaultChecked = this.props.callingInvitationListConfig.defaultChecked ?? true
    const list = (this.props.callingInvitationListConfig.waitingSelectUsers || []).map((waitingUser) => {
      return {
        ...waitingUser,
        checked: defaultChecked,
        canEdit: true,
      }
    })
    this.setState({
      waitingSelectUsers: list
    })
  }

  get invationList(): Invitation[] {
    const allUsers = [...this.props.userList, ...(this.props.core?._zimManager?.callInfo?.waitingUsers || [])]
    return this.state.waitingSelectUsers.map((user) => {
      const inSelectedUsers = allUsers.some((selectedUser) => selectedUser.userID === user.userID)
      return {
        ...user,
        canEdit: !inSelectedUsers,
      }
    })
  }

  handleSelectUser(invitation: Invitation, index: number) {
    if (!invitation.canEdit) return
    this.setState({
      waitingSelectUsers: this.state.waitingSelectUsers.map((user, i) => {
        if (i === index) {
          return {
            ...user,
            checked: !user.checked,
          }
        }
        return user
      })
    })
  }

  sendInvitation() {
    const invitees = this.invationList
      .filter((item) => item.canEdit && item.checked)
      .map((item) => {
        return {
          userID: item.userID,
          userName: item.userName
        }
      })
    this.props.handleInvitation(invitees)
  }

  componentDidMount(): void {
    this.setWaitingSelectUsers()
  }

  render(): React.ReactNode {
    return (
      <>
        <div className={ZegoInvitationListCss.invitationListWrapper}>
          {this.invationList.map((item, index) => {
            return (
              <div
                className={`${ZegoInvitationListCss.member} ${item.canEdit ? ZegoInvitationListCss.pointer : ZegoInvitationListCss.notAllowed}`}
                key={item.userID}
                onClick={() => this.handleSelectUser(item, index)}
              >
                <div
                  className={`${ZegoInvitationListCss.memberNameWrapper}`}>
                  {item.avatar && (
                    <img
                      src={item.avatar}
                      onError={(e: any) => {
                        e.target.style.display = "none"
                      }}
                      alt=""
                    />
                  )}
                  <span style={{ color: userNameColor(item.userName || "") }}>
                    {getNameFirstLetter(item.userName || "")}
                  </span>

                  <p>{item.userName}</p>
                </div>
                <div className={ZegoInvitationListCss.checkWrapper}>
                  {!item.canEdit && (
                    <img src={require("../../../../../assets/icon_checked.png")} alt="" />
                  )}
                  {item.canEdit && item.checked && (
                    <img src={require("../../../../../assets/icon_check_on@2x.png")} alt="" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className={`${ZegoInvitationListCss.callWrapper} ${ZegoInvitationListCss.pointer}`} onClick={() => this.sendInvitation()}>
          <img src={require('../../../../sdkAssets/icon_call.png')} alt="" />
        </div>
      </>
    )
  }
}
