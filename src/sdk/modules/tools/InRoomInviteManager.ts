import {
  ZIM,
  ZIMCallInvitationSentResult,
  ZIMCallInviteConfig,
} from "zego-zim-web";
import {
  InRoomInvitationInfo,
  InRoomInvitationReceivedInfo,
  ReasonForRefusedInviteToCoHost,
  ZegoInvitationType,
  ZegoUser,
} from "../../model";
import { TracerConnect } from "./ZegoTracer";
import { SpanEvent } from "../../model/tracer";

export default class InRoomInviteManager {
  _zim: ZIM;
  expressConfig: {
    userID: string;
    userName: string;
  };
  roomExtraInfo = {
    live_status: "0",
    host: "",
  };
  inviteToCoHostInfoMap: Map<string, InRoomInvitationInfo> = new Map(); // 主播发送的邀请通知信息 key为userID
  receivedInviteInfo: InRoomInvitationReceivedInfo =
    {} as InRoomInvitationReceivedInfo; // 观众收到的邀请通知信息
  requestCohostInfo: InRoomInvitationInfo = {} as InRoomInvitationInfo; // 观众发送的申请连麦信息
  receivedRequestInfo: Map<string, InRoomInvitationReceivedInfo> = new Map(); // 主播收到的连麦申请 key为userID
  constructor(zim: ZIM, expressConfig: { userName: string; userID: string }) {
    this._zim = zim;
    const { userID, userName } = expressConfig;
    this.expressConfig = { userID, userName };
  }
  updateRoomExtraInfo(data: any) {
    this.roomExtraInfo = data;
  }
  // 邀请为cohost
  async inviteJoinToCohost(
    inviteeID: string,
    inviteeName: string
  ): Promise<{ code: number; msg?: string }> {
    if (this.inviteToCoHostInfoMap.has(inviteeID)) {
      return {
        code: 2,
        msg: "Invitation has been sent.",
      };
    }
    const extendedData = JSON.stringify({
      inviter_name: this.expressConfig.userName,
      type: ZegoInvitationType.InviteToCoHost,
      data: "",
    });
    const config = {
      timeout: 60,
      extendedData,
    } as ZIMCallInviteConfig;
    this.inviteToCoHostInfoMap.set(inviteeID, {
      callID: inviteeID + new Date().getTime(),
      inviter: this.expressConfig,
      invitee: {
        userID: inviteeID,
        userName: inviteeName,
      },
      type: ZegoInvitationType.InviteToCoHost,
    });
    try {
      let res: ZIMCallInvitationSentResult = await this._zim!.callInvite(
        [inviteeID],
        config
      );
      if (!res.errorUserList.length) {
        this.inviteToCoHostInfoMap.set(inviteeID, {
          callID: res.callID,
          inviter: this.expressConfig,
          invitee: {
            userID: inviteeID,
            userName: inviteeName,
          },
          type: ZegoInvitationType.InviteToCoHost,
        });
      }
      const span = TracerConnect.createSpan(SpanEvent.LiveStreamingHostInvite, {
        call_id: res.callID,
        audience_id: inviteeID,
        error_userlist: JSON.stringify(res.errorUserList),
        error_count: res.errorUserList.length,
        extended_data: JSON.stringify(extendedData),
      })
      span.end();
      return {
        code: res.errorUserList.length, // 0：正常， 1：用户不在线，2：重复邀请，3：发送失败
        msg: "",
      };
    } catch (error) {
      this.inviteToCoHostInfoMap.delete(inviteeID);
      console.error("【ZEGOCLOUD】inviteJoinToCohost failed:", error);
      const span = TracerConnect.createSpan(SpanEvent.LiveStreamingHostInvite, {
        audience_id: inviteeID,
        extended_data: JSON.stringify(extendedData),
        error: (error as any).code || -1,
        msg: (error as any).message || ""
      })
      span.end();
      return {
        code: 3,
        msg: JSON.stringify(error),
      };
    }
  }
  // code 0：正常， 1：用户不在线，2：重复邀请，3：发送失败
  async requestCohost(): Promise<{ code: number; msg?: string }> {
    if (!this.roomExtraInfo.host) {
      return {
        code: 1,
        msg: "The host has left the room",
      };
    }
    const extendedData = JSON.stringify({
      inviter_name: this.expressConfig.userName,
      type: ZegoInvitationType.RequestCoHost,
      data: "",
    });
    const config = {
      timeout: 60,
      extendedData,
    } as ZIMCallInviteConfig;
    try {
      this.requestCohostInfo = {
        callID: "" + Date.now(),
        inviter: this.expressConfig,
        invitee: {
          userID: this.roomExtraInfo.host,
        },
        type: ZegoInvitationType.RequestCoHost,
      };
      const res: ZIMCallInvitationSentResult = await this._zim!.callInvite(
        [this.roomExtraInfo.host],
        config
      );
      if (!res.errorUserList.length) {
        this.requestCohostInfo.callID = res.callID;
      } else {
        this.requestCohostInfo = {} as InRoomInvitationInfo;
      }
      return {
        code: res.errorUserList.length,
        msg: res.errorUserList.length > 0 ? "The host has left the room" : "",
      };
    } catch (error: any) {
      console.error("【ZEGOCLOUD】requestCohost failed:", error);
      this.requestCohostInfo = {} as InRoomInvitationInfo;
      return {
        code: 3,
        msg: error?.message || JSON.stringify(error),
      };
    }
  }
  async removeCohost(inviteeID: string) {
    console.warn('[inRoomInviteManager]removeCohost', inviteeID, this.receivedRequestInfo);
    const span = TracerConnect.createSpan(SpanEvent.LiveStreamingHostStop, {
      // call_id: 
    })
    const extendedData = JSON.stringify({
      inviter_name: this.expressConfig.userName,
      type: ZegoInvitationType.RemoveCoHost,
      data: "",
    });
    const config = {
      timeout: 60,
      extendedData,
    } as ZIMCallInviteConfig;
    const res: ZIMCallInvitationSentResult = await this._zim!.callInvite(
      [inviteeID],
      config
    );
    return res.errorUserList.length === 0;
  }
  async audienceAcceptInvitation(callID?: string) {
    try {
      await this._zim?.callAccept(callID || this.receivedInviteInfo.callID, {
        extendedData: "",
      });
    } catch (error) {
      console.error("【ZEGOCLOUD】inRoom acceptInvitation failed", error);
    }
    this.receivedInviteInfo = {} as InRoomInvitationReceivedInfo;
  }
  async audienceRefuseInvitation(
    callID?: string,
    data?: string,
    clear: boolean = true
  ) {
    try {
      let extendedData = "";
      if (data) {
        extendedData = JSON.stringify({
          data,
        });
      }
      await this._zim?.callReject(callID || this.receivedInviteInfo.callID, {
        extendedData,
      });
    } catch (error) {
      console.error("【ZEGOCLOUD】inRoom refuseInvitation", error);
    }
    clear && (this.receivedInviteInfo = {} as InRoomInvitationReceivedInfo);
  }
  async audienceCancelRequest() {
    if (!this.requestCohostInfo.callID) return;
    try {
      await this._zim?.callCancel(
        [this.requestCohostInfo.invitee.userID],
        this.requestCohostInfo.callID,
        {
          extendedData: "",
        }
      );
      this.notifyRequestCohostTimeoutCallback();
      this.requestCohostInfo = {} as InRoomInvitationInfo;
    } catch (error) {
      console.error("【ZEGOCLOUD】inRoom cancelInvitation", error);
    }
  }
  async hostAcceptRequest(
    userID: string
  ): Promise<{ code: number; msg?: string }> {
    if (!this.receivedRequestInfo.has(userID))
      return { code: 0, msg: "success" };
    const span = TracerConnect.createSpan(SpanEvent.LiveStreamingHostRespond, {
      call_id: this.receivedRequestInfo.get(userID)!.callID,
      action: "accept"
    })
    span.end();
    try {
      await this._zim?.callAccept(
        this.receivedRequestInfo.get(userID)!.callID,
        {
          extendedData: "",
        }
      );
      this.receivedRequestInfo.delete(userID);
      return { code: 0, msg: "success" };
    } catch (error: any) {
      console.error("【ZEGOCLOUD】inRoom acceptInvitation failed", error);
      if (error?.code === 6000276) {
        // callID 不存在或已超时
        this.receivedRequestInfo.delete(userID);
      }
      return {
        code: error?.code || 1,
        msg: error?.message || JSON.stringify(error),
      };
    }
  }
  async hostRefuseRequest(
    userID: string
  ): Promise<{ code: number; msg?: string }> {
    if (!this.receivedRequestInfo.has(userID))
      return { code: 0, msg: "success" };
    const span = TracerConnect.createSpan(SpanEvent.LiveStreamingHostRespond, {
      call_id: this.receivedRequestInfo.get(userID)!.callID,
      action: "refuse"
    })
    span.end();
    try {
      await this._zim?.callReject(
        this.receivedRequestInfo.get(userID)!.callID,
        {
          extendedData: "",
        }
      );
      this.receivedRequestInfo.delete(userID);
      return { code: 0, msg: "success" };
    } catch (error: any) {
      console.error("【ZEGOCLOUD】inRoom hostRefuseRequest", error);
      if (error?.code === 6000276) {
        // callID 不存在或已超时
        this.receivedRequestInfo.delete(userID);
      }
      return {
        code: error?.code || 1,
        msg: error?.message || JSON.stringify(error),
      };
    }
  }
  async hostCancelInvitation(userID: string) {
    if (!this.inviteToCoHostInfoMap.has(userID)) return;
    try {
      await this._zim?.callCancel(
        [this.inviteToCoHostInfoMap.get(userID)!.invitee.userID],
        this.inviteToCoHostInfoMap.get(userID)!.callID,
        {
          extendedData: "",
        }
      );
      this.inviteToCoHostInfoMap.delete(userID);
    } catch (error) {
      console.error("【ZEGOCLOUD】inRoom hostCancelInvitation", error);
    }
  }
  hostCancelAllInvitation() {
    for (const userID of this.inviteToCoHostInfoMap.keys()) {
      this.hostCancelInvitation(userID);
      this.inviteToCoHostInfoMap.delete(userID); // 防止取消请求发送失败
    }
  }
  onCallInvitationReceived(
    callID: string,
    inviter: string,
    timeout: number,
    extendedData: string
  ) {
    const { type, inviter_name } = JSON.parse(extendedData);
    if (type === ZegoInvitationType.InviteToCoHost) {
      if (this.receivedInviteInfo.callID) {
        // 如果已经给被邀请了，就拒绝后面的要请
        this.audienceRefuseInvitation(callID, "busy", false);
      } else {
        this.receivedInviteInfo = {
          callID,
          inviter: {
            userID: inviter,
            userName: inviter_name,
          },
          type,
        };
        this.notifyInviteToCoHostCallback(inviter_name);
      }

      return;
    }
    if (type === ZegoInvitationType.RemoveCoHost) {
      this.notifyRemoveCoHostCallback();
      return;
    }
    if (type === ZegoInvitationType.RequestCoHost) {
      this.receivedRequestInfo.set(inviter, {
        callID,
        inviter: {
          userID: inviter,
          userName: inviter_name,
        },
        type: ZegoInvitationType.RequestCoHost,
      });
      this.notifyRequestCoHostCallback(
        {
          userID: inviter,
          userName: inviter_name,
        },
        1
      );
      return;
    }
  }
  onCallInvitationAccepted(
    callID: string,
    invitee: string,
    extendedData: string
  ) {
    // 观众接受主播的连麦邀请 （主播收到）
    this.inviteToCoHostInfoMap.delete(invitee);
    // 主播接受观众的连麦申请 （观众收到）
    if (this.requestCohostInfo.callID === callID) {
      this.notifyHostRespondRequestCohostCallback(0);
      this.requestCohostInfo = {} as InRoomInvitationInfo;
    }
  }
  onCallInvitationRefused(
    callID: string,
    invitee: string,
    extendedData: string
  ) {
    // 观众拒绝主播的连麦邀请 （主播收到）
    if (this.inviteToCoHostInfoMap.has(invitee)) {
      let data;
      try {
        data = JSON.parse(extendedData);
      } catch (error) { }

      this.notifyInviteToCoHostRefusedCallback(
        data?.data === "busy"
          ? ReasonForRefusedInviteToCoHost.Busy
          : ReasonForRefusedInviteToCoHost.Disagree,
        {
          inviteeName:
            this.inviteToCoHostInfoMap.get(invitee)?.invitee.userName || "",
          inviteeID: this.inviteToCoHostInfoMap.get(invitee)?.invitee.userID,
        }
      );

      this.inviteToCoHostInfoMap.delete(invitee);
    }
    // 主播拒绝观众的连麦申请 （观众收到）
    if (this.requestCohostInfo.callID === callID) {
      this.notifyHostRespondRequestCohostCallback(1);

      this.requestCohostInfo = {} as InRoomInvitationInfo;
    }
  }
  onCallInvitationCanceled(
    callID: string,
    invitee: string,
    extendedData: string
  ) {
    // 主播收到观众取消连麦申请的回调
    if (this.receivedRequestInfo.has(invitee)) {
      this.notifyRequestCoHostCallback(
        this.receivedRequestInfo.get(invitee)!.inviter,
        0
      );
      this.receivedRequestInfo.delete(invitee);
    }
    // 观众收到主播取消连麦的回调
    if (this.receivedInviteInfo.callID === callID) {
      this.notifyHostRespondRequestCohostCallback(2);
      this.receivedInviteInfo = {} as InRoomInvitationReceivedInfo;
    }
  }
  // 被邀请者响应超时后,“邀请者”收到的回调通知, 超时时间单位：秒（邀请者）
  onCallInviteesAnsweredTimeout(callID: string, invitees: string[]) {
    //主播的邀请超时
    invitees.forEach((id) => {
      if (this.inviteToCoHostInfoMap.get(id)?.callID === callID) {
        this.notifyInviteToCoHostRefusedCallback(
          ReasonForRefusedInviteToCoHost.Timeout,
          {
            inviteeName: "",
            inviteeID: this.inviteToCoHostInfoMap.get(id)?.invitee.userID,
          }
        );

        this.inviteToCoHostInfoMap.delete(id);
      }
    });
    // 观众的申请超时
    if (this.requestCohostInfo.callID === callID) {
      this.requestCohostInfo = {} as InRoomInvitationInfo;
      this.notifyRequestCohostTimeoutCallback();
    }
  }
  //被邀请者响应超时后,“被邀请者”收到的回调通知, 超时时间单位：秒 （被邀请者）
  onCallInvitationTimeout(callID: string) {
    //主播的邀请超时
    if (this.receivedInviteInfo.callID === callID) {
      this.receivedInviteInfo = {} as InRoomInvitationReceivedInfo;
    }
    // 观众的申请超时
    let userID = "";
    this.receivedRequestInfo.forEach((value, key) => {
      if (value.callID === callID) {
        userID = value.inviter.userID;
      }
    });
    if (userID) {
      this.notifyRequestCoHostCallback(
        this.receivedRequestInfo.get(userID)!.inviter,
        0
      );
      this.receivedRequestInfo.delete(userID);
    }
  }
  // 通知观众UI层，收到主播的连麦邀请
  private notifyInviteToCoHostCallback = (inviterName: string) => { };
  notifyInviteToCoHost(fn: (inviterName: string) => void) {
    this.notifyInviteToCoHostCallback = fn;
  }
  // 通知主播UI层，收到观众拒绝连麦邀请 reason: 0: 主动拒绝 1: 占线拒绝 2: 超时拒绝
  private notifyInviteToCoHostRefusedCallback = (
    reason: ReasonForRefusedInviteToCoHost,
    user: {
      inviteeName: string;
      inviteeID?: string;
    }
  ) => { };
  notifyInviteToCoHostRefused(
    fn: (
      reason: ReasonForRefusedInviteToCoHost,
      user: {
        inviteeName: string;
        inviteeID?: string;
      }
    ) => void
  ) {
    this.notifyInviteToCoHostRefusedCallback = fn;
  }
  // 通知观众UI层， 收到主播让下麦的通知
  private notifyRemoveCoHostCallback = () => { };
  notifyRemoveCoHost(fn: () => void) {
    this.notifyRemoveCoHostCallback = fn;
  }
  // 通知主播UI层，收到观众发来的连麦消息，state: 0 取消| 超时， 1 发起申请
  private notifyRequestCoHostCallback = (inviter: ZegoUser, state: 0 | 1) => { };
  notifyRequestCoHost(fn: (inviter: ZegoUser, state: 0 | 1) => void) {
    this.notifyRequestCoHostCallback = fn;
  }
  // 通知观众UI层，收到主播同意/拒绝/取消连麦申请的消息,0:同意 1: 拒绝 2: 取消 3:占线中
  private notifyHostRespondRequestCohostCallback = (
    respond: 0 | 1 | 2 | 3
  ) => { };
  notifyHostRespondRequestCohost(fn: (respond: 0 | 1 | 2 | 3) => void) {
    this.notifyHostRespondRequestCohostCallback = fn;
  }
  // 通知观众UI层， 观众的连麦申请超时了
  private notifyRequestCohostTimeoutCallback = () => { };
  notifyRequestCohostTimeout(fn: () => void) {
    this.notifyRequestCohostTimeoutCallback = fn;
  }
  clearInviteWhenUserLeave(userList: ZegoUser[]) {
    userList.forEach((u) => {
      this.inviteToCoHostInfoMap.delete(u.userID);
    });
  }
}
