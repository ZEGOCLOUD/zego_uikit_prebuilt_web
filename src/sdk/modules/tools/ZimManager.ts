import ZIM, {
	ZIMCallCancelConfig,
	ZIMCallInvitationSentResult,
	ZIMCallInviteConfig,
	ZIMEventOfConnectionStateChangedResult,
	ZIMEventOfReceiveConversationMessageResult,
	ZIMPushConfig,
} from "zego-zim-web";
import {
	CallInvitationEndReason,
	CallInvitationInfo,
	ScenarioModel,
	ZegoCallInvitationConfig,
	ZegoCloudRoomConfig,
	ZegoInvitationType,
	ZegoSignalingInRoomCommandMessage,
	ZegoSignalingInRoomTextMessage,
	ZegoSignalingPluginNotificationConfig,
	ZegoUIKitLanguage,
	ZegoUser,
} from "../../model";
import { callInvitationControl } from "../../view/pages/ZegoCallInvitation/callInvitationControl";
import InRoomInviteManager from "./InRoomInviteManager";
import { createIntl, createIntlCache } from "react-intl";
import { i18nMap } from '../../locale';

export class ZimManager {
	_zim: ZIM | null;
	_inRoomInviteMg: InRoomInviteManager = {} as InRoomInviteManager;
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
		language: ZegoUIKitLanguage.ENGLISH,
	};
	notificationConfig: ZegoSignalingPluginNotificationConfig | undefined = undefined;
	hostID = "";
	incomingTimer: NodeJS.Timer | null = null;
	outgoingTimer: NodeJS.Timer | null = null;
	// 多语言
	languageManager: any
	constructor(
		ZIM: ZIM,
		expressConfig: {
			appID: number;
			userID: string;
			userName: string;
			roomID: string;
			token: string;
		},
	) {
		// @ts-ignore
		this._zim = ZIM.create({ appID: expressConfig.appID }) || ZIM.getInstance();
		this._zim?.setLogConfig({
			logLevel: "error",
		});
		this._inRoomInviteMg = new InRoomInviteManager(this._zim!, expressConfig);
		this.expressConfig = expressConfig;
		this.initListener();
		this.login();
	}
	private async login(retryTime = 1) {
		console.warn("retryTime", retryTime);
		if (retryTime > 4) {
			console.error("【ZEGOCLOUD】zim login failed, retryTime ", retryTime);
			return;
		}
		this._zim!.login(
			{
				userID: this.expressConfig.userID,
				userName: this.expressConfig.userName,
			},
			this.expressConfig.token
		)
			.then(() => {
				// 登录成功
				console.warn("zim login success!!");
				this.isLogin = true;
				// 用户不调用 setCallInvitationConfig 时也需要初始化language
				if (!this.languageManager) {
					this.changeIntl();
				}
			})
			.catch((err: any) => {
				// 登录失败
				this.isLogin = false;
				console.error("【ZEGOCLOUD】zim login failed !!", err);
				if (err.code === 6000014) {
					this.isServiceActivated = false;
					return;
				}
				if (err.code === 6000111) {
					return;
				}
				setTimeout(() => {
					this.login(++retryTime);
				}, 2000 * retryTime);
			});
	}
	private initListener() {
		// 被邀请者收到邀请后的回调通知（被邀请者）
		this._zim!.on("callInvitationReceived", (zim: any, { callID, inviter, timeout, extendedData }: any) => {
			console.warn("callInvitationReceived", {
				callID,
				inviter,
				timeout,
				extendedData,
			});
			const { type } = JSON.parse(extendedData);
			if (type > ZegoInvitationType.VideoCall) {
				this._inRoomInviteMg.onCallInvitationReceived(callID, inviter, timeout, extendedData);
			} else {
				if (this.callInfo.callID) {
					// 如果已被邀请，就拒绝其他的
					callID !== this.callInfo.callID && this.refuseInvitation("busy", callID);
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
									this.config.onIncomingCallTimeout(this.callInfo.roomID, this.callInfo.inviter);
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
								this.config?.onIncomingCallAcceptButtonPressed?.();
							},
							() => {
								this.clearIncomingTimer();
								this.acceptInvitation();
								this.notifyJoinRoomCallback();
								this.config?.onIncomingCallDeclineButtonPressed?.();
							},
							this.languageManager,
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
						this.config?.onIncomingCallAcceptButtonPressed?.();
					};
					const accept = (data?: string) => {
						this.clearIncomingTimer();
						this.acceptInvitation(data);
						this.notifyJoinRoomCallback();
						this.config?.onIncomingCallDeclineButtonPressed?.();
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
		});
		// 被邀请者收到邀请被取消后的回调通知（被邀请者）
		this._zim!.on("callInvitationCancelled", (zim: any, { callID, inviter, extendedData }: any) => {
			console.warn("callInvitationCancelled", {
				callID,
				inviter,
				extendedData,
			});
			this._inRoomInviteMg.onCallInvitationCanceled(callID, inviter, extendedData);
			if (!this.callInfo.callID) return;
			// 透传取消呼叫事件
			if (this.config.onIncomingCallCanceled) {
				this.config.onIncomingCallCanceled(this.callInfo.roomID, this.callInfo.inviter);
			}
			this.clearIncomingTimer();
			callInvitationControl.callInvitationDialogHide();
			this.endCall(CallInvitationEndReason.Canceled);
		});
		// 邀请者的邀请被接受后的回调通知（邀请者）
		this._zim!.on("callInvitationAccepted", (zim: any, { callID, invitee, extendedData }: any) => {
			console.warn("callInvitationAccepted", {
				callID,
				invitee,
				extendedData,
			});
			this._inRoomInviteMg.onCallInvitationAccepted(callID, invitee, extendedData);
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
				const callee = this.callInfo.invitees.find((i) => i.userID === invitee) || { userID: invitee };
				this.config.onOutgoingCallAccepted(this.callInfo.roomID, callee);
			}
		});
		// 邀请者的邀请被拒绝后的回调通知（邀请者）
		this._zim!.on("callInvitationRejected", (zim: any, { callID, invitee, extendedData }: any) => {
			console.warn("callInvitationRejected", {
				callID,
				invitee,
				extendedData,
			});
			this._inRoomInviteMg.onCallInvitationRefused(callID, invitee, extendedData);
			if (!this.callInfo.callID) return;
			let reason;
			if (extendedData.length) {
				const data = JSON.parse(extendedData);
				reason = data.reason;
			}
			// 透传拒绝事件
			const callee = this.callInfo.invitees.find((i) => i.userID === invitee) || { userID: invitee };
			if (reason === "busy") {
				this.config.onOutgoingCallRejected && this.config.onOutgoingCallRejected(this.callInfo.roomID, callee);
			} else {
				this.config.onOutgoingCallDeclined && this.config.onOutgoingCallDeclined(this.callInfo.roomID, callee);
			}
			if (!this.callInfo.isGroupCall) {
				// 单人邀请，隐藏waitingPage,清除callInfo
				this.clearOutgoingTimer();
				callInvitationControl.callInvitationWaitingPageHide();
				this.endCall(reason === "busy" ? CallInvitationEndReason.Busy : CallInvitationEndReason.Declined);
			} else {
				// 多人邀请，
				// 移除拒绝者
				this.callInfo.invitees = this.callInfo.invitees.filter((i) => i.userID !== invitee);
				if (this.callInfo.invitees.length === 0) {
					// 全部拒绝后需要退出房间
					this.clearOutgoingTimer();
					this.notifyLeaveRoomCallback(CallInvitationEndReason.Declined);
				}
			}
		});
		//被邀请者响应超时后,“邀请者”收到的回调通知, 超时时间单位：秒（邀请者）
		this._zim!.on("callInviteesAnsweredTimeout", (zim: any, { callID, invitees }: any) => {
			console.warn("callInviteesAnsweredTimeout", { callID, invitees });
			this._inRoomInviteMg.onCallInviteesAnsweredTimeout(callID, invitees);
			if (!this.callInfo.callID) return;
			this.clearOutgoingTimer();
			// 透传超时事件
			if (this.config.onOutgoingCallTimeout) {
				const callees = invitees.map((i: string) => {
					return (
						this.callInfo.invitees.find((u) => u.userID === i) || {
							userID: i,
						}
					);
				});
				this.config.onOutgoingCallTimeout(this.callInfo.roomID, callees);
			}
			this.answeredTimeoutCallback(invitees);
		});

		//被邀请者响应超时后,“被邀请者”收到的回调通知, 超时时间单位：秒 （被邀请者）
		this._zim!.on("callInvitationTimeout", (zim: any, { callID }: any) => {
			console.warn("callInvitationTimeout", { callID });
			this._inRoomInviteMg.onCallInvitationTimeout(callID);
			if (!this.callInfo.callID) return;
			// 透传超时事件
			if (this.config.onIncomingCallTimeout) {
				this.config.onIncomingCallTimeout(this.callInfo.roomID, this.callInfo.inviter);
			}
			this.clearIncomingTimer();
			callInvitationControl.callInvitationDialogHide();
			this.endCall(CallInvitationEndReason.Timeout);
		});
		this._zim?.on("connectionStateChanged", (zim: any, data: ZIMEventOfConnectionStateChangedResult) => {
			console.warn("【zim】connectionStateChanged", data);
		});
		this._zim?.on("receiveRoomMessage", (zim: ZIM, data: ZIMEventOfReceiveConversationMessageResult) => {
			console.warn("receiveRoomMessage", data);
			const textMsgs = data.messageList
				.filter((msg: { type: number }) => msg.type === 1)
				.map((msg) => ({
					messageID: msg.messageID,
					timestamp: msg.timestamp,
					orderKey: msg.orderKey,
					senderUserID: msg.senderUserID,
					text: msg.message as string,
				}));
			const commandMsgs = data.messageList
				.filter((msg: { type: number }) => msg.type === 2)
				.map((msg) => ({
					messageID: msg.messageID,
					timestamp: msg.timestamp,
					orderKey: msg.orderKey,
					senderUserID: msg.senderUserID,
					command: JSON.parse(
						decodeURIComponent(escape(String.fromCharCode(...Array.from(msg.message as Uint8Array))))
					),
				}));
			commandMsgs.length && this.onRoomCommandMessageCallback && this.onRoomCommandMessageCallback(commandMsgs);
			textMsgs.length && this.onRoomTextMessageCallback && this.onRoomTextMessageCallback(textMsgs);
		});
	}

	private answeredTimeoutCallback(invitees: string[]) {
		if (!this.callInfo.callID) return;
		if (this.callInfo.isGroupCall) {
			// 多人邀请
			this.callInfo.invitees = this.callInfo.invitees.filter((i) => !invitees.find((u) => u === i.userID));
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
		roomID?: string,
		notificationConfig?: ZegoSignalingPluginNotificationConfig
	): Promise<{ errorInvitees: ZegoUser[] }> {
		if (this.callInfo.callID) return Promise.reject("You already have a call invitation!");
		if (!this.isServiceActivated) return Promise.reject("The call invitation service has not been activated.");
		if (this.inSendOperation) return Promise.reject("send invitation repeat !!");
		this.inSendOperation = true;
		const inviteesID = invitees.map((i) => i.userID);
		const zegoRoomID = roomID || `call_${this.expressConfig.userID}_${new Date().getTime()}`;
		if (notificationConfig) {
			this.notificationConfig = notificationConfig;
		}
		const _data = {
			call_id: zegoRoomID,
			invitees: invitees.map((u) => ({
				user_id: u.userID,
				user_name: u.userName,
			})),
			inviter: {
				id: this.expressConfig.userID,
				name: this.expressConfig.userName,
			},
			type,
			custom_data: data,
		};
		const extendedData = {
			inviter_name: this.expressConfig.userName,
			type,
			data: JSON.stringify(_data),
		};
		const config = {
			timeout,
			extendedData: JSON.stringify(extendedData),
		} as ZIMCallInviteConfig;

		// 发送离线消息
		const { formatMessage } = this.languageManager;
		if (this.config.enableNotifyWhenAppRunningInBackgroundOrQuit) {
			const group = this.config.language === ZegoUIKitLanguage.ENGLISH ? "group " : "群组";
			const pushConfig = {
				title: notificationConfig?.title || this.expressConfig.userName,
				content:
					notificationConfig?.message ||
					(invitees.length > 1 ?
						(type === 0 ? formatMessage({ id: "call.incomingVoice" }, { group: group }) : formatMessage({ id: "call.incomingVideo" }, { group: group }))
						: (type === 0 ? formatMessage({ id: "call.incomingVoice" }, { group: "" }) : formatMessage({ id: "call.incomingVideo" }, { group: "" }))),
				// `Incoming ${invitees.length > 1 ? "group " : ""}${type === 0 ? "voice" : "video"} call...`,
				payload: JSON.stringify(Object.assign({}, _data, extendedData)),
				resourcesID: notificationConfig?.resourcesID ?? "zegouikit_call",
			};
			config.pushConfig = pushConfig;
		}
		try {
			this.callInfo.callID = new Date().getTime().toString(); //临时生成个id，防止同时呼叫情况
			const res: ZIMCallInvitationSentResult = await this._zim!.callInvite(inviteesID, config);

			const errorInvitees = res.errorInvitees.map((i: { userID: string }) => {
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
				(i) => !res.errorInvitees.find((e: { userID: string }) => e.userID === i.userID)
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
				roomID: zegoRoomID,
				type,
				isGroupCall: invitees.length > 1,
			};
			this.onUpdateRoomIDCallback();
			// 添加定时器，断网等情况导致收不到消息时，当超时处理
			this.outgoingTimer = setTimeout(() => {
				if (this.callInfo.callID) {
					// 透传超时事件
					this.config.onOutgoingCallTimeout &&
						this.config.onOutgoingCallTimeout(this.callInfo.roomID, this.callInfo.invitees);
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
							this.config?.onCallInvitationEnded?.(CallInvitationEndReason.Canceled, "");
						},
						this.languageManager,
						this.config?.ringtoneConfig?.outgoingCallUrl,
					);
				}

				const cancel = () => {
					this.cancelInvitation();
					this.config?.onCallInvitationEnded?.(CallInvitationEndReason.Canceled, "");
				};
				this.config?.onWaitingPageWhenSending?.(this.callInfo.type, invitees, () => {
					cancel();
				});
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
		const config: ZIMCallCancelConfig = {
			extendedData: JSON.stringify(extendedData),
		};
		const { formatMessage } = this.languageManager;
		if (this.config.enableNotifyWhenAppRunningInBackgroundOrQuit) {
			config.pushConfig = {
				title: this.notificationConfig?.title || this.expressConfig.userName,
				content: this.notificationConfig?.message || formatMessage({ id: "call.cancelled" }),
				resourcesID: this.notificationConfig?.resourcesID ?? "zegouikit_call",
				payload: JSON.stringify({
					call_id: this.callInfo.roomID,
					operation_type: "cancel_invitation",
				}),
			} as ZIMPushConfig;
			console.log("cancelInvitation", config);
		}
		try {
			await this._zim?.callCancel(invitees, this.callInfo.callID, config);
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
	private notifyJoinRoomCallback = () => { };
	/** 通知UI层调用joinRoom */
	notifyJoinRoom(func: (type: ZegoInvitationType, roomConfig: ZegoCloudRoomConfig, mode: ScenarioModel) => void) {
		func &&
			(this.notifyJoinRoomCallback = () => {
				// 接收客户传递进来的roomConfig
				const roomConfig = this.config?.onSetRoomConfigBeforeJoining?.(this.callInfo.type) || {};
				roomConfig.language = this.config.language;
				func(
					this.callInfo.type,
					roomConfig,
					this.callInfo.isGroupCall ? ScenarioModel.GroupCall : ScenarioModel.OneONoneCall
				);
			});
	}
	private notifyLeaveRoomCallback = (reason: CallInvitationEndReason) => { };
	/** 通知UI层调用leaveRoom */
	notifyLeaveRoom(func: () => void) {
		this.notifyLeaveRoomCallback = (reason: CallInvitationEndReason) => {
			func && func();
			this.endCall(reason);
		};
	}
	private onUpdateRoomIDCallback = () => { };
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
		if (!this.languageManager) {
			this.changeIntl();
		}
	}

	// 改变多语言对象
	async changeIntl() {
		if (this.config.language) {
			this.languageManager = createIntl(
				{
					locale: this.config.language,
					messages: i18nMap[this.config.language],
				},
				createIntlCache()
			);
		}
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
	private onRoomTextMessageCallback = (msgs: ZegoSignalingInRoomTextMessage[]) => { };
	private onRoomCommandMessageCallback = (msgs: ZegoSignalingInRoomCommandMessage[]) => { };
	onRoomTextMessage(func: (msgs: ZegoSignalingInRoomTextMessage[]) => void) {
		this.onRoomTextMessageCallback = func;
	}
	onRoomCommandMessage(func: (msgs: ZegoSignalingInRoomCommandMessage[]) => void) {
		this.onRoomCommandMessageCallback = func;
	}
	enterRoom() {
		if (this.isLogin) {
			this._zim
				?.enterRoom({
					roomID: this.callInfo.callID || this.expressConfig.roomID,
					roomName: this.callInfo.callID || this.expressConfig.roomID,
				})
				.then((res: any) => {
					console.warn("【zim enterRoom】success");
				})
				.catch((error: any) => {
					console.error("【zim enterRoom】failed", error);
				});
		}
	}
	leaveRoom() {
		this._zim
			// @ts-ignore
			?.leaveRoom(this.callInfo.callID || this.expressConfig.roomID)
			.then((res: any) => {
				console.warn("【zim leaveRoom】success");
			})
			.catch((error: any) => {
				console.error("【zim leaveRoom】failed", error);
			});
	}
	async sendMessage(command: object, priority = 1): Promise<ZegoSignalingInRoomCommandMessage> {
		const res = await this._zim?.sendMessage(
			{
				type: 2,
				message: new Uint8Array(
					Array.from(unescape(encodeURIComponent(JSON.stringify(command)))).map((val) => val.charCodeAt(0))
				),
			},
			this.expressConfig.roomID,
			1,
			{
				priority: priority,
			}
		);
		const { messageID, orderKey, timestamp, senderUserID, message } = res!.message;
		return {
			messageID,
			timestamp,
			orderKey,
			senderUserID,
			command: JSON.parse(decodeURIComponent(escape(String.fromCharCode(...Array.from(message as Uint8Array))))),
		};
	}
}
