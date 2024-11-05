import React from "react";
import zegoInvitationListCss from "./zegoInvitationList.module.scss";
import { ZegoCloudRTCCore } from "../../../../modules"
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager"
import ShowManageContext, { ShowManageType } from "../../context/showManage"
import { FormattedMessage } from "react-intl";
import { CallingInvitationListConfig, ZegoUser } from "../../../../model";
import { getNameFirstLetter, userNameColor } from "../../../../util";

type Invitation = ZegoUser & {
  checked: boolean
  canEdit: boolean
}

export class ZegoInvitationList extends React.Component<{
  userList: ZegoCloudUserList
  core: ZegoCloudRTCCore
  callingInvitationListConfig: CallingInvitationListConfig
  closeCallBack: () => void
  handleInvitation: (invitees: ZegoUser[]) => void
}> {
  state: {
    waitingSelectUsers: Invitation[]
  } = {
      waitingSelectUsers: []
    };

  static contextType?: React.Context<ShowManageType> = ShowManageContext
  context!: React.ContextType<typeof ShowManageContext>
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
    const invitees = this.state.waitingSelectUsers
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
      <div className={zegoInvitationListCss.invitationListWrapper}>
        <div className={zegoInvitationListCss.invitationListHeader}>
          <div
            className={zegoInvitationListCss.invitationHide}
            onClick={(ev) => {
              ev.stopPropagation()
              this.props.closeCallBack()
            }}></div>
          <FormattedMessage id="global.invitees" />
        </div>
        <div className={zegoInvitationListCss.invitationListContent}>
          {this.invationList.map((item, index) => {
            return (
              <div
                key={item.userID}
                className={zegoInvitationListCss.member}
                onClick={(ev) => {
                  ev.stopPropagation()
                  this.handleSelectUser(item, index)
                }}>
                <div className={zegoInvitationListCss.memberName}>
                  <i style={{ color: userNameColor(item.userName!) }}>
                    {getNameFirstLetter(item.userName || "")}
                    {item.avatar && (
                      <img
                        src={item.avatar}
                        onError={(e: any) => {
                          e.target.style.display = "none"
                        }}
                        alt=""
                      />
                    )}
                  </i>
                  <span
                    key={item.userID}>
                    {item.userName}
                  </span>
                </div>
                <div className={`${zegoInvitationListCss.checkWrapper} ${!item.canEdit && zegoInvitationListCss.checked}`}>
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
        <div className={zegoInvitationListCss.callWrapper} onClick={() => this.sendInvitation()}>
          <img src={require('../../../../sdkAssets/icon_call.png')} alt="" />
        </div>
      </div>
    )
  }
}
