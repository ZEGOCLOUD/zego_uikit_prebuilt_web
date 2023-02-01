/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import {
  CoreError,
  LiveRole,
  LiveStreamingMode,
  ScenarioModel,
  SoundLevelMap,
  ZegoBroadcastMessageInfo2,
  ZegoBrowserCheckProp,
  ZegoNotification,
} from "../../../model";
import ZegoRoomCss from "./index.module.scss";
import {
  ZegoUser,
  ZegoBroadcastMessageInfo,
} from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoOne2One } from "./components/zegoOne2One";
import { ZegoMessage } from "./components/zegoMessage";
import {
  isIOS,
  isPc,
  IsLowVersionSafari,
  randomNumber,
  getVideoResolution,
  isFireFox,
} from "../../../util";
import { ZegoConfirm } from "../../components/mobile/zegoConfirm";
import { ZegoUserList } from "./components/zegoUserList";
import { ZegoRoomInvite } from "./components/zegoRoomInvite";
import { ZegoReconnect } from "./components/ZegoReconnect";
import { ZegoToast } from "../../components/mobile/zegoToast";
import {
  ZegoDeviceInfo,
  ZegoSoundLevelInfo,
} from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { ZegoSuperBoardView } from "zego-superboard-web";
import {
  ZegoCloudUser,
  ZegoCloudUserList,
} from "../../../modules/tools/UserListManager";
import { ZegoLayout } from "./components/zegoLayout";
import { ZegoManage } from "./components/zegoManage";
import { ZegoGrid } from "./components/zegoGrid";
import { ZegoSidebar } from "./components/zegoSidebar";
import ShowManageContext from "../context/showManage";
import { ZegoModelShow } from "../../components/zegoModel";
import { ZegoScreen } from "./components/zegoScreen";
import ZegoAudio from "../../components/zegoMedia/audio";
import { ZegoWhiteboard } from "./components/zegoWhiteboard";
import { formatTime } from "../../../modules/tools/util";
import { ZegoTimer } from "./components/zegoTimer";
export class ZegoRoomMobile extends React.PureComponent<ZegoBrowserCheckProp> {
  static contextType = ShowManageContext;
  state: {
    localStream: undefined | MediaStream;
    layOutStatus:
      | "ONE_VIDEO"
      | "INVITE"
      | "USER_LIST"
      | "MESSAGE"
      | "LAYOUT"
      | "MANAGE"
      | "WHITEBOARD";
    userLayoutStatus: "Auto" | "Grid" | "Sidebar";
    zegoCloudUserList: ZegoCloudUserList;
    memberList: ZegoCloudUserList;
    messageList: ZegoBroadcastMessageInfo2[];
    notificationList: ZegoNotification[];
    micOpen: boolean;
    cameraOpen: boolean;
    showMore: boolean;
    connecting: boolean;
    firstLoading: boolean;
    cameraFront: boolean;
    showFooter: boolean;
    isNetworkPoor: boolean;
    soundLevel: SoundLevelMap;
    liveCountdown: number;
    liveStatus: "1" | "0";
    screenSharingUserList: ZegoCloudUserList;
    zegoSuperBoardView: ZegoSuperBoardView | null; // 本地白板共享
    isZegoWhiteboardSharing: boolean; // 是否开启白板共享
    roomTime: string;
    isScreenPortrait: boolean; // 是否竖屏
  } = {
    micOpen: !!this.props.core._config.turnOnMicrophoneWhenJoining,
    cameraOpen: !!this.props.core._config.turnOnCameraWhenJoining,
    localStream: undefined,
    layOutStatus: "ONE_VIDEO",
    userLayoutStatus: this.props.core._config.layout || "Auto",
    zegoCloudUserList: [],
    memberList: [],
    messageList: [],
    notificationList: [],
    showMore: false,
    connecting: false,
    firstLoading: true,
    cameraFront: true,
    showFooter: true,
    isNetworkPoor: false,
    soundLevel: {},
    liveCountdown: -1,
    liveStatus: "0",
    screenSharingUserList: [],
    zegoSuperBoardView: null, // 本地白板共享
    isZegoWhiteboardSharing: false, // 是否开启白板共享
    roomTime: "00:00:00",
    isScreenPortrait: true, // 是否竖屏
  };
  micStatus: -1 | 0 | 1 = !!this.props.core._config.turnOnMicrophoneWhenJoining
    ? 1
    : 0;
  cameraStatus: -1 | 0 | 1 = !!this.props.core._config.turnOnCameraWhenJoining
    ? 1
    : 0;
  localUserPin = false;
  faceModel: 0 | 1 | -1 = this.props.core._config.facingMode === "user" ? 1 : 0;
  notifyTimer: NodeJS.Timeout | null = null;
  footerTimer!: NodeJS.Timeout;
  cameraDevices: ZegoDeviceInfo[] = [];

  userUpdateCallBack = () => {};
  localStreamID = "";
  safariLimitationNoticed: -1 | 0 | 1 = -1;
  iosLimitationNoticed = 0;
  showNotSupported = 0;

  roomTimer: NodeJS.Timer | null = null;
  roomTimeNum = 0;

  get isCDNLive(): boolean {
    return (
      this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
      this.props.core._config.scenario.config?.role === LiveRole.Audience &&
      (this.props.core._config.scenario.config as any).liveStreamingMode ===
        LiveStreamingMode.LiveStreaming
    );
  }
  get showRoomTimerUI() {
    return (
      this.props.core._config.showRoomTimer &&
      this.props.core._config?.scenario?.mode !== ScenarioModel.LiveStreaming
    );
  }
  componentDidMount() {
    window.addEventListener(
      "orientationchange",
      this.onOrientationChange.bind(this),
      false
    );
    this.onOrientationChange();
    this.initSDK();
    this.props.core._config.showRoomTimer && this.startRoomTimer();
    this.footerTimer = setTimeout(() => {
      this.setState({
        showFooter: false,
      });
    }, 5000);
  }
  componentWillUnmount() {
    window.removeEventListener(
      "orientationchange",
      this.onOrientationChange.bind(this),
      false
    );
    if (this.roomTimer) {
      clearInterval(this.roomTimer);
      this.roomTimer = null;
    }
    this.state.localStream &&
      this.props.core.destroyStream(this.state.localStream);
  }
  componentDidUpdate(
    preProps: ZegoBrowserCheckProp,
    preState: {
      localStream: undefined | MediaStream;
      layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
      messageList: ZegoBroadcastMessageInfo[];
      notificationList: ZegoNotification[];
      micOpen: boolean;
      cameraOpen: boolean;
      showMore: boolean;
      screenSharingUserList: ZegoCloudUserList;
      userLayoutStatus: "Auto" | "Grid" | "Sidebar";
    }
  ) {
    if (
      (preState.notificationList.length > 0 &&
        this.state.notificationList.length > 0 &&
        preState.notificationList[preState.notificationList.length - 1]
          .messageID !==
          this.state.notificationList[this.state.notificationList.length - 1]
            .messageID) ||
      (preState.notificationList.length === 0 &&
        this.state.notificationList.length > 0)
    ) {
      if (this.notifyTimer) {
        clearTimeout(this.notifyTimer);
        this.notifyTimer = null;
      }
      this.notifyTimer = setTimeout(() => {
        this.setState({
          notificationList: [],
        });
      }, 3000);
    }
    // if (preState.userLayoutStatus !== this.state.userLayoutStatus) {
    //   this.handleLayoutChange(this.state.userLayoutStatus);
    // }
  }

  async initSDK() {
    this.props.core.onNetworkStatusQuality((roomID: string, level: number) => {
      this.setState({
        isNetworkPoor: level > 2,
      });
    });

    this.props.core.onNetworkStatus(
      (
        roomID: string,
        type: "ROOM" | "STREAM",
        status: "DISCONNECTED" | "CONNECTING" | "CONNECTED"
      ) => {
        if (status === "DISCONNECTED") {
          this.setState({
            connecting: false,
            firstLoading: false,
          });
          this.props.core.leaveRoom();
          this.props.leaveRoom && this.props.leaveRoom();
        } else if (status === "CONNECTING") {
          this.setState({
            connecting: true,
          });
        } else if (status === "CONNECTED") {
          this.setState({
            connecting: false,
            firstLoading: false,
          });
        }
      }
    );
    this.props.core.onRemoteUserUpdate(
      (
        roomID: string,
        updateType: "DELETE" | "ADD",
        userList: ZegoUser[],
        allUsers: ZegoUser[]
      ) => {
        let notificationList: ZegoNotification[] = [];
        if (
          this.props.core._config.lowerLeftNotification?.showUserJoinAndLeave
        ) {
          userList.map((u) => {
            notificationList.push({
              content:
                u.userName +
                " " +
                (updateType === "ADD" ? "enter" : "quite") +
                " the room",
              type: "USER",
              userName: u.userName,
              messageID: randomNumber(5),
            });
          });
        }
        // 当房间只剩自己的时候，自动离开房间
        if (updateType === "DELETE") {
          if (
            this.props.core._config.autoLeaveRoomWhenOnlySelfInRoom &&
            allUsers.length === 0
          ) {
            this.confirmLeaveRoom();
            return;
          }
        }
        this.setState((state: { notificationList: string[] }) => {
          return {
            notificationList: [...state.notificationList, ...notificationList],
          };
        });
      }
    );
    this.props.core.onRoomMessageUpdate(
      (roomID: string, messageList: ZegoBroadcastMessageInfo[]) => {
        this.setState(
          (state: {
            messageList: ZegoBroadcastMessageInfo[];
            notificationList: ZegoNotification[];
          }) => {
            let lowerLeftNotification: ZegoNotification[] = [];
            if (
              this.state.layOutStatus !== "MESSAGE" &&
              this.props.core._config.lowerLeftNotification?.showTextChat
            ) {
              lowerLeftNotification = [
                ...state.notificationList,
                ...messageList.map<ZegoNotification>((m) => {
                  return {
                    content: m.message,
                    type: "MSG",
                    userName: m.fromUser.userName,
                    messageID: m.messageID,
                  };
                }),
              ];
            }
            return {
              messageList: [...state.messageList, ...messageList],
              notificationList: lowerLeftNotification,
            };
          }
        );
      }
    );
    this.props.core.subscribeUserList((userList) => {
      this.userUpdateCallBack();
      const notSupportPhone =
        !isPc() &&
        isIOS() &&
        IsLowVersionSafari() &&
        userList.filter((u) => {
          return (
            u.streamList.length > 0 && u.streamList[0].micStatus === "OPEN"
          );
        }).length > (this.state.screenSharingUserList.length > 0 ? 0 : 1);

      if (this.isCDNLive) {
        let userListCopy: ZegoCloudUserList = JSON.parse(
          JSON.stringify(userList)
        );
        const userNum = userListCopy.filter(
          (user) =>
            user.streamList.length > 0 &&
            (user.streamList[0].cameraStatus === "OPEN" ||
              user.streamList[0].micStatus === "OPEN")
        ).length;
        let limitNum = 1;
        if (this.isCDNLive && !isIOS()) {
          limitNum = this.state.screenSharingUserList.length > 0 ? 5 : 6;
        }
        if (userNum > limitNum) {
          let i = 0;
          let targetUsers = userListCopy
            .reverse()
            .map((user: ZegoCloudUser) => {
              if (
                user.streamList.length > 0 &&
                (user.streamList[0].cameraStatus === "OPEN" ||
                  user.streamList[0].micStatus === "OPEN")
              ) {
                if (i >= limitNum) {
                  user.streamList = [];
                } else {
                  i++;
                }
              }
              return user;
            });
          const users = targetUsers.reverse();

          this.setState(
            {
              zegoCloudUserList: targetUsers,
              memberList: users,
            },
            () => {
              this.handleLayoutChange(this.state.userLayoutStatus);
            }
          );

          if (isIOS() && this.isCDNLive && this.iosLimitationNoticed === 0) {
            this.iosLimitationNoticed = 1;
            ZegoModelShow({
              header: "Notice",
              contentText:
                "Your current mobile system does not support the display of multiple video screens during the live streaming.",
              okText: "Okay",
            });
          }
          return;
        }
      } else if (notSupportPhone) {
        let targetUsers = userList.reverse();

        let targetUser = targetUsers.find(
          (u) => u.streamList.length > 0 && u.streamList[0].micStatus === "OPEN"
        );
        this.setState({
          zegoCloudUserList: [targetUser],
          memberList: userList,
          screenSharingUserList: [],
        });
        if (this.safariLimitationNoticed === -1) {
          this.safariLimitationNoticed = 0;
          ZegoModelShow({
            header: "Notice",
            contentText:
              "The current browser does not support the display of multiple video screens, we suggest you change your browser.",
            okText: "Okay",
            onOk: () => {
              this.safariLimitationNoticed = 1;
              this.handleLayoutChange(this.state.userLayoutStatus);
            },
          });
        }
        return;
      }

      this.setState({
        zegoCloudUserList: userList,
        memberList: userList,
      });
    });
    this.props.core.subscribeWhiteBoard(
      (superBoardView: ZegoSuperBoardView | null) => {
        this.setState({
          zegoSuperBoardView: superBoardView,
          isZegoWhiteboardSharing: !!superBoardView,
        });
      }
    );
    this.props.core.subscribeScreenStream((userList) => {
      const notSupportPhone =
        !isPc() &&
        isIOS() &&
        (IsLowVersionSafari() || this.isCDNLive) &&
        this.state.zegoCloudUserList.filter((u) => {
          return (
            u.streamList.length > 0 &&
            (u.streamList[0].micStatus === "OPEN" ||
              u.streamList[0].cameraStatus === "OPEN")
          );
        }).length > 0;
      this.setState(
        { screenSharingUserList: notSupportPhone ? [] : userList },
        () => {
          this.handleLayoutChange(this.state.userLayoutStatus);
        }
      );
    });
    this.props.core.onSoundLevelUpdate(
      (soundLevelList: ZegoSoundLevelInfo[]) => {
        let list: SoundLevelMap = {};
        soundLevelList.forEach((s) => {
          let userId = s.streamID.split("_")[1];
          if (list[userId]) {
            list[userId][s.streamID] = Math.floor(s.soundLevel);
          } else {
            list[userId] = {
              [s.streamID]: Math.floor(s.soundLevel),
            };
          }
        });
        this.setState({
          soundLevel: list,
        });
      }
    );
    this.props.core.onRoomLiveStateUpdate((res: "1" | "0") => {
      this.setState(
        (preState: { liveCountdown: number }) => {
          return {
            liveStatus: res,
            liveCountdown:
              preState.liveCountdown === -1 || preState.liveCountdown == 0
                ? res == "1"
                  ? 0
                  : -1
                : preState.liveCountdown,
          };
        },
        () => {
          console.error("【ZEGOCLOUD】 liveStatus", this.state.liveStatus);
        }
      );
    });
    this.props.core.onCoreError((code: CoreError, msg: string) => {
      if (
        code === CoreError.notSupportStandardLive ||
        code === CoreError.notSupportCDNLive
      ) {
        if (this.showNotSupported) return;
        this.showNotSupported = 1;
        ZegoModelShow(
          {
            header: "Notice",
            contentText:
              "The service is not available, please contact the live streaming service provider to resolve.",
            okText: "Okay",
          },
          document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
        );
      }
    });
    // 监听呼叫邀请离开房间的通知
    this.props.core._zimManager &&
      this.props.core._zimManager.notifyLeaveRoom(() => {
        this.state.localStream &&
          this.props.core.destroyStream(this.state.localStream);
        this.props.core.leaveRoom();
        this.props.leaveRoom && this.props.leaveRoom();
      });
    // 监听远端控制摄像头麦克风
    this.props.core.onChangeYourDeviceStatus(
      async (
        type: "Camera" | "Microphone",
        status: "OPEN" | "CLOSE",
        fromUser: ZegoUser
      ) => {
        if (type === "Camera" && status === "CLOSE" && this.state.cameraOpen) {
          await this.toggleCamera();
          ZegoToast({
            content: `${fromUser.userName} has turned your camera off`,
          });
        }
        if (type === "Microphone" && status === "CLOSE" && this.state.micOpen) {
          await this.toggleMic();
          ZegoToast({
            content: `${fromUser.userName} has turned your camera off`,
          });
        }
      }
    );
    this.props.core.onKickedOutRoom(() => {
      this.confirmLeaveRoom(true);
    });
    const logInRsp = await this.props.core.enterRoom();
    let massage = "";
    if (logInRsp === 0) {
      this.createStream();
      setTimeout(async () => {
        this.props.core._config.showMyCameraToggleButton &&
          (this.cameraDevices = await this.props.core.getCameras());
      }, 4000);
      return;
    } else if (logInRsp === 1002034) {
      // 登录房间的用户数超过该房间配置的最大用户数量限制（测试环境下默认房间最大用户数为 50，正式环境无限制）。
      massage =
        "Failed to join the room, the number of people in the room has reached the maximum.(2 people)";
    } else if ([1002031, 1002053].includes(logInRsp)) {
      //登录房间超时，可能是由于网络原因导致。
      massage =
        "There's something wrong with your network. Please check it and try again.";
    } else if ([1102018, 1102016, 1102020].includes(logInRsp)) {
      // 登录 token 错误，
      massage = "Failed to join the room, token authentication error.";
    } else if (1002056 === logInRsp) {
      // 用户重复进行登录。
      massage =
        "You are on a call in another room, please leave that room first.";
    } else {
      massage =
        "Failed to join the room, please try again.(error code:" +
        logInRsp +
        ")";
    }
    ZegoModelShow({
      header: "Login room Failed",
      contentText: massage,
      okText: "OK",
    });
  }

  async createStream(): Promise<boolean> {
    if (
      !this.props.core._config.turnOnCameraWhenJoining &&
      !this.props.core._config.turnOnMicrophoneWhenJoining &&
      !this.props.core._config.showMyCameraToggleButton &&
      !this.props.core._config.showMyMicrophoneToggleButton
    ) {
      return false;
    }

    if (
      !this.props.core.status.videoRefuse ||
      !this.props.core.status.audioRefuse
    ) {
      try {
        let localStream: MediaStream | null = null;
        try {
          const solution = getVideoResolution(
            this.props.core._config.videoResolutionList![0]
          );
          localStream = await this.props.core.createStream({
            camera: {
              video: !this.props.core.status.videoRefuse,
              audio: !this.props.core.status.audioRefuse,
              videoQuality: 4,
              facingMode: this.faceModel ? "user" : "environment",
              ...solution,
              //   width: 640,
              //   height: 360,
              //   bitrate: 400,
              //   frameRate: 15,
            },
          });
        } catch (error: any) {
          if (JSON.stringify(error).includes("constrain")) {
            localStream = await this.props.core.createStream({
              camera: {
                video: !this.props.core.status.videoRefuse,
                audio: !this.props.core.status.audioRefuse,
                facingMode: this.faceModel ? "user" : "environment",
              },
            });
          }
          if (error?.code === 1103064) {
            this.props.core.status.videoRefuse = true;
            this.props.core.status.audioRefuse = true;
            this.setState({
              cameraOpen: false,
              micOpen: false,
            });
          }
        }

        if (!localStream) return false;

        this.props.core.mutePublishStreamVideo(
          localStream,
          !this.props.core._config.turnOnCameraWhenJoining
        );
        this.props.core.muteMicrophone(
          !this.props.core._config.turnOnMicrophoneWhenJoining
        );
        this.setState({
          localStream,
        });
        const extraInfo = JSON.stringify({
          isCameraOn: !!this.props.core._config.turnOnCameraWhenJoining,
          isMicrophoneOn: this.props.core._config.turnOnMicrophoneWhenJoining,
          hasVideo: !this.props.core.status.videoRefuse,
          hasAudio: !this.props.core.status.audioRefuse,
        });
        const res = this.props.core.publishLocalStream(
          localStream,
          "main",
          extraInfo
        );
        if (res !== false) {
          this.localStreamID = res as string;
        }
        return true;
      } catch (error: any) {
        console.error(
          "【ZEGOCLOUD】createStream or publishLocalStream failed,Reason: ",
          JSON.stringify(error)
        );
        if (error?.code === 1103064) {
          this.props.core.status.videoRefuse = true;
          this.props.core.status.audioRefuse = true;
          this.setState({
            cameraOpen: false,
            micOpen: false,
          });
        }
        return false;
      }
    } else {
      return false;
    }
  }

  async toggleMic() {
    if (this.props.core.status.audioRefuse) {
      ZegoConfirm({
        title: "Equipment authorization",
        content:
          "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
        confirm: "Okay",
      });
      return;
    }

    if (this.micStatus === -1) return;
    this.micStatus = -1;

    let result;
    if (
      this.state.localStream &&
      this.state.localStream.getAudioTracks().length > 0
    ) {
      result = await this.props.core.muteMicrophone(this.state.micOpen);
      await this.props.core.setStreamExtraInfo(
        this.localStreamID as string,
        JSON.stringify({
          isCameraOn: this.state.cameraOpen,
          isMicrophoneOn: !this.state.micOpen,
          hasVideo: !this.props.core.status.videoRefuse,
          hasAudio: !this.props.core.status.audioRefuse,
        })
      );
    }

    this.micStatus = !this.state.micOpen ? 1 : 0;
    if (result) {
      ZegoToast({
        content: "The microphone is " + (this.micStatus ? "on" : "off"),
      });
      result &&
        this.setState(
          {
            micOpen: !!this.micStatus,
          },
          () => {
            this.handleLayoutChange(this.state.userLayoutStatus);
          }
        );
    }
    return !!result;
  }

  async toggleCamera() {
    if (this.props.core.status.videoRefuse) {
      ZegoConfirm({
        title: "Equipment authorization",
        content:
          "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
        confirm: "Okay",
      });
      return;
    }
    if (this.cameraStatus === -1) return;
    this.cameraStatus = -1;

    let result;
    if (
      this.state.localStream &&
      this.state.localStream.getVideoTracks().length > 0
    ) {
      result = await this.props.core.mutePublishStreamVideo(
        this.state.localStream,
        this.state.cameraOpen
      );
      await this.props.core.setStreamExtraInfo(
        this.localStreamID as string,
        JSON.stringify({
          isCameraOn: !this.state.cameraOpen,
          isMicrophoneOn: this.state.micOpen,
          hasVideo: !this.props.core.status.videoRefuse,
          hasAudio: !this.props.core.status.audioRefuse,
        })
      );
    }
    this.cameraStatus = !this.state.cameraOpen ? 1 : 0;
    if (result) {
      ZegoToast({
        content: "The camera is " + (this.cameraStatus ? "on" : "off"),
      });
      result &&
        this.setState(
          {
            cameraOpen: !!this.cameraStatus,
          },
          () => {
            this.handleLayoutChange(this.state.userLayoutStatus);
          }
        );
    }
    return !!result;
  }

  async switchCamera() {
    if (this.props.core.status.videoRefuse) {
      ZegoConfirm({
        title: "Equipment authorization",
        content:
          "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
        confirm: "Okay",
      });
      return;
    }

    if (!this.state.localStream || this.cameraDevices.length < 2) {
      return;
    }

    let targetModel = false;
    if (this.faceModel === -1) {
      return;
    } else if (this.faceModel === 0) {
      targetModel = true;
    }
    this.faceModel = -1;
    this.state.localStream.getVideoTracks()[0].stop();
    this.state.localStream.getAudioTracks()[0].stop();
    try {
      const solution = getVideoResolution(
        this.props.core._config.videoResolutionList![0]
      );
      const stream = await this.props.core.createStream({
        camera: {
          video: !this.props.core.status.videoRefuse,
          audio: !this.props.core.status.audioRefuse,
          videoQuality: 4,
          facingMode: !this.state.cameraFront ? "user" : "environment",
          ...solution,
          //   width: 640,
          //   height: 360,
          //   bitrate: 400,
          //   frameRate: 15,
        },
      });
      let videoTrack = stream.getVideoTracks()[0];
      !this.state.cameraOpen && (videoTrack.enabled = false);
      let audioTrack = stream.getAudioTracks()[0];
      await this.props.core.replaceTrack(this.state.localStream, videoTrack);
      await this.props.core.replaceTrack(this.state.localStream, audioTrack);
    } catch (error) {
      console.error("【ZEGOCLOUD】switch camera failed!", error);
    }

    this.faceModel = targetModel ? 1 : 0;
    this.setState({
      cameraFront: targetModel,
    });
  }

  toggleLayOut(
    layOutStatus:
      | "ONE_VIDEO"
      | "INVITE"
      | "USER_LIST"
      | "MESSAGE"
      | "LAYOUT"
      | "WHITEBOARD"
  ) {
    this.setState(
      (state: {
        layOutStatus:
          | "ONE_VIDEO"
          | "INVITE"
          | "USER_LIST"
          | "MESSAGE"
          | "LAYOUT"
          | "WHITEBOARD";
        showMore: boolean;
      }) => {
        return {
          layOutStatus:
            state.layOutStatus === layOutStatus ? "ONE_VIDEO" : layOutStatus,
          showMore: false,
        };
      }
    );
  }

  async sendMessage(msg: string) {
    let messageID = randomNumber(3);
    this.setState((state: { messageList: ZegoBroadcastMessageInfo2[] }) => {
      return {
        messageList: [
          ...state.messageList,
          {
            fromUser: {
              userID: this.props.core._expressConfig.userID,
              userName: this.props.core._expressConfig.userName,
            },
            message: msg,
            sendTime: Date.now(),
            messageID,
            status: "SENDING",
          },
        ],
      };
    });
    let resp = {} as any;
    try {
      resp = await this.props.core.sendRoomMessage(msg);
    } catch (err) {
      console.error("【ZEGOCLOUD】sendMessage failed!", JSON.stringify(err));
    }
    this.setState((state: { messageList: ZegoBroadcastMessageInfo2[] }) => {
      const _messageList = state.messageList.map((msg) => {
        if (msg.messageID === messageID) {
          msg.status = resp.errorCode === 0 ? "SENDED" : "FAILED";
        }
        return msg;
      });
      console.log(_messageList);
      return {
        messageList: _messageList,
      };
    });
  }

  onblur = (e: { path?: any[] }) => {
    if (
      e.path &&
      !e.path.includes(document.querySelector("#ZegoRoomCssMobileMore")) &&
      !e.path.includes(document.querySelector("#ZegoRoomCssMobilePopMore"))
    ) {
      this.setState({ showMore: false });
      // @ts-ignore
      document.removeEventListener("click", this.onblur);
    }
  };

  openMore() {
    this.setState(
      (state: { showMore: boolean }) => {
        return { showMore: !state.showMore };
      },
      () => {
        if (this.state.showMore) {
          // @ts-ignore
          document.addEventListener("click", this.onblur);
        } else {
          // @ts-ignore
          document.removeEventListener("click", this.onblur);
        }
      }
    );
  }

  leaveRoom() {
    ZegoConfirm({
      title: "Leave the room",
      content: "Are you sure to leave the room?",
      cancel: "Cancel",
      confirm: "Confirm",
      closeCallBack: (confirm: boolean) => {
        if (confirm) {
          this.confirmLeaveRoom();
        }
      },
    });
  }

  private confirmLeaveRoom(isKickedOut = false) {
    this.props.core._config.turnOnCameraWhenJoining = this.state.cameraOpen;
    this.props.core._config.turnOnMicrophoneWhenJoining = this.state.micOpen;
    this.state.localStream &&
      this.props.core.destroyStream(this.state.localStream);

    this.props.core.leaveRoom();
    this.props.leaveRoom && this.props.leaveRoom(isKickedOut);
  }

  getAllUser(): ZegoCloudUserList {
    return [
      {
        userID: this.props.core._expressConfig.userID,
        userName: this.props.core._expressConfig.userName,
        pin: this.localUserPin,
        avatar: this.props.core._expressConfig.avatar,
        streamList: [
          {
            media: this.state.localStream!,
            fromUser: {
              userID: this.props.core._expressConfig.userID,
              userName: this.props.core._expressConfig.userName,
            },
            micStatus: this.state.micOpen ? "OPEN" : "MUTE",
            cameraStatus: this.state.cameraOpen ? "OPEN" : "MUTE",
            state: "PLAYING",
            streamID: this.localStreamID,
          },
        ],
      },
      ...this.state.zegoCloudUserList,
    ];
  }

  getAllMemberList(): ZegoCloudUserList {
    return [
      {
        userID: this.props.core._expressConfig.userID,
        userName: this.props.core._expressConfig.userName,
        pin: this.localUserPin,
        avatar: this.props.core._expressConfig.avatar,
        streamList: [
          {
            media: this.state.localStream!,
            fromUser: {
              userID: this.props.core._expressConfig.userID,
              userName: this.props.core._expressConfig.userName,
            },
            micStatus: this.state.micOpen ? "OPEN" : "MUTE",
            cameraStatus: this.state.cameraOpen ? "OPEN" : "MUTE",
            state: "PLAYING",
            streamID: this.localStreamID,
          },
        ],
      },
      ...this.state.memberList,
    ];
  }

  getShownUser() {
    const shownUser = this.getAllUser().filter((item) => {
      if (!this.props.core._config.showNonVideoUser) {
        if (
          item.streamList &&
          item.streamList[0] &&
          (item.streamList[0].media ||
            item.streamList[0].urlsHttpsFLV ||
            item.streamList[0].urlsHttpsHLS)
        ) {
          if (item.streamList[0].cameraStatus === "OPEN") {
            return true;
          } else if (
            this.props.core._config.showOnlyAudioUser &&
            item.streamList[0].micStatus === "OPEN"
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return true;
      }
    });

    // if (
    //   this._selectedUser &&
    //   !shownUser.some((su) => su.userID === this._selectedUser.userID) &&
    //   this.state.layOutStatus === "MANAGE"
    // ) {
    //   this.setState({
    //     layOutStatus: "ONE_VIDEO",
    //   });
    // }

    return shownUser as ZegoCloudUserList;
  }

  getHiddenUser() {
    const hiddenUser = this.getAllUser().filter((item) => {
      if (
        !this.props.core._config.showNonVideoUser &&
        item.streamList &&
        item.streamList[0] &&
        (item.streamList[0].media ||
          item.streamList[0].urlsHttpsFLV ||
          item.streamList[0].urlsHttpsHLS) &&
        item.streamList[0].cameraStatus !== "OPEN" &&
        !this.props.core._config.showOnlyAudioUser &&
        item.streamList[0].micStatus === "OPEN"
      ) {
        return true;
      } else {
        return false;
      }
    });

    return (
      <>
        {hiddenUser.map((user) => {
          return (
            <ZegoAudio
              muted={user.userID === this.props.core._expressConfig.userID}
              key={user.userID + "_hiddenAudio"}
              userInfo={user}
            ></ZegoAudio>
          );
        })}
      </>
    );
  }
  async manageSelectCallback(
    type?: "Pin" | "Mic" | "Camera" | "Remove",
    value?: boolean
  ) {
    if (type === "Pin" && typeof value != "undefined") {
      if (this._selectedUser.userID !== this.props.core._expressConfig.userID) {
        this.props.core.setPin(this._selectedUser.userID, value);
        this.localUserPin = false;
      } else {
        this.localUserPin = value;
        this._selectedUser.pin = value;
        this.props.core.setPin();
      }
      this.setState(
        {
          userLayoutStatus: "Sidebar",
        },
        () => {
          this.handleLayoutChange("Sidebar");
        }
      );
      this.props.core.setSidebarLayOut(
        this.state.screenSharingUserList.length > 0 ? false : !this.localUserPin
      );
    }
    if (type === "Mic") {
      if (this._selectedUser.streamList?.[0]?.micStatus === "OPEN") {
        let res;
        if (
          this._selectedUser.userID === this.props.core._expressConfig.userID
        ) {
          res = await this.toggleMic();
        } else {
          res = await this.props.core.turnRemoteMicrophoneOff(
            this._selectedUser.userID
          );
        }
        res &&
          ZegoToast({
            content: "Turned off the microphone successfully.",
          });
      }
    }
    if (type === "Camera") {
      if (this._selectedUser.streamList?.[0]?.cameraStatus === "OPEN") {
        let res;
        if (
          this._selectedUser.userID === this.props.core._expressConfig.userID
        ) {
          res = await this.toggleCamera();
        } else {
          res = await this.props.core.turnRemoteCameraOff(
            this._selectedUser.userID
          );
        }
        res &&
          ZegoToast({
            content: "Turned off the camera successfully.",
          });
      }
    }
    if (type === "Remove") {
      ZegoModelShow({
        header: "Remove participant",
        contentText:
          "Are you sure to remove " + this._selectedUser.userName + " ?",
        okText: "Confirm",
        cancelText: "Cancel",
        onOk: () => {
          this.props.core.removeMember(this._selectedUser.userID);
        },
      });
    }
  }
  private _selectedUser!: ZegoCloudUser;
  get showSelf() {
    if (this.props.core._config.showNonVideoUser) {
      return true;
    } else {
      if (this.props.core._config.showOnlyAudioUser) {
        return (
          this.localStreamID && (this.state.micOpen || this.state.cameraOpen)
        );
      } else {
        return this.localStreamID && this.state.cameraOpen;
      }
    }
  }
  async handleLayoutChange(
    selectLayout: "Auto" | "Grid" | "Sidebar"
  ): Promise<boolean> {
    if (selectLayout !== "Sidebar") {
      this._selectedUser && (this._selectedUser.pin = false);
      this.localUserPin = false;
      this.props.core.setPin(undefined, undefined, true);
    }
    this.setState({
      userLayoutStatus: selectLayout,
    });
    return new Promise(async (resolve, reject) => {
      if (this.state.screenSharingUserList.length) {
        if (!this.state.isScreenPortrait) {
          // 横屏下隐藏顶部视频
          await this.props.core.setMaxScreenNum(0, true);
        } else {
          await this.props.core.setMaxScreenNum(this.showSelf ? 3 : 4, true);
        }
      } else if (selectLayout !== "Sidebar") {
        await this.props.core.setMaxScreenNum(this.showSelf ? 5 : 6, true);
      } else {
        await this.props.core.setMaxScreenNum(this.showSelf ? 4 : 5, true);
      }

      this.userUpdateCallBack = () => {
        resolve(true);
      };
      setTimeout(() => {
        resolve(false);
      }, 5000);
      let sidebarEnabled = false;

      if (selectLayout === "Sidebar") {
        if (this.state.cameraOpen || this.state.micOpen) {
          sidebarEnabled = !this.localUserPin;
        } else {
          sidebarEnabled = true;
        }
      }
      await this.props.core.setSidebarLayOut(
        this.state.screenSharingUserList.length > 0 ? false : sidebarEnabled
      );
    });
  }
  get showTurnOffMicrophoneButton() {
    if (!this.props.core._config.showTurnOffRemoteMicrophoneButton)
      return false;
    if (this._selectedUser.streamList?.length === 0) return false;
    return (
      this.props.core._config.scenario?.config?.role === LiveRole.Host ||
      (this._selectedUser.userID === this.props.core._expressConfig.userID &&
        this.props.core._config.scenario?.config?.role === LiveRole.Cohost)
    );
  }
  get showTurnOffCameraButton() {
    if (!this.props.core._config.showTurnOffRemoteCameraButton) return false;
    if (this._selectedUser.streamList?.length === 0) return false;
    return (
      this.props.core._config.scenario?.config?.role === LiveRole.Host ||
      (this._selectedUser.userID === this.props.core._expressConfig.userID &&
        this.props.core._config.scenario?.config?.role === LiveRole.Cohost)
    );
  }
  get showRemoveButton() {
    if (!this.props.core._config.showRemoveUserButton) return false;
    return (
      this.props.core._config?.scenario?.config?.role === LiveRole.Host &&
      (this._selectedUser.userID !== this.props.core._expressConfig.userID ||
        this._selectedUser?.streamList?.length === 0)
    );
  }
  get isShownPin(): boolean {
    if (this.props.core._config.scenario?.mode === ScenarioModel.OneONoneCall) {
      return false;
    }
    let showPinButton = !!this.props.core._config.showPinButton;
    return (
      showPinButton &&
      (this.props.core._config.showNonVideoUser ||
        this._selectedUser?.streamList?.[0]?.cameraStatus === "OPEN" ||
        (this._selectedUser?.streamList?.[0]?.micStatus === "OPEN" &&
          !!this.props.core._config.showOnlyAudioUser))
    );
  }
  showManager(user?: ZegoCloudUser): boolean {
    if (!user) return false;
    return (
      this.showTurnOffMicrophoneButton ||
      this.showTurnOffCameraButton ||
      this.showRemoveButton ||
      this.isShownPin
    );
  }

  getListScreen() {
    let pages;
    if (this.state.layOutStatus === "INVITE") {
      pages = (
        <ZegoRoomInvite
          core={this.props.core}
          closeCallBack={() => {
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }}
        ></ZegoRoomInvite>
      );
    } else if (this.state.layOutStatus === "USER_LIST") {
      pages = (
        <ZegoUserList
          core={this.props.core}
          userList={this.getAllMemberList()}
          closeCallBack={(_user?: ZegoCloudUser) => {
            _user && (this._selectedUser = _user);
            console.warn(this.showManager(_user));
            this.setState({
              layOutStatus: this.showManager(_user) ? "MANAGE" : "ONE_VIDEO",
            });
          }}
        ></ZegoUserList>
      );
    } else if (this.state.layOutStatus === "MESSAGE") {
      pages = (
        <ZegoMessage
          userID={this.props.core._expressConfig.userID}
          messageList={this.state.messageList}
          sendMessage={(msg: string) => {
            this.sendMessage(msg);
          }}
          getAvatar={(userID: string) => {
            const user = this.getAllMemberList().find(
              (u) => u.userID === userID
            );
            return user?.avatar || "";
          }}
          closeCallBac={() => {
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }}
        ></ZegoMessage>
      );
    } else if (this.state.layOutStatus === "LAYOUT") {
      pages = (
        <ZegoLayout
          selectLayout={this.state.userLayoutStatus}
          closeCallBac={() => {
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }}
          selectCallBack={this.handleLayoutChange.bind(this)}
        ></ZegoLayout>
      );
    } else if (this.state.layOutStatus === "MANAGE") {
      pages = (
        <ZegoManage
          closeCallback={() => {
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }}
          selectCallback={this.manageSelectCallback.bind(this)}
          selectedUser={this._selectedUser}
          showPinButton={this.isShownPin}
          showMicButton={this.showTurnOffMicrophoneButton}
          showCameraButton={this.showTurnOffCameraButton}
          showRemoveButton={this.showRemoveButton}
        ></ZegoManage>
      );
    }

    if (pages) {
      return (
        <div
          className={`${ZegoRoomCss.mask}  zegocloud_layout_Mask`}
          onClick={(ev) => {
            // @ts-ignore
            const className: string = ev.target.className;
            if (className.includes("zegocloud_layout_Mask")) {
              this.setState({
                layOutStatus: "ONE_VIDEO",
              });
            }
          }}
        >
          {pages}
        </div>
      );
    }
  }

  getLayoutScreen() {
    if (
      this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
      this.props.core._config.scenario?.config?.role === LiveRole.Audience &&
      this.state.liveStatus != "1"
    ) {
      return (
        <div className={`${ZegoRoomCss.liveNotStart} zegoUserVideo_click`}>
          <i></i>
          <span>The Live has not started yet</span>
        </div>
      );
    } else if (
      ![...this.getAllUser(), ...this.state.screenSharingUserList].some((u) => {
        if (u.streamList) {
          return u.streamList.some((s) => {
            return s.cameraStatus === "OPEN" || s.micStatus === "OPEN";
          });
        }
        return false;
      }) &&
      this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming
    ) {
      return (
        <div className={`${ZegoRoomCss.noOneStreaming} zegoUserVideo_click`}>
          <i></i>
          <span>No one has turned on the camera or microphone yet.</span>
        </div>
      );
    }

    if (this.state.screenSharingUserList.length > 0) {
      return (
        <>
          {this.state.isScreenPortrait && (
            <div className={ZegoRoomCss.screenTopBar}>
              <p>
                <span>{this.state.screenSharingUserList[0].userName}</span> is
                presenting.
              </p>
              {this.showRoomTimerUI && (
                <ZegoTimer time={this.state.roomTime}></ZegoTimer>
              )}
            </div>
          )}
          <ZegoScreen
            selfInfo={{
              userID: this.props.core._expressConfig.userID,
            }}
            userList={this.getShownUser()}
            screenSharingUser={this.state.screenSharingUserList[0]}
            videoShowNumber={5}
            soundLevel={this.state.soundLevel}
          ></ZegoScreen>
        </>
      );
    }

    if (this.state.isZegoWhiteboardSharing) {
      return (
        <>
          {this.state.isScreenPortrait && this.showRoomTimerUI && (
            <div
              className={`${ZegoRoomCss.screenTopBar} ${ZegoRoomCss.center}`}
            >
              <ZegoTimer time={this.state.roomTime}></ZegoTimer>
            </div>
          )}
          <ZegoWhiteboard
            userList={this.getShownUser()}
            videoShowNumber={5}
            selfInfo={{
              userID: this.props.core._expressConfig.userID,
            }}
            // isSelfScreen={this.state.isWhiteboardSharingBySelf}
            soundLevel={this.state.soundLevel}
            roomID={this.props.core._expressConfig.roomID}
            onShow={async (el: HTMLDivElement) => {
              // 主动渲染
              if (
                this.isCreatingWhiteboardSharing &&
                !this.state.zegoSuperBoardView
              ) {
                try {
                  const zegoSuperBoardView =
                    await this.props.core.createAndPublishWhiteboard(
                      el,
                      this.props.core._expressConfig.userName
                    );
                  this.setState({
                    isWhiteboardSharingBySelf: true,
                    zegoSuperBoardView,
                  });
                } catch (error: any) {
                  console.error("createAndPublishWhiteboard", error);
                  ZegoModelShow(
                    {
                      header: "Notice",
                      contentText:
                        "Operation too frequent, failed to load the whiteboard.",
                      okText: "Okay",
                    },
                    document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
                  );
                }
                this.isCreatingWhiteboardSharing = false;
              } else if (this.state.zegoSuperBoardView) {
                // 被动渲染
                const uniqueID = this.state.zegoSuperBoardView
                  .getCurrentSuperBoardSubView()
                  ?.getModel().uniqueID;
                uniqueID &&
                  this.state.zegoSuperBoardView.switchSuperBoardSubView(
                    uniqueID
                  );
              }
            }}
            onResize={(el: HTMLDivElement) => {
              // 主动渲染
            }}
            onclose={() => {
              this.toggleWhiteboardSharing();
            }}
            onToolChange={(type: number, fontSize?: number, color?: string) => {
              this.props.core.setWhiteboardToolType(type, fontSize, color);
            }}
            onFontChange={(
              font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC",
              fontSize?: number,
              color?: string
            ) => {
              this.props.core.setWhiteboardFont(font, fontSize, color);
            }}
            onImageAdd={async () => {
              // if (isFireFox()) {
              //   await this.switchCamera();
              //   setTimeout(() => {
              //     this.switchCamera();
              //   }, 1000);
              // }
            }}
            zegoSuperBoardView={this.state.zegoSuperBoardView}
          ></ZegoWhiteboard>
        </>
      );
    }

    if (
      (this.state.userLayoutStatus === "Auto" &&
        this.getShownUser().length < 3) ||
      this.getShownUser().length < 2
    ) {
      return (
        <>
          {this.showRoomTimerUI && (
            <div
              className={`${ZegoRoomCss.screenTopBar} ${ZegoRoomCss.center}`}
            >
              <ZegoTimer time={this.state.roomTime}></ZegoTimer>
            </div>
          )}
          <ZegoOne2One
            selfInfo={{
              userID: this.props.core._expressConfig.userID,
            }}
            userList={this.getShownUser()}
            soundLevel={this.state.soundLevel}
            onLocalStreamPaused={async () => {
              await this.props.core.enableVideoCaptureDevice(
                this.state.localStream!,
                !this.state.cameraOpen
              );
              this.props.core.enableVideoCaptureDevice(
                this.state.localStream!,
                this.state.cameraOpen
              );
            }}
          ></ZegoOne2One>
        </>
      );
    } else if (
      (this.state.userLayoutStatus === "Grid" &&
        this.getShownUser().length > 1) ||
      (this.state.userLayoutStatus === "Auto" && this.getShownUser().length > 2)
    ) {
      return (
        <>
          {this.showRoomTimerUI && (
            <div
              className={`${ZegoRoomCss.screenTopBar} ${ZegoRoomCss.center}`}
            >
              <ZegoTimer time={this.state.roomTime}></ZegoTimer>
            </div>
          )}
          <ZegoGrid
            selfInfo={{
              userID: this.props.core._expressConfig.userID,
            }}
            userList={this.getShownUser()}
            videoShowNumber={6}
            soundLevel={this.state.soundLevel}
          ></ZegoGrid>
        </>
      );
    } else if (
      this.state.userLayoutStatus === "Sidebar" &&
      this.getShownUser().length > 1
    ) {
      return (
        <>
          {this.showRoomTimerUI && (
            <div
              className={`${ZegoRoomCss.screenTopBar} ${ZegoRoomCss.center}`}
            >
              <ZegoTimer time={this.state.roomTime}></ZegoTimer>
            </div>
          )}
          <ZegoSidebar
            selfInfo={{
              userID: this.props.core._expressConfig.userID,
            }}
            userList={this.getShownUser()}
            videoShowNumber={5}
            soundLevel={this.state.soundLevel}
          ></ZegoSidebar>
        </>
      );
    }
  }

  clickVideo(e: MouseEvent) {
    // @ts-ignore
    let className: string = e.target.className;
    let whiteboardClick = false;
    if (
      // @ts-ignore
      (e.target?.id as string).startsWith("zego-whiteboard-") &&
      // @ts-ignore
      e.target.parentElement
    ) {
      // @ts-ignore
      className = e.target.parentElement?.className;
      whiteboardClick = true;
    }

    if (
      className.includes("zegoUserVideo_videoCommon") ||
      className.includes("zegoMore_more") ||
      className.includes("ZegoRoomMobile_ZegoRoom") ||
      className.includes("zegoUserVideo_click")
    ) {
      if (!this.state.showFooter) {
        // 横屏白板不展示底部工具栏
        if (
          !this.state.isZegoWhiteboardSharing ||
          this.state.isScreenPortrait
        ) {
          this.setState({ showFooter: true });
        }
      } else {
        if (this.state.layOutStatus != "ONE_VIDEO") {
          this.setState({
            layOutStatus: "ONE_VIDEO",
          });
          clearTimeout(this.footerTimer);
          this.footerTimer = setTimeout(() => {
            this.setState({ showFooter: false, showMore: false });
          }, 5000);
        } else {
          this.setState({ showFooter: false, showMore: false });
        }
      }
      !whiteboardClick && e.stopPropagation();
    } else {
      clearTimeout(this.footerTimer);
      this.footerTimer = setTimeout(() => {
        !this.state.showMore &&
          this.setState({ showFooter: false, showMore: false });
      }, 5000);
    }
  }

  async setLive() {
    if (this.state.liveCountdown === 0) {
      ZegoModelShow({
        header: "Stop broadcast",
        contentText: "Are you sure to stop broadcasting?",
        okText: "Stop",
        cancelText: "Cancel",
        onOk: async () => {
          // stop live
          const res = await this.props.core.setLive("stop");
          this.setState({
            liveCountdown: -1,
          });
        },
      });
    } else if (this.state.liveCountdown === -1) {
      this.setState(
        {
          liveCountdown: 3,
        },
        () => {
          setTimeout(() => {
            this.liveCountdownTimer();
          }, 1000);
        }
      );
    }
  }

  liveCountdownTimer() {
    this.setState(
      (preState: { liveCountdown: number }) => {
        return {
          liveCountdown: preState.liveCountdown - 1,
        };
      },
      async () => {
        if (this.state.liveCountdown === 0) {
          const res = await this.props.core.setLive("live");
        } else {
          setTimeout(() => {
            this.liveCountdownTimer();
          }, 1000);
        }
      }
    );
  }

  async toggleWhiteboardSharing() {
    if (this.state.screenSharingUserList.length > 0) return;
    if (this.state.isZegoWhiteboardSharing) {
      this.closeWhiteboardSharing();
    } else if (!this.state.isZegoWhiteboardSharing) {
      this.createWhiteboardSharing();
    }
  }

  isCreatingWhiteboardSharing = false;
  async createWhiteboardSharing() {
    if (this.state.screenSharingUserList.length > 0) {
      ZegoToast({
        content: `${this.state.screenSharingUserList[0].userName} is presenting now. You cannot share your whiteboard.`,
      });

      return;
    } else if (this.state.zegoSuperBoardView) {
      ZegoToast({
        content: `${
          this.state.zegoSuperBoardView.getCurrentSuperBoardSubView()?.getModel
            .name
        } is presenting now. You cannot share your whiteboard.`,
      });
      return;
    }

    if (this.isCreatingWhiteboardSharing) return;
    this.isCreatingWhiteboardSharing = true;
    this.setState({
      isZegoWhiteboardSharing: true,
      showFooter: this.state.isScreenPortrait ? this.state.showFooter : false,
    });
  }

  closeWhiteboardSharing() {
    try {
      this.state.zegoSuperBoardView &&
        this.props.core.destroyAndStopPublishWhiteboard();
      this.setState({
        isWhiteboardSharingBySelf: false,
        isZegoWhiteboardSharing: false,
        zegoSuperBoardView: null,
      });
      this.isCreatingWhiteboardSharing = false;
    } catch (error) {
      console.error(error);
    }
  }
  startRoomTimer() {
    if (this.roomTimer) return;
    this.roomTimer = setInterval(() => {
      this.setState({ roomTime: formatTime(++this.roomTimeNum) });
    }, 1000);
  }
  onOrientationChange() {
    let isScreenPortrait;
    if (window.orientation === 180 || window.orientation === 0) {
      // 竖屏
      isScreenPortrait = true;
    }
    if (window.orientation === 90 || window.orientation === -90) {
      // 横屏
      isScreenPortrait = false;
    }
    if (!isScreenPortrait) {
      this.setState({ showFooter: false });
    }
    this.setState(
      {
        isScreenPortrait: isScreenPortrait,
      },
      () => {
        this.state.zegoSuperBoardView
          ?.getCurrentSuperBoardSubView()
          ?.reloadView();
      }
    );
  }
  render(): React.ReactNode {
    const startIndex =
      this.state.notificationList.length < 4
        ? 0
        : this.state.notificationList.length - 2;

    return (
      <ShowManageContext.Provider
        value={{
          show: (_user: ZegoCloudUser) => {
            _user && (this._selectedUser = _user);
            this.setState({
              layOutStatus: this.showManager(_user) ? "MANAGE" : "ONE_VIDEO",
            });
          },
          showPinButton:
            (!!this.props.core._config.showPinButton ||
              !!this.props.core._config.showTurnOffRemoteCameraButton ||
              !!this.props.core._config.showTurnOffRemoteMicrophoneButton ||
              !!this.props.core._config.showRemoveUserButton) &&
            this.getShownUser().length > 1,
          whiteboard_page:
            this.state.zegoSuperBoardView
              ?.getCurrentSuperBoardSubView()
              ?.getCurrentPage() || 1,
          whiteboard_toolType:
            this.props.core.zegoSuperBoard?.getToolType() || 0,
          whiteboard_fontSize:
            this.props.core.zegoSuperBoard?.getFontSize() || 0,
          whiteboard_brushSize:
            this.props.core.zegoSuperBoard?.getBrushSize() || 0,
          whiteboard_brushColor:
            this.props.core.zegoSuperBoard?.getBrushColor() || "",
          whiteboard_isFontBold: this.props.core.zegoSuperBoard?.isFontBold(),
          whiteboard_isFontItalic:
            this.props.core.zegoSuperBoard?.isFontItalic(),
          whiteboard_showAddImage:
            this.props.core._config.whiteboardConfig?.showAddImageButton,
          whiteboard_showCreateClose:
            this.props.core._config.whiteboardConfig?.showCreateAndCloseButton,
          userInfo: { userID: this.props.core._expressConfig.userID },
        }}
      >
        <div
          className={`${ZegoRoomCss.ZegoRoom}  ZegoRoomMobile_ZegoRoom ${
            this.props.core._config.scenario?.mode ===
            ScenarioModel.LiveStreaming
              ? this.props.core._config.scenario?.config?.role === LiveRole.Host
                ? ZegoRoomCss.host
                : this.props.core._config.scenario?.config?.role ===
                  LiveRole.Audience
                ? ZegoRoomCss.audience
                : ""
              : ""
          }`}
          onClick={(e) => {
            // @ts-ignore
            this.clickVideo(e);
          }}
        >
          {this.getLayoutScreen()}
          {this.state.isNetworkPoor && (
            <div className={ZegoRoomCss.network}></div>
          )}
          {(this.state.showFooter || false) && (
            <div className={ZegoRoomCss.footer}>
              {this.props.core._config.showMyCameraToggleButton &&
                (this.props.core._config.scenario?.mode !==
                  ScenarioModel.LiveStreaming ||
                  this.props.core._config.scenario?.config?.role ===
                    LiveRole.Cohost) && (
                  <a
                    className={`${ZegoRoomCss.switchCamera}`}
                    onClick={() => {
                      this.switchCamera();
                    }}
                  ></a>
                )}

              {this.props.core._config.showMyCameraToggleButton && (
                <a
                  className={
                    this.state.cameraOpen
                      ? ZegoRoomCss.toggleCamera
                      : ZegoRoomCss.cameraClose
                  }
                  onClick={() => {
                    this.toggleCamera();
                  }}
                ></a>
              )}

              {this.props.core._config.showMyMicrophoneToggleButton && (
                <a
                  className={
                    this.state.micOpen
                      ? ZegoRoomCss.toggleMic
                      : ZegoRoomCss.micClose
                  }
                  onClick={() => {
                    this.toggleMic();
                  }}
                ></a>
              )}

              <a
                className={
                  this.props.core._config.scenario?.mode ===
                  ScenarioModel.LiveStreaming
                    ? ZegoRoomCss.liveLeaveButton
                    : ZegoRoomCss.leaveRoom
                }
                onClick={() => {
                  this.leaveRoom();
                }}
              ></a>

              {(this.props.core._config.showTextChat ||
                this.props.core._config.showUserList ||
                this.props.core._config.sharedLinks) && (
                <a
                  id="ZegoRoomCssMobileMore"
                  className={ZegoRoomCss.more}
                  onClick={() => {
                    this.openMore();
                  }}
                >
                  {(this.state.showMore || false) && (
                    <div
                      id="ZegoRoomCssMobilePopMore"
                      className={`${ZegoRoomCss.popMore} ${ZegoRoomCss.popLiveMore}`}
                    >
                      <div className={ZegoRoomCss.popMoreContent}>
                        {this.props.core._config.showMyCameraToggleButton &&
                          this.props.core._config.scenario?.mode ===
                            ScenarioModel.LiveStreaming &&
                          this.props.core._config.scenario.config?.role ===
                            LiveRole.Host && (
                            <div
                              className={`${ZegoRoomCss.switchCamera} zegoUserVideo_click`}
                              onClick={() => {
                                this.switchCamera();
                              }}
                            >
                              <i
                                className={`${ZegoRoomCss.switchCamera} zegoUserVideo_click`}
                              ></i>
                              <span>Flip</span>
                            </div>
                          )}

                        {this.props.core._config.preJoinViewConfig
                          ?.invitationLink && (
                          <div
                            className={ZegoRoomCss.roomDetail}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              this.toggleLayOut("INVITE");
                            }}
                          >
                            <i className={ZegoRoomCss.details}></i>
                            <span>Room details</span>
                          </div>
                        )}

                        {this.props.core._config.showUserList && (
                          <div
                            onClick={(ev) => {
                              ev.stopPropagation();
                              this.toggleLayOut("USER_LIST");
                            }}
                          >
                            <i className={ZegoRoomCss.member}></i>
                            <span>Member</span>
                          </div>
                        )}
                        {this.props.core._config.showTextChat && (
                          <div
                            onClick={(ev) => {
                              ev.stopPropagation();
                              this.toggleLayOut("MESSAGE");
                            }}
                          >
                            <i className={ZegoRoomCss.chat}></i>
                            <span>Chat</span>
                          </div>
                        )}
                        {this.props.core._config.showLayoutButton && (
                          <div
                            onClick={(ev) => {
                              ev.stopPropagation();
                              this.toggleLayOut("LAYOUT");
                            }}
                          >
                            <i className={ZegoRoomCss.layout}></i>
                            <span>Layout</span>
                          </div>
                        )}

                        {this.props.core._config.plugins
                          ?.ZegoSuperBoardManager &&
                          this.props.core._config.whiteboardConfig
                            ?.showCreateAndCloseButton && (
                            <div
                              onClick={(ev) => {
                                ev.stopPropagation();
                                this.toggleLayOut("WHITEBOARD");
                                this.toggleWhiteboardSharing();
                              }}
                            >
                              <i
                                className={`${ZegoRoomCss.whiteboard} ${
                                  this.state.isZegoWhiteboardSharing
                                    ? ZegoRoomCss.sharing
                                    : ""
                                } ${
                                  this.state.screenSharingUserList.length > 0
                                    ? ZegoRoomCss.forbiddenSharing
                                    : ""
                                }`}
                              ></i>
                              <span>Whiteboard</span>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                  {(this.state.showMore || false) && (
                    <div className={ZegoRoomCss.popMoreArray}></div>
                  )}
                </a>
              )}

              {this.props.core._config.scenario?.mode ===
                ScenarioModel.LiveStreaming &&
                this.props.core._config.scenario.config?.role ===
                  LiveRole.Host && (
                  <a
                    className={`${ZegoRoomCss.goLive}  ${
                      this.state.liveCountdown === 0
                        ? ZegoRoomCss.goLiveEnabled
                        : ""
                    }`}
                    onClick={() => {
                      this.setLive();
                    }}
                  >
                    {this.state.liveCountdown === 3 ||
                    this.state.liveCountdown === -1
                      ? "Go Live"
                      : this.state.liveCountdown === 0
                      ? "Stop"
                      : "Go Live"}
                  </a>
                )}
            </div>
          )}
          {this.getListScreen()}
          <>{this.getHiddenUser()}</>
          <div className={ZegoRoomCss.notify}>
            {this.state.notificationList.slice(startIndex).map((notify) => {
              if (notify.type === "MSG") {
                return (
                  <div
                    key={notify.content}
                    className={ZegoRoomCss.notifyContent}
                  >
                    <h5>{notify.userName}</h5>
                    <span>{notify.content}</span>
                  </div>
                );
              } else {
                return (
                  <div
                    key={notify.content}
                    className={ZegoRoomCss.notifyContent}
                  >
                    <span>{notify.content}</span>
                  </div>
                );
              }
            })}
          </div>
          {this.state.liveCountdown > 0 && (
            <div className={ZegoRoomCss.countDown}>
              <div>{this.state.liveCountdown}</div>
            </div>
          )}
          {(this.state.connecting || false) && (
            <ZegoReconnect
              content={
                this.state.firstLoading || false
                  ? "Joining Room"
                  : "Trying to reconnect..."
              }
            ></ZegoReconnect>
          )}

          {this.props.core._config.scenario?.mode ===
            ScenarioModel.LiveStreaming &&
            (this.state.liveCountdown === 0 ||
              this.state.liveStatus == "1") && (
              <button
                className={`${ZegoRoomCss.LiveStateButton}  ${
                  this.state.showFooter
                    ? ""
                    : ZegoRoomCss.LiveStateButtonNoFooter
                }`}
              >
                Live
              </button>
            )}
        </div>
      </ShowManageContext.Provider>
    );
  }
}
