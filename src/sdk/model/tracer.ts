export enum SpanEvent {
    // web 接口调用事件
    Create = 'create',
    Init = 'init',
    Destory = 'destory',

    // web 查询问题打点
    ZIMInit = 'zim/init',
    ZIMLogin = 'zim/login',
    ZIMJoinRoom = 'zim/joinroom',
    ZIMLeaveRoom = 'zim/leaveroom',
    ZIMConnectionStateChanged = 'zim/connectionStateChanged',
    RoomConfig = 'roomConfig',
    Unmount = 'unmount',
    
    // UI 组件与设置相关
    BrowserCheckCreateStream = 'browserCheck/createStream',
    BrowserCheckToggleStreamFailed = 'browserCheck/toggleStreamFailed',
    BrowserCheckMicPermission = 'browserCheck/micPermission',
    BrowserCheckCameraPermission = 'browserCheck/cameraPermission',
    BrowserCheckStopAudio = 'browserCheck/stopAudio',
    BrowserCheckVideoDeviceStateChanged = 'browserCheck/videoDeviceStateChanged',
    SettingLocalVideoStreamFailed = 'setting/localVideoStreamFailed',
    SettingLocalAudioStreamFailed = 'setting/localAudioStreamFailed',
    SettingCaptureSpeakerVolumeError = 'setting/captureSpeakerVolumeError',
    SettingCaptureMicVolumeError = 'setting/captureMicVolumeError',
    MediaVideoEvent = 'media/videoEvent',
    
    // Core SDK 相关
    CoreEvent = 'core/event',
    ZimManagerEvent = 'zimManager/event',
    UserListManagerEvent = 'userListManager/event',
    InRoomInviteManagerEvent = 'inRoomInviteManager/event',
    
    // Core SDK API 调用追踪
    CoreCreateStream = 'core/createStream',
    CoreUseCameraDevice = 'core/useCameraDevice',
    CoreUseMicDevice = 'core/useMicDevice',
    CoreUseSpeakerDevice = 'core/useSpeakerDevice',
    CoreEnableVideo = 'core/enableVideo',
    CoreMuteVideo = 'core/muteVideo',
    CoreMuteAudio = 'core/muteAudio',
    CoreMuteMic = 'core/muteMic',

    // UI 组件与设置相关补充
    SettingToggleMic = 'setting/toggleMic',
    SettingToggleSpeaker = 'setting/toggleSpeaker',
    SettingToggleCamera = 'setting/toggleCamera',
    SettingToggleResolution = 'setting/toggleResolution',
    SettingCreateVideoStreamSuccess = 'setting/createVideoStreamSuccess',
    SettingCreateAudioStreamSuccess = 'setting/createAudioStreamSuccess',
    
    // KitComponent 相关
    KitCheckWebRTC = 'kit/checkWebRTC',
    KitWillUnmount = 'kit/willUnmount',
    KitDestroyNode = 'kit/destroyNode',
    KitLeaveRoom = 'kit/leaveRoom',

    // Room 相关
    RoomMount = 'room/mount',
    RoomRemoteUserUpdate = 'room/remoteUserUpdate',
    RoomDeviceCheck = 'room/deviceCheck',
    RoomCreateStream = 'room/createStream',
    RoomPublishStream = 'room/publishStream',
    RoomToggleMic = 'room/toggleMic',
    RoomToggleCamera = 'room/toggleCamera',
    RoomSetStreamExtraInfo = 'room/setStreamExtraInfo',
    RoomScreenSharing = 'room/screenSharing',
    RoomWhiteboardSharing = 'room/whiteboardSharing',
    RoomSendMessage = 'room/sendMessage',
    RoomLeave = 'room/leave',
    RoomResize = 'room/resize',
    RoomInviteCohost = 'room/inviteCohost',
    RoomRespondCohost = 'room/respondCohost',
    RoomBanMessages = 'room/banMessages',
    RoomCameraChange = 'room/cameraChange',

    // 与native统一上报事件
    LoginRoom = 'loginRoom',
    LogoutRoom = 'logoutRoom',
    // UnInit = 'unInit',
    Invite = 'callInvite',
    InvitationReceived = 'invitationReceived',
    CallInvite = 'call/invite',
    DisplayNotification = 'call/displayNotification',
    CalleeRespondInvitation = 'call/callee/respondInvitation',
    CallInvitationReceived = 'call/invitationReceived',
    CallerRespondInvitation = 'call/caller/respondInvitation',
    LiveStreamingHostInvite = 'livestreaming/cohost/host/invite',
    LiveStreamingHostReceived = 'livestreaming/cohost/host/received',
    LiveStreamingHostRespond = 'livestreaming/cohost/host/respond',
    LiveStreamingHostStop = 'livestreaming/cohost/host/stop',
    LiveStreamingAudienceInvite = 'livestreaming/cohost/audience/invite',
    LiveStreamingAudienceReceived = 'livestreaming/cohost/audience/received',
    LiveStreamingAudienceRespond = 'livestreaming/cohost/audience/respond',

    videoMode = 'video/mode',
    PublishStream = 'publishStream',
    PullStream = 'pullStream',
    CDNStuck = 'cdn/stuck',
}
