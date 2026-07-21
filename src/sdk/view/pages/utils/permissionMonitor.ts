import ZegoLocalStream from "zego-express-engine-webrtc/sdk/code/zh/ZegoLocalStream.web";

/**
 * 权限监听上下文接口
 * 抽象了 ZegoRoom 和 ZegoRoomMobile 共有的交互方法
 */
export interface PermissionMonitorContext {
	core: {
		status: {
			videoRefuse?: boolean;
			audioRefuse?: boolean;
		};
		_config: {
			turnOnCameraWhenJoining?: boolean;
			turnOnMicrophoneWhenJoining?: boolean;
			onCameraStateUpdated?: (state: 'ON' | 'OFF') => void;
			onMicrophoneStateUpdated?: (state: 'ON' | 'OFF') => void;
		};
		intl: {
			formatMessage: (descriptor: { id: string }) => string;
		};
	};
	getLocalStream: () => ZegoLocalStream | undefined | null;
	getCameraOpen: () => boolean;
	getMicOpen: () => boolean;
	setState: (state: any, callback?: () => void) => void;
	stopPublish: () => void;
	createStream: () => Promise<boolean>;
	showToast: (content: string) => void;
}

export interface PermissionMonitorResult {
	cameraPermissionStatus: PermissionStatus | null;
	micPermissionStatus: PermissionStatus | null;
}

/**
 * 初始化权限状态：当没有检测页直接进房时，videoRefuse 和 audioRefuse 为 undefined，需重新赋值
 */
function initPermissionState(
	ctx: PermissionMonitorContext,
	cameraStatus: PermissionStatus,
	micStatus: PermissionStatus,
) {
	if (ctx.core.status.videoRefuse === undefined || ctx.core.status.audioRefuse === undefined) {
		ctx.core.status.videoRefuse = cameraStatus.state.includes('denied');
		ctx.core.status.audioRefuse = micStatus.state.includes('denied');
		ctx.setState({
			cameraOpen: !!ctx.core._config.turnOnCameraWhenJoining && !ctx.core.status.videoRefuse,
			micOpen: !!ctx.core._config.turnOnMicrophoneWhenJoining && !ctx.core.status.audioRefuse,
		});
	}
}

/**
 * 设置摄像头/麦克风权限变化监听，当权限被撤销时停止推流并重建流。
 * ZegoRoom 和 ZegoRoomMobile 共用此逻辑。
 *
 * @returns PermissionMonitorResult - 需要在 componentWillUnmount 中清理 onchange
 */
export async function setupPermissionMonitor(
	ctx: PermissionMonitorContext,
): Promise<PermissionMonitorResult> {
	//@ts-ignore
	const cameraStatus: PermissionStatus = await navigator.permissions.query({ name: "camera" });
	//@ts-ignore
	const micStatus: PermissionStatus = await navigator.permissions.query({ name: "microphone" });

	initPermissionState(ctx, cameraStatus, micStatus);

	cameraStatus.onchange = async () => {
		if (cameraStatus.state === 'granted') {
			ctx.core.status.videoRefuse = false;
		} else {
			ctx.setState({
				cameraOpen: false,
			}, () => {
				ctx.showToast(
					ctx.core.intl.formatMessage({ id: "room.cameraStatus" }) +
					ctx.core.intl.formatMessage({ id: "room.off" }),
				);
				ctx.core._config.onCameraStateUpdated &&
					ctx.core._config.onCameraStateUpdated(ctx.getCameraOpen() ? 'ON' : 'OFF');
			});
			ctx.getLocalStream() && ctx.stopPublish();
			ctx.core.status.videoRefuse = true;
			if (!ctx.core.status.audioRefuse) {
				// 音视频流, camera权限没了，音视频流会卡住，需重新创建纯音频流
				await ctx.createStream();
			}
		}
	};

	micStatus.onchange = async () => {
		if (micStatus.state === 'granted') {
			ctx.core.status.audioRefuse = false;
		} else {
			ctx.setState({
				micOpen: false,
			}, () => {
				ctx.showToast(
					ctx.core.intl.formatMessage({ id: "room.microphoneStatus" }) +
					ctx.core.intl.formatMessage({ id: "room.off" }),
				);
				ctx.core._config.onMicrophoneStateUpdated &&
					ctx.core._config.onMicrophoneStateUpdated(ctx.getMicOpen() ? 'ON' : 'OFF');
			});
			ctx.getLocalStream() && ctx.stopPublish();
			ctx.core.status.audioRefuse = true;
			if (!ctx.core.status.videoRefuse) {
				// 音视频流, mic权限没了，音视频流会卡住，需重新创建纯视频流
				await ctx.createStream();
			}
		}
	};

	return {
		cameraPermissionStatus: cameraStatus,
		micPermissionStatus: micStatus,
	};
}

/**
 * 清理权限监听（在 componentWillUnmount 中调用）
 */
export function cleanupPermissionMonitor(result: PermissionMonitorResult) {
	if (result.micPermissionStatus) {
		result.micPermissionStatus.onchange = null;
	}
	if (result.cameraPermissionStatus) {
		result.cameraPermissionStatus.onchange = null;
	}
}

/**
 * 授权后重建流的上下文接口
 * 当 toggleMic/toggleCamera 发现当前流缺少对应 track 时调用
 */
export interface RebuildStreamContext {
	getLocalStream: () => ZegoLocalStream | undefined | null;
	setState: (state: any, callback?: () => void) => void;
	stopPublish: () => void;
	createStream: () => Promise<boolean>;
	showToast: (content: string) => void;
	/** 刷新设备列表并更新选中设备（仅在 targetOpen 为 true 时调用） */
	refreshDevice: () => Promise<void>;
	/** setState 回调中调用，用于布局刷新 */
	onLayoutUpdate: () => void;
	/** 状态更新回调（onCameraStateUpdated / onMicrophoneStateUpdated） */
	onStateCallback?: (state: 'ON' | 'OFF') => void;
}

/**
 * 授权后重建流逻辑，ZegoRoom 和 ZegoRoomMobile 的 toggleMic/toggleCamera 共用。
 *
 * 场景：当前流缺少音频/视频 track（权限之前被拒绝，现在恢复了），
 * 需要停止当前流并重新创建包含新 track 的流。
 *
 * @param ctx - 注入的上下文回调
 * @param stateKey - 'micOpen' | 'cameraOpen'，用于 setState
 * @param targetOpen - 目标状态（true=开启, false=关闭）
 * @param toastContent - Toast 显示内容
 * @returns createStream 的结果
 */
export async function rebuildStreamForDevice(
	ctx: RebuildStreamContext,
	stateKey: 'micOpen' | 'cameraOpen',
	targetOpen: boolean,
	toastContent: string,
): Promise<boolean> {
	// 存在纯视频/纯音频流，需要停止重新创建
	if (ctx.getLocalStream()) {
		ctx.stopPublish();
	}
	if (targetOpen) {
		await ctx.refreshDevice();
	}
	return new Promise<boolean>((resolve) => {
		ctx.setState({ [stateKey]: targetOpen }, async () => {
			ctx.onLayoutUpdate();
			const result = await ctx.createStream();
			ctx.showToast(toastContent);
			ctx.onStateCallback?.(targetOpen ? 'ON' : 'OFF');
			resolve(result);
		});
	});
}
