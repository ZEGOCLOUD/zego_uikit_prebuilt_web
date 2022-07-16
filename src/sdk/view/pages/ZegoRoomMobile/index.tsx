import React from "react";
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
import { ZegoOne2One } from "./components/zegoOne2One";
import { ZegoMessage } from "./components/zegoMessage";
import { randomNumber } from "../../../util";
import { ZegoConfirm } from "../../components/mobile/zegoConfirm";
import { ZegoUserList } from "./components/zegoUserList";
import { ZegoRoomInvite } from "./components/zegoRoomInvite";
import { ZegoReconnect } from "./components/ZegoReconnect";
import { ZegoToast } from "../../components/mobile/zegoToast";
export class ZegoRoomMobile extends React.Component<ZegoBrowserCheckProp> {
  state: {
    localStream: undefined | MediaStream;
    remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
    layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
    userList: ZegoUser[];
    messageList: ZegoBroadcastMessageInfo2[];
    notificationList: ZegoNotification[];
    micOpen: boolean;
    cameraOpen: boolean;
    showMore: boolean;
    connecting: boolean;
    firstLoading: boolean;
    cameraFront: boolean;
  } = {
    micOpen: !!this.props.core._config.micEnabled,
    cameraOpen: !!this.props.core._config.cameraEnabled,
    localStream: undefined,
    remoteStreamInfo: undefined,
    layOutStatus: "ONE_VIDEO",
    userList: [],
    messageList: [],
    notificationList: [],
    showMore: false,
    connecting: false,
    firstLoading: true,
    cameraFront: true,
  };
  micStatus: -1 | 0 | 1 = !!this.props.core._config.micEnabled ? 1 : 0;
  cameraStatus: -1 | 0 | 1 = !!this.props.core._config.cameraEnabled ? 1 : 0;
  faceModel: 0 | 1 | -1 = 1;
  notifyTimer!: NodeJS.Timeout;

  componentDidMount() {
    this.initSDK();
  }

  componentDidUpdate(
    preProps: ZegoBrowserCheckProp,
    preState: {
      localStream: undefined | MediaStream;
      remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
      layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
      userList: ZegoUser[];
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
          .content !=
          this.state.notificationList[this.state.notificationList.length - 1]
            .content) ||
      (preState.notificationList.length == 0 &&
        this.state.notificationList.length > 0)
    ) {
      this.notifyTimer && clearTimeout(this.notifyTimer);
      this.notifyTimer = setTimeout(() => {
        this.setState({
          notificationList: [],
        });
      }, 3000);
    }
  }

  async initSDK() {
    this.props.core.onNetworkStatus(
      (
        roomID: string,
        type: "ROOM" | "STREAM",
        status: "DISCONNECTED" | "CONNECTING" | "CONNECTED"
      ) => {
        if (status === "DISCONNECTED") {
          this.props.core.leaveRoom();
          this.props.leaveRoom && this.props.leaveRoom();
        } else if (status === "CONNECTING" && type != "STREAM") {
          this.setState({
            connecting: true,
          });
        } else {
          this.setState({
            connecting: false,
            fistLoading: false,
          });
        }
      }
    );
    this.props.core.onRemoteUserUpdate(
      (roomID: string, updateType: "DELETE" | "ADD", userList: ZegoUser[]) => {
        let notificationList: ZegoNotification[] = [];
        if (this.props.core._config.notification?.userOnlineOfflineTips) {
          userList.map((u) => {
            notificationList.push({
              content:
                u.userName +
                " " +
                (updateType === "ADD" ? "enter" : "quite") +
                " the room",
              type: "USER",
              userName: u.userName,
            });
          });
        }
        if (updateType === "ADD") {
          this.setState(
            (state: { userList: ZegoUser[]; notificationList: string[] }) => {
              return {
                userList: [...state.userList, ...userList],
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
            messageList: ZegoBroadcastMessageInfo[];
            notificationList: ZegoNotification[];
          }) => {
            let notification: ZegoNotification[] = [];
            if (
              this.state.layOutStatus !== "MESSAGE" &&
              this.props.core._config.notification?.unreadMessageTips
            ) {
              notification = [
                ...state.notificationList,
                ...messageList.map<ZegoNotification>((m) => {
                  return {
                    content: m.message,
                    type: "MSG",
                    userName: m.fromUser.userName,
                  };
                }),
              ];
            }
            return {
              messageList: [...state.messageList, ...messageList],
              notificationList: notification,
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
      !this.props.core.status.audioRefuse ||
      !this.props.core.status.audioRefuse
    ) {
      try {
        const localStream = await this.props.core.createStream({
          camera: {
            video: !this.props.core.status.audioRefuse,
            audio: !this.props.core.status.audioRefuse,
            videoQuality: 4,
            width: 640,
            height: 480,
            bitrate: 500,
            frameRate: 15,
          },
        });

        this.props.core.enableVideoCaptureDevice(
          localStream,
          !!this.props.core._config.cameraEnabled
        );
        this.props.core.muteMicrophone(!!this.props.core._config.micEnabled);
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
      ZegoConfirm({
        title: "Equipment authorization",
        content:
          "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
        confirm: "OK",
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
      result = await this.props.core.muteMicrophone(!this.state.micOpen);
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
        confirm: "OK",
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
  }

  async switchCamera() {
    if (this.props.core.status.videoRefuse) {
      ZegoConfirm({
        title: "Equipment authorization",
        content:
          "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
        confirm: "OK",
      });
      return;
    }

    if (!this.state.localStream) {
      return;
    }

    let targetModel = false;
    if (this.faceModel === -1) {
      return;
    } else if (this.faceModel === 0) {
      targetModel = true;
    }
    this.faceModel = -1;

    const _localStream = await this.props.core.createStream({
      camera: {
        video: !this.props.core.status.audioRefuse,
        audio: false,
        facingMode: targetModel ? "user" : "environment",
        videoQuality: 4,
        width: 640,
        height: 480,
        bitrate: 500,
        frameRate: 15,
      },
    });

    if (_localStream) {
      this.props.core.replaceTrack(
        this.state.localStream,
        _localStream.getVideoTracks()[0]
      );
      this.faceModel = targetModel ? 1 : 0;
      this.setState({
        cameraFront: targetModel,
      });
    }
  }

  toggleLayOut(layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE") {
    this.setState(
      (state: {
        layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
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
    const resp = await this.props.core.sendRoomMessage(msg);
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
          this.props.core.leaveRoom();
          this.props.leaveRoom && this.props.leaveRoom();
        }
      },
    });
  }

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
          userList={this.state.userList}
          closeCallBack={() => {
            this.setState({
              layOutStatus: "ONE_VIDEO",
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
    }
  }

  render(): React.ReactNode {
    const startIndex =
      this.state.notificationList.length < 4
        ? 0
        : this.state.notificationList.length - 2;

    return (
      <div className={ZegoRoomCss.ZegoRoom}>
        <ZegoOne2One
          cameraOpen={this.state.cameraOpen}
          micOpen={this.state.micOpen}
          localStream={this.state.localStream}
          remoteStreamInfo={this.state.remoteStreamInfo}
          core={this.props.core}
        ></ZegoOne2One>

        <div className={ZegoRoomCss.footer}>
          {this.props.core._config.userCanToggleSelfMic && (
            <a
              className={`${ZegoRoomCss.switchCamera} ${
                this.state.cameraFront ? "" : ZegoRoomCss.switchCameraBack
              }`}
              onClick={() => {
                this.switchCamera();
              }}
            ></a>
          )}

          {this.props.core._config.userCanToggleSelfMic && (
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
          {this.props.core._config.userCanToggleSelfCamera && (
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

          <a
            className={ZegoRoomCss.leaveRoom}
            onClick={() => {
              this.leaveRoom();
            }}
          ></a>

          <a
            id="ZegoRoomCssMobileMore"
            className={ZegoRoomCss.more}
            onClick={() => {
              this.openMore();
            }}
          >
            {this.state.showMore && (
              <div
                id="ZegoRoomCssMobilePopMore"
                className={ZegoRoomCss.popMore}
              >
                <div className={ZegoRoomCss.popMoreContent}>
                  <div
                    onClick={(ev) => {
                      ev.stopPropagation();
                      this.toggleLayOut("INVITE");
                    }}
                  >
                    <i className={ZegoRoomCss.details}></i>
                    <span>Room details</span>
                  </div>
                  <div
                    onClick={(ev) => {
                      ev.stopPropagation();
                      this.toggleLayOut("USER_LIST");
                    }}
                  >
                    <i className={ZegoRoomCss.member}></i>
                    <span>Member</span>
                  </div>
                  <div
                    onClick={(ev) => {
                      ev.stopPropagation();
                      this.toggleLayOut("MESSAGE");
                    }}
                  >
                    <i className={ZegoRoomCss.chat}></i>
                    <span>Chat</span>
                  </div>
                </div>
                <div className={ZegoRoomCss.popMoreArray}></div>
              </div>
            )}
          </a>
        </div>
        {this.getListScreen()}
        <div className={ZegoRoomCss.notify}>
          {this.state.notificationList.slice(startIndex).map((notify) => {
            if (notify.type === "MSG") {
              return (
                <div key={notify.content} className={ZegoRoomCss.notifyContent}>
                  <h5>{notify.userName}</h5>
                  <span>{notify.content}</span>
                </div>
              );
            } else {
              return (
                <div key={notify.content} className={ZegoRoomCss.notifyContent}>
                  <span>{notify.content}</span>
                </div>
              );
            }
          })}
        </div>
        {this.state.connecting && (
          <ZegoReconnect
            content={
              this.state.firstLoading
                ? "Joining Room"
                : "Trying to reconnect..."
            }
          ></ZegoReconnect>
        )}
      </div>
    );
  }
}
