import ZIM, { ZIMCallInvitationSentResult } from "zego-zim-web";
import { CallInvitationInfo, ZegoInvitationType, ZegoUser } from "../../model";
import { callInvitationControl } from "../../view/pages/ZegoCallInvitation/callInvitationControl";
export class ZimManager {
  _zim: ZIM | null;
  isLogin = false;
  expressConfig: {
    appID: number;
    userID: string;
    userName: string;
    roomID: string;
    token: string;
  };
  callInfo = {} as CallInvitationInfo;
  inOperation = false; //防止重复点击
  constructor(
    ZIM: ZIM,
    expressConfig: {
      appID: number;
      userID: string;
      userName: string;
      roomID: string;
      token: string;
    }
  ) {
    // @ts-ignore
    this._zim = ZIM.create({ appID: expressConfig.appID }) || ZIM.getInstance();
    this.expressConfig = expressConfig;
    this.initListener();
    this._zim!.login(
      { userID: expressConfig.userID, userName: expressConfig.userName },
      expressConfig.token
    )
      .then(() => {
        // 登录成功
        console.warn("zim login success!!");
        this.isLogin = true;
      })
      .catch((err: any) => {
        // 登录失败
        this.isLogin = false;
        console.error("【ZEGOCLOUD】zim login failed !!", err);
      });
  }

  initListener() {
    // 被邀请者收到邀请后的回调通知
    this._zim!.on(
      "callInvitationReceived",
      (zim, { callID, inviter, timeout, extendedData }) => {
        console.warn("callInvitationReceived", {
          callID,
          inviter,
          timeout,
          extendedData,
        });
        if (this.callInfo.callID) {
          // 如果已被邀请，就拒绝其他的
          this.refuseInvitation("Busy", callID);
        } else {
          const { inviter_name, type, data } = JSON.parse(extendedData);
          const { call_id, invitees, custom_data } = JSON.parse(data);
          this.callInfo = {
            callID,
            invitees: invitees.map((i: { user_id: any; user_name: any }) => ({
              userID: i.user_id,
              userName: i.user_name,
            })),
            inviter: {
              userID: inviter,
              userName: inviter_name,
            },
            roomID: call_id,
            type: type,
          };
          callInvitationControl.callInvitationDialogShow(
            { userID: inviter, userName: inviter_name },
            () => {
              this.refuseInvitation();
              callInvitationControl.callInvitationDialogHide();
            },
            () => {
              this.acceptInvitation();
              callInvitationControl.callInvitationDialogHide();
              // TODO: joinRoom
            }
          );
        }
      }
    );
    // 被邀请者收到邀请被取消后的回调通知
    this._zim!.on(
      "callInvitationCancelled",
      (zim, { callID, inviter, extendedData }) => {
        console.warn("callInvitationCancelled", {
          callID,
          inviter,
          extendedData,
        });
        callInvitationControl.callInvitationDialogHide();
        this.clearCallInfo();
      }
    );
    // 邀请者的邀请被接受后的回调通知
    this._zim!.on(
      "callInvitationAccepted",
      (zim, { callID, invitee, extendedData }) => {
        console.warn("callInvitationAccepted", {
          callID,
          invitee,
          extendedData,
        });
        // TODO：joinRoom
        callInvitationControl.callInvitationWaitingPageHide();
      }
    );
    // 邀请者的邀请被拒绝后的回调通知
    this._zim!.on(
      "callInvitationRejected",
      (zim, { callID, invitee, extendedData }) => {
        console.warn("callInvitationRejected", {
          callID,
          invitee,
          extendedData,
        });
        if (this.callInfo.callID && this.callInfo.invitees.length <= 1) {
          // 单人邀请，隐藏waitingPage,清除callInfo
          callInvitationControl.callInvitationWaitingPageHide();
          this.clearCallInfo();
        } else {
          // 多人邀请，全部拒绝后需要退出房间
        }
      }
    );
    //被邀请者响应超时后,“邀请者”收到的回调通知, 超时时间单位：秒
    this._zim!.on(
      "callInviteesAnsweredTimeout",
      (zim, { callID, invitees }) => {
        console.warn("callInviteesAnsweredTimeout", { callID, invitees });
        if (this.callInfo.invitees.length > 1) {
          // TODO
        } else {
          callInvitationControl.callInvitationDialogHide();
          this.clearCallInfo();
        }
      }
    );

    //被邀请者响应超时后,“被邀请者”收到的回调通知, 超时时间单位：秒
    this._zim!.on("callInvitationTimeout", (zim, { callID }) => {
      console.warn("callInvitationTimeout", { callID });
      callInvitationControl.callInvitationDialogHide();
      this.clearCallInfo();
    });
  }
  async sendInvitation(
    invitees: ZegoUser[],
    type: number,
    timeout: number,
    data: string
  ): Promise<{ code: number; msg: string }> {
    if (this.inOperation) return { code: 1, msg: "send invitation repeat!!" };
    this.inOperation = true;
    const inviteesID = invitees.map((i) => i.userID);
    const _data = JSON.stringify({
      call_id: this.expressConfig.roomID,
      invitees: invitees.map((u) => ({
        user_id: u.userID,
        user_name: u.userName,
      })),
      custom_data: data,
    });
    const extendedData = JSON.stringify({
      inviter_name: this.expressConfig.userName,
      type,
      data: _data,
    });

    // const pushConfig = {
    //   title: "离线通知",
    //   content: "这是一个离线通知",
    //   payload: data,
    //   resourcesID: "",
    // };
    try {
      const res: ZIMCallInvitationSentResult = await this._zim!.callInvite(
        inviteesID,
        {
          timeout,
          extendedData,
          // pushConfig,
        }
      );
      console.warn("callInvite", res);
      if (invitees.length > 1) {
        // 多人邀请
      } else {
        // 单人邀请
        if (res.errorInvitees.length >= invitees.length) {
          return { code: 1, msg: "The user dose not exist or is offline." };
        }
        // 保存邀请信息
        this.callInfo = {
          callID: res.callID,
          invitees: invitees,
          inviter: {
            userID: this.expressConfig.userID,
            userName: this.expressConfig.userName,
          },
          roomID: this.expressConfig.roomID,
          type,
        };
        callInvitationControl.callInvitationWaitingPageShow(
          invitees[0],
          type,
          () => {
            this.cancelInvitation();
            callInvitationControl.callInvitationWaitingPageHide();
          }
        );
      }
    } catch (error) {
      this.inOperation = false;
      return { code: 0, msg: JSON.stringify(error) };
    }
    this.inOperation = false;
    return { code: 0, msg: "" };
  }
  async cancelInvitation(data?: string) {
    if (this.inOperation) return;
    this.inOperation = true;
    const invitees = this.callInfo.invitees.map((i) => i.userID);
    const extendedData: any = {};
    if (data) {
      extendedData.custom_data = data;
    }
    try {
      await this._zim?.callCancel(invitees, this.callInfo.callID, {
        extendedData: JSON.stringify(extendedData),
      });
      this.clearCallInfo();
    } catch (error) {
      console.error("【ZEGOCLOUD】cancelInvitation", error);
    }
    this.inOperation = false;
  }
  async refuseInvitation(reason?: string, callID?: string, data?: string) {
    if (this.inOperation) return;
    this.inOperation = true;
    const extendedData: any = {};
    if (data) {
      extendedData.custom_data = data;
    }
    if (reason) {
      extendedData.reason = reason;
    }
    try {
      await this._zim?.callReject(callID || this.callInfo.callID, {
        extendedData: JSON.stringify(extendedData),
      });
    } catch (error) {
      console.error("【ZEGOCLOUD】refuseInvitation", error);
    }
    this.inOperation = false;
  }
  async acceptInvitation(data?: string) {
    if (this.inOperation) return;
    this.inOperation = true;
    const extendedData: any = {};
    if (data) {
      extendedData.custom_data = data;
    }
    try {
      await this._zim?.callAccept(this.callInfo.callID, {
        extendedData: JSON.stringify(extendedData),
      });
    } catch (error) {
      console.error("【ZEGOCLOUD】acceptInvitation", error);
    }
  }
  clearCallInfo() {
    this.callInfo = {} as CallInvitationInfo;
  }
  destroy() {
    this._zim?.destroy();
    this._zim = null;
  }
  onJoinRoom(func: (type: ZegoInvitationType) => void) {
    func && func(this.callInfo.type);
  }
}
