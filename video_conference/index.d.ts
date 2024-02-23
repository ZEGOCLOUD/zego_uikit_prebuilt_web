declare type ZegoCloudRTCCore = {};
declare type ZegoExpressEngine = {};
declare interface ZegoUser {
  userID: string;
  userName?: string;
  setUserAvatar?: (avatar: string) => void;
}
declare enum LiveRole {
  Host = "Host",
  Cohost = "Cohost",
  Audience = "Audience",
}
declare enum ScenarioModel {
  OneONoneCall = "OneONoneCall",
  GroupCall = "GroupCall",
  VideoConference = "VideoConference",
  LiveStreaming = "LiveStreaming",
}
declare enum VideoResolution {
  _180P = "180p",
  _360P = "360p",
  _480P = "480p",
  _720P = "720p",
}
export enum VideoMixinLayoutType {
  AutoLayout = 0,
}
export enum VideoMixinOutputResolution {
  _180P = "180p",
  _360P = "360p",
  _540P = "540p",
  _720P = "720p",
  _1080P = "1080p",
}
declare interface ScenarioConfig {
  [ScenarioModel.LiveStreaming]: {
    role: LiveRole;
    liveStreamingMode: LiveStreamingMode;
    enableVideoMixing?: boolean;
    // videoMixingLayout?: VideoMixinLayoutType;
    videoMixingOutputResolution?: VideoMixinOutputResolution;
  };
  [ScenarioModel.OneONoneCall]: {
    role: LiveRole;
  };
  [ScenarioModel.GroupCall]: {
    role: LiveRole;
  };
  [ScenarioModel.VideoConference]: {
    role: LiveRole;
  };
}
declare enum LiveStreamingMode {
  /**
   * @Deprecated  StanderLive will be removed, please use LiveStreaming instead
   */
  StanderLive = "LiveStreaming",
  /**
   * @Deprecated  PremiumLive will be removed, please use InteractiveLiveStreaming instead
   */
  PremiumLive = "InteractiveLiveStreaming",
  LiveStreaming = "LiveStreaming", // CDN
  InteractiveLiveStreaming = "InteractiveLiveStreaming", // L3
  RealTimeLive = "RealTimeLive", //RTC
}

declare enum ConsoleLevel {
  Debug = "Debug",
  Info = "Info",
  Warning = "Warning",
  Error = "Error",
  None = "None",
}
declare interface InRoomMessageInfo {
	fromUser: ZegoUser
	message: string
	sendTime: number
	messageID: number
	attrs?: any
	status?: "SENDING" | "SENDED" | "FAILED"
}
declare enum ScreenSharingResolution {
	_360P = "360p",
	_480P = "480p",
	_720P = "720p",
	_1080P = "1080p",
	_2K = "2k",
	_4K = "4k",
	Auto = "auto",
	Custom = "custom",
}
declare interface ZegoCloudRoomConfig {
	// 1 UI controls
	// 1.1 Global
	container?: HTMLElement | undefined | null // Component container.
	maxUsers?: number // In-call participants range from [2 - 20]. The default value is unlimited.
	scenario?: {
		mode?: ScenarioModel // Scenario selection.
		config?: ScenarioConfig[ScenarioModel] // Specific configurations in the corresponding scenario.
	}
	console?: ConsoleLevel // Used to problem localization, not a regular setup. While setting this can decide what severity of logs you want to print.
	screenSharingConfig?: {
		resolution?: ScreenSharingResolution
		width?: number
		height?: number
		frameRate?: number
		maxBitRate?: number
	} // Screen sharing settings, resolution settings

	// 1.2 Prejoin view
	showPreJoinView?: boolean // Whether to display the prejoin view. Displayed by default.
	preJoinViewConfig?: {
		title?: string // The title of the prejoin view. Uses "enter Room" by default.
	}
	turnOnMicrophoneWhenJoining?: boolean // Whether to enable the microphone when joining the call. Enabled by default.
	turnOnCameraWhenJoining?: boolean // Whether to enable the camera when joining the call. Enabled by default.
	useFrontFacingCamera?: boolean // Whether to use the front-facing camera when joining the room. Uses a front-facing camera by default.
	videoResolutionDefault?: VideoResolution // The default video resolution.
	enableStereo?: boolean // Whether to enable stereo, disenabled by default.

	// 1.3 Room view
	showRoomDetailsButton?: boolean // Whether to display room details. Displayed by default
	showRoomTimer?: boolean //  Whether to display the timer. Not displayed by default.
	showMyCameraToggleButton?: boolean // Whether to display the button for toggling my camera. Displayed by default.
	showMyMicrophoneToggleButton?: boolean // Whether to display the button for toggling my microphone. Displayed by default.
	showAudioVideoSettingsButton?: boolean // Whether to display the button for audio and video settings. Displayed by default.
	showTurnOffRemoteCameraButton?: boolean /// Whether to display the button for turning off the remote camera. Not displayed by default.
	showTurnOffRemoteMicrophoneButton?: boolean // Whether to display the button for turning off the remote microphone. Not displayed by default.
	showTextChat?: boolean // Whether to display the text chat interface on the right side. Displayed by default.
	showUserList?: boolean // Whether to display the participant list. Displayed by default.
	showRemoveUserButton?: boolean // Whether to display the button for removing participants. Not displayed by default.
	lowerLeftNotification?: {
		showUserJoinAndLeave?: boolean // Whether to display notifications on the lower left area when participants join and leave the room. Displayed by default.
		showTextChat?: boolean // Whether to display the latest messages on the lower left area. Displayed by default.
	}
	branding?: {
		logoURL?: string // The branding LOGO URL.
	}
	layout?: "Sidebar" | "Grid" | "Auto" // The layout modes. Uses the Auto mode by default.
	showLayoutButton?: boolean // Whether to display the button for switching layouts. Displayed by default.
	showNonVideoUser?: boolean // Whether to display the non-video participants. Displayed by default.
	showOnlyAudioUser?: boolean // Whether to display audio-only participants. Displayed by default.
	sharedLinks?: { name?: string; url?: string }[] // Description of the generated shared links.
	showScreenSharingButton?: boolean // Whether to display the Screen Sharing button. Displayed by default.
	showPinButton?: boolean // Whether to display the Pin button. Displayed by default.
	whiteboardConfig?: {
		showAddImageButton?: boolean // It's set to false by default. To use this feature, activate the File Sharing feature, and then import the plugin. Otherwise, this prompt will occur: "Failed to add image, this feature is not supported."
		showCreateAndCloseButton?: boolean // Whether to display the button that is used to create/turn off the whiteboard. Displayed by default.
	}
	showInviteToCohostButton?: boolean // Whether to show the button that is used to invite the audience to co-host on the host end.
	showRemoveCohostButton?: boolean // Whether to show the button that is used to remove the audience on the host end.
	showRequestToCohostButton?: boolean // Whether to show the button that is used to request to co-host on the audience end.
	rightPanelExpandedType?: RightPanelExpandedType // Controls the type of the information displayed on the right panel, display "None" by default.
	autoHideFooter?: boolean // Whether to enable the footer auto-hide feature, enabled by default.
	enableUserSearch?: boolean // Whether to enable the user search feature, false by default.
	// 1.4 Leaving view
	showLeavingView?: boolean // Whether to display the leaving view. Displayed by default.
	showLeaveRoomConfirmDialog?: boolean // When leaving the room, whether to display a confirmation pop-up window, the default is true

	// 2 Related event callbacks
	onJoinRoom?: () => void // Callback for participants join the room.
	onLeaveRoom?: () => void // Callback for participants exits the room.
	onUserJoin?: (users: ZegoUser[]) => void // Callback for other participants join the call.
	onUserLeave?: (users: ZegoUser[]) => void // Callback for other participants leave the call.
	onUserAvatarSetter?: (user: ZegoUser[]) => void // Callback for the user avatar can be set.
	onLiveStart?: (user: ZegoUser) => void //  Callback for livestream starts.
	onLiveEnd?: (user: ZegoUser) => void // Callback for livestream ends.
	onYouRemovedFromRoom?: () => void // Callback for me removed from the room.
	onInRoomMessageReceived?: (messageInfo: InRoomMessageInfo) => void // Callback for room chat message
	onInRoomCommandReceived?: (fromUser: ZegoUser, command: string) => void // Callback for room command message
	onInRoomTextMessageReceived?: (messages: ZegoSignalingInRoomTextMessage[]) => void // Callback for room signaling text message
	onInRoomCustomCommandReceived?: (command: ZegoSignalingInRoomCommandMessage[]) => void // Callback for room custom command message
	onReturnToHomeScreenClicked?: () => void // Callback for click return to home screen button.
	addInRoomMessageMessageAttributes?: () => any //  add in room message message attribute. return custom message attribute.
	customMessageUI?: (msg: InRoomMessageInfo) => Element // Custom message UI. need return Element.
}

export enum RightPanelExpandedType {
	None = "None",
	RoomDetails = "RoomDetails",
	RoomMembers = "RoomMembers",
	RoomMessages = "RoomMessages",
}
declare interface ZegoSignalingInRoomTextMessage {
	messageID: string;
	timestamp: number;
	orderKey: number;
	senderUserID: string;
	text: string;
}
declare interface ZegoSignalingInRoomCommandMessage {
	messageID: string;
	timestamp: number;
	orderKey: number;
	senderUserID: string;
	command: object;
}

declare enum ZegoInvitationType {
	VoiceCall = 0,
	VideoCall,
}
declare interface ZegoCallInvitationConfig {
	enableCustomCallInvitationWaitingPage?: boolean; // Whether to customize the call invitation waiting page, default false
	enableCustomCallInvitationDialog?: boolean; // Whether to customize the call invitation pop-up window, the default is false
	enableNotifyWhenAppRunningInBackgroundOrQuit?: boolean; // Notify users when the app is running in the background or the app is killed, default false
	ringtoneConfig?: {
		incomingCallUrl?: string; // ringtone when receiving
		outgoingCallUrl?: string; // Outgoing ringtone
	};
	// Callback when entering the call waiting page, return the cancel method, if called, you can cancel the invitation
	onWaitingPageWhenSending?: (
		callType: ZegoInvitationType,
		callees: ZegoUser[],
		cancel: CancelCallInvitationFunc
	) => void;

	// When the callee receives the invitation, the invitation pop-up window displays the callback, and returns the accept and refuse methods to bind the UI to the user
	onConfirmDialogWhenReceiving?: (
		callType: ZegoInvitationType,
		caller: ZegoUser,
		refuse: RefuseCallInvitationFunc,
		accept: AcceptCallInvitationFunc,
		data: string
	) => void;

	// Callback before entering the room after accepting the invitation, used to set the room configuration, automatically join the room internally, and the room configuration is based on the default ZegoInvitationType
	onSetRoomConfigBeforeJoining?: (callType: ZegoInvitationType) => ZegoCloudRoomConfig;

	// Call invitation end callback (call rejected, timeout, busy, user exits the room where the call was invited, etc.)
	onCallInvitationEnded?: (reason: CallInvitationEndReason, data: string) => void;

	// After Prebuilt receives the call invitation, it converts the internal data into corresponding data and throws
	onIncomingCallReceived?: (
		callID: string,
		caller: ZegoUser,
		callType: ZegoInvitationType,
		callees: ZegoUser[]
	) => void;
	// When the caller cancels the call, convert the internal data to the corresponding data and throw it.
	onIncomingCallCanceled?: (callID: string, caller: ZegoUser) => void;
	// After the callee accepts the invitation, the caller will receive the callback, convert the internal data into corresponding data and throw it.
	onOutgoingCallAccepted?: (callID: string, callee: ZegoUser) => void;
	// When the callee is in a call and rejects the invitation, the caller will receive this callback, convert the internal data into corresponding data and throw it.
	onOutgoingCallRejected?: (callID: string, callee: ZegoUser) => void;
	// When the callee voluntarily refuses the call, the caller will receive this callback, convert the internal data into corresponding data and throw it.
	onOutgoingCallDeclined?: (callID: string, callee: ZegoUser) => void;
	//When the callee fails to respond to the invitation after a timeout, the callee will receive the callback, convert the internal data into corresponding data and throw it.
	onIncomingCallTimeout?: (callID: string, caller: ZegoUser) => void;
	//When the call exceeds the fixed time, if there are still callees who do not respond, the caller will receive the callback, convert the internal data into corresponding data and throw it.
	onOutgoingCallTimeout?: (callID: string, callees: ZegoUser[]) => void;
}

declare interface ZegoSignalingPluginNotificationConfig {
	resourcesID?: string;
	title?: string;
	message?: string;
}

declare enum CallInvitationEndReason {
	Declined = "Declined",
	Timeout = "Timeout",
	Canceled = "Canceled",
	Busy = "Busy",
	LeaveRoom = "LeaveRoom",
}
declare type CancelCallInvitationFunc = (data?: string) => void; // cancel invitation
declare type AcceptCallInvitationFunc = (data?: string) => void; // accept invitation
declare type RefuseCallInvitationFunc = (data?: string) => void; // reject invitation
declare enum MessagePriority {
	Low = 1,
	Medium = 2,
	High = 3,
}
export declare class ZegoUIKitPrebuilt {
	static core: ZegoCloudRTCCore | undefined;
	static _instance: ZegoUIKitPrebuilt;
	static Host: LiveRole;
	static Cohost: LiveRole;
	static Audience: LiveRole;
	static OneONoneCall: ScenarioModel;
	static GroupCall: ScenarioModel;
	static LiveStreaming: ScenarioModel;
	static VideoConference: ScenarioModel;
	static VideoResolution_180P: VideoResolution;
	static VideoResolution_360P: VideoResolution;
	static VideoResolution_480P: VideoResolution;
	static VideoResolution_720P: VideoResolution;
	static LiveStreamingMode: typeof LiveStreamingMode;
	static InvitationTypeVoiceCall: ZegoInvitationType;
	static InvitationTypeVideoCall: ZegoInvitationType;
	static ConsoleDebug: ConsoleLevel;
	static ConsoleInfo: ConsoleLevel;
	static ConsoleWarning: ConsoleLevel;
	static ConsoleError: ConsoleLevel;
	static ConsoleNone: ConsoleLevel;
	private hasJoinedRoom;
	express: ZegoExpressEngine;
	localStream: MediaStream | undefined;
	static generateKitTokenForTest(
		appID: number,
		serverSecret: string,
		roomID: string,
		userID: string,
		userName?: string,
		ExpirationSeconds?: number
	): string;
	static generateKitTokenForProduction(
		appID: number,
		token: string,
		roomID: string,
		userID: string,
		userName?: string
	): string;
	static create(kitToken: string): ZegoUIKitPrebuilt;
	addPlugins(plugins?: { ZegoSuperBoardManager?: any; ZIM?: any }): void;
	joinRoom(roomConfig?: ZegoCloudRoomConfig): void;
	destroy(): void;
	setCallInvitationConfig(config?: ZegoCallInvitationConfig): void;
	sendCallInvitation(params: {
		callees: ZegoUser[];
		callType: ZegoInvitationType;
		timeout?: number;
		data?: string;
		notificationConfig?: ZegoSignalingPluginNotificationConfig;
	}): Promise<{
		errorInvitees: ZegoUser[];
	}>;
	sendInRoomCommand(command: string, toUserIDs: string[]): Promise<boolean>;
	sendInRoomCustomCommand(command: object, priority?: MessagePriority): Promise<ZegoSignalingInRoomCommandMessage>;
	hangUp(): void;
}
