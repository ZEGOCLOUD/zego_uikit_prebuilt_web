import ReactDOM, { Root } from "react-dom/client";
import type { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoSuperBoardManager } from "zego-superboard-web";
import ZIM from "zego-zim-web";
import {
	CallingInvitationListConfig,
	ConsoleLevel,
	LiveRole,
	LiveStreamingMode,
	RightPanelExpandedType,
	ScenarioModel,
	ScreenSharingResolution,
	VideoMixinOutputResolution,
	VideoResolution,
	ZegoCallInvitationConfig,
	ZegoCloudRoomConfig,
	ZegoInvitationType,
	ZegoSignalingInRoomCommandMessage,
	ZegoSignalingPluginNotificationConfig,
	ZegoUIKitLanguage,
	ZegoUser,
	ZegoUIKitCreateConfig,
} from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
import { generatePrebuiltToken, isPc, SDK_VERSION } from "./util";
import { ZegoCloudRTCKitComponent } from "./view/index";
import { TracerConnect } from "./modules/tools/ZegoTracer";
import { SpanEvent } from "./model/tracer";
import { ZegoLogger } from './modules/tools/ZegoLogger';

const zgLogger = ZegoLogger.getLogger('ZegoUIKitPrebuilt');
export class ZegoUIKitPrebuilt {
	static core: ZegoCloudRTCCore | undefined;
	static _instance: ZegoUIKitPrebuilt;
	static Host = LiveRole.Host;
	static Cohost = LiveRole.Cohost;
	static Audience = LiveRole.Audience;

	static OneONoneCall = ScenarioModel.OneONoneCall;
	static GroupCall = ScenarioModel.GroupCall;
	static LiveStreaming = ScenarioModel.LiveStreaming;
	static VideoConference = ScenarioModel.VideoConference;
	static VideoResolution_180P = VideoResolution._180P;
	static VideoResolution_360P = VideoResolution._360P;
	static VideoResolution_480P = VideoResolution._480P;
	static VideoResolution_720P = VideoResolution._720P;
	static ScreenSharingResolution_360P = ScreenSharingResolution._360P;
	static ScreenSharingResolution_480P = ScreenSharingResolution._480P;
	static ScreenSharingResolution_720P = ScreenSharingResolution._720P;
	static ScreenSharingResolution_1080P = ScreenSharingResolution._1080P;
	static ScreenSharingResolution_2K = ScreenSharingResolution._2K;
	static ScreenSharingResolution_4K = ScreenSharingResolution._4K;
	static ScreenSharingResolution_Auto = ScreenSharingResolution.Auto;
	static ScreenSharingResolution_Custom = ScreenSharingResolution.Custom;
	static LiveStreamingMode = LiveStreamingMode;
	static InvitationTypeVoiceCall = ZegoInvitationType.VoiceCall;
	static InvitationTypeVideoCall = ZegoInvitationType.VideoCall;
	static ConsoleDebug = ConsoleLevel.Debug;
	static ConsoleInfo = ConsoleLevel.Info;
	static ConsoleWarning = ConsoleLevel.Warning;
	static ConsoleError = ConsoleLevel.Error;
	static ConsoleNone = ConsoleLevel.None;
	static VideoMixinOutputResolution = VideoMixinOutputResolution;
	static RightPanelExpandedType = RightPanelExpandedType;
	private hasJoinedRoom = false;
	root: Root | undefined;
	public express: ZegoExpressEngine | undefined;
	constructor() {
		this.express = ZegoCloudRTCCore._zg;
		zgLogger.log(SpanEvent.KitCheckWebRTC, 'express version:', this.express.getVersion());
		zgLogger.log(SpanEvent.KitCheckWebRTC, 'ZegoUIKitPrebuilt version:', SDK_VERSION);
	}
	get localStream() {
		return ZegoUIKitPrebuilt.core?.localStream;
	}
	static generateKitTokenForTest(
		appID: number,
		serverSecret: string,
		roomID: string,
		userID: string,
		userName?: string,
		ExpirationSeconds?: number
	) {
		return generatePrebuiltToken(appID, serverSecret, roomID, userID, userName, ExpirationSeconds);
	}

	static generateKitTokenForProduction(
		appID: number,
		token: string,
		roomID: string,
		userID: string,
		userName?: string
	) {
		return (
			token +
			"#" +
			window.btoa(
				JSON.stringify({
					userID,
					roomID,
					userName: encodeURIComponent(userName || ""),
					appID,
				})
			)
		);
	}

	static create(kitToken: string, createConfig?: ZegoUIKitCreateConfig, cloudProxyConfig?: { proxyList: { hostName: string, port?: number }[] }): ZegoUIKitPrebuilt {
		const startTime = Date.now();
		if (!ZegoUIKitPrebuilt.core && kitToken) {
			ZegoUIKitPrebuilt.core = ZegoCloudRTCCore.getInstance(kitToken, createConfig);
			ZegoUIKitPrebuilt._instance = new ZegoUIKitPrebuilt();
			zgLogger.info(SpanEvent.Create, {
				error: 0,
				msg: '',
				start_time: startTime,
				elapsed_time_sdk: Date.now() - startTime,
			})
		}
		return ZegoUIKitPrebuilt._instance;
	}
	static getVersion(): string {
		return SDK_VERSION;
	}

	addPlugins(plugins?: { ZegoSuperBoardManager?: typeof ZegoSuperBoardManager; ZIM?: typeof ZIM }) {
		// @ts-ignore
		ZegoUIKitPrebuilt.core?.addPlugins(plugins);
		if (ZegoUIKitPrebuilt.core?._zimManager) {
			ZegoUIKitPrebuilt.core?._zimManager.notifyJoinRoom(
				(type: ZegoInvitationType, config: ZegoCloudRoomConfig, mode: ScenarioModel) => {
					zgLogger.warn(SpanEvent.KitCheckWebRTC, "notifyJoinRoom", type, config);
					if (config.autoLeaveRoomWhenOnlySelfInRoom === undefined) {
						config.autoLeaveRoomWhenOnlySelfInRoom = mode === ScenarioModel.OneONoneCall;
					}
					config.turnOnMicrophoneWhenJoining = config.turnOnMicrophoneWhenJoining ?? true;
					if (type === ZegoInvitationType.VoiceCall) {
						config.turnOnCameraWhenJoining = config.turnOnCameraWhenJoining ?? false;
					}
					if (type === ZegoInvitationType.VideoCall) {
						config.turnOnCameraWhenJoining = config.turnOnCameraWhenJoining ?? true;
					}
					//   ZegoCloudRoomConfig部分参数不允许自定义
					let roomConfig = Object.assign(config, {
						showPreJoinView: false,
						showLeavingView: false,
						sharedLinks: [],
						scenario: {
							mode: mode,
						},
					}) as ZegoCloudRoomConfig;
					ZegoUIKitPrebuilt!.core!.status = {
						loginRsp: false,
						videoRefuse: undefined,
						audioRefuse: undefined,
					};
					this.joinRoom(roomConfig);
				}
			);
		}
	}

	joinRoom(roomConfig?: ZegoCloudRoomConfig) {
		if (!ZegoUIKitPrebuilt.core) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, "please call init first !!");
			return;
		}
		if (this.hasJoinedRoom) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, "joinRoom repeat !!");
			return;
		}
		let div: any;
		if (!roomConfig || !roomConfig.container) {
			zgLogger.warn(SpanEvent.KitCheckWebRTC, "joinRoom/roomConfig/container required !!");
			div = document.createElement("div");
			div.style.position = "fixed";
			div.style.width = "100%";
			div.style.height = isPc() ? "100vh" : "100%";
			div.style.minWidth = "345px";
			div.style.top = "0px";
			div.style.left = "0px";
			div.style.zIndex = "100";
			div.style.backgroundColor = "#FFFFFF";
			div.style.overflow = "auto";
			div.id = "zego-container";
			document.body.appendChild(div);
			roomConfig = {
				...roomConfig,
				...{
					container: div,
				},
			};
		}

		const result = ZegoUIKitPrebuilt.core.setConfig(roomConfig);
		zgLogger.info(SpanEvent.RoomConfig, {
			room_config: ZegoUIKitPrebuilt.core.originConfig,
		})
		if (result) {
			this.root = ReactDOM.createRoot(roomConfig.container as HTMLDivElement);
			this.root.render(
				<ZegoCloudRTCKitComponent
					core={ZegoUIKitPrebuilt.core}
					unmount={() => {
						// 单纯的销毁渲染的节点，不会销毁实例
						this.root?.unmount();
						this.root = undefined;
						this.hasJoinedRoom = false;
						ZegoUIKitPrebuilt.core?._zimManager?.updateJoinRoomState?.(false)
						div && div.remove();
						zgLogger.info(SpanEvent.Unmount, {});
					}}></ZegoCloudRTCKitComponent>
			);
			this.hasJoinedRoom = true;
			ZegoUIKitPrebuilt.core?._zimManager?.updateJoinRoomState?.(true)
		} else {
			zgLogger.error(SpanEvent.KitCheckWebRTC, "joinRoom parameter error !!");
		}
	}

	destroy() {
		zgLogger.info(SpanEvent.Destory, {})
		ZegoUIKitPrebuilt.core?.leaveRoom?.();
		ZegoUIKitPrebuilt.core?._zimManager?.updateJoinRoomState?.(false)
		ZegoUIKitPrebuilt.core = undefined;
		// @ts-ignore
		ZegoCloudRTCCore._instance = undefined;
		TracerConnect.unInit();
		this.root?.unmount?.();
		this.root = undefined;
		this.hasJoinedRoom = false;
	}
	setCallInvitationConfig(config?: ZegoCallInvitationConfig): void {
		if (!ZegoUIKitPrebuilt.core?._zimManager) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, "Please add ZIM plugin first");
			return;
		}
		if (!config) return;
		ZegoUIKitPrebuilt.core?._zimManager.setCallInvitationConfig(config);
	}
	// 发起邀请
	async sendCallInvitation(params: {
		callees: ZegoUser[];
		callType: ZegoInvitationType;
		timeout?: number;
		roomID?: string;
		data?: string;
		notificationConfig?: ZegoSignalingPluginNotificationConfig;
	}): Promise<{ errorInvitees: ZegoUser[] }> {
		if (!ZegoUIKitPrebuilt.core?._zimManager) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, "Please add ZIM plugin first");
			return Promise.reject("ZEGOCLOUD】Please add ZIM plugin first");
		}
		const { callees, callType, timeout = 60, roomID, data = "", notificationConfig } = params;
		if (!Array.isArray(callees) || callees.length < 1) {
			return Promise.reject("sendCallInvitation params error: callees !!");
		} else if (callees.length > 9) {
			return Promise.reject("Maximum number of users exceeded");
		}
		if (callType !== ZegoInvitationType.VideoCall && callType !== ZegoInvitationType.VoiceCall) {
			return Promise.reject("sendCallInvitation params error: callType !!");
		}
		if (roomID && typeof roomID !== 'string') return Promise.reject("room ID should be string");

		zgLogger.info(SpanEvent.CallInvite, {
			call_id: '',
			callees,
			type: callType,
			room_id: roomID,
			custom_data: data,
			timeout,
			notification_config: notificationConfig
		})
		return ZegoUIKitPrebuilt.core._zimManager.sendInvitation({
			invitees: callees,
			type: callType,
			timeout,
			data,
			roomID,
			notificationConfig,
		});
	}

	async sendInRoomCommand(command: string, toUserIDs: string[]): Promise<boolean> {
		return await ZegoUIKitPrebuilt.core!.sendInRoomCommand(command, toUserIDs);
	}
	async sendInRoomCustomCommand(command: object, priority = 1): Promise<ZegoSignalingInRoomCommandMessage> {
		if (!ZegoUIKitPrebuilt.core?._zimManager?._zim) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, "Please add ZIM plugin first");
			return Promise.reject("ZEGOCLOUD】Please add ZIM plugin first");
		}
		if (typeof command !== "object" || command === null) {
			return Promise.reject("sendInRoomCustomCommand params error: command !!");
		}
		return await ZegoUIKitPrebuilt.core._zimManager.sendInRoomCustomMessage(command, priority);
	}
	// 主动退出房间
	hangUp() {
		ZegoUIKitPrebuilt.core?.eventEmitter.emit("hangUp");
	}

	// 设置语言
	setLanguage(language: ZegoUIKitLanguage): void {
		if (!ZegoUIKitPrebuilt.core) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, " please call init first !!");
			return;
		}
		ZegoUIKitPrebuilt.core._config.language = language;
		ZegoUIKitPrebuilt.core.changeIntl();
		ZegoUIKitPrebuilt.core?.eventEmitter.emit("lang", language);

		if (!ZegoUIKitPrebuilt.core?._zimManager) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, "Please add ZIM plugin first");
			return;
		}
		// call
		ZegoUIKitPrebuilt.core._zimManager.config.language = language;
		ZegoUIKitPrebuilt.core._zimManager.changeIntl();
		zgLogger.warn(SpanEvent.KitCheckWebRTC, "setLanguage", language, ZegoUIKitPrebuilt.core);
	}

	// 获取 call kit 房间ID
	getRoomID(): string {
		if (!ZegoUIKitPrebuilt.core) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, " please call init first !!");
			return " please call init first !!";
		}
		return ZegoUIKitPrebuilt.core._expressConfig.roomID;
	}

	// 更新通话中邀请用户配置
	updateCallingInvitationListConfig(config: CallingInvitationListConfig) {
		if (!ZegoUIKitPrebuilt.core) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, " please call init first !!");
			return;
		}
		ZegoUIKitPrebuilt.core.updateCallingInvitationListConfig(config);
	}

	rotateToLandscape() {
		if (!ZegoUIKitPrebuilt.core) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, " please call init first !!");
			return;
		}
		ZegoUIKitPrebuilt.core.rotateToLandscape();
	}

	rotateToPortrait() {
		if (!ZegoUIKitPrebuilt.core) {
			zgLogger.error(SpanEvent.KitCheckWebRTC, " please call init first !!");
			return;
		}
		ZegoUIKitPrebuilt.core.rotateToPortrait();
	}

	renewToken(kitToken: string): boolean {
		return ZegoUIKitPrebuilt.core?.renewToken(kitToken)!;
	}
	async closeBackgroundProcess() {
		if (ZegoUIKitPrebuilt.core?.BackgroundProcessConfig!.initialized) {
			return await ZegoUIKitPrebuilt.core?.closeBackgroundProcess();
		} else {
			zgLogger.error(SpanEvent.KitCheckWebRTC, "please init background process first !!");
		}
	}
	async openBackgroundProcess() {
		if (ZegoUIKitPrebuilt.core?.BackgroundProcessConfig!.initialized) {
			return await ZegoUIKitPrebuilt.core?.openBackgroundProcess();
		} else {
			zgLogger.error(SpanEvent.KitCheckWebRTC, "please init background process first !!");
		}
	}
}
