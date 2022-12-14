import ZIM, { ZIMCallInvitationSentResult } from "zego-zim-web";
import { ZegoUser } from "../../model";
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
      }
    );
    // 被邀请者收到取消邀请后的回调通知
    this._zim!.on(
      "callInvitationCancelled",
      (zim, { callID, inviter, extendedData }) => {
        console.warn("callInvitationCancelled", {
          callID,
          inviter,
          extendedData,
        });
      }
    );
    // 邀请者接受邀请后的回调通知
    this._zim!.on(
      "callInvitationAccepted",
      (zim, { callID, invitee, extendedData }) => {
        console.warn("callInvitationAccepted", {
          callID,
          invitee,
          extendedData,
        });
      }
    );
    // 邀请者拒绝邀请后的回调通知
    this._zim!.on(
      "callInvitationRejected",
      (zim, { callID, invitee, extendedData }) => {
        console.warn("callInvitationRejected", {
          callID,
          invitee,
          extendedData,
        });
      }
    );
    //被邀请者响应超时后,“邀请者”收到的回调通知, 超时时间单位：秒
    this._zim!.on(
      "callInviteesAnsweredTimeout",
      (zim, { callID, invitees }) => {
        console.warn("callInviteesAnsweredTimeout", { callID, invitees });
      }
    );

    //被邀请者响应超时后,“被邀请者”收到的回调通知, 超时时间单位：秒
    this._zim!.on("callInvitationTimeout", (zim, { callID }) => {
      console.warn("callInvitationTimeout", { callID });
    });
  }
  async sendInvitation(
    invitees: ZegoUser[],
    type: number,
    timeout: number,
    data: string
  ) {
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
    const res: ZIMCallInvitationSentResult | undefined =
      await this._zim?.callInvite(inviteesID, {
        timeout,
        extendedData,
        // pushConfig,
      });
    console.warn("callInvite", res);
  }
  cancelInvitation(invitees: string[], data: string) {}
  refuseInvitation(inviterID: string, data: string) {}
  acceptInvitation(inviterID: string, data: string) {}
  destroy() {
    this._zim?.destroy();
    this._zim = null;
  }
}
