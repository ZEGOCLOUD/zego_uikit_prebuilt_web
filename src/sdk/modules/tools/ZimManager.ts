import {
	ZIM,
	ZIMCallCancelConfig,
	ZIMCallingInvitationSentResult,
	ZIMCallingInviteConfig,
	ZIMCallInvitationSentResult,
	ZIMCallInviteConfig,
	ZIMEventOfCallInvitationCancelledResult,
	ZIMEventOfCallInvitationReceivedResult,
	ZIMEventOfCallInvitationTimeoutResult,
	ZIMEventOfCallUserStateChangedResult,
	ZIMEventOfConnectionStateChangedResult,
	ZIMEventOfReceiveConversationMessageResult,
	ZIMPushConfig,
} from "zego-zim-web";
import {
	CallInvitationEndReason,
	CallInvitationInfo,
	ScenarioModel,
	UserTypeEnum,
	ZegoCallInvitationConfig,
	ZegoCloudRoomConfig,
	ZegoInvitationType,
	ZegoSignalingInRoomCommandMessage,
	ZegoSignalingInRoomTextMessage,
	ZegoSignalingPluginNotificationConfig,
	ZegoUIKitLanguage,
	ZegoUser,
	ZIMCallInvitationMode,
	ZIMCallUserState,
} from "../../model";
import { callInvitationControl } from "../../view/pages/ZegoCallInvitation/callInvitationControl";
import InRoomInviteManager from "./InRoomInviteManager";
import { createIntl, createIntlCache } from "react-intl";
import { i18nMap } from '../../locale';
import { typeIsBoolean } from "../../util";
import { ZegoUIKitPrebuilt } from "../..";

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
		canInvitingInCalling: false,
		onlyInitiatorCanInvite: false,
		endCallWhenInitiatorLeave: false,
	};
	notificationConfig: ZegoSignalingPluginNotificationConfig | undefined = undefined;
	hostID = "";
	incomingTimer: NodeJS.Timer | null = null;
	outgoingTimer: NodeJS.Timer | null = null;
	// 多语言
	languageManager: any
	// 是否加入到房间内
	hasJoinedRoom: boolean = false;
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
			this.expressConfig.userID,
			{
				userName: this.expressConfig.userName,
				token: this.expressConfig.token,
				isOfflineLogin: false,
			}
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
		this._zim!.on("callInvitationReceived", (zim: ZIM, { callID, inviter, timeout, extendedData }: ZIMEventOfCallInvitationReceivedResult) => {
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
					const { inviter_name, type, data, canInvitingInCalling, onlyInitiatorCanInvite, endCallWhenInitiatorLeave } = JSON.parse(extendedData);
					const { call_id, invitees, custom_data, inviter: _inviter } = JSON.parse(data);
					typeIsBoolean(canInvitingInCalling) && (this.config.canInvitingInCalling = canInvitingInCalling);
					typeIsBoolean(onlyInitiatorCanInvite) && (this.config.onlyInitiatorCanInvite = onlyInitiatorCanInvite);
					typeIsBoolean(endCallWhenInitiatorLeave) && (this.config.endCallWhenInitiatorLeave = endCallWhenInitiatorLeave);
					this.callInfo = {
						callID,
						invitees: invitees.map((i: { user_id: any; user_name: any }) => ({
							userID: i.user_id,
							userName: i.user_name,
						})),
						inviter: {
							userID: _inviter?.id || inviter,
							userName: inviter_name,
						},
						acceptedInvitees: [],
						roomID: call_id,
						type: type,
						isGroupCall: this.config.canInvitingInCalling || invitees.length > 1,
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
		this._zim!.on("callInvitationCancelled", (zim: ZIM, { callID, inviter, extendedData }: ZIMEventOfCallInvitationCancelledResult) => {
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
		// 被邀请者响应超时后,“被邀请者”收到的回调通知, 超时时间单位：秒 （被邀请者）
		this._zim!.on("callInvitationTimeout", (zim: ZIM, { callID }: ZIMEventOfCallInvitationTimeoutResult) => {
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
		// 呼叫邀请相关用户的状态变化 （邀请者）
		this._zim!.on('callUserStateChanged', (zim: ZIM, { callUserList, callID }: ZIMEventOfCallUserStateChangedResult) => {
			console.log("【ZEGOCLOUD】callUserStateChanged", callUserList, callID);
			callUserList.forEach(({ state, userID, extendedData }) => {
				if (userID === this.expressConfig.userID) return
				if (state === ZIMCallUserState.Rejected) {
					this.callInvitationRejected({ callID, invitee: userID, extendedData })
				}
				if (state === ZIMCallUserState.Accepted) {
					this.callInvitationAccepted({ callID, invitee: userID, extendedData })
				}
				if (state === ZIMCallUserState.Timeout) {
					this.callInviteesAnsweredTimeout({ callID, invitees: [userID] })
				}
				if (state === ZIMCallUserState.Ended) {
					if (callInvitationControl.isDialogShow) {
						callInvitationControl.callInvitationDialogHide();
						this.clearIncomingTimer();
						this.endCall(CallInvitationEndReason.Canceled);
						this.config?.onCallInvitationEnded?.(CallInvitationEndReason.Canceled, "");
					}
				}
				// @ts-ignore
				if (state === ZIMCallUserState.BeCancelled) {
					this.removeWaitingUser(userID);
				}
			})
		})
		this._zim?.on("connectionStateChanged", (zim: ZIM, data: ZIMEventOfConnectionStateChangedResult) => {
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

	//被邀请者响应超时后,“邀请者”收到的回调通知, 超时时间单位：秒（邀请者）
	private callInviteesAnsweredTimeout({ callID, invitees }: any) {
		console.warn("callInviteesAnsweredTimeout", { callID, invitees });
		this._inRoomInviteMg.onCallInviteesAnsweredTimeout(callID, invitees);
		if (!this.callInfo.callID) return;
		this.clearOutgoingTimer();
		(invitees || []).forEach((id: string) => {
			this.removeWaitingUser(id);
		});
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
	}

	// 邀请者的邀请被拒绝后的回调通知（邀请者）
	private callInvitationRejected({ callID, invitee, extendedData }: any) {
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
		if (callInvitationControl.isWaitingPageShow) {
			// 单人邀请，隐藏waitingPage,清除callInfo
			this.clearOutgoingTimer();
			callInvitationControl.callInvitationWaitingPageHide();
			this.endCall(reason === "busy" ? CallInvitationEndReason.Busy : CallInvitationEndReason.Declined);
		} else {
			// 多人邀请，
			// 移除拒绝者
			this.callInfo.invitees = this.callInfo.invitees.filter((i) => i.userID !== invitee);
			this.removeWaitingUser(invitee);
			if (this.callInfo.invitees.length === 0) {
				// 全部拒绝后需要退出房间
				this.clearOutgoingTimer();
				this.notifyLeaveRoomCallback(CallInvitationEndReason.Declined);
			}
		}
	}

	// 邀请者的邀请被接受后的回调通知（邀请者）
	private callInvitationAccepted({ callID, invitee, extendedData }: any) {
		console.warn("callInvitationAccepted", {
			callID,
			invitee,
			extendedData,
		});
		this._inRoomInviteMg.onCallInvitationAccepted(callID, invitee, extendedData);
		if (!this.callInfo.callID) return;
		this.removeWaitingUser(invitee);
		this.clearOutgoingTimer();
		this.callInfo.acceptedInvitees.push({
			userID: invitee,
			userName: "",
		});
		if (callInvitationControl.isWaitingPageShow) {
			callInvitationControl.callInvitationWaitingPageHide();
		}
		if (!this.hasJoinedRoom) {
			this.notifyJoinRoomCallback();
		}
		// 透传接受邀请事件
		if (this.config.onOutgoingCallAccepted) {
			const callee = this.callInfo.invitees.find((i) => i.userID === invitee) || { userID: invitee };
			this.config.onOutgoingCallAccepted(this.callInfo.roomID, callee);
		}
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

	private removeWaitingUser(userID: string) {
		if (!this.callInfo.waitingUsers) return
		const userIndex = this.callInfo.waitingUsers.findIndex((i) => i.userID === userID)
		if (userIndex === -1) return
		this.callInfo.waitingUsers.splice(userIndex, 1)
	}

	updateJoinRoomState(isJoin: boolean) {
		console.log("【ZEGOCLOUD】updateJoinRoomState", isJoin);
		this.hasJoinedRoom = isJoin
	}

	async sendInvitation(params: {
		invitees: ZegoUser[],
		type: number,
		timeout: number,
		data: string,
		roomID?: string,
		notificationConfig?: ZegoSignalingPluginNotificationConfig,
	}): Promise<{ errorInvitees: ZegoUser[] }> {
		const { invitees, type, timeout, data, roomID, notificationConfig } = params;
		const { canInvitingInCalling, onlyInitiatorCanInvite, endCallWhenInitiatorLeave } = this.config
		if (this.callInfo.callID && !this.hasJoinedRoom) return Promise.reject("You already have a call invitation!");
		if (!this.isServiceActivated) return Promise.reject("The call invitation service has not been activated.");
		if (this.inSendOperation) return Promise.reject("send invitation repeat !!");
		this.inSendOperation = true;
		const inviteesID = invitees.map((i) => i.userID);
		const zegoRoomID = roomID || `call_${this.expressConfig.userID}_${new Date().getTime()}`;
		if (notificationConfig) {
			this.notificationConfig = notificationConfig;
		}
		const inviterID = this.callInfo.inviter?.userID || this.expressConfig.userID
		const inviterName = this.callInfo.inviter?.userName || this.expressConfig.userName
		const _data = {
			call_id: zegoRoomID,
			invitees: invitees.map((u) => ({
				user_id: u.userID,
				user_name: u.userName,
			})),
			inviter: {
				id: inviterID,
				name: inviterName,
			},
			type,
			custom_data: data,
		};
		const extendedData = {
			inviter_name: inviterName,
			type,
			data: JSON.stringify(_data),
			canInvitingInCalling,
			onlyInitiatorCanInvite,
			endCallWhenInitiatorLeave,
		};
		const mode = canInvitingInCalling
			? ZIMCallInvitationMode.Advanced
			: ZIMCallInvitationMode.General
		const config = {
			timeout,
			extendedData: JSON.stringify(extendedData),
			mode,
		} as ZIMCallInviteConfig;

		// 发送离线消息
		const { formatMessage } = this.languageManager;
		const isGroupCall = canInvitingInCalling || invitees.length > 1
		if (this.config.enableNotifyWhenAppRunningInBackgroundOrQuit) {
			const group = this.config.language === ZegoUIKitLanguage.ENGLISH ? "group " : "群组";
			const pushConfig = {
				title: notificationConfig?.title || this.expressConfig.userName,
				content:
					notificationConfig?.message ||
					(isGroupCall ?
						(type === 0 ? formatMessage({ id: "call.incomingVoice" }, { group: group }) : formatMessage({ id: "call.incomingVideo" }, { group: group }))
						: (type === 0 ? formatMessage({ id: "call.incomingVoice" }, { group: "" }) : formatMessage({ id: "call.incomingVideo" }, { group: "" }))),
				// `Incoming ${isGroupCall ? "group " : ""}${type === 0 ? "voice" : "video"} call...`,
				payload: JSON.stringify(Object.assign({}, _data, extendedData)),
				resourcesID: notificationConfig?.resourcesID ?? "zegouikit_call",
			};
			config.pushConfig = pushConfig;
		}
		if (this.hasJoinedRoom) {
			if (!canInvitingInCalling) {
				return Promise.reject('You already have a call invitation!')
			}
			if (onlyInitiatorCanInvite && this.expressConfig.userID !== this.callInfo.inviter?.userID) {
				return Promise.reject('Only initiator can invite')
			}
			return this.addInvitation(invitees, { pushConfig: config.pushConfig })
		}
		try {
			this.callInfo.callID = new Date().getTime().toString(); //临时生成个id，防止同时呼叫情况
			const res: ZIMCallInvitationSentResult = await this._zim!.callInvite(inviteesID, config);

			const errorInvitees = res.errorUserList.map((i: { userID: string }) => {
				return invitees.find((u) => u.userID === i.userID) as ZegoUser;
			});
			if (res.errorUserList.length >= invitees.length) {
				// 全部邀请失败，中断流程
				this.inSendOperation = false;
				this.clearCallInfo();
				return Promise.resolve({ errorInvitees });
			}
			// 过滤掉不在线的用户
			const onlineInvitee = invitees.filter(
				(i) => !res.errorUserList.find((e: { userID: string }) => e.userID === i.userID)
			);
			const waitingUsers = onlineInvitee.map((user) => ({
				...user,
				type: UserTypeEnum.GENERAL_WAITING,
			}))
			// 保存邀请信息，进入busy状态
			this.callInfo = {
				callID: res.callID,
				invitees: [...onlineInvitee],
				inviter: {
					userID: this.expressConfig.userID,
					userName: this.expressConfig.userName,
				},
				acceptedInvitees: [],
				roomID: zegoRoomID,
				type,
				isGroupCall,
				waitingUsers,
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

	async addInvitation(invitees: ZegoUser[], config: ZIMCallingInviteConfig) {
		const { callID } = this.callInfo
		try {
			const inviteesID = invitees.map((i) => i.userID);
			const res: ZIMCallingInvitationSentResult = await this._zim!.callingInvite(inviteesID, callID, config);
			const errorInvitees = res.errorUserList.map((i: { userID: string }) => {
				return invitees.find((u) => u.userID === i.userID) as ZegoUser;
			});
			console.log("【ZEGOCLOUD】addInvitationRes", res);
			if (res.errorUserList.length >= invitees.length) {
				// 全部邀请失败，中断流程
				return Promise.resolve({ errorInvitees });
			}
			// 过滤掉不在线的用户
			const onlineInvitee = invitees.filter(
				(i) => !res.errorUserList.find((e: { userID: string }) => e.userID === i.userID)
			);
			const waitingUsers = onlineInvitee.map((user) => ({
				...user,
				type: UserTypeEnum.CALLING_WAITTING,
			}))
			this.callInfo.waitingUsers = [...(this.callInfo.waitingUsers || []), ...waitingUsers]
			this.callInfo.invitees = [...(this.callInfo.invitees || []), ...onlineInvitee];
			return Promise.resolve({ errorInvitees });
		} catch (error) {
			console.error('【ZEGOCLOUD】 addInvitation', error)
			return Promise.reject(JSON.stringify(error));
		} finally {
			this.inSendOperation = false;
		}
	}

	// 仅进阶模式可以单独取消某个用户
	async cancelInvitation(data?: string, invitees = this.callInfo.invitees, clearCallInfo = true) {
		if (this.inCancelOperation) return;
		if (!this.callInfo.callID) {
			console.warn("【ZEGOCLOUD】cancelInvitation has not callID");
			return
		};
		this.inCancelOperation = true;
		this.clearOutgoingTimer();
		const _invitees = invitees.map((i) => i.userID);
		const _data = {
			call_id: this.callInfo.roomID,
			operation_type: "cancel_invitation",
		}
		const extendedData: Record<string, string> = { ..._data };
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
				payload: JSON.stringify(_data),
			} as ZIMPushConfig;
			console.log("cancelInvitation", config);
		}
		try {
			const callCancelRes = await this._zim?.callCancel(_invitees, this.callInfo.callID, config);
			console.log("【ZEGOCLOUD】callCancelRes", callCancelRes);
			// 过滤掉取消失败的用户
			const onlineInvitee = invitees.filter(
				(i) => !(callCancelRes?.errorInvitees || []).find((id) => id === i.userID)
			);
			onlineInvitee.forEach(({ userID }) => {
				this.removeWaitingUser(userID);
			});
			callInvitationControl.callInvitationWaitingPageHide();
			clearCallInfo && this.clearCallInfo();
			ZegoUIKitPrebuilt.core?.eventEmitter.emit("cancelCall");
		} catch (error) {
			console.error("【ZEGOCLOUD】cancelInvitation", error);
		} finally {
			this.inCancelOperation = false;
		}
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
	async callEnd() {
		const { callID } = this.callInfo
		if (!callID) return
		try {
			await this._zim?.callEnd(callID, { extendedData: '' })
		} catch (err) {
			console.error("【ZEGOCLOUD】callEnd", err)
		}
	}

	async callQuit() {
		const { callID } = this.callInfo
		if (!callID) return
		try {
			await this._zim?.callQuit(callID, { extendedData: '' })
		} catch (err) {
			console.error("【ZEGOCLOUD】callQuit", err)
		}
	}
	/**结束 call,清除 callInfo */
	async endCall(reason: CallInvitationEndReason, isCallQuit = true) {
		const { canInvitingInCalling, endCallWhenInitiatorLeave } = this.config
		const isInviter = this.callInfo.inviter.userID === this.expressConfig.userID
		if (
			reason === CallInvitationEndReason.LeaveRoom &&
			!this.callInfo.acceptedInvitees.length &&
			isInviter
		) {
			// 主叫人如果在所有人接收邀请前离开房间，则取消所有人的邀请
			try {
				await this.cancelInvitation();
			} catch (error) {
				console.error("【ZEGOCLOUD】cancelInvitation error", error)
			};
		}
		if (canInvitingInCalling && reason === CallInvitationEndReason.LeaveRoom) {
			if (endCallWhenInitiatorLeave && isInviter) {
				if (this.callInfo.waitingUsers?.length) {
					// 主呼叫人离开 取消所有未接受的邀请
					this.cancelInvitation(void 0, this.callInfo.waitingUsers)
				}
				this.callEnd()
			} else {
				isCallQuit && this.callQuit()
			}
		}
		this.config?.onCallInvitationEnded?.(reason, "");
		this.clearCallInfo();
	}
	setCallInvitationConfig(config: ZegoCallInvitationConfig) {
		this.config = Object.assign(this.config, config);
		console.log("【ZEGOCLOUD】 setCallInvitationConfig", this.config);
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
