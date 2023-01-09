declare type ZegoCloudRTCCore = {};
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

declare interface ScenarioConfig {
  [ScenarioModel.LiveStreaming]: {
    role: LiveRole;
    liveStreamingMode: LiveStreamingMode;
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
declare interface ZegoCloudRoomConfig {
  container?: HTMLElement | undefined | null; // mount container
  preJoinViewConfig?: {
    title?: string; // Title setting, default enter Room
    invitationLink?: string;
  };
  showPreJoinView?: boolean; // Whether to display the preview detection page, the default display
  turnOnMicrophoneWhenJoining?: boolean; // Whether to turn on your own microphone, by default
  turnOnCameraWhenJoining?: boolean; // Whether to turn on your own camera or not, it is turned on by default
  showMyCameraToggleButton?: boolean; // Whether to display the button to control your own microphone, the default display
  showMyMicrophoneToggleButton?: boolean; // Whether to display the button to control your own camera, the default display
  showAudioVideoSettingsButton?: boolean; // Whether to display the audio and video settings button, the default display

  showTextChat?: boolean; // Whether to enable chat, default enabled
  showUserList?: boolean; //Whether to display the member list or not by default
  lowerLeftNotification?: {
    showUserJoinAndLeave?: boolean; //Whether to display members entering and leaving, default is not displayed
    showTextChat?: boolean; // Whether to display unread messages or not by default
  };
  branding?: {
    logoURL?: string; // call page logo
  };
  showLeavingView?: boolean; // The page after leaving the room, by default

  maxUsers?: number; // The number of people in the room is 2 to 20, the default is 2
  layout?: "Sidebar" | "Grid" | "Auto"; // Default Default

  showNonVideoUser?: boolean; // whether to display users without video, default display
  showOnlyAudioUser?: boolean; // Whether to display audio-only users, the default display

  useFrontFacingCamera?: boolean;
  onJoinRoom?: () => void; // User enters call page callback
  onLeaveRoom?: () => void; // User exit call page callback
  onUserJoin?: (user: ZegoUser[]) => void; // other users enter the callback
  onUserLeave?: (user: ZegoUser[]) => void; // Other users leave the callback
  sharedLinks?: { name?: string; url?: string }[]; // product link description
  showScreenSharingButton?: boolean; // Whether to display the screen sharing button
  scenario?: {
    mode?: ScenarioModel; // Scenario selection
    config?: ScenarioConfig[ScenarioModel]; // Corresponding scenario-specific configuration
  };

  showLayoutButton?: boolean; // Whether to display the layout switch button
  showPinButton?: boolean; // Whether to display the pin button
  onUserAvatarSetter?: (user: ZegoUser[]) => void; //Is it possible to set the user avatar callback
  videoResolutionList?: VideoResolution[]; // video resolution list (the first one is used by default)
  videoResolutionDefault?: VideoResolution; // Default video resolution
  onLiveStart?: (user: ZegoUser) => void; //Live start callback
  onLiveEnd?: (user: ZegoUser) => void; //Callback for live broadcast end
  /**
   * @deprecated facingMode will be removed
   * */
  facingMode?: "user" | "environment"; // front camera mode
  /**
   * @deprecated joinRoomCallback will be removed
   * */
  joinRoomCallback?: () => void; // join room success callback
  /**
   * @deprecated leaveRoomCallback will be removed
   * */
  leaveRoomCallback?: () => void; // exit room callback
  /**
   * @deprecated userUpdateCallback will be removed
   * */
  userUpdateCallback?: (
    updateType: "DELETE" | "ADD",
    userList: ZegoUser[]
  ) => void; // user add/exit callback
  /**
   * @deprecated roomTimerDisplayed will be removed
   * */
  roomTimerDisplayed?: boolean; // Whether to display the countdown

  whiteboardConfig?: {
    showAddImageButton?: boolean; // The default is false, the file sharing function is enabled and the plug-in is introduced before it will take effect; otherwise, an error message will appear: "Failed to add image, this feature is not supported."
    showCreateAndCloseButton?: boolean;
  };
  autoLeaveRoomWhenOnlySelfInRoom?: boolean; // When there is only one person left in the room, automatically exit the room
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
  onSetRoomConfigBeforeJoining?: (
    callType: ZegoInvitationType
  ) => ZegoCloudRoomConfig;

  // Call invitation end callback (call rejected, timeout, busy, user exits the room where the call was invited, etc.)
  onCallInvitationEnded?: (
    reason: CallInvitationEndReason,
    data: string
  ) => void;

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
  private hasJoinedRoom;
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
}
