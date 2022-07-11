import React from "react";
import { ZegoBrowserCheckProp, ZegoCloudRemoteMedia } from "../../../model";
import ZegoRoomCss from "./index.module.scss";
import {
  ZegoUser,
  ZegoBroadcastMessageInfo,
} from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoOne2One } from "./components/zegoOne2One";
import { ZegoMessage } from "./components/zegoMessage";
import { randomID } from "../../../util";
import { ZegoConfirm } from "../../components/zegoConfirm";
import { copy } from "../../../modules/util";
import { ZegoToast } from "../../components/zegoToast";
export class ZegoRoomMobile extends React.Component<ZegoBrowserCheckProp> {
  state: {
    localStream: undefined | MediaStream;
    remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
    layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
    userList: ZegoUser[];
    messageList: ZegoBroadcastMessageInfo[];
    notificationList: string[];
    micOpen: boolean;
    cameraOpen: boolean;
    showMore: boolean;
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
  };
  micStatus: -1 | 0 | 1 = !!this.props.core._config.micEnabled ? 1 : 0;
  cameraStatus: -1 | 0 | 1 = !!this.props.core._config.cameraEnabled ? 1 : 0;
  faceModel: 0 | 1 | -1 = 0;
  componentDidMount() {
    this.initSDK();
  }

  async initSDK() {
    this.props.core.onNetworkStatus(
      (
        roomID: string,
        type: "ROOM" | "STREAM",
        status: "DISCONNECTED" | "CONNECTING" | "CONNECTED"
      ) => {
        if (status === "DISCONNECTED") {
          this.leaveRoom();
        }
      }
    );
    this.props.core.onRemoteUserUpdate(
      (roomID: string, updateType: "DELETE" | "ADD", userList: ZegoUser[]) => {
        let notificationList: string[] = [];
        if (this.props.core._config.notification?.userOnlineOfflineTips) {
          if (updateType === "ADD") {
            notificationList = userList.map<string>(
              (u) => u.userName + ": enter room"
            );
          } else if (updateType === "DELETE") {
            notificationList = [
              ...userList.map((u) => u.userName + ": leave room"),
            ];
          }
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
            notificationList: string[];
          }) => {
            let notification: string[] = [];
            if (
              this.state.layOutStatus !== "MESSAGE" &&
              this.props.core._config.notification?.unreadMessageTips
            ) {
              notification = [
                ...state.notificationList,
                ...messageList.map<string>(
                  (u) => u.fromUser.userName + ": " + u.message
                ),
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

    logInRsp &&
      this.createStream(
        !!this.props.core._config.cameraEnabled,
        !!this.props.core._config.micEnabled
      );
  }

  async createStream(
    video: boolean,
    audio: boolean,
    facingMode = true
  ): Promise<boolean> {
    if (video || audio) {
      try {
        const localStream = await this.props.core.createStream({
          camera: {
            video,
            audio,
            facingMode: facingMode ? "user" : "environment",
            videoQuality: 4,
            width: 480,
            height: 640,
            bitrate: 500,
            frameRate: 15,
          },
        });

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
    if (this.micStatus === -1) return;
    this.micStatus = -1;

    let result;
    if (this.state.localStream) {
      result = await this.props.core.muteMicrophone(!this.state.micOpen);
    } else {
      result = await this.createStream(
        !!this.state.cameraOpen,
        !!this.state.micOpen
      );
    }

    if (result) {
      this.micStatus = !this.state.micOpen ? 1 : 0;
      result &&
        this.setState({
          micOpen: !!this.micStatus,
        });
    }
  }

  async toggleCamera() {
    if (this.cameraStatus === -1) return;
    this.cameraStatus = -1;

    let result;
    if (this.state.localStream) {
      result = await this.props.core.enableVideoCaptureDevice(
        this.state.localStream,
        !this.state.cameraOpen
      );
    } else {
      const res = await this.createStream(
        !!this.state.cameraOpen,
        !!this.state.micOpen
      );
    }
    if (result) {
      this.cameraStatus = !this.state.cameraOpen ? 1 : 0;
      result &&
        this.setState({
          cameraOpen: !!this.cameraStatus,
        });
    }
  }

  async switchCamera() {
    let targetModel = false;
    if (this.faceModel === -1) {
      return;
    } else if (this.faceModel === 0) {
      targetModel = true;
    }
    this.faceModel = -1;
    const res = await this.createStream(
      !!this.state.cameraOpen,
      !!this.state.micOpen,
      targetModel
    );
    this.faceModel = targetModel ? 1 : 0;
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

  sendMessage(msg: string) {
    this.props.core.sendRoomMessage(msg);

    this.setState((state: { messageList: ZegoBroadcastMessageInfo[] }) => {
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
            messageID: randomID(3),
          },
        ],
      };
    });
  }

  openMore() {
    this.setState((state: { showMore: boolean }) => {
      return { showMore: !state.showMore };
    });
  }

  leaveRoom() {
    ZegoConfirm({
      title: "Leave the room",
      content: "Are you sure to leave the room?",
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
        <div className={ZegoRoomCss.roomDetails}>
          <div className={ZegoRoomCss.inviteHeader}>Room details</div>
          <div className={ZegoRoomCss.inviteURL}>
            {this.props.core._config.joinScreen?.inviteURL}
          </div>
          <div
            className={ZegoRoomCss.inviteCopy}
            onClick={(ev) => {
              ev.stopPropagation();
              this.props.core._config.joinScreen?.inviteURL &&
                copy(this.props.core._config.joinScreen?.inviteURL);

              ZegoToast({
                content: "Copy successfully",
                duration: 3,
              });
              this.setState({
                layOutStatus: "ONE_VIDEO",
              });
            }}
          >
            <i></i>
            <span>Copy the link</span>
          </div>
        </div>
      );
    } else if (this.state.layOutStatus === "USER_LIST") {
      return (
        <div className={ZegoRoomCss.memberList}>
          <div className={ZegoRoomCss.memberListHeader}>
            <div
              className={ZegoRoomCss.memberHide}
              onClick={(ev) => {
                ev.stopPropagation();
                this.setState({
                  layOutStatus: "ONE_VIDEO",
                });
              }}
            ></div>
            Member
          </div>
          <div className={ZegoRoomCss.memberListContent}>
            <div>
              <i>{this.props.core._expressConfig.userName.substring(0, 1)}</i>
              <a>{this.props.core._expressConfig.userName}(You)</a>
            </div>

            {this.state.userList.map((user) => {
              return (
                <div>
                  <i>{user.userName?.substring(0, 1)}</i>
                  <a key={user.userID}>{user.userName}</a>{" "}
                </div>
              );
            })}
          </div>
        </div>
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
    return (
      <div className={ZegoRoomCss.ZegoRoom}>
        <ZegoOne2One
          localStream={this.state.localStream}
          remoteStreamInfo={this.state.remoteStreamInfo}
        ></ZegoOne2One>

        <div className={ZegoRoomCss.footer}>
          <div className={ZegoRoomCss.footerContent}>
            {this.props.core._config.userCanToggleSelfMic && (
              <a
                className={ZegoRoomCss.switchCamera}
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
                    : ZegoRoomCss.cameraClose
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
              className={ZegoRoomCss.more}
              onClick={() => {
                this.openMore();
              }}
            >
              {this.state.showMore && (
                <div className={ZegoRoomCss.popMore}>
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
        </div>
        {this.getListScreen()}
      </div>
    );
  }
}
