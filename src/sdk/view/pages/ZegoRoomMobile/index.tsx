import React from "react";
import {
  LiveRole,
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
import { isIOS, isPc, IsSafari, randomNumber } from "../../../util";
import { ZegoConfirm } from "../../components/mobile/zegoConfirm";
import { ZegoUserList } from "./components/zegoUserList";
import { ZegoRoomInvite } from "./components/zegoRoomInvite";
import { ZegoReconnect } from "./components/ZegoReconnect";
import { ZegoToast } from "../../components/mobile/zegoToast";
import {
  ZegoDeviceInfo,
  ZegoSoundLevelInfo,
} from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";

import {
  ZegoCloudUser,
  ZegoCloudUserList,
} from "../../../modules/tools/UserListManager";
import { ZegoLayout } from "./components/zegoLayout";
import { ZegoManage } from "./components/zegoManage";
import { ZegoGrid } from "./components/zegoGrid";
import { ZegoSidebar } from "./components/zegoSidebar";
import ShowManageContext from "./context/showManage";
import { ZegoModelShow } from "../../components/zegoModel";

export class ZegoRoomMobile extends React.Component<ZegoBrowserCheckProp> {
  static contextType = ShowManageContext;
  state: {
    localStream: undefined | MediaStream;
    layOutStatus:
      | "ONE_VIDEO"
      | "INVITE"
      | "USER_LIST"
      | "MESSAGE"
      | "LAYOUT"
      | "MANAGE";
    userLayoutStatus: "Default" | "Grid" | "Sidebar";
    zegoCloudUserList: ZegoCloudUserList;
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
  } = {
    micOpen: !!this.props.core._config.turnOnMicrophoneWhenJoining,
    cameraOpen: !!this.props.core._config.turnOnCameraWhenJoining,
    localStream: undefined,
    layOutStatus: "ONE_VIDEO",
    userLayoutStatus: this.props.core._config.layout || "Default",
    zegoCloudUserList: [],
    messageList: [],
    notificationList: [],
    showMore: false,
    connecting: false,
    firstLoading: true,
    cameraFront: true,
    showFooter: true,
    isNetworkPoor: false,
    soundLevel: {},
    liveCountdown: 3,
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
  safariLimitationNoticed = false;

  componentDidMount() {
    this.initSDK();
    this.footerTimer = setTimeout(() => {
      this.setState({
        showFooter: false,
      });
    }, 5000);
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
      (roomID: string, updateType: "DELETE" | "ADD", userList: ZegoUser[]) => {
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
        !isPc() && isIOS() && IsSafari() && userList.length > 2;
      if (notSupportPhone) {
        userList = [userList[0]];
        if (!this.safariLimitationNoticed) {
          ZegoModelShow({
            header: "Notice",
            contentText:
              "The current browser does not support the display of multiple video screens, we suggest you change your browser.",
            cancelText: "Okay",
            onOk: () => {
              this.safariLimitationNoticed = true;
              this.setState({ zegoCloudUserList: userList });
            },
          });
        } else {
          this.setState({ zegoCloudUserList: userList });
        }
      } else {
        this.setState({ zegoCloudUserList: userList });
      }
    });

    this.props.core.onSoundLevelUpdate(
      (soundLevelList: ZegoSoundLevelInfo[]) => {
        let list: SoundLevelMap = {};
        soundLevelList.forEach((s) => {
          let userId = s.streamID.split("_")[0];
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

    const logInRsp = await this.props.core.enterRoom();

    if (logInRsp === 0) {
      this.createStream();
      this.cameraDevices = await this.props.core.getCameras();
    }
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
        const localStream = await this.props.core.createStream({
          camera: {
            video: !this.props.core.status.videoRefuse,
            audio: !this.props.core.status.audioRefuse,
            videoQuality: 4,
            facingMode: this.faceModel ? "user" : "environment",
            width: 640,
            height: 480,
            bitrate: 500,
            frameRate: 15,
          },
        });

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
        const res = this.props.core.publishLocalStream(localStream);
        if (res !== false) {
          this.localStreamID = res as string;
        }
        return true;
      } catch (error) {
        console.error(
          "【ZEGOCLOUD】createStream or publishLocalStream failed,Reason: ",
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
    }

    this.micStatus = !this.state.micOpen ? 1 : 0;
    if (result) {
      ZegoToast({
        content: "The microphone is " + (this.micStatus ? "on" : "off"),
      });
      result &&
        this.setState({
          micOpen: !!this.micStatus,
        });
    }
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
    }
    this.cameraStatus = !this.state.cameraOpen ? 1 : 0;
    if (result) {
      ZegoToast({
        content: "The camera is " + (this.cameraStatus ? "on" : "off"),
      });
      result &&
        this.setState({
          cameraOpen: !!this.cameraStatus,
        });
    }
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

    let targetCameraID;
    if (this.cameraDevices.length < 4) {
      targetCameraID = targetModel
        ? this.cameraDevices[this.cameraDevices.length - 2].deviceID
        : this.cameraDevices[this.cameraDevices.length - 1].deviceID;
    } else {
      targetCameraID = targetModel
        ? this.cameraDevices[0].deviceID
        : this.cameraDevices[this.cameraDevices.length - 1].deviceID;
    }

    await this.props.core.useCameraDevice(
      this.state.localStream,
      targetCameraID
    );

    this.faceModel = targetModel ? 1 : 0;
    this.setState({
      cameraFront: targetModel,
    });
  }

  toggleLayOut(
    layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE" | "LAYOUT"
  ) {
    this.setState(
      (state: {
        layOutStatus:
          | "ONE_VIDEO"
          | "INVITE"
          | "USER_LIST"
          | "MESSAGE"
          | "LAYOUT";
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
          this.state.localStream &&
            this.props.core.destroyStream(this.state.localStream);
          this.props.core.leaveRoom();
          this.props.leaveRoom && this.props.leaveRoom();
        }
      },
    });
  }

  getShownUser(forceShowNonVideoUser = false) {
    const shownUser = [
      {
        userID: this.props.core._expressConfig.userID,
        userName: this.props.core._expressConfig.userName + "（You）",
        pin: this.localUserPin,
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
    ].filter((item) => {
      if (!this.props.core._config.showNonVideoUser && !forceShowNonVideoUser) {
        if (item.streamList && item.streamList[0] && item.streamList[0].media) {
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

  getHiddenUser() {
    const hiddenUser = [
      {
        userID: this.props.core._expressConfig.userID,
        userName: this.props.core._expressConfig.userName + "（You）",
        pin: this.localUserPin,
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
    ].filter((item) => {
      if (
        !this.props.core._config.showNonVideoUser &&
        item.streamList &&
        item.streamList[0] &&
        item.streamList[0].media &&
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
            <audio
              autoPlay
              muted={user.userID === this.props.core._expressConfig.userID}
              key={user.userID + "_hiddenAudio"}
              ref={(el) => {
                el &&
                  el.srcObject !== user.streamList[0].media &&
                  (el.srcObject = user.streamList[0].media!);
              }}
            ></audio>
          );
        })}
      </>
    );
  }

  private _selectedUser!: ZegoCloudUser;

  getListScreen() {
    if (this.state.layOutStatus === "INVITE") {
      return (
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
      return (
        <ZegoUserList
          core={this.props.core}
          userList={this.getShownUser(true)}
          closeCallBack={(_user?: ZegoCloudUser) => {
            _user && (this._selectedUser = _user);
            this.setState({
              layOutStatus: _user ? "MANAGE" : "ONE_VIDEO",
            });
          }}
        ></ZegoUserList>
      );
    } else if (this.state.layOutStatus === "MESSAGE") {
      return (
        <ZegoMessage
          userID={this.props.core._expressConfig.userID}
          messageList={this.state.messageList}
          sendMessage={(msg: string) => {
            this.sendMessage(msg);
          }}
          closeCallBac={() => {
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }}
        ></ZegoMessage>
      );
    } else if (this.state.layOutStatus === "LAYOUT") {
      return (
        <ZegoLayout
          selectLayout={this.state.userLayoutStatus}
          closeCallBac={() => {
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }}
          selectCallBack={(selectLayout: "Default" | "Grid" | "Sidebar") => {
            if (selectLayout !== "Sidebar") {
              this._selectedUser && (this._selectedUser.pin = false);
              this.props.core.setPin();
            }
            this.setState({
              userLayoutStatus: selectLayout,
            });
            return new Promise(async (resolve, reject) => {
              const showSelf =
                this.props.core._config.showNonVideoUser ||
                this.state.localStream;
              if (selectLayout !== "Sidebar") {
                await this.props.core.setMaxScreenNum(showSelf ? 5 : 6);
              } else {
                await this.props.core.setMaxScreenNum(showSelf ? 4 : 5);
              }
              this.userUpdateCallBack = () => {
                resolve(true);
              };
              await this.props.core.setSidebarLayOut(
                selectLayout === "Sidebar"
              );

              setTimeout(() => {
                resolve(false);
              }, 5000);
            });
          }}
        ></ZegoLayout>
      );
    } else if (this.state.layOutStatus === "MANAGE") {
      return (
        <ZegoManage
          closeCallBac={() => {
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }}
          selectCallBac={(type?: "Pin", value?: boolean) => {
            if (type === "Pin" && typeof value != "undefined") {
              if (
                this._selectedUser.userID !=
                this.props.core._expressConfig.userID
              ) {
                this.props.core.setPin(this._selectedUser.userID, value);
                this.localUserPin = false;
              } else {
                this.localUserPin = value;
                this._selectedUser.pin = value;
                this.props.core.setPin();
              }
              this.setState({
                userLayoutStatus: "Sidebar",
              });
              this.props.core.setSidebarLayOut(true);
            }
          }}
          selectedUser={this._selectedUser}
        ></ZegoManage>
      );
    }
  }

  getLayoutScreen() {
    if (
      (this.state.userLayoutStatus === "Default" &&
        this.getShownUser().length < 3) ||
      this.getShownUser().length < 2
    ) {
      return (
        <ZegoOne2One
          selfInfo={{
            userID: this.props.core._expressConfig.userID,
          }}
          userList={this.getShownUser()}
          soundLevel={this.state.soundLevel}
          onLocalStreamPaused={async () => {
            console.warn("onLocalStreamPaused");
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
      );
    } else if (
      (this.state.userLayoutStatus === "Grid" &&
        this.getShownUser().length > 1) ||
      (this.state.userLayoutStatus === "Default" &&
        this.getShownUser().length > 2)
    ) {
      return (
        <ZegoGrid
          selfInfo={{
            userID: this.props.core._expressConfig.userID,
          }}
          userList={this.getShownUser()}
          videoShowNumber={6}
          soundLevel={this.state.soundLevel}
        ></ZegoGrid>
      );
    } else if (
      this.state.userLayoutStatus === "Sidebar" &&
      this.getShownUser().length > 1
    ) {
      return (
        <ZegoSidebar
          selfInfo={{
            userID: this.props.core._expressConfig.userID,
          }}
          userList={this.getShownUser()}
          videoShowNumber={5}
          soundLevel={this.state.soundLevel}
        ></ZegoSidebar>
      );
    }
  }

  clickVideo(e: MouseEvent) {
    // @ts-ignore
    const className: string = e.target.className;
    if (
      className.includes("zegoUserVideo_videoCommon") ||
      className.includes("zegoMore_more") ||
      className.includes("ZegoRoomMobile_ZegoRoom") ||
      className.includes("zegoUserVideo_click")
    ) {
      if (!this.state.showFooter) {
        this.setState({ showFooter: true });
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
      e.stopPropagation();
    } else {
      clearTimeout(this.footerTimer);
      this.footerTimer = setTimeout(() => {
        this.setState({ showFooter: false, showMore: false });
      }, 5000);
    }
  }

  async setLive() {
    if (this.state.liveCountdown === 0) {
      ZegoModelShow({
        header: "Stop broadcast",
        contentText: "Are you sure to stop broadcasting??",
        okText: "Stop",
        cancelText: "Cancel",
        onOk: async () => {
          // stop live
          const res = await this.props.core.setLive("stop");
          this.setState({
            liveCountdown: 3,
          });
        },
      });
    } else if (this.state.liveCountdown === 3) {
      this.liveCountdownTimer();
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
              layOutStatus: _user ? "MANAGE" : "ONE_VIDEO",
            });
          },
        }}
      >
        <div
          className={`${ZegoRoomCss.ZegoRoom}  ZegoRoomMobile_ZegoRoom`}
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
              {this.props.core._config.showMyCameraToggleButton && (
                <a
                  className={`${ZegoRoomCss.switchCamera} ${
                    this.state.cameraFront ? "" : ZegoRoomCss.switchCameraBack
                  }`}
                  onClick={() => {
                    this.switchCamera();
                  }}
                ></a>
              )}

              {this.props.core._config.showMyCameraToggleButton &&
                this.props.core._config.scenario?.mode !==
                  ScenarioModel.LiveStreaming && (
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
                className={ZegoRoomCss.leaveRoom}
                onClick={() => {
                  this.leaveRoom();
                }}
              ></a>

              {(this.props.core._config.showTextChat ||
                this.props.core._config.showUserList ||
                this.props.core._config.preJoinViewConfig?.invitationLink) && (
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
                      className={ZegoRoomCss.popMore}
                    >
                      <div className={ZegoRoomCss.popMoreContent}>
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
                        {true && (
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
                      </div>
                      <div className={ZegoRoomCss.popMoreArray}></div>
                    </div>
                  )}
                </a>
              )}

              {this.props.core._config.scenario?.mode ===
                ScenarioModel.LiveStreaming &&
                this.props.core._config.scenario.config?.role ===
                  LiveRole.Host && (
                  <a
                    className={ZegoRoomCss.goLive}
                    onClick={() => {
                      this.setLive();
                    }}
                  >
                    {this.state.liveCountdown === 3
                      ? "goLive"
                      : this.state.liveCountdown === 0
                      ? "Stop broadcast"
                      : "start stream"}
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
          {(this.state.connecting || false) && (
            <ZegoReconnect
              content={
                this.state.firstLoading || false
                  ? "Joining Room"
                  : "Trying to reconnect..."
              }
            ></ZegoReconnect>
          )}
        </div>
      </ShowManageContext.Provider>
    );
  }
}
