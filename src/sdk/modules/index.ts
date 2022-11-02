import { generateStreamID, getConfig, changeCDNUrlOrigin } from "./tools/util";
import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import {
  ZegoDeviceInfo,
  ZegoLocalStreamConfig,
  ZegoPlayerState,
  ZegoPublisherState,
  ZegoPublishStats,
  ZegoPublishStreamConfig,
  ZegoServerResponse,
  ZegoSoundLevelInfo,
  ZegoStreamList,
} from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";

import {
  ZegoBroadcastMessageInfo,
  ZegoRoomExtraInfo,
} from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import {
  LiveRole,
  LiveStreamingMode,
  ScenarioModel,
  VideoResolution,
  ZegoCloudRemoteMedia,
  ZegoCloudRoomConfig,
  ZegoUser,
} from "../model";
import {
  ZegoCloudUserList,
  ZegoCloudUserListManager,
} from "./tools/UserListManager";

export class ZegoCloudRTCCore {
  static _instance: ZegoCloudRTCCore;
  static _zg: ZegoExpressEngine;
  zum!: ZegoCloudUserListManager;
  _expressConfig!: {
    appID: number;
    userID: string;
    userName: string;
    roomID: string;
    token: string;
    avatar?: string;
  };
  status: {
    loginRsp: boolean;
    videoRefuse: boolean;
    audioRefuse: boolean;
    micDeviceID?: string;
    cameraDeviceID?: string;
    speakerDeviceID?: string;
    videoResolution?: string;
  } = {
    loginRsp: false,
    videoRefuse: false,
    audioRefuse: false,
  };
  remoteStreamMap: { [index: string]: ZegoCloudRemoteMedia } = {};
  waitingHandlerStreams: {
    add: ZegoStreamList[];
    delete: ZegoStreamList[];
  } = { add: [], delete: [] };

  _config: ZegoCloudRoomConfig = {
    // @ts-ignore
    container: undefined, // 挂载容器
    preJoinViewConfig: {
      title: "Join Room", // 标题设置，默认join Room
      invitationLink: window.location.href, // 邀请链接，空则不显示，默认空
    },
    showPreJoinView: true, // 是否显示预览检测页面，默认显示

    turnOnMicrophoneWhenJoining: true, // 是否开启自己的麦克风,默认开启
    turnOnCameraWhenJoining: true, // 是否开启自己的摄像头 ,默认开启
    showMyCameraToggleButton: true, // 是否可以控制自己的麦克风,默认开启
    showMyMicrophoneToggleButton: true, // 是否可以控制体自己的摄像头,默认开启
    showAudioVideoSettingsButton: true,

    showTextChat: true, // 是否开启聊天，默认开启   preJoinViewConfig: boolean，// 通话前检测页面是否需要，默认需要
    showUserList: true, //是否显示成员列表，默认展示
    lowerLeftNotification: {
      showUserJoinAndLeave: true, //是否显示成员进出，默认显示
      showTextChat: true, // 是否显示未读消息，默认显示
    },
    branding: {
      logoURL: "",
    },

    showLeavingView: true, // 离开房间后页面，默认有

    maxUsers: 2, // 房间人数2～20，默认2
    layout: "Auto", // 默认Default

    showNonVideoUser: true, // 是否显示无视频用户，默认显示
    showOnlyAudioUser: false, // 是否显示纯音频用户，默认显示

    useFrontFacingCamera: true,

    onJoinRoom: () => {},
    onLeaveRoom: () => {},
    onUserJoin: (user: ZegoUser[]) => {}, // 用户进入回调
    onUserLeave: (user: ZegoUser[]) => {}, // 用户退入回调
    onCanSetUserAvatar: (user: ZegoUser[]) => {}, // 用户可以设置头像时机回调
    sharedLinks: [], // 产品链接描述
    showScreenSharingButton: true, // 是否显示屏幕共享按钮
    scenario: {
      mode: ScenarioModel.OneONoneCall, // 场景选择
      config: { role: LiveRole.Host }, // 对应场景专有配置
    },

    facingMode: "user",
    joinRoomCallback: () => {}, // 点击加入房间触发
    leaveRoomCallback: () => {}, // 退出房间回调
    userUpdateCallback: () => {},
    showLayoutButton: true, // 是否显示布局切换按钮
    showPinButton: true, // 是否显pin按钮
    videoResolutionList: [], //视频分辨率可选列表
  };
  _currentPage: "BrowserCheckPage" | "Room" | "RejoinRoom" = "BrowserCheckPage";
  extraInfoKey = "extra_info";
  _roomExtraInfo: { [index: string]: any } = {
    live_status: {
      v: 0,
      u: "xxx",
      r: 0,
    },
  };
  NetworkStatusTimer: NodeJS.Timer | null = null;
  //   static _soundMeter: SoundMeter;
  static getInstance(token: string): ZegoCloudRTCCore {
    const config = getConfig(token);
    if (!ZegoCloudRTCCore._instance && config) {
      ZegoCloudRTCCore._instance = new ZegoCloudRTCCore();
      ZegoCloudRTCCore._instance._expressConfig = config;
      //   ZegoCloudRTCCore._soundMeter = new SoundMeter();
      ZegoCloudRTCCore._zg = new ZegoExpressEngine(
        ZegoCloudRTCCore._instance._expressConfig.appID,
        "wss://webliveroom" +
          ZegoCloudRTCCore._instance._expressConfig.appID +
          "-api.zegocloud.com/ws"
      );
      ZegoCloudRTCCore._instance.zum = new ZegoCloudUserListManager(
        ZegoCloudRTCCore._zg
      );
    }

    return ZegoCloudRTCCore._instance;
  }
  setConfig(config: ZegoCloudRoomConfig): boolean {
    if (
      config.scenario &&
      config.scenario.mode === ScenarioModel.LiveStreaming
    ) {
      if (config.showNonVideoUser === true) {
        console.error(
          "【ZEGOCLOUD】 showNonVideoUser have be false scenario.mode is LiveStreaming!!"
        );
        return false;
      }
      config.showNonVideoUser = false;
      config.showOnlyAudioUser = true;
      if (
        config.scenario.config &&
        config.scenario.config.role === LiveRole.Host
      ) {
        if (
          config.turnOnMicrophoneWhenJoining === false &&
          config.turnOnCameraWhenJoining === false &&
          config.showMyCameraToggleButton === false &&
          config.showAudioVideoSettingsButton === false
        ) {
          console.error(
            "【ZEGOCLOUD】 Host could turn on at least one of the camera and the microphone!!"
          );
          return false;
        }
      } else if (
        config.scenario.config &&
        config.scenario.config.role === LiveRole.Audience
      ) {
        if (
          config.turnOnMicrophoneWhenJoining === true ||
          config.turnOnCameraWhenJoining === true ||
          config.showMyCameraToggleButton === true ||
          config.showMyMicrophoneToggleButton === true ||
          config.showAudioVideoSettingsButton === true ||
          config.showScreenSharingButton === true ||
          config.useFrontFacingCamera === true ||
          (!!config.layout && config.layout !== "Grid")
        ) {
          console.error(
            "【ZEGOCLOUD】 Audience cannot configure camera and microphone related params"
          );
          return false;
        }
      }

      if (!config.maxUsers) {
        config.maxUsers = 5000;
      }

      if (
        config.scenario.config &&
        config.scenario.config.role === LiveRole.Audience
      ) {
        config.turnOnMicrophoneWhenJoining = false;
        config.turnOnCameraWhenJoining = false;
        config.showMyCameraToggleButton = false;
        config.showMyMicrophoneToggleButton = false;
        config.showAudioVideoSettingsButton = false;
        config.showScreenSharingButton = false;
        config.useFrontFacingCamera = false;
        config.useFrontFacingCamera = false;
        config.showUserList =
          config.showUserList === undefined ? false : config.showUserList;
        config.showPinButton = false;
        config.showLayoutButton = false;
        config.layout = "Grid";
        config.lowerLeftNotification = {
          showTextChat: false,
          showUserJoinAndLeave: false,
        };
      }
    }

    if (
      config.scenario &&
      config.scenario.mode === ScenarioModel.OneONoneCall
    ) {
      if (!config.maxUsers) {
        config.maxUsers = 2;
      }
      config.showLayoutButton = false;
      config.showPinButton = false;
    }

    if (config.scenario && config.scenario.mode === ScenarioModel.GroupCall) {
      if (!config.maxUsers) {
        config.maxUsers = 50;
      }
    }

    config.facingMode &&
      (config.useFrontFacingCamera = config.facingMode === "user");
    config.joinRoomCallback && (config.onJoinRoom = config.joinRoomCallback);
    config.leaveRoomCallback && (config.onLeaveRoom = config.leaveRoomCallback);
    if (config.userUpdateCallback) {
      config.onUserJoin = (users: ZegoUser[]) => {
        config.userUpdateCallback && config.userUpdateCallback("ADD", users);
      };

      config.onUserLeave = (users: ZegoUser[]) => {
        config.userUpdateCallback && config.userUpdateCallback("DELETE", users);
      };
    }

    if (config.preJoinViewConfig && config.preJoinViewConfig.invitationLink) {
      config.sharedLinks = [
        {
          name: "Share the link",
          url: config.preJoinViewConfig.invitationLink,
        },
      ];
    }
    if (config.videoResolutionList && config.videoResolutionList.length > 0) {
      config.videoResolutionList = config.videoResolutionList.filter(
        (s: string) => {
          //@ts-ignore
          return VideoResolution[s.toUpperCase()] !== undefined;
        }
      );
    } else {
      config.videoResolutionList = [VideoResolution["360P"]];
    }
    config.preJoinViewConfig &&
      (config.preJoinViewConfig = {
        ...this._config.preJoinViewConfig,
        ...config.preJoinViewConfig,
      });
    config.scenario &&
      config.scenario.config &&
      (config.scenario.config = {
        ...this._config.scenario?.config,
        ...config.scenario.config,
      });

    this._config = { ...this._config, ...config };
    this.zum.scenario =
      this._config.scenario?.mode || ScenarioModel.OneONoneCall;
    this.zum.role = this._config.scenario?.config?.role || LiveRole.Host;
    this.zum.showOnlyAudioUser = !!this._config.showOnlyAudioUser;
    this.zum.setShowNonVideo(!!this._config.showNonVideoUser);
    return true;
  }
  async checkWebRTC(): Promise<boolean> {
    const webRTC = await ZegoCloudRTCCore._zg.checkSystemRequirements("webRTC");
    const H264 = await ZegoCloudRTCCore._zg.checkSystemRequirements("H264");

    return !!webRTC.result && !!H264.result;
  }
  setPin(userID?: string, pined?: boolean, stopUpdateUser?: boolean): void {
    this.zum.setPin(userID, pined);
    if (!stopUpdateUser) {
      this.subscribeUserListCallBack &&
        this.subscribeUserListCallBack([...this.zum.remoteUserList]);
    }
  }

  async setMaxScreenNum(num: number, stopUpdateUser?: boolean) {
    await this.zum.setMaxScreenNum(num);
    if (!stopUpdateUser) {
      this.subscribeUserListCallBack &&
        this.subscribeUserListCallBack([...this.zum.remoteUserList]);
    }
  }

  async setSidebarLayOut(enable: boolean, stopUpdateUser?: boolean) {
    await this.zum.setSidebarLayOut(enable);
    if (!stopUpdateUser) {
      this.subscribeUserListCallBack &&
        this.subscribeUserListCallBack([...this.zum.remoteUserList]);
    }
  }

  async setShowNonVideo(enable: boolean) {
    await this.zum.setShowNonVideo(enable);
    this.subscribeUserListCallBack &&
      this.subscribeUserListCallBack([...this.zum.remoteUserList]);
  }

  setCurrentPage(page: "BrowserCheckPage" | "Room" | "RejoinRoom") {
    this._currentPage = page;
  }

  getCameras(): Promise<ZegoDeviceInfo[]> {
    return ZegoCloudRTCCore._zg.getCameras();
  }

  useVideoDevice(
    localStream: MediaStream,
    deviceID: string
  ): Promise<ZegoServerResponse> {
    return ZegoCloudRTCCore._zg.useVideoDevice(localStream, deviceID);
  }

  getMicrophones(): Promise<ZegoDeviceInfo[]> {
    return ZegoCloudRTCCore._zg.getMicrophones();
  }
  getSpeakers(): Promise<ZegoDeviceInfo[]> {
    return ZegoCloudRTCCore._zg.getSpeakers();
  }

  setVolume(media: HTMLVideoElement, volume: number): void {
    media.volume = volume;
  }

  async createStream(source?: ZegoLocalStreamConfig): Promise<MediaStream> {
    return ZegoCloudRTCCore._zg.createStream(source);
  }

  async setVideoConfig(
    media: MediaStream,
    constraints: ZegoPublishStreamConfig
  ) {
    return ZegoCloudRTCCore._zg.setVideoConfig(media, constraints);
  }
  stopPublishingStream(streamID: string): boolean {
    return ZegoCloudRTCCore._zg.stopPublishingStream(streamID);
  }
  destroyStream(stream: MediaStream): void {
    ZegoCloudRTCCore._zg.destroyStream(stream);
  }

  useCameraDevice(
    media: MediaStream,
    deviceID: string
  ): Promise<ZegoServerResponse> {
    return ZegoCloudRTCCore._zg.useVideoDevice(media, deviceID);
  }

  useMicrophoneDevice(
    media: MediaStream,
    deviceID: string
  ): Promise<ZegoServerResponse> {
    return ZegoCloudRTCCore._zg.useAudioDevice(media, deviceID);
  }

  async useSpeakerDevice(
    media: HTMLMediaElement,
    deviceID: string
  ): Promise<ZegoServerResponse> {
    if (!media.srcObject) {
      return Promise.resolve({ errorCode: -1 });
    }

    try {
      const res = await ZegoCloudRTCCore._zg.useAudioOutputDevice(
        media,
        deviceID
      );
      return { errorCode: res ? 0 : -1 };
    } catch (error) {
      return { errorCode: -1 };
    }
  }

  async enableVideoCaptureDevice(
    localStream: MediaStream,
    enable: boolean
  ): Promise<boolean> {
    return ZegoCloudRTCCore._zg.enableVideoCaptureDevice(localStream, enable);
  }

  async mutePublishStreamVideo(
    localStream: MediaStream,
    enable: boolean
  ): Promise<boolean> {
    return ZegoCloudRTCCore._zg.mutePublishStreamVideo(localStream, enable);
  }
  async mutePublishStreamAudio(
    localStream: MediaStream,
    enable: boolean
  ): Promise<boolean> {
    return ZegoCloudRTCCore._zg.mutePublishStreamAudio(localStream, enable);
  }
  async muteMicrophone(enable: boolean): Promise<boolean> {
    return ZegoCloudRTCCore._zg.muteMicrophone(enable);
  }

  set roomExtraInfo(value: { [index: string]: any }) {
    if (this._currentPage === "Room") {
      this._roomExtraInfo = value;
      this.zum.setLiveStates(this._roomExtraInfo.live_status.v);
      // console.error(
      //   "【ZEGOCLOUD】roomExtraInfo choui",
      //   value,
      //   this.onRoomLiveStateUpdateCallBack
      // );
      this.onRoomLiveStateUpdateCallBack &&
        this.onRoomLiveStateUpdateCallBack(this._roomExtraInfo.live_status.v);
    } else if (
      this._currentPage === "BrowserCheckPage" ||
      this._currentPage === "RejoinRoom"
    ) {
      setTimeout(() => {
        this.roomExtraInfo = value;
      }, 1000);
    }
  }
  get roomExtraInfo() {
    return this._roomExtraInfo;
  }
  async setLive(status: "live" | "stop"): Promise<boolean> {
    const setRoomExtraInfo = {
      ...this._roomExtraInfo,
      ...{
        live_status: {
          v: status === "live" ? 1 : 0,
          u: ZegoCloudRTCCore._instance._expressConfig.userID,
          r:
            ZegoCloudRTCCore._instance._config.scenario?.config?.role ===
            LiveRole.Host
              ? 1
              : ZegoCloudRTCCore._instance._config.scenario?.config?.role ===
                LiveRole.Audience
              ? 2
              : 3,
        },
      },
    };
    const res = await ZegoCloudRTCCore._zg.setRoomExtraInfo(
      ZegoCloudRTCCore._instance._expressConfig.roomID,
      "extra_info",
      JSON.stringify(setRoomExtraInfo)
    );
    res.errorCode === 0 && (this.roomExtraInfo = setRoomExtraInfo);
    return res.errorCode === 0;
  }

  async enterRoom(): Promise<number> {
    // 已经登陆过不再登录
    if (this.status.loginRsp) return Promise.resolve(0);
    ZegoCloudRTCCore._zg.off("roomExtraInfoUpdate");
    ZegoCloudRTCCore._zg.off("roomStreamUpdate");
    ZegoCloudRTCCore._zg.off("remoteCameraStatusUpdate");
    ZegoCloudRTCCore._zg.off("remoteMicStatusUpdate");
    ZegoCloudRTCCore._zg.off("playerStateUpdate");
    ZegoCloudRTCCore._zg.off("roomUserUpdate");
    ZegoCloudRTCCore._zg.off("IMRecvBroadcastMessage");
    ZegoCloudRTCCore._zg.off("roomStateUpdate");
    ZegoCloudRTCCore._zg.off("publisherStateUpdate");
    ZegoCloudRTCCore._zg.off("publishQualityUpdate");
    ZegoCloudRTCCore._zg.off("soundLevelUpdate");
    ZegoCloudRTCCore._zg.on(
      "roomStreamUpdate",
      async (
        roomID: string,
        updateType: "DELETE" | "ADD",
        streamList: ZegoStreamList[],
        extendedData?: string
      ) => {
        if (updateType === "ADD") {
          this.waitingHandlerStreams.add = [
            ...this.waitingHandlerStreams.add,
            ...streamList,
          ];

          this.waitingHandlerStreams.delete =
            this.waitingHandlerStreams.delete.filter((stream) => {
              if (
                streamList.some(
                  (add_stream) => add_stream.streamID === stream.streamID
                )
              ) {
                return false;
              } else {
                return true;
              }
            });
        } else {
          // 找出删除流中，和之前的新增流重叠的，存储这个下面对象中
          let willDelete: string[] = [];

          // 新增流中，删除下线的流
          this.waitingHandlerStreams.add =
            this.waitingHandlerStreams.add.filter((stream) => {
              if (
                streamList.some((delete_stream) => {
                  if (delete_stream.streamID === stream.streamID) {
                    willDelete.push(delete_stream.streamID);
                    return true;
                  } else {
                    return false;
                  }
                })
              ) {
                return false;
              } else {
                return true;
              }
            });

          // 删除流中，去除上次要新增的
          streamList = streamList.filter((s) => {
            if (willDelete.some((wd) => wd == s.streamID)) {
              return false;
            } else {
              return true;
            }
          });

          this.waitingHandlerStreams.delete = [
            ...this.waitingHandlerStreams.delete,
            ...streamList,
          ];
        }
        console.error("roomStreamUpdate", this.waitingHandlerStreams);
      }
    );
    ZegoCloudRTCCore._zg.on(
      "roomExtraInfoUpdate",
      (roomID: string, roomExtraInfoList: ZegoRoomExtraInfo[]) => {
        roomExtraInfoList.forEach((info) => {
          if (info.key === this.extraInfoKey) {
            this.roomExtraInfo = JSON.parse(info.value);
          }
        });
      }
    );
    ZegoCloudRTCCore._zg.on(
      "remoteCameraStatusUpdate",
      (streamID: string, status: "OPEN" | "MUTE") => {
        if (this.remoteStreamMap[streamID]) {
          this.remoteStreamMap[streamID].cameraStatus = status;
          this.onRemoteMediaUpdateCallBack &&
            this.onRemoteMediaUpdateCallBack("UPDATE", [
              this.remoteStreamMap[streamID],
            ]);
        }
      }
    );
    ZegoCloudRTCCore._zg.on(
      "remoteMicStatusUpdate",
      (streamID: string, status: "OPEN" | "MUTE") => {
        if (this.remoteStreamMap[streamID]) {
          this.remoteStreamMap[streamID].micStatus = status;
          this.onRemoteMediaUpdateCallBack &&
            this.onRemoteMediaUpdateCallBack("UPDATE", [
              this.remoteStreamMap[streamID],
            ]);
        }
      }
    );
    ZegoCloudRTCCore._zg.on(
      "playerStateUpdate",
      (streamInfo: ZegoPlayerState) => {
        console.warn("【ZEGOCLOUD】", streamInfo);
        if (this.remoteStreamMap[streamInfo.streamID]) {
          this.remoteStreamMap[streamInfo.streamID].state = streamInfo.state;
          this.onRemoteMediaUpdateCallBack &&
            this.onRemoteMediaUpdateCallBack("UPDATE", [
              this.remoteStreamMap[streamInfo.streamID],
            ]);
        }
      }
    );
    ZegoCloudRTCCore._zg.on(
      "roomUserUpdate",
      (roomID: string, updateType: "DELETE" | "ADD", userList: ZegoUser[]) => {
        console.warn("【ZEGOCLOUD】roomUserUpdate", updateType, userList);
        this.onRemoteUserUpdateCallBack &&
          this.onRemoteUserUpdateCallBack(roomID, updateType, userList);
        setTimeout(() => {
          const newUserList = userList.map((user) => {
            user.setUserAvatar = (avatar: string) => {
              if (avatar && typeof avatar === "string") {
                this.zum.updateUserInfo(user.userID, "avatar", avatar);
              }
            };
            return user;
          });
          if (updateType === "ADD") {
            this._config.onCanSetUserAvatar &&
              this._config.onCanSetUserAvatar(newUserList);
            this._config.onUserJoin && this._config.onUserJoin(userList);
          } else {
            this._config.onUserLeave && this._config.onUserLeave(userList);
          }
        }, 0);
      }
    );
    ZegoCloudRTCCore._zg.on(
      "IMRecvBroadcastMessage",
      (roomID: string, chatData: ZegoBroadcastMessageInfo[]) => {
        this.onRoomMessageUpdateCallBack &&
          this.onRoomMessageUpdateCallBack(roomID, chatData);
      }
    );

    ZegoCloudRTCCore._zg.on(
      "publisherStateUpdate",
      (streamInfo: ZegoPublisherState) => {
        let state: "DISCONNECTED" | "CONNECTING" | "CONNECTED" = "DISCONNECTED";
        if (streamInfo.state === "PUBLISHING") {
          state = "CONNECTED";
        } else if (streamInfo.state === "NO_PUBLISH") {
          state = "DISCONNECTED";
        } else if (streamInfo.state === "PUBLISH_REQUESTING") {
          state = "CONNECTING";
        }
        this.onNetworkStatusCallBack &&
          this.onNetworkStatusCallBack(
            ZegoCloudRTCCore._instance._expressConfig.roomID,
            "STREAM",
            state
          );
      }
    );

    ZegoCloudRTCCore._zg.on(
      "playQualityUpdate",
      (streamID: string, stats: ZegoPublishStats) => {
        this.onNetworkStatusQualityCallBack &&
          this.onNetworkStatusQualityCallBack(
            streamID,
            Math.max(stats.video.videoQuality, stats.audio.audioQuality)
          );
      }
    );

    ZegoCloudRTCCore._zg.on(
      "publishQualityUpdate",
      (streamID: string, stats: ZegoPublishStats) => {
        this.onNetworkStatusQualityCallBack &&
          this.onNetworkStatusQualityCallBack(
            streamID,
            Math.max(stats.video.videoQuality, stats.audio.audioQuality)
          );
      }
    );
    ZegoCloudRTCCore._zg.on(
      "soundLevelUpdate",
      (soundLevelList: ZegoSoundLevelInfo[]) => {
        this.onSoundLevelUpdateCallBack &&
          this.onSoundLevelUpdateCallBack(soundLevelList);
      }
    );
    ZegoCloudRTCCore._zg.on("screenSharingEnded", (stream: MediaStream) => {
      this.onScreenSharingEndedCallBack &&
        this.onScreenSharingEndedCallBack(stream);
    });
    if (
      this._config.scenario?.mode === ScenarioModel.LiveStreaming &&
      this._config.scenario.config?.role === LiveRole.Audience &&
      (this._config.scenario.config as any)?.liveStreamingMode ===
        LiveStreamingMode.CDNLive
    ) {
      ZegoCloudRTCCore._zg.on(
        "streamExtraInfoUpdate",
        (
          roomID: string,
          streamList: { streamID: string; user: ZegoUser; extraInfo: string }[]
        ) => {
          if (roomID === this._expressConfig.roomID) {
            console.warn("streamExtraInfoUpdate", streamList);
            this.streamExtraInfoUpdateCallBack(streamList);
          }
        }
      );
    }
    const resp = await new Promise<number>(async (res, rej) => {
      ZegoCloudRTCCore._zg.on(
        "roomStateUpdate",
        (
          roomID: string,
          state: "DISCONNECTED" | "CONNECTING" | "CONNECTED",
          errorCode: number,
          extendedData: string
        ) => {
          this.onNetworkStatusCallBack &&
            this.onNetworkStatusCallBack(roomID, "ROOM", state);
          if (state === "CONNECTED" || state === "DISCONNECTED") {
            this.status.loginRsp = errorCode === 0;
            res(errorCode);
          }
        }
      );

      await ZegoCloudRTCCore._zg.loginRoom(
        ZegoCloudRTCCore._instance._expressConfig.roomID,
        ZegoCloudRTCCore._instance._expressConfig.token,
        {
          userID: ZegoCloudRTCCore._instance._expressConfig.userID,
          userName: ZegoCloudRTCCore._instance._expressConfig.userName,
        },
        {
          userUpdate: true,
          maxMemberCount: ZegoCloudRTCCore._instance._config.maxUsers,
        }
      );
      const user = {
        userID: ZegoCloudRTCCore._instance._expressConfig.userID,
        userName: ZegoCloudRTCCore._instance._expressConfig.userName,
        setUserAvatar: (avatar: string) => {
          if (avatar && typeof avatar === "string") {
            this._expressConfig.avatar = avatar;
          }
        },
      };
      this._config.onCanSetUserAvatar &&
        this._config.onCanSetUserAvatar([user]);
    });
    ZegoCloudRTCCore._zg.setSoundLevelDelegate(true, 300);
    this.streamUpdateTimer(this.waitingHandlerStreams);
    return resp;
  }

  async streamUpdateTimer(_waitingHandlerStreams: {
    add: ZegoStreamList[];
    delete: ZegoStreamList[];
  }): Promise<void> {
    if (!this.status.loginRsp) {
      console.warn("【ZEGOCLOUD】logoutRoom,stop streamUpdateTimer");
      return;
    }
    if (this._currentPage === "Room") {
      let _streamList = [];
      if (_waitingHandlerStreams.add.length > 0) {
        for (let i = 0; i < _waitingHandlerStreams.add.length; i++) {
          const streamInfo = _waitingHandlerStreams.add[i];
          try {
            if (
              this._config.scenario?.mode === ScenarioModel.LiveStreaming &&
              (this._config.scenario?.config as any)?.liveStreamingMode ===
                LiveStreamingMode.CDNLive &&
              this._config.scenario?.config?.role === LiveRole.Audience
            ) {
              // CDN拉流
              const extraInfo = JSON.parse(streamInfo.extraInfo);
              this.remoteStreamMap[streamInfo.streamID] = {
                fromUser: streamInfo.user,
                media: undefined,
                micStatus: extraInfo.isMicrophoneOn ? "OPEN" : "MUTE",
                cameraStatus: extraInfo.isCameraOn ? "OPEN" : "MUTE",
                state: "PLAYING",
                streamID: streamInfo.streamID,
                urlsHttpsFLV: changeCDNUrlOrigin(
                  streamInfo.urlsHttpsFLV || streamInfo.urlsFLV
                ),
                urlsHttpsHLS: changeCDNUrlOrigin(
                  streamInfo.urlsHttpsHLS || streamInfo.urlsHLS
                ),
                hasAudio: extraInfo.hasAudio,
                hasVideo: extraInfo.hasVideo,
              };
            } else {
              const stream = await this.zum.startPullStream(
                streamInfo.user.userID,
                streamInfo.streamID
              );
              this.remoteStreamMap[streamInfo.streamID] = {
                fromUser: streamInfo.user,
                media: stream,
                micStatus:
                  stream && stream.getAudioTracks().length > 0
                    ? "OPEN"
                    : "MUTE",
                cameraStatus:
                  stream && stream.getVideoTracks().length > 0
                    ? "OPEN"
                    : "MUTE",
                state: "PLAYING",
                streamID: streamInfo.streamID,
              };
            }

            _streamList.push(this.remoteStreamMap[streamInfo.streamID]);
          } catch (error) {
            console.warn("【ZEGOCLOUD】:startPlayingStream error", error);
          }
        }

        this.onRemoteMediaUpdateCallBack &&
          _streamList.length > 0 &&
          this.onRemoteMediaUpdateCallBack("ADD", _streamList);
      }

      if (_waitingHandlerStreams.delete.length > 0) {
        _streamList = [];
        for (let i = 0; i < _waitingHandlerStreams.delete.length; i++) {
          const streamInfo = _waitingHandlerStreams.delete[i];
          this.remoteStreamMap[streamInfo.streamID] &&
            _streamList.push(this.remoteStreamMap[streamInfo.streamID]);
          await this.zum.stopPullStream(
            streamInfo.user.userID,
            streamInfo.streamID
          );
          delete this.remoteStreamMap[streamInfo.streamID];
        }
        this.onRemoteMediaUpdateCallBack &&
          _streamList.length > 0 &&
          this.onRemoteMediaUpdateCallBack("DELETE", _streamList);
      }
      // const nextWaitingHandlerStreams = {
      //   add: [...this.waitingHandlerStreams.add],
      //   delete: [...this.waitingHandlerStreams.delete],
      // };
      const nextWaitingHandlerStreams = {
        add: this.waitingHandlerStreams.add.filter((realTime_item) => {
          if (
            _waitingHandlerStreams.add.some(
              (handing_item) => handing_item.streamID === realTime_item.streamID
            )
          ) {
            return false;
          } else {
            return true;
          }
        }),
        delete: this.waitingHandlerStreams.delete.filter((realTime_item) => {
          if (
            _waitingHandlerStreams.delete.some(
              (handing_item) => handing_item.streamID === realTime_item.streamID
            )
          ) {
            return false;
          } else {
            return true;
          }
        }),
      };

      this.waitingHandlerStreams = nextWaitingHandlerStreams;
      setTimeout(() => {
        this.streamUpdateTimer(this.waitingHandlerStreams);
      }, 700);
    } else if (
      this._currentPage === "BrowserCheckPage" ||
      this._currentPage === "RejoinRoom"
    ) {
      setTimeout(() => {
        this.streamUpdateTimer(_waitingHandlerStreams);
      }, 1000);
    }
  }

  publishLocalStream(
    media: MediaStream,
    streamType?: "main" | "media" | "screensharing"
  ): boolean | string {
    if (!media) return false;
    const streamID = generateStreamID(
      this._expressConfig.userID,
      this._expressConfig.roomID,
      streamType
    );
    const res = ZegoCloudRTCCore._zg.startPublishingStream(streamID, media);
    return res && streamID;
  }

  async replaceTrack(
    media: MediaStream,
    mediaStreamTrack: MediaStreamTrack
  ): Promise<ZegoServerResponse> {
    return ZegoCloudRTCCore._zg.replaceTrack(media, mediaStreamTrack);
  }

  private subscribeUserListCallBack!: (userList: ZegoCloudUserList) => void;
  subscribeUserList(callback: (userList: ZegoCloudUserList) => void): void {
    this.subscribeUserListCallBack = callback;
  }

  private subscribeScreenStreamCallBack!: (userList: ZegoCloudUserList) => void;
  subscribeScreenStream(callback: (userList: ZegoCloudUserList) => void): void {
    this.subscribeScreenStreamCallBack = callback;
  }
  private onRemoteMediaUpdateCallBack: (
    updateType: "DELETE" | "ADD" | "UPDATE",
    streamList: ZegoCloudRemoteMedia[]
  ) => void = async (
    updateType: "DELETE" | "ADD" | "UPDATE",
    streamList: ZegoCloudRemoteMedia[]
  ) => {
    await this.zum.mainStreamUpdate(updateType, streamList);
    await this.zum.screenStreamUpdate(updateType, streamList);
    this.subscribeUserListCallBack &&
      this.subscribeUserListCallBack([...this.zum.remoteUserList]);
    this.subscribeScreenStreamCallBack &&
      this.subscribeScreenStreamCallBack([...this.zum.remoteScreenStreamList]);
  };
  private onNetworkStatusQualityCallBack!: (
    roomID: string,
    level: number
  ) => void;
  onNetworkStatusQuality(func: (roomID: string, level: number) => void) {
    this.onNetworkStatusQualityCallBack = func;
  }

  private onRemoteUserUpdateCallBack!: (
    roomID: string,
    updateType: "DELETE" | "ADD",
    user: ZegoUser[]
  ) => void;
  onRemoteUserUpdate(
    func: (
      roomID: string,
      updateType: "DELETE" | "ADD",
      user: ZegoUser[]
    ) => void
  ) {
    this.onRemoteUserUpdateCallBack = async (
      roomID: string,
      updateType: "DELETE" | "ADD",
      users: ZegoUser[]
    ) => {
      if (
        this._currentPage === "BrowserCheckPage" ||
        this._currentPage === "RejoinRoom"
      ) {
        setTimeout(() => {
          this.onRemoteUserUpdateCallBack(roomID, updateType, users);
        }, 1000);
      } else if (this._currentPage === "Room") {
        func(roomID, updateType, users);
        await this.zum.userUpdate(roomID, updateType, users);
        setTimeout(() => {
          console.warn(
            "【ZEGOCLOUD】roomUserUpdate",
            [...this.zum.remoteUserList],
            [...this.zum.remoteUserList].length
          );
          this.subscribeUserListCallBack &&
            this.subscribeUserListCallBack([...this.zum.remoteUserList]);
        }, 0);
      }
    };
  }
  private onSoundLevelUpdateCallBack!: (
    soundLevelList: ZegoSoundLevelInfo[]
  ) => void;
  onSoundLevelUpdate(func: (soundLevelList: ZegoSoundLevelInfo[]) => void) {
    this.onSoundLevelUpdateCallBack = func;
  }

  private onRoomLiveStateUpdateCallBack!: (live: 1 | 0) => void;
  onRoomLiveStateUpdate(func: (live: 1 | 0) => void) {
    this.onRoomLiveStateUpdateCallBack = func;
  }
  sendRoomMessage(message: string) {
    return ZegoCloudRTCCore._zg.sendBroadcastMessage(
      ZegoCloudRTCCore._instance._expressConfig.roomID,
      message
    );
  }
  private onRoomMessageUpdateCallBack!: (
    roomID: string,
    info: ZegoBroadcastMessageInfo[]
  ) => void;
  onRoomMessageUpdate(
    func: (roomID: string, info: ZegoBroadcastMessageInfo[]) => void
  ) {
    this.onRoomMessageUpdateCallBack = func;
  }

  private onScreenSharingEndedCallBack!: (stream: MediaStream) => void;
  onScreenSharingEnded(func: (stream: MediaStream) => void) {
    this.onScreenSharingEndedCallBack = func;
  }

  private onNetworkStatusCallBack!: (
    roomID: string,
    type: "ROOM" | "STREAM",
    status: "DISCONNECTED" | "CONNECTING" | "CONNECTED"
  ) => void;
  onNetworkStatus(
    func: (
      roomID: string,
      type: "ROOM" | "STREAM",
      status: "DISCONNECTED" | "CONNECTING" | "CONNECTED"
    ) => void
  ) {
    this.onNetworkStatusCallBack = (
      roomID: string,
      type: "ROOM" | "STREAM",
      status: "DISCONNECTED" | "CONNECTING" | "CONNECTED"
    ) => {
      if (status === "CONNECTING") {
        !this.NetworkStatusTimer &&
          (this.NetworkStatusTimer = setTimeout(() => {
            func(roomID, type, "DISCONNECTED");
          }, 60000));
      } else {
        if (this.NetworkStatusTimer) {
          clearTimeout(this.NetworkStatusTimer);
          this.NetworkStatusTimer = null;
        }
      }
      func(roomID, type, status);
    };
  }
  // TODO
  private streamExtraInfoUpdateCallBack(
    streamList: { streamID: string; user: ZegoUser; extraInfo: string }[]
  ): void {
    streamList.forEach((stream) => {
      const extraInfo = JSON.parse(stream.extraInfo);
      console.warn("extraInfo", extraInfo);
      if (extraInfo.isCameraOn !== undefined) {
        this.zum.updateStreamInfo(
          stream.user.userID,
          stream.streamID,
          "cameraStatus",
          extraInfo.isCameraOn ? "OPEN" : "MUTE"
        );
      }
      if (extraInfo.isMicrophoneOn !== undefined) {
        this.zum.updateStreamInfo(
          stream.user.userID,
          stream.streamID,
          "micStatus",
          extraInfo.isMicrophoneOn ? "OPEN" : "MUTE"
        );
      }
      extraInfo.hasVideo !== undefined &&
        this.zum.updateStreamInfo(
          stream.user.userID,
          stream.streamID,
          "hasVideo",
          !!extraInfo.hasVideo
        );
      extraInfo.hasAudio !== undefined &&
        this.zum.updateStreamInfo(
          stream.user.userID,
          stream.streamID,
          "hasAudio",
          !!extraInfo.hasAudio
        );
    });
    this.subscribeUserListCallBack &&
      this.subscribeUserListCallBack([...this.zum.remoteUserList]);
  }

  leaveRoom(): void {
    if (!this.status.loginRsp) return;
    ZegoCloudRTCCore._zg.off("streamExtraInfoUpdate");
    ZegoCloudRTCCore._zg.off("roomExtraInfoUpdate");
    ZegoCloudRTCCore._zg.off("roomStreamUpdate");
    ZegoCloudRTCCore._zg.off("remoteCameraStatusUpdate");
    ZegoCloudRTCCore._zg.off("remoteMicStatusUpdate");
    ZegoCloudRTCCore._zg.off("playerStateUpdate");
    ZegoCloudRTCCore._zg.off("roomUserUpdate");
    ZegoCloudRTCCore._zg.off("IMRecvBroadcastMessage");
    ZegoCloudRTCCore._zg.off("roomStateUpdate");
    ZegoCloudRTCCore._zg.off("publisherStateUpdate");
    ZegoCloudRTCCore._zg.off("publishQualityUpdate");
    ZegoCloudRTCCore._zg.off("soundLevelUpdate");
    ZegoCloudRTCCore._zg.off("screenSharingEnded");

    ZegoCloudRTCCore._zg.setSoundLevelDelegate(false);
    this.onNetworkStatusCallBack = () => {};
    this.onRemoteMediaUpdateCallBack = async (
      updateType: "DELETE" | "ADD" | "UPDATE",
      streamList: ZegoCloudRemoteMedia[]
    ) => {
      await this.zum.mainStreamUpdate(updateType, streamList);
      await this.zum.screenStreamUpdate(updateType, streamList);
      this.subscribeUserListCallBack &&
        this.subscribeUserListCallBack([...this.zum.remoteUserList]);
      this.subscribeScreenStreamCallBack &&
        this.subscribeScreenStreamCallBack([
          ...this.zum.remoteScreenStreamList,
        ]);
    };
    this.onRemoteUserUpdateCallBack = () => {};
    this.onRoomMessageUpdateCallBack = () => {};
    this.onRoomLiveStateUpdateCallBack = () => {};
    this.subscribeUserListCallBack = () => {};
    this.zum.reset();

    for (let key in this.remoteStreamMap) {
      ZegoCloudRTCCore._zg.stopPlayingStream(key);
    }
    this.remoteStreamMap = {};
    this.waitingHandlerStreams = { add: [], delete: [] };

    ZegoCloudRTCCore._zg.logoutRoom();
    this.status.loginRsp = false;
  }
  setStreamExtraInfo(
    streamID: string,
    extraInfo: string
  ): Promise<ZegoServerResponse> {
    return ZegoCloudRTCCore._zg.setStreamExtraInfo(streamID, extraInfo);
  }
}
