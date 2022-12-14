import ZIM, {
  ZIMCallInvitationSentResult,
  ZIMCallInviteConfig,
  ZIMEventOfConnectionStateChangedResult,
} from "zego-zim-web";
import {
  CallInvitationEndReason,
  CallInvitationInfo,
  ScenarioModel,
  ZegoCallInvitationConfig,
  ZegoCloudRoomConfig,
  ZegoInvitationType,
  ZegoSignalingPluginNotificationConfig,
  ZegoUser,
} from "../../model";
import { callInvitationControl } from "../../view/pages/ZegoCallInvitation/callInvitationControl";
export class ZimManager {
  _zim: ZIM | null;
  isLogin = false;
  isServiceActivated = true; //IM 服务是否开通
  expressConfig: {
    appID: number;
    userID: string;
    userName: string;
    roomID: string;
    token: string;
  };
  callInfo = {} as CallInvitationInfo;
  inSendOperation = false; //防止重复点击
  inRefuseOperation = false; //防止重复点击
  inAcceptOperation = false; //防止重复点击
  inCancelOperation = false; //防止重复点击
  config: ZegoCallInvitationConfig = {
    enableCustomCallInvitationWaitingPage: false,
    enableCustomCallInvitationDialog: false,
    enableNotifyWhenAppRunningInBackgroundOrQuit: false,
  };
  incomingTimer: NodeJS.Timer | null = null;
  outgoingTimer: NodeJS.Timer | null = null;
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
        if (err.code === 6000014) {
          this.isServiceActivated = false;
        }
        console.error("【ZEGOCLOUD】zim login failed !!", err);
      });
  }

  private initListener() {
    // 被邀请者收到邀请后的回调通知（被邀请者）
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
          callID !== this.callInfo.callID &&
            this.refuseInvitation("busy", callID);
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
            acceptedInvitees: [],
            roomID: call_id,
            type: type,
            isGroupCall: invitees.length > 1,
          };
          this.onUpdateRoomIDCallback();
          //   设置来电计时器，当断网等收不到消息时以超时为由结束call
          if (this.incomingTimer) {
            this.clearIncomingTimer();
          } else {
            this.incomingTimer = setTimeout(() => {
              if (this.callInfo.callID) {
                this.config.onIncomingCallTimeout &&
                  this.config.onIncomingCallTimeout(
                    this.callInfo.roomID,
                    this.callInfo.inviter
                  );
                callInvitationControl.callInvitationDialogHide();
                this.endCall(CallInvitationEndReason.Timeout);
              }
              this.clearIncomingTimer();
            }, (timeout + 1) * 1000);
          }

          if (!this.config.enableCustomCallInvitationDialog) {
            // 展示默认UI
            callInvitationControl.callInvitationDialogShow(
              { userID: inviter, userName: inviter_name },
              () => {
                this.clearIncomingTimer();
                this.refuseInvitation("decline");
                callInvitationControl.callInvitationDialogHide();
                this.endCall(CallInvitationEndReason.Declined);
              },
              () => {
                this.clearIncomingTimer();
                this.acceptInvitation();
                this.notifyJoinRoomCallback();
              },
              this.config?.ringtoneConfig?.incomingCallUrl
            );
          }
          // 透传接收到邀请回调
          if (this.config.onIncomingCallReceived) {
            this.config.onIncomingCallReceived(
              this.callInfo.roomID,
              this.callInfo.inviter,
              this.callInfo.type,
              this.callInfo.invitees
            );
          }

          // 对外再包一层，不暴露内部逻辑
          const refuse = (data?: string) => {
            this.clearIncomingTimer();
            this.refuseInvitation("decline", "", data);
            callInvitationControl.callInvitationDialogHide();
            this.endCall(CallInvitationEndReason.Declined);
          };
          const accept = (data?: string) => {
            this.clearIncomingTimer();
            this.acceptInvitation(data);
          };
          this.config?.onConfirmDialogWhenReceiving?.(
            type,
            { userID: inviter, userName: inviter_name },
            (data?: string) => {
              refuse(data);
            },
            (data?: string) => {
              accept(data);
            },
            custom_data
          );
        }
      }
    );
    // 被邀请者收到邀请被取消后的回调通知（被邀请者）
    this._zim!.on(
      "callInvitationCancelled",
      (zim, { callID, inviter, extendedData }) => {
        console.warn("callInvitationCancelled", {
          callID,
          inviter,
          extendedData,
        });
        if (!this.callInfo.callID) return;
        // 透传取消呼叫事件
        if (this.config.onIncomingCallCanceled) {
          this.config.onIncomingCallCanceled(
            this.callInfo.roomID,
            this.callInfo.inviter
          );
        }
        this.clearIncomingTimer();
        callInvitationControl.callInvitationDialogHide();
        this.endCall(CallInvitationEndReason.Canceled);
      }
    );
    // 邀请者的邀请被接受后的回调通知（邀请者）
    this._zim!.on(
      "callInvitationAccepted",
      (zim, { callID, invitee, extendedData }) => {
        console.warn("callInvitationAccepted", {
          callID,
          invitee,
          extendedData,
        });
        if (!this.callInfo.callID) return;

        this.clearOutgoingTimer();
        this.callInfo.acceptedInvitees.push({
          userID: invitee,
          userName: "",
        });

        if (!this.callInfo.isGroupCall) {
          callInvitationControl.callInvitationWaitingPageHide();
          this.notifyJoinRoomCallback();
        }
        // 透传接受邀请事件
        if (this.config.onOutgoingCallAccepted) {
          const callee = this.callInfo.invitees.find(
            (i) => i.userID === invitee
          ) || { userID: invitee };
          this.config.onOutgoingCallAccepted(this.callInfo.roomID, callee);
        }
      }
    );
    // 邀请者的邀请被拒绝后的回调通知（邀请者）
    this._zim!.on(
      "callInvitationRejected",
      (zim, { callID, invitee, extendedData }) => {
        console.warn("callInvitationRejected", {
          callID,
          invitee,
          extendedData,
        });
        if (!this.callInfo.callID) return;
        let reason;
        if (extendedData.length) {
          const data = JSON.parse(extendedData);
          reason = data.reason;
        }
        // 透传拒绝事件
        const callee = this.callInfo.invitees.find(
          (i) => i.userID === invitee
        ) || { userID: invitee };
        if (reason === "busy") {
          this.config.onOutgoingCallRejected &&
            this.config.onOutgoingCallRejected(this.callInfo.roomID, callee);
        } else {
          this.config.onOutgoingCallDeclined &&
            this.config.onOutgoingCallDeclined(this.callInfo.roomID, callee);
        }
        if (!this.callInfo.isGroupCall) {
          // 单人邀请，隐藏waitingPage,清除callInfo
          this.clearOutgoingTimer();
          callInvitationControl.callInvitationWaitingPageHide();
          this.endCall(
            reason === "busy"
              ? CallInvitationEndReason.Busy
              : CallInvitationEndReason.Declined
          );
        } else {
          // 多人邀请，
          // 移除拒绝者
          this.callInfo.invitees = this.callInfo.invitees.filter(
            (i) => i.userID !== invitee
          );
          if (this.callInfo.invitees.length === 0) {
            // 全部拒绝后需要退出房间
            this.clearOutgoingTimer();
            this.notifyLeaveRoomCallback(CallInvitationEndReason.Declined);
          }
        }
      }
    );
    //被邀请者响应超时后,“邀请者”收到的回调通知, 超时时间单位：秒（邀请者）
    this._zim!.on(
      "callInviteesAnsweredTimeout",
      (zim, { callID, invitees }) => {
        console.warn("callInviteesAnsweredTimeout", { callID, invitees });
        if (!this.callInfo.callID) return;
        this.clearOutgoingTimer();
        // 透传超时事件
        if (this.config.onOutgoingCallTimeout) {
          const callees = invitees.map((i) => {
            return (
              this.callInfo.invitees.find((u) => u.userID === i) || {
                userID: i,
              }
            );
          });
          this.config.onOutgoingCallTimeout(this.callInfo.roomID, callees);
        }
        this.answeredTimeoutCallback(invitees);
      }
    );

    //被邀请者响应超时后,“被邀请者”收到的回调通知, 超时时间单位：秒 （被邀请者）
    this._zim!.on("callInvitationTimeout", (zim, { callID }) => {
      console.warn("callInvitationTimeout", { callID });
      if (!this.callInfo.callID) return;
      // 透传超时事件
      if (this.config.onIncomingCallTimeout) {
        this.config.onIncomingCallTimeout(
          this.callInfo.roomID,
          this.callInfo.inviter
        );
      }
      this.clearIncomingTimer();
      callInvitationControl.callInvitationDialogHide();
      this.endCall(CallInvitationEndReason.Timeout);
    });
    this._zim?.on(
      "connectionStateChanged",
      (zim, data: ZIMEventOfConnectionStateChangedResult) => {
        console.warn("【zim】connectionStateChanged", data);
      }
    );
  }

  private answeredTimeoutCallback(invitees: string[]) {
    if (!this.callInfo.callID) return;
    if (this.callInfo.isGroupCall) {
      // 多人邀请
      this.callInfo.invitees = this.callInfo.invitees.filter(
        (i) => !invitees.find((u) => u === i.userID)
      );
      if (this.callInfo.invitees.length === 0) {
        // 全部超时就退出房间，结束邀请
        this.notifyLeaveRoomCallback(CallInvitationEndReason.Timeout);
      }
    } else {
      callInvitationControl.callInvitationWaitingPageHide();
      this.endCall(CallInvitationEndReason.Timeout);
    }
  }

  async sendInvitation(
    invitees: ZegoUser[],
    type: number,
    timeout: number,
    data: string,
    notificationConfig?: ZegoSignalingPluginNotificationConfig
  ): Promise<{ errorInvitees: ZegoUser[] }> {
    if (this.callInfo.callID)
      return Promise.reject("You already have a call invitation!");
    if (!this.isServiceActivated)
      return Promise.reject(
        "The call invitation service has not been activated."
      );
    if (this.inSendOperation)
      return Promise.reject("send invitation repeat !!");
    this.inSendOperation = true;
    const inviteesID = invitees.map((i) => i.userID);
    const roomID = `call_${this.expressConfig.userID}_${new Date().getTime()}`;

    const _data = JSON.stringify({
      call_id: roomID,
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
    const config: ZIMCallInviteConfig = {
      timeout,
      extendedData,
    };

    // 发送离线消息
    if (this.config.enableNotifyWhenAppRunningInBackgroundOrQuit) {
      const pushConfig = {
        title: notificationConfig?.title || this.expressConfig.userName,
        content:
          notificationConfig?.message ||
          `Incoming ${invitees.length > 1 ? "group " : ""}${
            type === 0 ? "voice" : "video"
          } call...`,
        payload: extendedData,
        resourcesID: notificationConfig?.resourcesID ?? "zegouikit_call",
      };
      config.pushConfig = pushConfig;
    }
    try {
      this.callInfo.callID = new Date().getTime().toString(); //临时生成个id，防止同时呼叫情况
      const res: ZIMCallInvitationSentResult = await this._zim!.callInvite(
        inviteesID,
        config
      );

      const errorInvitees = res.errorInvitees.map((i) => {
        return invitees.find((u) => u.userID === i.userID) as ZegoUser;
      });
      if (res.errorInvitees.length >= invitees.length) {
        // 全部邀请失败，中断流程
        this.inSendOperation = false;
        this.clearCallInfo();
        return Promise.resolve({ errorInvitees });
      }
      // 过滤掉不在线的用户
      const onlineInvitee = invitees.filter(
        (i) => !res.errorInvitees.find((e) => e.userID === i.userID)
      );
      // 保存邀请信息，进入busy状态
      this.callInfo = {
        callID: res.callID,
        invitees: onlineInvitee,
        inviter: {
          userID: this.expressConfig.userID,
          userName: this.expressConfig.userName,
        },
        acceptedInvitees: [],
        roomID,
        type,
        isGroupCall: invitees.length > 1,
      };
      this.onUpdateRoomIDCallback();
      // 添加定时器，断网等情况导致收不到消息时，当超时处理
      this.outgoingTimer = setTimeout(() => {
        if (this.callInfo.callID) {
          // 透传超时事件
          this.config.onOutgoingCallTimeout &&
            this.config.onOutgoingCallTimeout(
              this.callInfo.roomID,
              this.callInfo.invitees
            );
          // 当超时后，没有一个人接受邀请，则主动退出房间
          !this.callInfo.acceptedInvitees.length &&
            this.answeredTimeoutCallback(onlineInvitee.map((u) => u.userID));
        }
        this.clearOutgoingTimer();
      }, (timeout + 1) * 1000);
      if (invitees.length > 1) {
        // 多人邀请,直接进房
        this.notifyJoinRoomCallback();
      } else {
        // 单人邀请，进入等待页
        if (!this.config.enableCustomCallInvitationWaitingPage) {
          callInvitationControl.callInvitationWaitingPageShow(
            invitees[0],
            type,
            () => {
              this.cancelInvitation();
            },
            this.config?.ringtoneConfig?.outgoingCallUrl
          );
        }

        const cancel = () => {
          this.cancelInvitation();
        };
        this.config?.onWaitingPageWhenSending?.(
          this.callInfo.type,
          invitees,
          () => {
            cancel();
          }
        );
      }
      this.inSendOperation = false;
      return Promise.resolve({ errorInvitees });
    } catch (error) {
      this.clearCallInfo();
      this.inSendOperation = false;
      return Promise.reject(JSON.stringify(error));
    }
  }
  async cancelInvitation(data?: string) {
    if (this.inCancelOperation) return;
    if (!this.callInfo.callID) return;
    this.inCancelOperation = true;
    this.clearOutgoingTimer();
    const invitees = this.callInfo.invitees.map((i) => i.userID);
    const extendedData: any = {};
    if (data) {
      extendedData.custom_data = data;
    }
    try {
      await this._zim?.callCancel(invitees, this.callInfo.callID, {
        extendedData: JSON.stringify(extendedData),
      });
      callInvitationControl.callInvitationWaitingPageHide();
      this.clearCallInfo();
    } catch (error) {
      console.error("【ZEGOCLOUD】cancelInvitation", error);
    }
    this.inCancelOperation = false;
  }
  async refuseInvitation(reason?: string, callID?: string, data?: string) {
    if (this.inRefuseOperation) return;
    if (!this.callInfo.callID) return;
    this.inRefuseOperation = true;
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
    this.inRefuseOperation = false;
  }
  async acceptInvitation(data?: string) {
    if (this.inAcceptOperation) return;
    if (!this.callInfo.callID) return;
    this.inAcceptOperation = true;
    const extendedData: any = {};
    if (data) {
      extendedData.custom_data = data;
    }
    try {
      await this._zim?.callAccept(this.callInfo.callID, {
        extendedData: JSON.stringify(extendedData),
      });
      callInvitationControl.callInvitationDialogHide();
    } catch (error) {
      console.error("【ZEGOCLOUD】acceptInvitation", error);
    }
    this.inAcceptOperation = false;
  }
  private clearCallInfo() {
    this.callInfo = {} as CallInvitationInfo;
  }
  destroy() {
    this._zim?.destroy();
    this._zim = null;
  }
  private notifyJoinRoomCallback = () => {};
  /** 通知UI层调用joinRoom */
  notifyJoinRoom(
    func: (
      type: ZegoInvitationType,
      roomConfig: ZegoCloudRoomConfig,
      mode: ScenarioModel
    ) => void
  ) {
    func &&
      (this.notifyJoinRoomCallback = () => {
        // 接收客户传递进来的roomConfig
        const roomConfig =
          this.config?.onSetRoomConfigBeforeJoining?.(this.callInfo.type) || {};
        func(
          this.callInfo.type,
          roomConfig,
          this.callInfo.isGroupCall
            ? ScenarioModel.GroupCall
            : ScenarioModel.OneONoneCall
        );
      });
  }
  private notifyLeaveRoomCallback = (reason: CallInvitationEndReason) => {};
  /** 通知UI层调用leaveRoom */
  notifyLeaveRoom(func: () => void) {
    this.notifyLeaveRoomCallback = (reason: CallInvitationEndReason) => {
      func && func();
      this.endCall(reason);
    };
  }
  private onUpdateRoomIDCallback = () => {};
  /**收到邀请后需要更新roomID*/
  onUpdateRoomID(func: (roomID: string) => void) {
    func &&
      (this.onUpdateRoomIDCallback = () => {
        func(this.callInfo.roomID);
        this.expressConfig.roomID = this.callInfo.roomID;
      });
  }
  /**结束 call,清除 callInfo */
  endCall(reason: CallInvitationEndReason) {
    if (
      reason === CallInvitationEndReason.LeaveRoom &&
      !this.callInfo.acceptedInvitees.length &&
      this.callInfo.inviter.userID === this.expressConfig.userID
    ) {
      // 主叫人如果在所有人接收邀请前离开房间，则取消所有人的邀请
      this.cancelInvitation();
    }
    this.config?.onCallInvitationEnded?.(reason, "");
    this.clearCallInfo();
  }
  setCallInvitationConfig(config: ZegoCallInvitationConfig) {
    this.config = Object.assign(this.config, config);
  }
  private clearOutgoingTimer() {
    if (this.outgoingTimer) {
      clearTimeout(this.outgoingTimer);
      this.outgoingTimer = null;
    }
  }
  private clearIncomingTimer() {
    if (this.incomingTimer) {
      clearTimeout(this.incomingTimer);
      this.incomingTimer = null;
    }
  }
}
