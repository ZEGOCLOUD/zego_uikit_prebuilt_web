export declare const kZMInitSetting: {
    event: string;
    error: {
        kInvalidParamError: {
            code: number;
            msg: string;
        };
    };
    system_info: (item?: string) => string | undefined;
    servers: (item: string[]) => string[];
    is_from_cache: (item: boolean) => boolean;
    project: (item?: string) => string | undefined;
    liveroom_version: (item?: string) => string | undefined;
    biz_type: (item: number) => number;
    lua_md5: (item?: string) => string | undefined;
    sev_env: (item?: string) => string | undefined;
    use_na: (item: number) => number;
};
export declare const kZMListener: {
    event: string;
};
export declare const kZMRContext: {
    event: string;
};
export declare const kZMHB: {
    event: string;
};
export declare const kZMSetDebug: {
    event: string;
    debug: (item?: string) => string | undefined;
};
export declare const kZMSetLog: {
    event: string;
    error: {
        kInvalidParamError: {
            code: number;
            msg: string;
        };
    };
    log_level: (level: string) => string;
    remote_log_level: (item?: string) => string | undefined;
    log_url: (item?: string) => string | undefined;
};
export declare const kZMOnListener: {
    event: string;
    listener: (item?: string) => string | undefined;
    error: {
        INPUT_PARAM: {
            code: number;
            msg: string;
        };
    };
};
export declare const kZMOffListener: {
    event: string;
    listener: (item?: string) => string | undefined;
    error: {
        INPUT_PARAM: {
            code: number;
            msg: string;
        };
    };
};
export declare const kZMLoginRoom: {
    event: string;
    room_id: (item?: string) => string | undefined;
    room_sid_string: (item?: string) => string | undefined;
    user_state_update: (item: number) => number;
    max_member_cnt: (item: number) => number;
    message: (item?: string) => string | undefined;
    token: (item?: string) => string | undefined;
    svr_env: (item?: string) => string | undefined;
    server: (item?: string) => string | undefined;
    try_cnt: (item: number) => number;
    room_mode: (item: number) => number;
    role: (item: number) => number;
    audience_create_room: (item: number) => number;
    liveroom_sid_string: (item?: string) => string | undefined;
    error: {
        ROOM_ID_NULL: {
            code: number;
            msg: string;
        };
        INPUT_PARAM: {
            code: number;
            msg: string;
        };
        ROOM_ID_TOO_LONG: {
            code: number;
            msg: string;
        };
        ROOM_ID_INVALID_CHARACTER: {
            code: number;
            msg: string;
        };
        USER_ID_NULL: {
            code: number;
            msg: string;
        };
        USER_ID_TOO_LONG: {
            code: number;
            msg: string;
        };
        USER_ID_INVALID_CHARACTER: {
            code: number;
            msg: string;
        };
        USER_NAME_NULL: {
            code: number;
            msg: string;
        };
        USER_NAME_TOO_LONG: {
            code: number;
            msg: string;
        };
        REPEATEDLY_LOGIN: {
            code: number;
            msg: string;
        };
        LOGIN_TIMEOUT: {
            code: number;
            msg: string;
        };
        INNER_ERROR: {
            code: number;
            msg: string;
        };
        NETWORK_BROKEN: {
            code: number;
            msg: string;
        };
        ROOM_COUNT_EXCEED: {
            code: number;
            msg: string;
        };
        DIFFERENT_USER_ID: {
            code: number;
            msg: string;
        };
    };
};
export declare const kZMSubLogin: {
    event: string;
    server: (item?: string) => string | undefined;
    room_id: (item?: string) => string | undefined;
    room_sid_string: (item?: string) => string | undefined;
};
export declare const kZMSwitchLogin: {
    event: string;
    sdk_zpush_sessionid_string: (item?: string) => string | undefined;
};
export declare const kZMLiveRoomEnter: {
    event: string;
};
export declare const kZegoLiveRoomConnect: {
    event: string;
};
export declare const kZMReNewToken: {
    event: string;
    error: {
        INPUT_PARAM: {
            code: number;
            msg: string;
        };
        NOT_LOGIN: {
            code: number;
            msg: string;
        };
    };
    token: (item?: string) => string | undefined;
};
export declare const kZMHbTimeout: {
    event: string;
};
export declare const kZMLogoutRoom: {
    event: string;
    error: {
        INPUT_PARAM: {
            code: number;
            msg: string;
        };
        ROOM_NOT_EXIST: {
            code: number;
            msg: string;
        };
    };
    room_id: (item?: string) => string | undefined;
    room_sid_string: (item?: string) => string | undefined;
    is_multi: (item: boolean) => boolean;
    is_send_cmd_net: (item: boolean) => boolean;
    liveroom_sid_string: (item?: string) => string | undefined;
};
export declare const kZMSwitchLogout: {
    event: string;
    error: {
        INPUT_PARAM: {
            code: number;
            msg: string;
        };
        ROOM_NOT_EXIST: {
            code: number;
            msg: string;
        };
    };
};
export declare const kZMQuitLiveroom: {
    event: string;
    error: {
        INPUT_PARAM: {
            code: number;
            msg: string;
        };
        ROOM_NOT_EXIST: {
            code: number;
            msg: string;
        };
    };
    is_multi: (item: boolean) => boolean;
    liveroom_sid_string: (item?: string) => string | undefined;
    sdk_zpush_sessionid_string: (item?: string) => string | undefined;
    valid_d: (item: number) => number;
    total_d: (item: number) => number;
    tempbroken_cnt: (item: number) => number;
};
export declare const kZMMultiLogout: {
    event: string;
    error: {
        INPUT_PARAM: {
            code: number;
            msg: string;
        };
        ROOM_NOT_EXIST: {
            code: number;
            msg: string;
        };
    };
};
export declare const kZMReLoginRoom: {
    event: string;
    error: {
        ROOM_ID_NULL: {
            code: number;
            msg: string;
        };
        ROOM_DISCONNECT: {
            code: number;
            msg: string;
        };
    };
    server: (item?: string) => string | undefined;
    try_cnt: (item: number) => number;
};
export declare const kZMTempBroken: {
    event: string;
};
export declare const kZMReconnect: {
    event: string;
    room_broken_time: (item: number) => number;
};
export declare const kZMSdkDisconnect: {
    event: string;
    valid_d: (item: number) => number;
    total_d: (item: number) => number;
    tempbroken_cnt: (item: number) => number;
};
export declare const kZMKickout: {
    event: string;
    user_id: (item?: string) => string | undefined;
    kickout_reason: (item: number) => number;
    need_relogin: (item: number) => number;
    valid_d: (item: number) => number;
    total_d: (item: number) => number;
    tempbroken_cnt: (item: number) => number;
    error: {};
};
export declare const kZMRHB: {
    event: string;
    room_id: (item?: string) => string | undefined;
    room_sid_string: (item?: string) => string | undefined;
    interval: (item: number) => number;
    stream_seq: (item: number) => number;
    server_user_seq: (item: number) => number;
    error: {
        NOT_LOGIN: {
            code: number;
            msg: string;
        };
        HB_TIMEOUT: {
            code: number;
            msg: string;
        };
    };
};
export declare const kZMRRecvUserUpdateInfo: {
    event: string;
    user_list_seq: (item: number) => number;
    update_user: (item: any) => any;
    error: {
        ROOM_NOT_EXIST: {
            code: number;
            msg: string;
        };
    };
};
export declare const kZegoListener: {
    event: string;
};
export declare const kZegoEnableMultiRoom: {
    event: string;
    is_multi: (item: boolean) => boolean;
    error: {
        kInvalidParamError: {
            code: number;
            msg: string;
        };
        kAlreadyLoginError: {
            code: number;
            msg: string;
        };
    };
};
export declare const kZMCloudSettingCache: {
    event: string;
    files: (item: any) => any;
};
export declare const kZMCloudSettingRefresh: {
    event: string;
    request_kv: (item: any) => any;
    files: (item: any) => any;
};
export declare const kZMCloudSettingRequest: {
    event: string;
    request_detail: (item: any) => any;
    files: (item: any) => any;
};
export declare const kZMGetCurrentUserList: {
    event: string;
    user_index: (item: number) => number;
    is_time_ascend: (item: boolean) => boolean;
    use_na: (item: number) => number;
};
export declare const kZegoConnConnect: {
    event: string;
    connect_id: (item?: string) => string | undefined;
    request_count: (item: number) => number;
    events: (item: any) => any;
};
export declare const kZegoConnDisConnect: {
    event: string;
    connect_id: (item?: string) => string | undefined;
    url: (item?: string) => string | undefined;
    connect_duration: (item: number) => number;
};
export declare const kZegoConnDispatch: {
    event: string;
    domain_list: (item: string[]) => string[];
};
export declare const kZegoRequest: {
    event: string;
    req_location: (item: any) => any;
};
export declare const kZegoSDKConfigInit: {
    event: string;
    trigger_reason: (item: any) => any;
    try_count: (item: number) => number;
};
export declare const kZegoSDKProxyConnect: {
    event: string;
    service_no: (item: number) => number;
    proxy_link_sources: (item: number) => number;
    recv_time: (item: number) => number;
    connect_stream: (item: number) => number;
};
export declare const kZegoSDKProxyBroken: {
    event: string;
    service_no: (item: number) => number;
};
export declare const kZegoSDKProxyDisconnect: {
    event: string;
    service_no: (item: number) => number;
};
