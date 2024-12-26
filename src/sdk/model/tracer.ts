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
    RoomConfig = 'RoomConfig',
    Unmount = 'unmount',

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
}
