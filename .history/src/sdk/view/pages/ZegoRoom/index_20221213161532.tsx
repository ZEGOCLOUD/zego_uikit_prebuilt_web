import React, { RefObject } from "react";
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

import { ZegoTimer } from "./components/zegoTimer";
import { ZegoOne2One } from "./components/zegoOne2One";
import { ZegoMessage } from "./components/zegoMessage";
import {
  getVideoResolution,
  isFireFox,
  isSafari,
  randomNumber,
  throttle,
} from "../../../util";
import { ZegoSettings } from "../../components/zegoSetting";
import { ZegoModelShow } from "../../components/zegoModel";
import { ZegoToast } from "../../components/zegoToast";
import { ZegoGridLayout } from "./components/zegoGridLayout";
import { ZegoSidebarLayout } from "./components/zegoSidebarLayout";
import {
  ZegoCloudUser,
  ZegoCloudUserList,
} from "../../../modules/tools/UserListManager";
import { ZegoRoomInvite } from "./components/zegoRoomInvite";
import { ZegoUserList } from "./components/zegoUserList";
import { ZegoSoundLevelInfo } from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { ZegoScreenSharingLayout } from "./components/ZegoScreenSharingLayout";
import { ZegoSuperBoardView } from "zego-superboard-web";
import { ZegoWhiteboardSharingLayout } from "./components/ZegoWhiteboardSharingLayout";
import ShowManageContext from "../context/showManage";
import ZegoAudio from "../../components/zegoMedia/audio";
export class ZegoRoom extends React.PureComponent<ZegoBrowserCheckProp> {
  state: {
    localStream: undefined | MediaStream;
    layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
    zegoCloudUserList: ZegoCloudUserList;
    messageList: ZegoBroadcastMessageInfo2[];
    notificationList: ZegoNotification[];
    micOpen: boolean;
    cameraOpen: boolean;
    showSettings: boolean;
    isNetworkPoor: boolean;
    connecting: boolean;
    firstLoading: boolean;
    selectMic: string | undefined;
    selectSpeaker: string | undefined;
    selectCamera: string | undefined;
    selectVideoResolution: string;
    showNonVideoUser: boolean;
    videoShowNumber: number; // ?????????????????????
    gridRowNumber: number; // Grid ??????
    layout: "Auto" | "Grid" | "Sidebar";
    showLayoutSettingsModel: boolean; // ??????????????????????????????
    isLayoutChanging: boolean; // ???????????????????????????
    soundLevel: SoundLevelMap;
    liveCountdown: number;
    liveStatus: "1" | "0";
    isScreenSharingBySelf: boolean; // ??????????????????????????????

    screenSharingStream: undefined | MediaStream; // ?????????????????????
    zegoSuperBoardView: ZegoSuperBoardView | null; // ??????????????????
    isZegoWhiteboardSharing: boolean; // ????????????????????????
    screenSharingUserList: ZegoCloudUserList; // ??????????????????
    showZegoSettings: boolean;
    haveUnReadMsg: boolean;
  } = {
    localStream: undefined,
    layOutStatus: "ONE_VIDEO",
    zegoCloudUserList: [],
    messageList: [],
    notificationList: [],
    micOpen: !!this.props.core._config.turnOnMicrophoneWhenJoining,
    cameraOpen: !!this.props.core._config.turnOnCameraWhenJoining,
    showSettings: false,
    isNetworkPoor: false,
    connecting: false,
    firstLoading: true,
    selectMic: this.props.core.status.micDeviceID,
    selectSpeaker: this.props.core.status.speakerDeviceID,
    selectCamera: this.props.core.status.cameraDeviceID,
    selectVideoResolution:
      this.props.core.status.videoResolution ||
      this.props.core._config.videoResolutionList![0],
    videoShowNumber: 9,
    gridRowNumber: 3,
    layout: this.props.core._config.layout || "Auto",
    showLayoutSettingsModel: false,
    isLayoutChanging: false,
    soundLevel: {},
    showNonVideoUser: this.props.core._config.showNonVideoUser as boolean,
    liveCountdown: -1,
    liveStatus: "0",
    isScreenSharingBySelf: false,

    screenSharingStream: undefined,
    zegoSuperBoardView: null,
    screenSharingUserList: [],
    showZegoSettings: false,
    haveUnReadMsg: false,
    isZegoWhiteboardSharing: false,
  };

  settingsRef: RefObject<HTMLDivElement> = React.createRef();
  moreRef: RefObject<HTMLDivElement> = React.createRef();

  micStatus: -1 | 0 | 1 = !!this.props.core._config.turnOnMicrophoneWhenJoining
    ? 1
    : 0;
  cameraStatus: -1 | 0 | 1 = !!this.props.core._config.turnOnCameraWhenJoining
    ? 1
    : 0;
  notifyTimer!: NodeJS.Timeout;
  msgDelayed = true; // 5s?????????
  localUserPin = false;
  localStreamID = "";
  screenSharingStreamID = "";
  isCreatingScreenSharing = false;
  isCreatingWhiteboardSharing = false;
  fullScreen = false;
  showNotSupported = 0;
  notSupportMultipleVideoNotice = 0;
  get isCDNLive(): boolean {
    return (
      this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
      this.props.core._config.scenario.config?.role === LiveRole.Audience &&
      (this.props.core._config.scenario.config as any).liveStreamingMode ===
        LiveStreamingMode.StandardLive
    );
  }
  userUpdateCallBack = () => {};
  componentDidMount() {
    this.setAllSinkId(this.state.selectSpeaker || "");
    this.computeByResize();
    setTimeout(() => {
      this.msgDelayed = false;
    }, 5000);
    this.initSDK();
    // ?????????????????????, ??????????????????)
    document.addEventListener("click", this.onOpenSettings);
    window.addEventListener("resize", this.onWindowResize.bind(this));
    this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
      this.props.core._config.scenario?.config?.role === LiveRole.Audience &&
      this.toggleLayOut("MESSAGE");
  }
  componentDidUpdate(
    preProps: ZegoBrowserCheckProp,
    preState: {
      localStream: undefined | MediaStream;
      layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
      zegoCloudUserList: ZegoCloudUserList;
      messageList: ZegoBroadcastMessageInfo2[];
      notificationList: ZegoNotification[];
      micOpen: boolean;
      cameraOpen: boolean;
      showMore: boolean;
      layout: string;
      videoShowNumber: number;
      liveStatus: "1" | "0";
      isScreenSharingBySelf: boolean;
      isZegoWhiteboardSharing: boolean;
      screenSharingUserList: ZegoCloudUserList;
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
      this.notifyTimer && clearTimeout(this.notifyTimer);
      this.notifyTimer = setTimeout(() => {
        this.setState({
          notificationList: [],
        });
      }, 3000);
    }
    if (
      preState.layout !== this.state.layout ||
      preState.isScreenSharingBySelf !== this.state.isScreenSharingBySelf ||
      preState.isZegoWhiteboardSharing !== this.state.isZegoWhiteboardSharing
    ) {
      this.computeByResize();
    }
    if (preState.videoShowNumber !== this.state.videoShowNumber) {
      if (preState.zegoCloudUserList === this.state.zegoCloudUserList) {
        this.userUpdateCallBack();
      }
    }
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.onOpenSettings);
    window.removeEventListener("resize", this.onWindowResize.bind(this));
    this.state.isScreenSharingBySelf && this.closeScreenSharing();
    this.state.localStream &&
      this.props.core.destroyStream(this.state.localStream);
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
        if (status === "DISCONNECTED" && type === "ROOM") {
          this.setState({
            connecting: false,
            firstLoading: false,
          });
          this.leaveRoom();
        } else if (status === "CONNECTING" && type !== "STREAM") {
          this.setState({
            connecting: true,
          });
        } else {
          this.setState({
            connecting: false,
            firstLoading: false,
          });
        }
      }
    );
    this.props.core.onRemoteUserUpdate(
      (roomID: string, updateType: "DELETE" | "ADD", userList: ZegoUser[]) => {
        let notificationList: ZegoNotification[] = [];
        if (
          this.props.core._config.lowerLeftNotification?.showUserJoinAndLeave
        ) {
          userList.forEach((u) => {
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

        this.setState((state: { notificationList: string[] }) => {
          return {
            notificationList: [...state.notificationList, ...notificationList],
          };
        });
        this.computeByResize();
      }
    );
    this.props.core.onRoomMessageUpdate(
      (roomID: string, messageList: ZegoBroadcastMessageInfo[]) => {
        this.setState(
          (state: {
            messageList: ZegoBroadcastMessageInfo2[];
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
              haveUnReadMsg: this.state.layOutStatus != "MESSAGE",
            };
          }
        );
      }
    );
    this.props.core.subscribeUserList((userList) => {
      this.userUpdateCallBack();
      if (this.isCDNLive) {
        // CDN??????????????????6??????????????????????????????
        let userListCopy: ZegoCloudUserList = JSON.parse(
          JSON.stringify(userList)
        );
        const userNum = userListCopy.filter(
          (user) =>
            user.streamList.length > 0 &&
            (user.streamList[0].cameraStatus === "OPEN" ||
              user.streamList[0].micStatus === "OPEN")
        ).length;
        let limitNum = this.state.screenSharingUserList.length > 0 ? 5 : 6;
        if (isSafari()) {
          limitNum = 1;
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
          this.setState({
            zegoCloudUserList: targetUsers.reverse(),
          });
          if (isSafari() && this.notSupportMultipleVideoNotice === 0) {
            this.notSupportMultipleVideoNotice = 1;
            ZegoModelShow(
              {
                header: "Notice",
                contentText:
                  "Your current browser does not support the display of multiple video screens during the live streaming.",
                okText: "Okay",
              },
              document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
            );
          }
          return;
        }
      }
      this.setState({
        zegoCloudUserList: userList,
      });
    });

    this.props.core.onRoomLiveStateUpdate((res: "1" | "0") => {
      this.setState((preState: { liveCountdown: number }) => {
        return {
          liveStatus: res,
          liveCountdown:
            preState.liveCountdown === -1 || preState.liveCountdown == 0
              ? res === "1"
                ? 0
                : -1
              : preState.liveCountdown,
        };
      });
    });
    this.props.core.subscribeScreenStream((userList) => {
      if (
        this.isCDNLive &&
        isSafari() &&
        this.state.zegoCloudUserList.filter(
          (user) =>
            user.streamList.length > 0 &&
            (user.streamList[0].cameraStatus === "OPEN" ||
              user.streamList[0].micStatus === "OPEN")
        ).length > 0
      ) {
        this.setState({ screenSharingUserList: [] }, () => {
          this.computeByResize();
        });
      } else {
        this.setState({ screenSharingUserList: userList }, () => {
          this.computeByResize();
        });
      }
    });
    this.props.core.subscribeWhiteBoard(
      (superBoardView: ZegoSuperBoardView | null) => {
        // ??????????????????????????????????????????????????????????????????
        if (
          (!this.state.zegoSuperBoardView && superBoardView) ||
          (this.state.zegoSuperBoardView && !superBoardView)
        ) {
          this.setState(
            {
              zegoSuperBoardView: superBoardView,
              isZegoWhiteboardSharing: !!superBoardView,
            },
            () => {
              this.computeByResize();
            }
          );
        }
      }
    );
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
    this.props.core.onScreenSharingEnded((stream: MediaStream) => {
      if (stream === this.state.screenSharingStream) {
        this.closeScreenSharing();
      }
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
    const logInRsp = await this.props.core.enterRoom();
    let massage = "";
    if (logInRsp === 0) {
      this.createStream();
      return;
    } else if (logInRsp === 1002034) {
      // ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? 50??????????????????????????????
      massage =
        "Failed to join the room, the number of people in the room has reached the maximum.(2 people)";
    } else if ([1002031, 1002053].includes(logInRsp)) {
      //?????????????????????????????????????????????????????????
      massage =
        "There's something wrong with your network. Please check it and try again.";
    } else if ([1102018, 1102016, 1102020].includes(logInRsp)) {
      // ?????? token ?????????
      massage = "Failed to join the room, token authentication error.";
    } else if (1002056 === logInRsp) {
      // ???????????????????????????
      massage =
        "You are on a call in another room, please leave that room first.";
    } else {
      massage =
        "Failed to join the room, please try again.(error code:" +
        logInRsp +
        ")";
    }
    ZegoModelShow(
      {
        header: "Login room Failed",
        contentText: massage,
        okText: "OK",
      },
      document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
    );
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
        const solution = getVideoResolution(this.state.selectVideoResolution);
        const localStream = await this.props.core.createStream({
          camera: {
            video: !this.props.core.status.videoRefuse,
            audio: !this.props.core.status.audioRefuse,
            videoInput: this.state.selectCamera,
            audioInput: this.state.selectMic,
            videoQuality: 4,
            ...solution,
          },
        });

        this.props.core.enableVideoCaptureDevice(
          localStream,
          !!this.props.core._config.turnOnCameraWhenJoining
        );
        this.props.core.muteMicrophone(
          !this.props.core._config.turnOnMicrophoneWhenJoining
        );
        this.setState({
          localStream,
        });
        const res = this.props.core.publishLocalStream(localStream);
        if (res !== false) {
          this.localStreamID = res as string;
          this.props.core.setStreamExtraInfo(
            res as string,
            JSON.stringify({
              isCameraOn: !!this.props.core._config.turnOnCameraWhenJoining,
              isMicrophoneOn:
                this.props.core._config.turnOnMicrophoneWhenJoining,
              hasVideo: !this.props.core.status.videoRefuse,
              hasAudio: !this.props.core.status.audioRefuse,
            })
          );
        }
        return true;
      } catch (error) {
        console.error(
          "???ZEGOCLOUD???createStream or publishLocalStream failed,Reason: ",
          JSON.stringify(error)
        );
        return false;
      }
    } else {
      return false;
    }
  }

  async toggleMic() {
    if (this.props.core.status.audioRefuse) {
      ZegoModelShow(
        {
          header: "Equipment authorization",
          contentText:
            "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
          okText: "Okay",
        },
        document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
      );
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
      this.props.core.setStreamExtraInfo(
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
            this.computeByResize(this.state.cameraOpen || this.state.micOpen);
          }
        );
    }
  }

  async toggleCamera(): Promise<boolean> {
    if (this.props.core.status.videoRefuse) {
      ZegoModelShow(
        {
          header: "Equipment authorization",
          contentText:
            "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
          okText: "Okay",
        },
        document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
      );
      return Promise.resolve(false);
    }
    if (this.cameraStatus === -1) return Promise.resolve(false);
    this.cameraStatus = -1;

    let result;
    if (
      this.state.localStream &&
      this.state.localStream.getVideoTracks().length > 0
    ) {
      result = await this.props.core.enableVideoCaptureDevice(
        this.state.localStream,
        !this.state.cameraOpen
      );
      this.props.core.setStreamExtraInfo(
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
            this.computeByResize(this.state.cameraOpen || this.state.micOpen);
          }
        );
    }

    return !!result;
  }
  async toggleScreenSharing() {
    if (this.state.isScreenSharingBySelf) {
      this.closeScreenSharing();
    } else {
      this.createScreenSharing();
    }
  }

  async createScreenSharing() {
    if (this.state.isZegoWhiteboardSharing) return;
    if (this.state.screenSharingUserList.length > 0) {
      ZegoToast({
        content: `${this.state.screenSharingUserList[0].userName} is presenting now. You cannot share your screen.`,
      });
      return;
    }
    if (this.isCreatingScreenSharing) return;
    this.isCreatingScreenSharing = true;
    try {
      const screenSharingStream = await this.props.core.createStream({
        screen: {
          videoQuality: 2,
          bitRate: 1500,
          frameRate: 15,
          audio: !isFireFox(),
        },
      });
      const streamID = this.props.core.publishLocalStream(
        screenSharingStream,
        "screensharing"
      );
      streamID && (this.screenSharingStreamID = streamID as string);
      this.props.core.setStreamExtraInfo(
        streamID as string,
        JSON.stringify({
          isCameraOn: true,
          isMicrophoneOn: true,
          hasVideo: screenSharingStream.getVideoTracks().length > 0,
          hasAudio: screenSharingStream.getAudioTracks()[0].enabled,
        })
      );
      this.setState({
        isScreenSharingBySelf: true,
        screenSharingStream: screenSharingStream,
      });
    } catch (error: any) {
      if (error?.code === 1103043) {
        ZegoModelShow(
          {
            header: "Notice",
            contentText: "Your browser does not support screen sharing.",
            okText: "Okay",
          },
          document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
        );
      } else if (error?.code === 1103010 && error?.msg.includes("Permission")) {
        ZegoModelShow(
          {
            header: "Grant access to share your screen",
            contentText:
              "Your system does not have access to share a screen from the browser. Please grant access to share your screen on your system settings.",
            okText: "Okay",
          },
          document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
        );
      } else if (error?.code !== 1103042) {
        ZegoToast({
          content: `Failed to present your screen. error code: ${
            error?.code || -1
          }`,
        });
      }
    }
    this.isCreatingScreenSharing = false;
  }
  closeScreenSharing() {
    try {
      this.screenSharingStreamID &&
        this.props.core.stopPublishingStream(this.screenSharingStreamID);
      this.state.screenSharingStream &&
        this.props.core.destroyStream(this.state.screenSharingStream);
      this.setState({
        isScreenSharingBySelf: false,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async toggleWhiteboardSharing() {
    if (this.getScreenSharingUser.length > 0) return;
    if (this.state.zegoSuperBoardView) {
      this.closeWhiteboardSharing();
    } else if (!this.state.isZegoWhiteboardSharing) {
      this.createWhiteboardSharing();
    }
  }

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
    this.setState({ isZegoWhiteboardSharing: true });
  }

  closeWhiteboardSharing() {
    try {
      this.state.zegoSuperBoardView &&
        this.props.core.destroyAndStopPublishWhiteboard();
      this.setState({
        isZegoWhiteboardSharing: false,
        zegoSuperBoardView: null,
      });
      this.isCreatingWhiteboardSharing = false;
    } catch (error) {
      console.error(error);
    }
  }

  toggleLayOut(layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE") {
    this.setState(
      (state: {
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
      }) => {
        return {
          layOutStatus:
            state.layOutStatus === layOutStatus ? "ONE_VIDEO" : layOutStatus,
        };
      },
      () => {
        this.computeByResize();
      }
    );
  }

  async sendMessage(msg: string) {
    let messageID = randomNumber(5);
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
      console.error("???ZEGOCLOUD???sendMessage failed!", JSON.stringify(err));
    }
    this.setState((state: { messageList: ZegoBroadcastMessageInfo2[] }) => {
      const _messageList = state.messageList.map((msg) => {
        if (msg.messageID === messageID) {
          msg.status = resp?.errorCode === 0 ? "SENDED" : "FAILED";
        }
        return msg;
      });
      console.log(_messageList);
      return {
        messageList: _messageList,
      };
    });
  }

  openSettings() {
    this.setState({
      showSettings: !this.state.showSettings,
    });
  }
  onOpenSettings = (event: any) => {
    if (
      this.settingsRef.current === event.target ||
      this.settingsRef.current?.contains(event.target as Node) ||
      this.moreRef.current === event.target ||
      this.moreRef.current?.contains(event.target as Node)
    ) {
    } else {
      this.setState({
        showSettings: false,
      });
    }
  };
  handleSetting() {
    this.setState({
      showZegoSettings: true,
    });
  }
  handleLeave() {
    ZegoModelShow(
      {
        header: "Leave the room",
        contentText: "Are you sure to leave the room?",
        okText: "Confirm",
        cancelText: "Cancel",
        onOk: () => {
          this.props.core._config.turnOnCameraWhenJoining =
            this.state.cameraOpen;
          this.props.core._config.turnOnMicrophoneWhenJoining =
            this.state.micOpen;
          this.props.core.status.micDeviceID = this.state.selectMic;
          this.props.core.status.cameraDeviceID = this.state.selectCamera;
          this.props.core.status.speakerDeviceID = this.state.selectSpeaker;
          this.props.core.status.videoResolution =
            this.state.selectVideoResolution;
          this.leaveRoom();
        },
      },
      document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
    );
  }
  leaveRoom() {
    this.state.isScreenSharingBySelf && this.closeScreenSharing();
    this.state.localStream &&
      this.props.core.destroyStream(this.state.localStream);
    this.props.core.leaveRoom();
    this.props.leaveRoom && this.props.leaveRoom();
  }
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
  async computeByResize(justSetNum = false) {
    const width = Math.max(this.props.core._config.container!.clientWidth, 640);
    const height = Math.max(
      this.props.core._config.container!.clientHeight,
      328
    );
    let videoShowNumber = 0,
      gridRowNumber = 0;

    if (
      this.getScreenSharingUser.length > 0 ||
      this.state.isZegoWhiteboardSharing
    ) {
      //Screen Sidebar
      const videWrapHight =
        height -
        (this.props.core._config.branding?.logoURL ? 64 : 0) -
        84 -
        (this.state.isZegoWhiteboardSharing ? 0 : 38);
      const n = parseInt(String(videWrapHight / 124)) || 1;
      videoShowNumber = Math.min(
        n * 124 + (n - 1) * 10 <= videWrapHight ? n : n - 1 || 1,
        5
      );

      !justSetNum && (await this.props.core.setSidebarLayOut(false));
      if (this.fullScreen) {
        this.setState({
          videoShowNumber: 0,
        });
        await this.props.core.setMaxScreenNum(0);
      } else {
        this.setState({
          videoShowNumber: videoShowNumber,
        });
        await this.props.core.setMaxScreenNum(
          this.showSelf ? videoShowNumber - 1 : videoShowNumber
        );
      }

      return;
    }
    if (this.state.layout === "Sidebar") {
      // Sidebar
      const videWrapHight =
        height - (this.props.core._config.branding?.logoURL ? 64 : 0) - 84;
      const n = parseInt(String(videWrapHight / 124)) || 1;
      videoShowNumber = Math.min(
        n * 124 + (n - 1) * 10 <= videWrapHight ? n : n - 1 || 1,
        5
      );
      const sidebarEnabled =
        this.state.cameraOpen || this.state.micOpen ? !this.localUserPin : true;
      !justSetNum && (await this.props.core.setSidebarLayOut(sidebarEnabled));
      this.setState({
        videoShowNumber: videoShowNumber,
      });

      await this.props.core.setMaxScreenNum(
        this.showSelf ? videoShowNumber : videoShowNumber + 1
      );
      return;
    }

    if (this.state.layout === "Grid" || this.state.layout === "Auto") {
      if (height < 406 - (this.props.core._config.branding?.logoURL ? 0 : 64)) {
        const videoWrapWidth =
          width - 32 - (this.state.layOutStatus === "ONE_VIDEO" ? 0 : 350);
        const n = parseInt(String(videoWrapWidth / 160));
        videoShowNumber = Math.min(
          n * 160 + (n - 1) * 10 <= videoWrapWidth ? n : n - 1,
          10
        );
        gridRowNumber = 1;
      } else if (
        height <
        540 - (this.props.core._config.branding?.logoURL ? 0 : 64)
      ) {
        const videoWrapWidth =
          width - 32 - (this.state.layOutStatus === "ONE_VIDEO" ? 0 : 350);
        const n = parseInt(String(videoWrapWidth / 124));
        videoShowNumber = Math.min(
          n * 124 + (n - 1) * 10 <= videoWrapWidth ? 2 * n : 2 * (n - 1),
          10
        );
        gridRowNumber = 2;
      } else {
        videoShowNumber = 9;
        gridRowNumber = 3;
      }
      !justSetNum && (await this.props.core.setSidebarLayOut(false));
      this.setState({
        videoShowNumber: videoShowNumber,
        gridRowNumber: gridRowNumber,
      });
      await this.props.core.setMaxScreenNum(
        this.showSelf ? videoShowNumber - 1 : videoShowNumber
      );
      return;
    }
  }
  onWindowResize = throttle(this.computeByResize.bind(this), 500);
  showLayoutSettings(show: boolean) {
    this.setState({
      showLayoutSettingsModel: show,
    });
  }
  async changeLayout(type: string) {
    if (this.state.isLayoutChanging) return;
    return new Promise((resolve, reject) => {
      this.userUpdateCallBack = () => {
        this.setState({
          isLayoutChanging: false,
        });
        resolve(true);
      };
      if (type === "Grid" || type === "Auto") {
        this.props.core.setPin();
        this.localUserPin = false;
      }
      this.setState({
        isLayoutChanging: true,
        layout: type,
      });
      this.props.core.setSidebarLayOut(type === "Sidebar");
      setTimeout(() => {
        this.setState({
          isLayoutChanging: false,
        });
        resolve(false);
      }, 5000);
    });
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
  getShownUser(forceShowNonVideoUser = false) {
    const shownUser = this.getAllUser().filter((item) => {
      if (!this.props.core._config.showNonVideoUser && !forceShowNonVideoUser) {
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

    return shownUser as ZegoCloudUserList;
  }
  get getScreenSharingUser(): ZegoCloudUserList {
    if (this.state.isScreenSharingBySelf) {
      return [
        {
          userID: this.props.core._expressConfig.userID,
          userName: this.props.core._expressConfig.userName,
          avatar: this.props.core._expressConfig.avatar,
          pin: false,
          streamList: [
            {
              media: this.state.screenSharingStream!,
              fromUser: {
                userID: this.props.core._expressConfig.userID,
                userName: this.props.core._expressConfig.userName,
              },
              micStatus: "OPEN",
              cameraStatus: "OPEN",
              state: "PLAYING",
              streamID: this.screenSharingStreamID,
            },
          ],
        },
      ];
    } else {
      return this.state.screenSharingUserList;
    }
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
              userInfo={user}
              key={user.userID + "_hiddenAudio"}
            ></ZegoAudio>
          );
        })}
      </>
    );
  }
  get showScreenShareBottomTip(): boolean {
    if (
      this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
      this.props.core._config.scenario?.config?.role === LiveRole.Audience &&
      this.state.liveStatus !== "1"
    ) {
      return false;
    } else {
      return this.getScreenSharingUser.length > 0;
    }
  }
  getLayoutScreen() {
    if (
      this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
      this.props.core._config.scenario?.config?.role === LiveRole.Audience &&
      this.state.liveStatus !== "1"
    ) {
      return (
        <div className={ZegoRoomCss.liveNotStart}>
          <i></i>
          <span>The Live has not started yet</span>
        </div>
      );
    } else if (
      ![...this.getAllUser(), ...this.getScreenSharingUser].some((u) => {
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
        <div className={ZegoRoomCss.noOneStreaming}>
          <i></i>
          <span>No one has turned on the camera or microphone yet.</span>
        </div>
      );
    }

    if (this.getScreenSharingUser.length > 0) {
      return (
        <>
          <ZegoScreenSharingLayout
            handleSetPin={(userID: string) => {
              this.handleSetPin(userID);
            }}
            userList={this.getShownUser()}
            videoShowNumber={this.state.videoShowNumber}
            selfInfo={{
              userID: this.props.core._expressConfig.userID,
            }}
            screenSharingUser={this.getScreenSharingUser[0]}
            soundLevel={this.state.soundLevel}
            handleFullScreen={this.handleFullScreen.bind(this)}
            roomID={this.props.core._expressConfig.roomID}
          ></ZegoScreenSharingLayout>
        </>
      );
    }

    if (this.state.isZegoWhiteboardSharing) {
      return (
        <ZegoWhiteboardSharingLayout
          handleSetPin={(userID: string) => {
            this.handleSetPin(userID);
          }}
          userList={this.getShownUser()}
          videoShowNumber={this.state.videoShowNumber}
          selfInfo={{
            userID: this.props.core._expressConfig.userID,
          }}
          soundLevel={this.state.soundLevel}
          handleFullScreen={this.handleFullScreen.bind(this)}
          roomID={this.props.core._expressConfig.roomID}
          onShow={async (el: HTMLDivElement) => {
            // console.error(
            //   "???ZEGOCLOUD???onShow",
            //   this.isCreatingWhiteboardSharing,
            //   !this.state.zegoSuperBoardView
            // );
            // ????????????
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
                  zegoSuperBoardView,
                });
              } catch (error: any) {
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
              // ????????????
              const uniqueID = this.state.zegoSuperBoardView
                .getCurrentSuperBoardSubView()
                ?.getModel().uniqueID;
              uniqueID &&
                this.state.zegoSuperBoardView.switchSuperBoardSubView(uniqueID);
            }
          }}
          onResize={(el: HTMLDivElement) => {
            // ????????????
            if (this.state.isZegoWhiteboardSharing && el) {
              try {
                this.state.zegoSuperBoardView
                  ?.getCurrentSuperBoardSubView()
                  ?.reloadView();
              } catch (error) {
                console.warn("???ZEGOCLOUD???onResize", error);
              }
            }
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
          zegoSuperBoardView={this.state.zegoSuperBoardView}
        ></ZegoWhiteboardSharingLayout>
      );
    }

    if (
      (this.state.layout === "Auto" && this.getShownUser().length < 3) ||
      this.getShownUser().length < 2
    ) {
      return (
        <ZegoOne2One
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
          selfInfo={{
            userID: this.props.core._expressConfig.userID,
          }}
          handleSetPin={(userID: string) => {
            this.handleSetPin(userID);
          }}
          userList={this.getShownUser()}
          soundLevel={this.state.soundLevel}
        ></ZegoOne2One>
      );
    }
    if (
      (this.state.layout === "Grid" && this.getShownUser().length > 1) ||
      (this.state.layout === "Auto" && this.getShownUser().length > 2)
    ) {
      return (
        <ZegoGridLayout
          userList={this.getShownUser()}
          videoShowNumber={this.state.videoShowNumber}
          gridRowNumber={this.state.gridRowNumber}
          selfInfo={{
            userID: this.props.core._expressConfig.userID,
          }}
          handleSetPin={(userID: string) => {
            this.handleSetPin(userID);
          }}
          soundLevel={this.state.soundLevel}
        ></ZegoGridLayout>
      );
    }
    if (this.state.layout === "Sidebar" && this.getShownUser().length > 1) {
      return (
        <ZegoSidebarLayout
          handleSetPin={(userID: string) => {
            this.handleSetPin(userID);
          }}
          userList={this.getShownUser()}
          videoShowNumber={this.state.videoShowNumber}
          selfInfo={{
            userID: this.props.core._expressConfig.userID,
          }}
          soundLevel={this.state.soundLevel}
        ></ZegoSidebarLayout>
      );
    }
    return <></>;
  }
  handleSetPin(userID: string) {
    if (userID === this.props.core._expressConfig.userID) {
      this.localUserPin = !this.localUserPin;
      this.props.core.setPin();
    } else {
      this.localUserPin = false;
      this.props.core.setPin(userID);
    }
    this.props.core.setSidebarLayOut(
      this.getScreenSharingUser.length > 0 ? false : this.localUserPin === false
    );
    this.setState({ layout: "Sidebar" });
  }
  handleFullScreen(fullScreen: boolean) {
    this.fullScreen = fullScreen;
    this.computeByResize();
  }

  async setLive() {
    if (this.state.liveCountdown === 0) {
      ZegoModelShow(
        {
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
        },
        document.querySelector(`.${ZegoRoomCss.ZegoRoom}`)
      );
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
  private setAllSinkId(speakerId: string) {
    const room = document.querySelector(`.${ZegoRoomCss.ZegoRoom}`);
    room?.querySelectorAll("video").forEach((video: any) => {
      video?.setSinkId?.(speakerId || "");
    });
    room?.querySelectorAll("audio").forEach((audio: any) => {
      audio?.setSinkId?.(speakerId || "");
    });
  }
  render(): React.ReactNode {
    const startIndex =
      this.state.notificationList.length < 4
        ? 0
        : this.state.notificationList.length - 2;

    return (
      <ShowManageContext.Provider
        value={{
          showPinButton:
            !!this.props.core._config.showPinButton &&
            this.getShownUser().length > 1,
          speakerId: this.state.selectSpeaker,
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
          userInfo: { userID: this.props.core._expressConfig.userID },
        }}
      >
        <div className={ZegoRoomCss.ZegoRoom}>
          {(this.props.core._config.branding?.logoURL ||
            this.props.core._config.roomTimerDisplayed ||
            this.props.core._config.scenario?.mode ===
              ScenarioModel.LiveStreaming) && (
            <div className={ZegoRoomCss.header}>
              <div className={ZegoRoomCss.headerLeft}>
                {this.props.core._config.branding?.logoURL && (
                  <img
                    className={ZegoRoomCss.logo}
                    src={this.props.core._config.branding?.logoURL}
                    alt="logo"
                  />
                )}

                {this.props.core._config.scenario?.mode ===
                  ScenarioModel.LiveStreaming &&
                  (this.state.liveCountdown === 0 ||
                    this.state.liveStatus == "1") && (
                    <div className={ZegoRoomCss.liveState}>Live</div>
                  )}
              </div>

              {this.props.core._config.scenario?.mode ===
                ScenarioModel.LiveStreaming &&
                this.props.core._config.scenario?.config?.role ===
                  LiveRole.Host && (
                  <button
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
                      ? "Stop broadcast"
                      : "Start stream..."}
                  </button>
                )}

              {this.props.core._config.roomTimerDisplayed && (
                <ZegoTimer></ZegoTimer>
              )}
            </div>
          )}
          <div className={ZegoRoomCss.content}>
            <div className={ZegoRoomCss.contentLeft}>
              {this.getLayoutScreen()}
              {this.getHiddenUser()}
              <div className={ZegoRoomCss.notify}>
                {this.state.notificationList
                  .slice(startIndex)
                  .map((notify, index) => {
                    if (notify.type === "MSG") {
                      return (
                        <div key={index} className={ZegoRoomCss.notifyContent}>
                          <h5>{notify.userName}</h5>
                          <span>{notify.content}</span>
                        </div>
                      );
                    } else {
                      return (
                        <div key={index} className={ZegoRoomCss.notifyContent}>
                          <span className={ZegoRoomCss.nowrap}>
                            {notify.content}
                          </span>
                        </div>
                      );
                    }
                  })}
              </div>
              {this.state.isNetworkPoor && (
                <div className={ZegoRoomCss.network}></div>
              )}
            </div>
            <div
              className={ZegoRoomCss.contentRight}
              style={{
                display:
                  this.state.layOutStatus !== "ONE_VIDEO" ? "flex" : "none",
              }}
            >
              <div className={ZegoRoomCss.listHeader}>
                {this.state.layOutStatus === "INVITE" && "Room details"}
                {this.state.layOutStatus === "USER_LIST" && "Room members"}
                {this.state.layOutStatus === "MESSAGE" && "Room messages"}
                <span
                  className={ZegoRoomCss.listHeaderClose}
                  onClick={() => {
                    this.setState({
                      layOutStatus: "ONE_VIDEO",
                    });
                  }}
                ></span>
              </div>
              <div className={ZegoRoomCss.listContent}>
                {this.state.layOutStatus === "INVITE" && (
                  <ZegoRoomInvite core={this.props.core}></ZegoRoomInvite>
                )}
                {this.state.layOutStatus === "USER_LIST" && (
                  <ZegoUserList
                    core={this.props.core}
                    userList={this.getShownUser(true)}
                    selfUserID={this.props.core._expressConfig.userID}
                    handleSetPin={this.handleSetPin.bind(this)}
                    soundLevel={this.state.soundLevel}
                  ></ZegoUserList>
                )}
                {this.state.layOutStatus === "MESSAGE" && (
                  <ZegoMessage
                    messageList={this.state.messageList}
                    sendMessage={(msg: string) => {
                      this.sendMessage(msg);
                    }}
                    selfUserID={this.props.core._expressConfig.userID}
                  ></ZegoMessage>
                )}
              </div>
            </div>
          </div>
          {this.showScreenShareBottomTip && (
            <div className={ZegoRoomCss.screenBottomBar}>
              <div className={ZegoRoomCss.screenBottomBarLeft}>
                <span></span>
                <p>
                  {this.state.isScreenSharingBySelf
                    ? "You're presenting to everyone"
                    : `${this.state.screenSharingUserList[0].userName} is presenting the screen`}
                </p>
              </div>
              {this.state.isScreenSharingBySelf && (
                <div
                  className={ZegoRoomCss.screenBottomBarRight}
                  onClick={() => {
                    this.toggleScreenSharing();
                  }}
                >
                  Stop Presenting
                </div>
              )}
            </div>
          )}
          <div className={ZegoRoomCss.footer}>
            <div className={ZegoRoomCss.handlerMiddle}>
              {this.props.core._config.showMyMicrophoneToggleButton && (
                <div
                  className={`${ZegoRoomCss.micButton} ${
                    !this.state.micOpen && ZegoRoomCss.close
                  }`}
                  onClick={() => {
                    this.toggleMic();
                  }}
                ></div>
              )}
              {this.props.core._config.showMyCameraToggleButton && (
                <div
                  className={`${ZegoRoomCss.cameraButton} ${
                    !this.state.cameraOpen && ZegoRoomCss.close
                  }`}
                  onClick={() => {
                    this.toggleCamera();
                  }}
                ></div>
              )}
              {this.props.core._config.showScreenSharingButton && (
                <div
                  className={`${ZegoRoomCss.screenButton} ${
                    this.state.isScreenSharingBySelf && ZegoRoomCss.sharing
                  } ${
                    this.state.isZegoWhiteboardSharing && ZegoRoomCss.forbidden
                  }`}
                  onClick={() => {
                    this.toggleScreenSharing();
                  }}
                ></div>
              )}
              {this.props.core._config.plugins?.ZegoSuperBoardManager && (
                <div
                  className={`${ZegoRoomCss.whiteboardButton} ${
                    this.state.isZegoWhiteboardSharing && ZegoRoomCss.sharing
                  }  ${
                    this.getScreenSharingUser.length > 0 &&
                    ZegoRoomCss.forbidden
                  }`}
                  onClick={() => {
                    this.toggleWhiteboardSharing();
                  }}
                ></div>
              )}

              {(this.props.core._config.showAudioVideoSettingsButton ||
                this.props.core._config.showLayoutButton) && (
                <div
                  ref={this.moreRef}
                  className={ZegoRoomCss.moreButton}
                  onClick={() => {
                    this.openSettings();
                  }}
                >
                  <div
                    className={ZegoRoomCss.settingsButtonModel}
                    style={{
                      display: this.state.showSettings ? "block" : "none",
                    }}
                    ref={this.settingsRef}
                  >
                    {this.props.core._config.showLayoutButton && (
                      <div onClick={() => this.showLayoutSettings(true)}>
                        Change layout
                      </div>
                    )}
                    {this.props.core._config.showAudioVideoSettingsButton &&
                      this.props.core._config.showLayoutButton && <span></span>}
                    {this.props.core._config.showAudioVideoSettingsButton && (
                      <div onClick={() => this.handleSetting()}>Settings</div>
                    )}
                  </div>
                </div>
              )}
              <div
                className={
                  this.props.core._config.scenario?.mode ===
                  ScenarioModel.LiveStreaming
                    ? ZegoRoomCss.liveLeaveButton
                    : ZegoRoomCss.leaveButton
                }
                onClick={() => {
                  this.handleLeave();
                }}
              ></div>
            </div>
            <div className={ZegoRoomCss.handlerRight}>
              {this.props.core._config.preJoinViewConfig?.invitationLink && (
                <div
                  className={ZegoRoomCss.inviteButton}
                  onClick={() => {
                    this.toggleLayOut("INVITE");
                  }}
                ></div>
              )}
              {this.props.core._config.showUserList && (
                <div
                  className={ZegoRoomCss.memberButton}
                  onClick={() => {
                    this.toggleLayOut("USER_LIST");
                  }}
                >
                  <span className={ZegoRoomCss.memberNum}>
                    {this.state.zegoCloudUserList.length > 99
                      ? "99+"
                      : this.state.zegoCloudUserList.length + 1}
                  </span>
                </div>
              )}
              {this.props.core._config.showTextChat && (
                <div
                  className={`${ZegoRoomCss.msgButton} ${
                    this.state.haveUnReadMsg ? ZegoRoomCss.msgButtonRed : ""
                  }`}
                  onClick={() => {
                    this.setState({
                      haveUnReadMsg: false,
                    });
                    this.toggleLayOut("MESSAGE");
                  }}
                ></div>
              )}
            </div>
          </div>
          <div
            className={ZegoRoomCss.reconnect}
            style={{
              display: this.state.connecting ? "flex" : "none",
              backgroundColor: this.state.firstLoading ? "#1C1F2E" : "",
            }}
          >
            <div></div>
            <p>
              {this.state.firstLoading
                ? "Joining Room"
                : "There's something wrong with your network. Trying to reconnect..."}
            </p>
          </div>

          <div
            className={ZegoRoomCss.countDown}
            style={{
              display: this.state.liveCountdown > 0 ? "flex" : "none",
            }}
          >
            <div>{this.state.liveCountdown}</div>
          </div>

          {this.state.showLayoutSettingsModel && (
            <div className={ZegoRoomCss.layoutSettingsMask}>
              <div className={ZegoRoomCss.layoutSettingsWrapper}>
                <div className={ZegoRoomCss.layoutSettingsHeader}>
                  <p>Change layout</p>
                  <span
                    className={ZegoRoomCss.layoutSettingsCloseIcon}
                    onClick={() => this.showLayoutSettings(false)}
                  ></span>
                </div>
                <div className={ZegoRoomCss.layoutSettingsContent}>
                  <div
                    className={ZegoRoomCss.layoutSettingsItemRow}
                    onClick={() => this.changeLayout("Auto")}
                  >
                    <p>
                      <span
                        className={`${ZegoRoomCss.layoutSettingsItemIcon} ${
                          this.state.layout === "Auto"
                            ? ZegoRoomCss.layoutSettingsItemChecked
                            : ""
                        } ${
                          this.state.isLayoutChanging &&
                          this.state.layout === "Auto"
                            ? ZegoRoomCss.layoutSettingsItemLoading
                            : ""
                        }`}
                      ></span>
                      Auto
                    </p>
                    <img
                      src={require("../../../sdkAssets/img_layout_auto@2x.png")}
                      alt="grid layout"
                    />
                  </div>
                  <div
                    className={ZegoRoomCss.layoutSettingsItemRow}
                    onClick={() => this.changeLayout("Grid")}
                  >
                    <p>
                      <span
                        className={`${ZegoRoomCss.layoutSettingsItemIcon} ${
                          this.state.layout === "Grid"
                            ? ZegoRoomCss.layoutSettingsItemChecked
                            : ""
                        } ${
                          this.state.isLayoutChanging &&
                          this.state.layout === "Grid"
                            ? ZegoRoomCss.layoutSettingsItemLoading
                            : ""
                        }`}
                      ></span>
                      Grid
                    </p>
                    <img
                      src={require("../../../sdkAssets/img_layout_grid@2x.png")}
                      alt="grid layout"
                    />
                  </div>
                  <div
                    className={ZegoRoomCss.layoutSettingsItemRow}
                    onClick={() => this.changeLayout("Sidebar")}
                  >
                    <p>
                      <span
                        className={`${ZegoRoomCss.layoutSettingsItemIcon} ${
                          this.state.layout === "Sidebar"
                            ? ZegoRoomCss.layoutSettingsItemChecked
                            : ""
                        } ${
                          this.state.isLayoutChanging &&
                          this.state.layout === "Sidebar"
                            ? ZegoRoomCss.layoutSettingsItemLoading
                            : ""
                        }`}
                      ></span>
                      Sidebar
                    </p>
                    <img
                      src={require("../../../sdkAssets/img_layout_sidebar@2x.png")}
                      alt="Sidebar layout"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          {this.state.showZegoSettings && (
            <ZegoSettings
              core={this.props.core}
              theme={"black"}
              initDevices={{
                mic: this.state.selectMic,
                cam: this.state.selectCamera,
                speaker: this.state.selectSpeaker,
                videoResolve: this.state.selectVideoResolution,
                showNonVideoUser: this.state.showNonVideoUser,
              }}
              closeCallBack={() => {
                this.setState({
                  showZegoSettings: false,
                });
              }}
              onMicChange={(deviceID: string) => {
                this.setState(
                  {
                    selectMic: deviceID,
                  },
                  () => {
                    if (this.state.localStream) {
                      this.props.core.useMicrophoneDevice(
                        this.state.localStream,
                        deviceID
                      );
                    }
                  }
                );
              }}
              onCameraChange={(deviceID: string) => {
                this.setState(
                  {
                    selectCamera: deviceID,
                  },
                  async () => {
                    if (this.state.localStream) {
                      await this.props.core.useCameraDevice(
                        this.state.localStream,
                        deviceID
                      );
                      this.setState({
                        cameraOpen: true,
                      });
                    }
                  }
                );
              }}
              onSpeakerChange={(deviceID: string) => {
                this.setState(
                  {
                    selectSpeaker: deviceID,
                  },
                  () => {
                    this.setAllSinkId(deviceID);
                  }
                );
              }}
              onVideoResolutionChange={(level: string) => {
                this.setState(
                  {
                    selectVideoResolution: level,
                  },
                  () => {
                    if (this.state.localStream) {
                      const { width, height, bitrate, frameRate } =
                        getVideoResolution(level);
                      this.props.core.setVideoConfig(this.state.localStream, {
                        width,
                        height,
                        maxBitrate: bitrate,
                        frameRate,
                      });
                    }
                  }
                );
              }}
              onShowNonVideoChange={(selected: boolean) => {
                this.props.core._config.showNonVideoUser = selected;
                this.props.core.setShowNonVideo(selected);
                this.setState({
                  showNonVideoUser: selected,
                });
              }}
            ></ZegoSettings>
          )}
        </div>
      </ShowManageContext.Provider>
    );
  }
}
