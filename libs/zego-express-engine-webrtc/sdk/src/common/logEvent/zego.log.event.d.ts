export declare const SDK_INIT = "/sdk/init";
export declare const kZMInitSetting: {
    event: string;
    error: {
        _zgp_kInvalidParamError: {
            code: number;
            message: string;
        };
    };
    system_info: (item?: string | undefined) => string | undefined;
    servers: (item: any) => string[];
};
export declare const kZegoTaskRoom: {
    event: string;
};
export declare const kZMLoginRoom: {
    event: string;
};
export declare const kZegoTaskListener: {
    event: string;
};
export declare const kZegoTaskOnListener: {
    event: string;
    listener: (item?: string | undefined) => string | undefined;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
    };
};
export declare const kZegoTaskOffListener: {
    event: string;
    listener: (item?: string | undefined) => string | undefined;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
    };
};
export declare const kZegoTaskRoomContext: {
    event: string;
};
export declare const kZegoTaskInitSetting: {
    event: string;
};
export declare const kZegoTaskCreateStream: {
    event: string;
    error: {
        _zgp_kBrowserNotSupportError: {
            code: number;
            message: string;
        };
        _zgp_kParamError: {
            code: number;
            message: string;
        };
        _zgp_kScreenCancelError: {
            code: number;
            message: string;
        };
        _zgp_kScreenFailedError: {
            code: number;
            message: string;
        };
        _zgp_kScreenNotSupportError: {
            code: number;
            message: string;
        };
        _zgp_kHttpsRequiredError: {
            code: number;
            message: string;
        };
        _zgp_kGetUserMediaError: {
            code: number;
            message: string;
        };
        _zgp_kDeviceNoAllowedError: {
            code: number;
            message: string;
        };
        _zgp_kDeviceNoReadableError: {
            code: number;
            message: string;
        };
        _zgp_kDeviceOverConstrainedError: {
            code: number;
            message: string;
        };
    };
    stream_type: (item?: string | undefined) => string | undefined;
    screen: (item: any) => any;
    camera: (item: any) => any;
    custom: (item: any) => any;
    preview_conf: (item: any) => any;
    media_stream_id: (item?: string | undefined) => string | undefined;
};
export declare const kZegoTaskPublishStart: {
    event: string;
    error: {
        _zgp_kPublishParamError: {
            code: number;
            message: string;
        };
        _zgp_kPublishNetworkTimeoutError: {
            code: number;
            message: string;
        };
        _zgp_kPublishDispatchTimeoutError: {
            code: number;
            message: string;
        };
        _zgp_kPublishDispatchError: {
            code: number;
            message: string;
        };
        _zgp_kPublishNetworkBrokenError: {
            code: number;
            message: string;
        };
        _zgp_kPublishNoPreviewError: {
            code: number;
            message: string;
        };
        _zgp_kPublishNoCaptureError: {
            code: number;
            message: string;
        };
        _zgp_kPublishEffectIsStarting: {
            code: number;
            message: string;
        };
        _zgp_kPublishNoLoginError: {
            code: number;
            message: string;
        };
        _zgp_kPublishRetryTimeoutError: {
            code: number;
            message: string;
        };
        _zgp_kMediaServerForbidError: {
            code: number;
            message: string;
        };
        _zgp_kPublishTokenExpiredError: {
            code: number;
            message: string;
        };
        _zgp_kPublishSessionClosedError: {
            code: number;
            message: string;
        };
        _zgp_kPublishNegoTimeoutError: {
            code: number;
            message: string;
        };
        _zgp_kCreateOfferError: {
            code: number;
            message: string;
        };
        _zgp_kSetLocalDescError: {
            code: number;
            message: string;
        };
        _zgp_kSessionTimeoutError: {
            code: number;
            message: string;
        };
        _zgp_kSessionRequestError: {
            code: number;
            message: string;
        };
        _zgp_kSetRemoteDescError: {
            code: number;
            message: string;
        };
        _zgp_kMediaConnectionError: {
            code: number;
            message: string;
        };
        _zgp_kWebsocketDisconnectedError: {
            code: number;
            message: string;
        };
        _zgp_kMediaDescError: {
            code: number;
            message: string;
        };
        _zgp_kCandidateError: {
            code: number;
            message: string;
        };
        _zgp_kIsPublishing: {
            code: number;
            message: string;
        };
        _zgp_kClientIPChangedError: {
            code: number;
            message: string;
        };
        _zgp_kTTLOverTimeError: {
            code: number;
            message: string;
        };
        _zgp_kUpdateMediaDescriptionTimeOut: {
            code: number;
            message: string;
        };
        _zgp_kUpdateMediaDescriptionError: {
            code: number;
            message: string;
        };
        _zgp_kPublishNetProbePoor: {
            code: number;
            message: string;
        };
        _zgp_kPublishNotSubscribeBackgroundProcessError: {
            code: number;
            message: string;
        };
        _zgp_kCancelPublish: {
            code: number;
            message: string;
        };
        _zgp_kMiniSDP: {
            code: number;
            message: string;
        };
        _zgp_kPublishStreamAuthFail: {
            code: number;
            message: string;
        };
    };
    urls: (item: any) => string[];
    is_center: (item: boolean) => boolean;
    server_url: (item?: string | undefined) => string | undefined;
    publish_option: (item: any) => any;
    message: (item?: string | undefined) => string | undefined;
    stream_id: (item?: string | undefined) => string | undefined;
    stream_sid: (item?: number | undefined) => number | undefined;
    room_id: (item?: string | undefined) => string | undefined;
    video_en_codec_id: (item?: number | undefined) => number | undefined;
    cap_w: (item?: number | undefined) => number | undefined;
    cap_h: (item?: number | undefined) => number | undefined;
    w: (item?: number | undefined) => number | undefined;
    h: (item?: number | undefined) => number | undefined;
    video_en_fps: (item?: number | undefined) => number | undefined;
    video_en_bps: (item?: number | undefined) => number | undefined;
    audio_c_channel_count: (item?: number | undefined) => number | undefined;
    audio_en_bps: (item?: number | undefined) => number | undefined;
    aec_level: (item?: number | undefined) => number | undefined;
    ans_level: (item?: number | undefined) => number | undefined;
    agc: (item: boolean) => boolean;
    traffic_control_min_video_bitrate: {
        bitrate: (item?: number | undefined) => number | undefined;
        mode: (item?: number | undefined) => number | undefined;
    };
    enable_camera: (item: boolean) => boolean;
    enable_mic: (item: boolean) => boolean;
    video_activate: (item: boolean) => boolean;
    audio_activate: (item: boolean) => boolean;
    gw_version: (item?: number | undefined) => number | undefined;
    use_na: (item?: number | undefined) => number | undefined;
    is_dual_stream: (item?: number | undefined) => number | undefined;
};
export declare const kZegoStartPublish: {
    event: string;
    is_peer: (item: boolean) => boolean;
    reason: (item?: string | undefined) => string | undefined;
    url: (item?: string | undefined) => string | undefined;
    ip: (item?: string | undefined) => string | undefined;
    peer_id: (item?: number | undefined) => number | undefined;
    source_type: (item?: string | undefined) => string | undefined;
    net_protocol: (item?: string | undefined) => string | undefined;
    wait_consume: (item?: number | undefined) => number | undefined;
    dispatch_consume: (item?: number | undefined) => number | undefined;
    signal_consume: (item?: number | undefined) => number | undefined;
    is_center: (item: boolean) => boolean;
    is_dual_stream: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPublishUpdate: {
    event: string;
    stream_id: (item?: string | undefined) => string | undefined;
    reason_code: (item?: number | undefined) => number | undefined;
};
export declare const kZegoRePublish: {
    event: string;
    stream_id: (item?: string | undefined) => string | undefined;
    server_url: (item?: string | undefined) => string | undefined;
    reason_code: (item?: number | undefined) => number | undefined;
    is_dual_stream: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskRePublish: {
    event: string;
};
export declare const kZegoTaskSDKPublishStream: {
    event: string;
    room_id: (item?: string | undefined) => string | undefined;
    room_sid_string: (item?: string | undefined) => string | undefined;
    retry_btime: (item?: number | undefined) => number | undefined;
    max_retry_interval: (item?: number | undefined) => number | undefined;
    fail_cnt: (item?: number | undefined) => number | undefined;
    continuous_fail_cnt: (item?: number | undefined) => number | undefined;
    probe_ip_cnt: (item?: number | undefined) => number | undefined;
    valid_probe_ip_cnt: (item?: number | undefined) => number | undefined;
    poor_quality_retry_cnt: (item?: number | undefined) => number | undefined;
    use_resource_type: (item: any) => string[];
    probe_not_trigger_retry_info: (item: any) => any;
    stop_reason: (item?: string | undefined) => string | undefined;
    child_error: (item?: number | undefined) => number | undefined;
    try_time: (item?: number | undefined) => number | undefined;
    try_cnt: (item?: number | undefined) => number | undefined;
    server_url: (item?: string | undefined) => string | undefined;
    publish_begin_time: (item?: number | undefined) => number | undefined;
    publish_state_time: (item?: number | undefined) => number | undefined;
    bitrate: (item?: number | undefined) => number | undefined;
    h: (item?: number | undefined) => number | undefined;
    w: (item?: number | undefined) => number | undefined;
    cap_w: (item?: number | undefined) => number | undefined;
    cap_h: (item?: number | undefined) => number | undefined;
    fps: (item?: number | undefined) => number | undefined;
    use_na: (item?: number | undefined) => number | undefined;
    env: (item?: number | undefined) => number | undefined;
    webrtc_sid: (item?: number | undefined) => number | undefined;
    stream_id: (item?: string | undefined) => string | undefined;
    itemtype: (item?: string | undefined) => string | undefined;
    total_d: (item?: number | undefined) => number | undefined;
    valid_d: (item?: number | undefined) => number | undefined;
    tempbroken_cnt: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskVideoCaptureSize: {
    event: string;
    webrtc_sid: (item?: number | undefined) => number | undefined;
    w: (item?: number | undefined) => number | undefined;
    h: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskVideoPlaySize: {
    event: string;
    webrtc_sid: (item?: number | undefined) => number | undefined;
    w: (item?: number | undefined) => number | undefined;
    h: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskRTCPublish: {
    event: string;
    tryidx: (item?: number | undefined) => number | undefined;
    url: (item?: string | undefined) => string | undefined;
    ip: (item?: string | undefined) => string | undefined;
    net_protocol: (item?: string | undefined) => string | undefined;
    lsttime: (item?: number | undefined) => number | undefined;
    denied_info: (item?: string | undefined) => string | undefined;
    dispatch_external_ip: (item?: string | undefined) => string | undefined;
    total_stat: (item: any) => any;
    room_id: (item?: string | undefined) => string | undefined;
    room_sid_string: (item?: string | undefined) => string | undefined;
    resource_type: (item?: string | undefined) => string | undefined;
    protocol: (item?: string | undefined) => string | undefined;
    stop_reason: (item?: string | undefined) => string | undefined;
    try_time: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskPublishStop: {
    event: string;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
    };
    stream_id: (item?: string | undefined) => string | undefined;
    stream_sid: (item?: number | undefined) => number | undefined;
    room_id: (item?: string | undefined) => string | undefined;
};
export declare const kZegoTaskPublishStreamStateError: {
    event: string;
};
export declare const kZegoTaskPlayStart: {
    event: string;
    error: {
        _zgp_kStreamIDNullError: {
            code: number;
            message: string;
        };
        _zgp_kPlayParamError: {
            code: number;
            message: string;
        };
        _zgp_kPlayStreamIDToLongError: {
            code: number;
            message: string;
        };
        _zgp_kPlayStreamIDInvalidCharacterError: {
            code: number;
            message: string;
        };
        _zgp_kPlayNoLoginError: {
            code: number;
            message: string;
        };
        _zgp_kPlayRepeatedPullError: {
            code: number;
            message: string;
        };
        _zgp_kPlayNetworkTimeoutError: {
            code: number;
            message: string;
        };
        _zgp_kPlayDispatchTimeoutError: {
            code: number;
            message: string;
        };
        _zgp_kPlayDispatchError: {
            code: number;
            message: string;
        };
        _zgp_kPlayNetworkBrokenError: {
            code: number;
            message: string;
        };
        _zgp_kPlayUnsupportedResourceMode: {
            code: number;
            message: string;
        };
        _zgp_kPlayStreamNotFound: {
            code: number;
            message: string;
        };
        _zgp_kPlayRetryTimeoutError: {
            code: number;
            message: string;
        };
        _zgp_kPlaySessionClosedError: {
            code: number;
            message: string;
        };
        _zgp_kPlaySessionResetError: {
            code: number;
            message: string;
        };
        _zgp_kPlayNegoTimeoutError: {
            code: number;
            message: string;
        };
        _zgp_kCreateOfferError: {
            code: number;
            message: string;
        };
        _zgp_kSetLocalDescError: {
            code: number;
            message: string;
        };
        _zgp_kSessionRequestError: {
            code: number;
            message: string;
        };
        _zgp_kSessionTimeoutError: {
            code: number;
            message: string;
        };
        _zgp_kSetRemoteDescError: {
            code: number;
            message: string;
        };
        _zgp_kMediaConnectionError: {
            code: number;
            message: string;
        };
        _zgp_kWebsocketDisconnectedError: {
            code: number;
            message: string;
        };
        _zgp_kCandidateError: {
            code: number;
            message: string;
        };
        _zgp_kMediaDescError: {
            code: number;
            message: string;
        };
        _zgp_kIsPlaying: {
            code: number;
            message: string;
        };
        _zgp_kClientIPChangedError: {
            code: number;
            message: string;
        };
        _zgp_kTTLOverTimeError: {
            code: number;
            message: string;
        };
        _zgp_kProbeTimeOutError: {
            code: number;
            message: string;
        };
        _zgp_kPlayNetProbePoor: {
            code: number;
            message: string;
        };
        _zgp_kCancelPlay: {
            code: number;
            message: string;
        };
        _zgp_kMiniSDP: {
            code: number;
            message: string;
        };
        _zgp_kPlayStreamOutLimit: {
            code: number;
            message: string;
        };
        _zgp_kPlayStreamAuthFailed: {
            code: number;
            message: string;
        };
    };
    room_id: (item?: string | undefined) => string | undefined;
    urls: (item: any) => string[];
    is_center: (item: boolean) => boolean;
    server_url: (item?: string | undefined) => string | undefined;
    video_layer: (item?: number | undefined) => number | undefined;
    play_option: (item: any) => any;
    message: (item?: string | undefined) => string | undefined;
    stream_id: (item?: string | undefined) => string | undefined;
    stream_sid: (item?: number | undefined) => number | undefined;
    resource_mode: (item?: number | undefined) => number | undefined;
    src: (item?: string | undefined) => string | undefined;
    video_codec_id: (item?: string | undefined) => string | undefined;
    room_sid_string: (item?: string | undefined) => string | undefined;
    is_multi: (item: boolean) => boolean;
    audio_activate: (item: boolean) => boolean;
    video_activate: (item: boolean) => boolean;
    gw_version: (item?: number | undefined) => number | undefined;
    use_na: (item?: number | undefined) => number | undefined;
    biz_product: (item?: number | undefined) => number | undefined;
};
export declare const kZegoStartPlay: {
    event: string;
    tryidx: (item?: number | undefined) => number | undefined;
    is_peer: (item: boolean) => boolean;
    reason: (item?: string | undefined) => string | undefined;
    url: (item?: string | undefined) => string | undefined;
    ip: (item?: string | undefined) => string | undefined;
    peer_id: (item?: number | undefined) => number | undefined;
    source_type: (item?: string | undefined) => string | undefined;
    net_protocol: (item?: string | undefined) => string | undefined;
    wait_consume: (item?: number | undefined) => number | undefined;
    dispatch_consume: (item?: number | undefined) => number | undefined;
    signal_consume: (item?: number | undefined) => number | undefined;
    is_center: (item: boolean) => boolean;
    biz_product: (item?: number | undefined) => number | undefined;
};
export declare const kZegoRePlay: {
    event: string;
    stream_id: (item?: string | undefined) => string | undefined;
    server_url: (item?: string | undefined) => string | undefined;
    reason_code: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskSDKPlayStream: {
    event: string;
    audio_cumulative_break_time: (item?: number | undefined) => number | undefined;
    audio_cumulative_decode_time: (item?: number | undefined) => number | undefined;
    video_cumulative_break_time: (item?: number | undefined) => number | undefined;
    video_cumulative_decode_time: (item?: number | undefined) => number | undefined;
    l3_a_break_time: (item?: number | undefined) => number | undefined;
    l3_a_decode_time: (item?: number | undefined) => number | undefined;
    l3_v_break_time: (item?: number | undefined) => number | undefined;
    l3_v_decode_time: (item?: number | undefined) => number | undefined;
    rtc_a_break_time: (item?: number | undefined) => number | undefined;
    rtc_a_decode_time: (item?: number | undefined) => number | undefined;
    rtc_v_break_time: (item?: number | undefined) => number | undefined;
    rtc_v_decode_time: (item?: number | undefined) => number | undefined;
    fft_audio: (item?: number | undefined) => number | undefined;
    fft_video: (item?: number | undefined) => number | undefined;
    room_id: (item?: string | undefined) => string | undefined;
    room_sid_string: (item?: string | undefined) => string | undefined;
    retry_btime: (item?: number | undefined) => number | undefined;
    max_retry_interval: (item?: number | undefined) => number | undefined;
    use_na: (item?: number | undefined) => number | undefined;
    fail_cnt: (item?: number | undefined) => number | undefined;
    continuous_fail_cnt: (item?: number | undefined) => number | undefined;
    probe_ip_cnt: (item?: number | undefined) => number | undefined;
    valid_probe_ip_cnt: (item?: number | undefined) => number | undefined;
    poor_quality_retry_cnt: (item?: number | undefined) => number | undefined;
    probe_not_trigger_retry_info: (item: any) => any;
    use_resource_type: (item: any) => string[];
    stop_reason: (item?: string | undefined) => string | undefined;
    child_error: (item?: number | undefined) => number | undefined;
    try_time: (item?: number | undefined) => number | undefined;
    try_cnt: (item?: number | undefined) => number | undefined;
    webrtc_sid: (item?: number | undefined) => number | undefined;
    itemtype: (item?: string | undefined) => string | undefined;
    server_url: (item?: string | undefined) => string | undefined;
    play_begin_time: (item?: number | undefined) => number | undefined;
    play_state_time: (item?: number | undefined) => number | undefined;
    play_state_cnt: (item?: number | undefined) => number | undefined;
    first_frame_time: (item?: number | undefined) => number | undefined;
    protocol: (item?: string | undefined) => string | undefined;
    dispatch_external_ip: (item?: string | undefined) => string | undefined;
    total_stat: (item: any) => any;
    w: (item?: number | undefined) => number | undefined;
    h: (item?: number | undefined) => number | undefined;
    abrc: (item?: number | undefined) => number | undefined;
    vbrc: (item?: number | undefined) => number | undefined;
    vinfo: (item: any) => any;
    total_d: (item?: number | undefined) => number | undefined;
    valid_d: (item?: number | undefined) => number | undefined;
    tempbroken_cnt: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskStreamPlay: {
    event: string;
    tryidx: (item?: number | undefined) => number | undefined;
    url: (item?: string | undefined) => string | undefined;
    ip: (item?: string | undefined) => string | undefined;
    stream_id: (item?: string | undefined) => string | undefined;
    room_id: (item?: string | undefined) => string | undefined;
    room_sid_string: (item?: string | undefined) => string | undefined;
    net_protocol: (item?: string | undefined) => string | undefined;
    lsttime: (item?: number | undefined) => number | undefined;
    denied_info: (item?: string | undefined) => string | undefined;
    stop_reason: (item?: string | undefined) => string | undefined;
    dispatch_external_ip: (item?: string | undefined) => string | undefined;
    env: (item?: number | undefined) => number | undefined;
    resource_type: (item?: string | undefined) => string | undefined;
    protocol: (item?: string | undefined) => string | undefined;
    total_stat: (item: any) => any;
    vinfo: (item: any) => any;
    try_time: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskRePlay: {
    event: string;
    stream_id: (item?: string | undefined) => string | undefined;
    server_url: (item?: string | undefined) => string | undefined;
    reason_code: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskPlayStop: {
    event: string;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
    };
    room_id: (item?: string | undefined) => string | undefined;
    stream_id: (item?: string | undefined) => string | undefined;
    webrtc_sid: (item?: number | undefined) => number | undefined;
    stream_sid: (item?: number | undefined) => number | undefined;
    biz_product: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskPlayStreamStateError: {
    event: string;
};
export declare const kZegoTaskEnumDevices: {
    event: string;
    error: {
        _zgp_kBrowserNotSupportError: {
            code: number;
            message: string;
        };
        _zgp_kEnumDevicesError: {
            code: number;
            message: string;
        };
    };
    dev_list: (item: any) => any;
    dev_kind: (item?: string | undefined) => string | undefined;
};
export declare const kZegoAudioDeviceChanged: {
    event: string;
    error: {
        _zgp_kBrowserNotSupportError: {
            code: number;
            message: string;
        };
        _zgp_kEnumDevicesError: {
            code: number;
            message: string;
        };
    };
    interrupt: (item?: number | undefined) => number | undefined;
    device: (item?: string | undefined) => string | undefined;
    device_name: (item?: string | undefined) => string | undefined;
};
export declare const kZegoVideoDeviceChanged: {
    event: string;
    error: {
        _zgp_kBrowserNotSupportError: {
            code: number;
            message: string;
        };
        _zgp_kEnumDevicesError: {
            code: number;
            message: string;
        };
    };
    interrupt: (item?: number | undefined) => number | undefined;
    device: (item?: string | undefined) => string | undefined;
    device_name: (item?: string | undefined) => string | undefined;
};
export declare const kZegoTaskDeviceInterrupt: {
    event: string;
    error: {
        _zgp_kBrowserNotSupportError: {
            code: number;
            message: string;
        };
        _zgp_kEnumDevicesError: {
            code: number;
            message: string;
        };
    };
    interrupt: (item?: number | undefined) => number | undefined;
    device: (item?: string | undefined) => string | undefined;
    device_name: (item?: string | undefined) => string | undefined;
};
export declare const kZegoTaskCheckSystemRequirements: {
    event: string;
    capability: (item: any) => any;
};
export declare const kZegoTaskRemoteCameraUpdate: {
    event: string;
    stream_id: (item?: string | undefined) => string | undefined;
    camera_status: (item?: string | undefined) => string | undefined;
    status_code: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskRemoteMicUpdate: {
    event: string;
    stream_id: (item?: string | undefined) => string | undefined;
    mic_status: (item?: string | undefined) => string | undefined;
    status_code: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskDestroyStream: {
    event: string;
    error: {
        _zgp_kLocalStreamError: {
            code: number;
            message: string;
        };
    };
    stop_reason: (item?: string | undefined) => string | undefined;
};
export declare const kZegoTaskAudioOutputChanged: {
    event: string;
    device: (item?: string | undefined) => string | undefined;
    device_name: (item?: string | undefined) => string | undefined;
    reason_type: (item?: string | undefined) => string | undefined;
};
export declare const kZegoTaskLiveRoomRecvStreamUpdateInfo: {
    event: string;
    stream_update_type: (item?: string | undefined) => string | undefined;
    stream_seq: (item?: number | undefined) => number | undefined;
    stream_list: (item: any) => any;
    error: {
        _zgp_kRoomNotExist: {
            code: number;
            msg: string;
        };
    };
};
export declare const kZegoTaskLiveRoomSendStreamUpdateInfo: {
    event: string;
    stream_update_type: (item?: string | undefined) => string | undefined;
    stream_extra_info: (item?: string | undefined) => string | undefined;
    stream_id: (item?: string | undefined) => string | undefined;
    svr_env: (item?: string | undefined) => string | undefined;
    send_seq: (item?: number | undefined) => number | undefined;
    use_na: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskLiveRoomGetCurrentStreamList: {
    event: string;
    room_id: (item?: string | undefined) => string | undefined;
    room_sid_string: (item?: string | undefined) => string | undefined;
    stream_seq: (item?: number | undefined) => number | undefined;
    stream_size: (item?: number | undefined) => number | undefined;
    stream_list: (item: any) => any;
    use_ua: (item?: number | undefined) => number | undefined;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
        NOT_LOGIN: {
            code: number;
            message: string;
        };
    };
};
export declare const kZegoTaskLiveRoomGetStreamExtraInfo: {
    event: string;
    update_stream: (item: any) => any;
};
export declare const kZegoTaskPlayNetFirstVideoFrame: {
    event: string;
    webrtc_sid: (item?: number | undefined) => number | undefined;
    fft_consumed: (item: any) => any;
    resource_type: (item?: string | undefined) => string | undefined;
    reliability: (item?: number | undefined) => number | undefined;
    push_consumed: (item?: number | undefined) => number | undefined;
    prepare_recv_consumed: (item?: number | undefined) => number | undefined;
    connected_consumed: (item?: number | undefined) => number | undefined;
    protocol: (item?: string | undefined) => string | undefined;
    biz_product: (item?: number | undefined) => number | undefined;
    dev_changed: (item: boolean) => boolean;
};
export declare const kZegoTaskPlayNetFirstAudioFrame: {
    event: string;
    webrtc_sid: (item?: number | undefined) => number | undefined;
    fft_consumed: (item: any) => any;
    resource_type: (item?: string | undefined) => string | undefined;
    reliability: (item?: number | undefined) => number | undefined;
    push_consumed: (item?: number | undefined) => number | undefined;
    prepare_recv_consumed: (item?: number | undefined) => number | undefined;
    connected_consumed: (item?: number | undefined) => number | undefined;
    protocol: (item?: string | undefined) => string | undefined;
    biz_product: (item?: number | undefined) => number | undefined;
    dev_changed: (item: boolean) => boolean;
};
export declare const kZegoAppLifeCycle: {
    event: string;
    state: (item?: string | undefined) => string | undefined;
};
export declare const kZegoSetCaptureVolume: {
    event: string;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
    };
};
export declare const kZegoListener: {
    event: string;
};
export declare const kZegoNetProbe: {
    event: string;
    net_quality: (item?: number | undefined) => number | undefined;
    node_list: (item: any) => string[];
};
export declare const kZegoNetProbeResult: {
    event: string;
    is_switch: (item: boolean) => boolean;
    is_publish: (item: boolean) => boolean;
    stream_id: (item?: string | undefined) => string | undefined;
    result: (item?: number | undefined) => number | undefined;
    node: (item?: string | undefined) => string | undefined;
    net_quality: (item?: number | undefined) => number | undefined;
    probe_net_quality: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskCloudSettingCache: {
    event: string;
    files: (item: any) => any;
};
export declare const kZegoTaskCloudSettingRefresh: {
    event: string;
};
export declare const kZegoTaskCDNPlay: {
    event: string;
    protocol: (item?: string | undefined) => string | undefined;
    tryidx: (item?: number | undefined) => number | undefined;
    url: (item?: string | undefined) => string | undefined;
    stop_reason: (item?: string | undefined) => string | undefined;
    biz_product: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskL3Play: {
    event: string;
    protocol: (item?: string | undefined) => string | undefined;
    tryidx: (item?: number | undefined) => number | undefined;
    url: (item?: string | undefined) => string | undefined;
    stop_reason: (item?: string | undefined) => string | undefined;
    biz_product: (item?: number | undefined) => number | undefined;
    try_time: (item?: number | undefined) => number | undefined;
};
export declare const kZegoTaskSrcChange: {
    event: string;
    last_src: (item?: string | undefined) => string | undefined;
    src: (item?: string | undefined) => string | undefined;
    biz_product: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPublishStreamResource: {
    event: string;
    urls: (item: any) => string[];
    try_cnt: (item?: number | undefined) => number | undefined;
    is_center: (item: boolean) => boolean;
};
export declare const kZegoPublishServerConnect: {
    event: string;
    server_url: (item?: string | undefined) => string | undefined;
    stream_type: (item?: string | undefined) => string | undefined;
};
export declare const kZegoPublishCreateOffer: {
    event: string;
    sdp: (item?: string | undefined) => string | undefined;
    stream_type: (item?: string | undefined) => string | undefined;
    is_mini: (item: boolean) => boolean;
    is_dual_stream: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPublishSetLocalSdp: {
    event: string;
    sdp: (item?: string | undefined) => string | undefined;
    stream_type: (item?: string | undefined) => string | undefined;
    is_mini: (item: boolean) => boolean;
    is_dual_stream: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPublishCreateSession: {
    event: string;
    sdp: (item?: string | undefined) => string | undefined;
    is_mini: (item: boolean) => boolean;
    gw_nodes: (item: any) => string[];
    gw_nodes_ttl: (item?: number | undefined) => number | undefined;
    gw_version: (item?: number | undefined) => number | undefined;
    webrtc_sid: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPublishSetRemoteSdp: {
    event: string;
    sdp: (item?: string | undefined) => string | undefined;
    is_mini: (item: boolean) => boolean;
    webrtc_sid: (item?: number | undefined) => number | undefined;
    is_dual_stream: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPublishIceConnected: {
    event: string;
    webrtc_sid: (item?: number | undefined) => number | undefined;
};
export declare const kZegoRTCPublishEvent: {
    event: string;
    event_state: (item?: number | undefined) => number | undefined;
    webrtc_sid: (item?: number | undefined) => number | undefined;
};
export declare const kZegoRTCPlayEvent: {
    event: string;
    event_state: (item?: number | undefined) => number | undefined;
    webrtc_sid: (item?: number | undefined) => number | undefined;
};
export declare const kZegoRTCRecvCloseSession: {
    event: string;
    err_info: (item: any) => any;
};
export declare const kZegoRTCRecvResetSession: {
    event: string;
};
export declare const kZegoRTCIceStateChanged: {
    event: string;
    ice_state: (item?: string | undefined) => string | undefined;
};
export declare const kZegoPublishSendMediaDesc: {
    event: string;
    webrtc_sid: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPublishRecvMediaDesc: {
    event: string;
    sdp: (item?: string | undefined) => string | undefined;
    is_mini: (item: boolean) => boolean;
};
export declare const kZegoPublishSendIceCandidate: {
    event: string;
    candidate_info: (item: any) => any;
};
export declare const kZegoPublishRecvIceCandidate: {
    event: string;
    candidate_info: (item: any) => any;
};
export declare const kZegoRTCHB: {
    event: string;
    error: {
        RTC_HB_ERROR: {
            code: number;
            message: string;
        };
    };
};
export declare const kZCRecvRemoteStream: {
    event: string;
};
export declare const kZegoPlayStreamResource: {
    event: string;
    urls: (item: any) => string[];
    try_cnt: (item?: number | undefined) => number | undefined;
    is_center: (item: boolean) => boolean;
};
export declare const kZegoPlayServerConnect: {
    event: string;
    server_url: (item?: string | undefined) => string | undefined;
    stream_type: (item?: string | undefined) => string | undefined;
};
export declare const kZegoPlayCreateOffer: {
    event: string;
    sdp: (item?: string | undefined) => string | undefined;
    is_mini: (item: boolean) => boolean;
    stream_type: (item?: string | undefined) => string | undefined;
};
export declare const kZegoPlaySetLocalSdp: {
    event: string;
    sdp: (item?: string | undefined) => string | undefined;
    is_mini: (item: boolean) => boolean;
    stream_type: (item?: string | undefined) => string | undefined;
};
export declare const kZegoPlayCreateSession: {
    event: string;
    sdp: (item?: string | undefined) => string | undefined;
    is_mini: (item: boolean) => boolean;
    gw_nodes: (item: any) => string[];
    gw_nodes_ttl: (item?: number | undefined) => number | undefined;
    gw_version: (item?: number | undefined) => number | undefined;
    webrtc_sid: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPlaySetRemoteSdp: {
    event: string;
    sdp: (item?: string | undefined) => string | undefined;
    is_mini: (item: boolean) => boolean;
    webrtc_sid: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPlayIceConnected: {
    event: string;
    webrtc_sid: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPlaySendMediaDesc: {
    event: string;
    webrtc_sid: (item?: number | undefined) => number | undefined;
};
export declare const kZegoPlayRecvMediaDesc: {
    event: string;
    sdp: (item?: string | undefined) => string | undefined;
    is_mini: (item: boolean) => boolean;
};
export declare const kZegoPlaySendIceCandidate: {
    event: string;
    candidate_info: (item: any) => any;
};
export declare const kZegoPlayRecvIceCandidate: {
    event: string;
    candidate_info: (item: any) => any;
};
export declare const kZegoConnConnect: {
    event: string;
};
export declare const kZegoSDKProxyConnect: {
    event: string;
    service_no: (item?: number | undefined) => number | undefined;
    proxy_link_sources: (item?: number | undefined) => number | undefined;
    recv_time: (item?: number | undefined) => number | undefined;
    connect_stream: (item?: number | undefined) => number | undefined;
};
export declare const kZegoSDKProxyBroken: {
    event: string;
    service_no: (item?: number | undefined) => number | undefined;
};
export declare const kZegoSDKProxyDisconnect: {
    event: string;
    service_no: (item?: number | undefined) => number | undefined;
};
export declare const kZegoExceptionUpdate: {
    event: string;
    stream: (item?: string | undefined) => string | undefined;
    code: (item?: number | undefined) => number | undefined;
    message: (item?: string | undefined) => string | undefined;
};
export declare const kZegoTaskPublishTarget: {
    event: string;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
        _zgp_kPublishStreamNoFoundError: {
            code: number;
            message: string;
        };
        _zgp_kNoLoginError: {
            code: number;
            message: string;
        };
        _zgp_kNoResponseError: {
            code: number;
            message: string;
        };
        _zgp_kBizChannelError: {
            code: number;
            message: string;
        };
        _zgp_kInvalidChannelError: {
            code: number;
            message: string;
        };
        _zgp_kUnknownServerError: {
            code: number;
            message: string;
        };
    };
};
export declare const kZegoTaskAddPublishCdnUrl: {
    event: string;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
    };
    stream_id: (item?: string | undefined) => string | undefined;
    url: (item?: string | undefined) => string | undefined;
};
export declare const kZegoTaskRemovePublishCdnUrl: {
    event: string;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
    };
    stream_id: (item?: string | undefined) => string | undefined;
    url: (item?: string | undefined) => string | undefined;
};
export declare const kZegoTaskClearPublishCdnUrl: {
    event: string;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
    };
};
export declare const kZegoTaskLiveRoomSendStreamExtraInfo: {
    event: string;
    error: {
        _zgp_kParamError: {
            code: number;
            message: string;
        };
        _zgp_kExtraInfoNullError: {
            code: number;
            message: string;
        };
        _zgp_kNoLoginError: {
            code: number;
            message: string;
        };
        _zgp_kPublishStreamNoFoundError: {
            code: number;
            message: string;
        };
        _zgp_kUpdateStreamInfoFailError: {
            code: number;
            message: string;
        };
    };
    stream_id: (item?: string | undefined) => string | undefined;
    stream_extra_info: (item?: string | undefined) => string | undefined;
    room_sid_string: (item?: string | undefined) => string | undefined;
    room_id: (item?: string | undefined) => string | undefined;
    send_seq: (item?: number | undefined) => number | undefined;
};
