import React, { RefObject } from "react";
import {
  ZegoBroadcastMessageInfo2,
  ZegoBrowserCheckProp,
  ZegoCloudRemoteMedia,
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
import { getVideoResolution, randomNumber, throttle } from "../../../util";
import { ZegoSettingsAlert } from "../../components/zegoSetting";
import { copy } from "../../../modules/tools/util";
import { userNameColor } from "../../../util";
import { ZegoModelShow } from "../../components/zegoModel";
import { ZegoToast } from "../../components/zegoToast";
import { ZegoGridLayout } from "./components/zegoGridLayout";
import { ZegoSidebarLayout } from "./components/zegoSidebarLayout";
export class ZegoRoom extends React.Component<ZegoBrowserCheckProp> {
  state: {
    localStream: undefined | MediaStream;
    remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
    layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
    userList: ZegoUser[];
    messageList: ZegoBroadcastMessageInfo2[];
    notificationList: ZegoNotification[];
    micOpen: boolean;
    cameraOpen: boolean;
    showSettings: boolean;
    isNetworkPoor: boolean;
    connecting: boolean;
    firstLoading: boolean;
    seletMic: string | undefined;
    seletSpeaker: string | undefined;
    seletCamera: string | undefined;
    seletVideoResolution: string;
    videoShowNumber: number; // 展示视频的数量
    gridRowNumber: number; // Grid 行数
    layoutType: "Default" | "Grid" | "Sidebar";
    showLayoutSettingsModel: boolean; // 是否显示布局设置弹窗
    isLayoutChanging: boolean; // 布局是否正在变更中
  } = {
    localStream: undefined,
    remoteStreamInfo: undefined,
    layOutStatus: "ONE_VIDEO",
    userList: [],
    messageList: [],
    notificationList: [],
    micOpen: !!this.props.core._config.turnOnMicrophoneWhenJoining,
    cameraOpen: !!this.props.core._config.turnOnCameraWhenJoining,
    showSettings: false,
    isNetworkPoor: false,
    connecting: false,
    firstLoading: true,
    seletMic: this.props.core.status.micDeviceID,
    seletSpeaker: this.props.core.status.speakerDeviceID,
    seletCamera: this.props.core.status.cameraDeviceID,
    seletVideoResolution: this.props.core.status.videoResolution || "360",
    videoShowNumber: 9,
    gridRowNumber: 3,
    layoutType: this.props.core._config.layout || "Default",
    showLayoutSettingsModel: false,
    isLayoutChanging: false,
  };
  inviteRef: RefObject<HTMLInputElement> = React.createRef();
  settingsRef: RefObject<HTMLDivElement> = React.createRef();
  moreRef: RefObject<HTMLDivElement> = React.createRef();

  micStatus: -1 | 0 | 1 = !!this.props.core._config.turnOnMicrophoneWhenJoining
    ? 1
    : 0;
  cameraStatus: -1 | 0 | 1 = !!this.props.core._config.turnOnCameraWhenJoining
    ? 1
    : 0;
  notifyTimer!: NodeJS.Timeout;
  msgDelayed = true; // 5s不显示
  isMemberMenuShow = false; // 当前是否有成员菜单弹出
  componentDidMount() {
    this.computeByResize();
    setTimeout(() => {
      this.msgDelayed = false;
    }, 5000);
    this.initSDK();
    // 点击其他区域时, 隐藏更多弹窗)
    document.addEventListener("click", this.onOpenSettings);
    window.addEventListener("resize", this.onWindowResize.bind(this));
    document.addEventListener("click", this.collapseMemberMenu.bind(this));
  }
  componentDidUpdate(
    preProps: ZegoBrowserCheckProp,
    preState: {
      localStream: undefined | MediaStream;
      remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
      layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
      userList: ZegoUser[];
      messageList: ZegoBroadcastMessageInfo2[];
      notificationList: ZegoNotification[];
      micOpen: boolean;
      cameraOpen: boolean;
      showMore: boolean;
      layoutType: string;
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
    if (preState.layoutType !== this.state.layoutType) {
      this.computeByResize();
    }
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.onOpenSettings);
    window.removeEventListener("resize", this.onWindowResize.bind(this));
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
        console.warn(userList);
        if (
          this.props.core._config.lowerLeftNotification?.showUserJoinAndLeave &&
          !this.msgDelayed
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
        if (updateType === "ADD") {
          this.setState(
            (state: { userList: ZegoUser[]; notificationList: string[] }) => {
              const noRepeat: ZegoUser[] = [];
              userList.map((user) => {
                if (
                  !state.userList.some((su) => {
                    if (su.userID === user.userID) {
                      return true;
                    } else {
                      return false;
                    }
                  })
                ) {
                  noRepeat.push(user);
                }
              });
              return {
                userList: [...state.userList, ...noRepeat],
                notificationList: [
                  ...state.notificationList,
                  ...notificationList,
                ],
              };
            }
          );
        } else if (updateType === "DELETE") {
          this.setState(
            (state: { userList: ZegoUser[]; notificationList: string[] }) => {
              return {
                userList: state.userList.filter(
                  (user1) =>
                    !userList.some((user2) => user1.userID === user2.userID)
                ),
                notificationList: [
                  ...state.notificationList,
                  ...notificationList,
                ],
              };
            }
          );
        }
      }
    );
    this.props.core.onRemoteMediaUpdate(
      (
        updateType: "DELETE" | "ADD" | "UPDATE",
        streamList: ZegoCloudRemoteMedia[]
      ) => {
        if (updateType === "ADD" || updateType === "UPDATE") {
          this.setState({
            remoteStreamInfo: streamList[0],
          });
        } else if (updateType === "DELETE") {
          this.setState({
            remoteStreamInfo: undefined,
          });
        }
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
            };
          }
        );
      }
    );

    const logInRsp = await this.props.core.enterRoom();
    logInRsp === 0 && this.createStream();
  }

  async createStream(): Promise<boolean> {
    if (
      !this.props.core.status.videoRefuse ||
      !this.props.core.status.audioRefuse
    ) {
      try {
        const solution = getVideoResolution(this.state.seletVideoResolution);
        const localStream = await this.props.core.createStream({
          camera: {
            video: !this.props.core.status.videoRefuse,
            audio: !this.props.core.status.audioRefuse,
            videoInput: this.state.seletCamera,
            audioInput: this.state.seletMic,
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
        this.props.core.publishLocalStream(localStream);
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
      ZegoModelShow({
        header: "Equipment authorization",
        contentText:
          "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
        okText: "Okay",
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

  async toggleCamera(): Promise<boolean> {
    if (this.props.core.status.videoRefuse) {
      ZegoModelShow({
        header: "Equipment authorization",
        contentText:
          "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
        okText: "Okay",
      });
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
    return !!result;
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
      console.error("【ZEGOCLOUD】sendMessage failed!", JSON.stringify(err));
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
    ZegoSettingsAlert({
      core: this.props.core,
      theme: "black",
      initDevices: {
        mic: this.state.seletMic,
        cam: this.state.seletCamera,
        speaker: this.state.seletSpeaker,
        videoResolve: this.state.seletVideoResolution,
      },
      closeCallBack: () => {},
      onMicChange: (deviceID: string) => {
        this.setState(
          {
            seletMic: deviceID,
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
      },
      onCameraChange: (deviceID: string) => {
        this.setState(
          {
            seletCamera: deviceID,
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
      },
      onSpeakerChange: (deviceID: string) => {
        this.setState(
          {
            seletSpeaker: deviceID,
          },
          () => {
            document
              .querySelectorAll("video")
              .forEach((el: any) => el.setSinkId(deviceID));
          }
        );
      },
      onVideoResolutionChange: (level: string) => {
        this.setState(
          {
            seletVideoResolution: level,
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
      },
    });
  }
  handleLeave() {
    ZegoModelShow({
      header: "Leave the room",
      contentText: "Are you sure to leave the room?",
      okText: "Confirm",
      cancelText: "Cancel",
      onOk: () => {
        this.props.core._config.turnOnCameraWhenJoining = this.state.cameraOpen;
        this.props.core._config.turnOnMicrophoneWhenJoining =
          this.state.micOpen;
        this.props.core.status.micDeviceID = this.state.seletMic;
        this.props.core.status.cameraDeviceID = this.state.seletCamera;
        this.props.core.status.speakerDeviceID = this.state.seletSpeaker;
        this.props.core.status.videoResolution =
          this.state.seletVideoResolution;
        this.leaveRoom();
      },
    });
  }
  leaveRoom() {
    this.state.localStream &&
      this.props.core.destroyStream(this.state.localStream);
    this.props.core.leaveRoom();
    this.props.leaveRoom && this.props.leaveRoom();
  }
  handleCopy() {
    this.inviteRef.current && copy(this.inviteRef.current.value);
    ZegoToast({
      content: "Copied",
    });
  }

  getListScreen() {
    if (this.state.layOutStatus === "INVITE") {
      return (
        <>
          <div className={ZegoRoomCss.listHeader}>
            Room details
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
            <div className={ZegoRoomCss.inviteLinkWrapper}>
              <div className={ZegoRoomCss.title}>Share the Link</div>
              <input
                className={ZegoRoomCss.inviteLink}
                placeholder="inviteLink"
                readOnly
                value={
                  this.props.core._config.preJoinViewConfig?.invitationLink
                }
                ref={this.inviteRef}
              ></input>
              <div
                className={ZegoRoomCss.copyLinkButton}
                onClick={() => {
                  this.handleCopy();
                }}
              >
                Copy
              </div>
            </div>
          </div>
        </>
      );
    } else if (this.state.layOutStatus === "USER_LIST") {
      return (
        <>
          <div className={ZegoRoomCss.listHeader}>
            Room members
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
            <div className={ZegoRoomCss.memberListWrapper}>
              <div className={ZegoRoomCss.member}>
                <span
                  style={{
                    color: userNameColor(
                      this.props.core._expressConfig.userName
                    ),
                  }}
                >
                  {this.props.core._expressConfig.userName
                    .slice(0, 1)
                    ?.toUpperCase()}
                </span>
                <div className={ZegoRoomCss.memberNameWrapper}>
                  <p>{this.props.core._expressConfig.userName}</p> (You)
                </div>
                <div className={ZegoRoomCss.selfStatusWrapper}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className={ZegoRoomCss.memberMenuWrapper}>
                  <div className={ZegoRoomCss.memberMenuItem}>Pin</div>
                </div>
              </div>
              {this.state.userList.map((user) => {
                return (
                  <div
                    className={ZegoRoomCss.member}
                    onClick={() => this.expandMemberMenu(user.userID)}
                  >
                    <span style={{ color: userNameColor(user.userName || "") }}>
                      {user.userName?.slice(0, 1)?.toUpperCase()}
                    </span>
                    <div
                      className={`${ZegoRoomCss.memberNameWrapper} ${ZegoRoomCss.memberGuestNameWrapper}`}
                    >
                      <p>{user.userName}</p>
                    </div>
                    <div className={ZegoRoomCss.memberStatusWrapper}>
                      <span
                        className={`${ZegoRoomCss.memberMicIcon} ${ZegoRoomCss.memberMicIconOpen}`}
                      ></span>
                      <span
                        className={`${ZegoRoomCss.memberCameraIcon} ${ZegoRoomCss.memberCameraIconOpen}`}
                      ></span>
                      <span
                        className={`${ZegoRoomCss.memberPinIcon} ${ZegoRoomCss.memberPinIconOpen}`}
                      ></span>
                    </div>
                    <div
                      className={ZegoRoomCss.memberMenuWrapper}
                      data-id={user.userID}
                    >
                      <div className={ZegoRoomCss.memberMenuItem}>Pin</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      );
    } else if (this.state.layOutStatus === "MESSAGE") {
      return (
        <>
          <div className={ZegoRoomCss.listHeader}>
            Room messages
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
            <ZegoMessage
              messageList={this.state.messageList}
              sendMessage={(msg: string) => {
                this.sendMessage(msg);
              }}
              selfUserID={this.props.core._expressConfig.userID}
            ></ZegoMessage>
          </div>
        </>
      );
    }
  }
  computeByResize() {
    const width = Math.max(document.body.clientWidth, 826);
    const height = Math.max(document.body.clientHeight, 280);
    console.warn(width, height);
    // Grid
    if (this.state.layoutType === "Grid") {
      if (height < 406 - (this.props.core._config.branding?.logoURL ? 0 : 64)) {
        const videoWrapWidth =
          width - 32 - (this.state.layOutStatus === "ONE_VIDEO" ? 0 : 350);
        const n = parseInt(String(videoWrapWidth / 160));

        this.setState({
          videoShowNumber: Math.min(
            n * 160 + (n - 1) * 10 <= videoWrapWidth ? n : n - 1,
            10
          ),
          gridRowNumber: 1,
        });
      } else if (
        height <
        540 - (this.props.core._config.branding?.logoURL ? 0 : 64)
      ) {
        const videoWrapWidth =
          width - 32 - (this.state.layOutStatus === "ONE_VIDEO" ? 0 : 350);
        const n = parseInt(String(videoWrapWidth / 124));
        this.setState({
          videoShowNumber: Math.min(
            n * 124 + (n - 1) * 10 <= videoWrapWidth ? 2 * n : 2 * (n - 1),
            10
          ),
          gridRowNumber: 2,
        });
      } else {
        this.setState({
          videoShowNumber: 9,
          gridRowNumber: 3,
        });
      }
    } else if (this.state.layoutType === "Sidebar") {
      // Sidebar
      const videWrapHight =
        height - (this.props.core._config.branding?.logoURL ? 64 : 0) - 84;
      const n = parseInt(String(videWrapHight / 124));
      this.setState({
        videoShowNumber: Math.min(
          n * 124 + (n - 1) * 10 <= videWrapHight ? n : n - 1,
          5
        ),
      });
    }
  }
  onWindowResize = throttle(this.computeByResize.bind(this), 500);
  showLayoutSettings(show: boolean) {
    this.setState({
      showLayoutSettingsModel: show,
    });
  }
  changeLayout(type: string) {
    this.setState(
      {
        isLayoutChanging: true,
        layoutType: type,
      },
      () => {
        //   TODO
        this.setState({
          isLayoutChanging: false,
        });
      }
    );
  }
  expandMemberMenu(userID: string | null) {
    const members = document.querySelectorAll(
      `.${ZegoRoomCss.memberMenuWrapper}`
    );
    console.warn(members);
    this.isMemberMenuShow = false;
    members.forEach((m: any) => {
      if (m?.dataset.id === userID) {
        this.isMemberMenuShow = m.style.display === "none";
        m.style.display = m.style.display === "block" ? "none" : "block";
      } else {
        m.style.display = "none";
      }
    });
  }
  collapseMemberMenu(event: Event) {
    if (this.isMemberMenuShow) {
      this.expandMemberMenu(null);
    }
  }
  render(): React.ReactNode {
    const startIndex =
      this.state.notificationList.length < 4
        ? 0
        : this.state.notificationList.length - 2;

    return (
      <div className={ZegoRoomCss.ZegoRoom}>
        {(this.props.core._config.branding?.logoURL ||
          this.props.core._config.roomTimerDisplayed) && (
          <div className={ZegoRoomCss.header}>
            {this.props.core._config.branding?.logoURL && (
              <img
                className={ZegoRoomCss.logo}
                src={this.props.core._config.branding?.logoURL}
                alt="logo"
              />
            )}
            {this.props.core._config.roomTimerDisplayed && (
              <ZegoTimer></ZegoTimer>
            )}
          </div>
        )}
        <div className={ZegoRoomCss.content}>
          <div className={ZegoRoomCss.contentLeft}>
            {/* <ZegoOne2One
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
              localStream={this.state.localStream}
              remoteStreamInfo={this.state.remoteStreamInfo}
              remoteUserInfo={{
                userName:
                  this.state.remoteStreamInfo?.fromUser.userName ||
                  this.state.userList[0]?.userName,
                userID:
                  this.state.remoteStreamInfo?.fromUser.userID ||
                  this.state.userList[0]?.userID,
              }}
              selfUserInfo={{
                userName: this.props.core._expressConfig.userName,
                micOpen: this.state.micOpen,
                cameraOpen: this.state.cameraOpen,
              }}
            ></ZegoOne2One> */}
            {this.state.layoutType === "Grid" && (
              <ZegoGridLayout
                userList={new Array(3).fill({ userName: "G" })}
                videoShowNumber={this.state.videoShowNumber}
                gridRowNumber={this.state.gridRowNumber}
              ></ZegoGridLayout>
            )}
            {this.state.layoutType === "Sidebar" && (
              <ZegoSidebarLayout
                userList={new Array(9).fill({ userName: "G" })}
                videoShowNumber={this.state.videoShowNumber}
              ></ZegoSidebarLayout>
            )}
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
            {this.getListScreen()}
          </div>
        </div>
        <div className={ZegoRoomCss.footer}>
          {this.props.core._config.preJoinViewConfig?.invitationLink && (
            <div
              className={ZegoRoomCss.inviteButton}
              onClick={() => {
                this.toggleLayOut("INVITE");
              }}
            ></div>
          )}

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
            {this.props.core._config.showAudioVideoSettingsButton && (
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
                  {this.props.core._config.layout && (
                    <div onClick={() => this.showLayoutSettings(true)}>
                      Change layout
                    </div>
                  )}
                  {this.props.core._config.layout && <span></span>}
                  <div onClick={() => this.handleSetting()}>Settings</div>
                </div>
              </div>
            )}
            <div
              className={ZegoRoomCss.leaveButton}
              onClick={() => {
                this.handleLeave();
              }}
            ></div>
          </div>
          <div className={ZegoRoomCss.handlerRight}>
            {this.props.core._config.showUserList && (
              <div
                className={ZegoRoomCss.memberButton}
                onClick={() => {
                  this.toggleLayOut("USER_LIST");
                }}
              >
                <span className={ZegoRoomCss.memberNum}>
                  {this.state.userList.length > 99
                    ? "99+"
                    : this.state.userList.length + 1}
                </span>
              </div>
            )}
            {this.props.core._config.showTextChat && (
              <div
                className={ZegoRoomCss.msgButton}
                onClick={() => {
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
                  onClick={() => this.changeLayout("Default")}
                >
                  <p>
                    <span
                      className={`${ZegoRoomCss.layoutSettingsItemIcon} ${
                        this.state.layoutType === "Default"
                          ? ZegoRoomCss.layoutSettingsItemChecked
                          : ""
                      } ${
                        this.state.isLayoutChanging &&
                        this.state.layoutType === "Default"
                          ? ZegoRoomCss.layoutSettingsItemLoadoing
                          : ""
                      }`}
                    ></span>
                    Default
                  </p>
                </div>
                <div
                  className={ZegoRoomCss.layoutSettingsItemRow}
                  onClick={() => this.changeLayout("Grid")}
                >
                  <p>
                    <span
                      className={`${ZegoRoomCss.layoutSettingsItemIcon} ${
                        this.state.layoutType === "Grid"
                          ? ZegoRoomCss.layoutSettingsItemChecked
                          : ""
                      } ${
                        this.state.isLayoutChanging &&
                        this.state.layoutType === "Grid"
                          ? ZegoRoomCss.layoutSettingsItemLoadoing
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
                        this.state.layoutType === "Sidebar"
                          ? ZegoRoomCss.layoutSettingsItemChecked
                          : ""
                      } ${
                        this.state.isLayoutChanging &&
                        this.state.layoutType === "Sidebar"
                          ? ZegoRoomCss.layoutSettingsItemLoadoing
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
      </div>
    );
  }
}
