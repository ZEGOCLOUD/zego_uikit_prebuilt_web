export enum SpanEvent {
    // web 接口调用事件
    Create = 'create',
    Init = 'init',
    Destory = 'destory',

    // web 查询问题打点
    ZIMLoginRoom = 'zim/loginRoom',
    ZIMLogoutRoom = 'zim/logoutRoom',
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
    RespondInvitation = 'call/respondInvitation',
    // InvitationReceived = 'call/invitationReceived',

}
