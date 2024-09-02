/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import {
  CoreError,
  LiveRole,
  LiveStreamingMode,
  ReasonForRefusedInviteToCoHost,
  ScenarioModel,
  SoundLevelMap,
  UserListMenuItemType,
  UserTypeEnum,
  ZegoBroadcastMessageInfo2,
  ZegoBrowserCheckProp,
  ZegoNotification,
} from "../../../model";
import ZegoRoomCss from "./index.module.scss";
// import {
//   ZegoUser,
//   ZegoBroadcastMessageInfo,
// } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoOne2One } from "./components/zegoOne2One";
import { ZegoMessage } from "./components/zegoMessage";
import {
  isIOS,
  isPc,
  IsLowVersionSafari,
  randomNumber,
  getVideoResolution,
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
import { ZegoSettings } from "../../components/zegoSetting";

import { ZegoMixPlayer } from "./components/zegoMixPlayer";
import { ZegoBroadcastMessageInfo, ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity"
import { FormattedMessage } from "react-intl";
import { ZegoInvitationList } from "./components/zegoInvitationList";

type LayOutStatus = "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE" | "LAYOUT" | "MANAGE" | "WHITEBOARD" | "INVITE_LIST";
export class ZegoRoomMobile extends React.PureComponent<ZegoBrowserCheckProp> {
  static contextType = ShowManageContext;
  state: {
    localStream: undefined | MediaStream;
    layOutStatus: LayOutStatus;
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
    isRequestingCohost: boolean; // 是否正在申请连麦
    unreadInviteList: Set<string>; // 是否有未读的连麦申请
    isMixing: "1" | "0"; // 是否开始混流
    showZegoSettings: boolean;
    selectMic: string | undefined;
    selectCamera: string | undefined;
    selectSpeaker: string | undefined;
    selectVideoResolution: string;
    showNonVideoUser: boolean;
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
      isRequestingCohost: false,
      unreadInviteList: new Set(),
      isMixing: "0",
      showZegoSettings: false,
      selectMic: this.props.core.status.micDeviceID,
      selectCamera: this.props.core.status.cameraDeviceID,
      selectSpeaker: this.props.core.status.speakerDeviceID,
      selectVideoResolution:
        this.props.core.status.videoResolution || this.props.core._config.videoResolutionList![0],
      showNonVideoUser: this.props.core._config.showNonVideoUser as boolean,
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
  localStreamID = "";
  safariLimitationNoticed: -1 | 0 | 1 = -1;
  iosLimitationNoticed = 0;
  showNotSupported = 0;

  roomTimer: NodeJS.Timer | null = null;
  roomTimeNum = 0;
  setViewportMetaTimer: NodeJS.Timer | null = null;
  viewportHeight = 0;
  inviteModelRoot: any = null;
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
  get showRequestToCohostButton(): boolean {
    if (this.props.core._config.scenario?.config?.role !== LiveRole.Audience)
      return false;
    if (this.state.liveStatus === "0") return false;
    return !!this.props.core._config.showRequestToCohostButton;
  }
  get showInviteToCohostButton(): boolean {
    if (!this.props.core._config.showInviteToCohostButton) return false;
    if (this.state.liveStatus === "0") return false;
    if (this._selectedUser.streamList?.[0]?.media) return false;
    return this.props.core.isHost(this.props.core._expressConfig.userID);
  }

  componentDidMount() {
    this.setAllSinkId(this.state.selectSpeaker || "");
    window.addEventListener(
      "orientationchange",
      this.onOrientationChange.bind(this),
      false
    );
    this.onOrientationChange();
    this.initInRoomInviteMgListener();
    this.initSDK();
    this.props.core.eventEmitter.on("hangUp", () => {
      this.confirmLeaveRoom();
    });
    this.props.core._config.showRoomTimer && this.startRoomTimer();
    this.footerTimer = setTimeout(() => {
      this.setState({
        showFooter: !this.props.core._config.autoHideFooter,
      });
    }, 5000);
  }
  componentWillUnmount() {
    window.removeEventListener(
      "orientationchange",
      this.onOrientationChange.bind(this),
      false
    );
    this.props.core.eventEmitter.off("hangUp");
    if (this.roomTimer) {
      clearInterval(this.roomTimer);
      this.roomTimer = null;
    }
    this.state.localStream &&
      this.props.core.destroyStream(this.state.localStream);
    this.props.core.localStream = undefined;

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
    const { formatMessage } = this.props.core.intl;
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
        const { formatMessage } = this.props.core.intl;
        if (
          this.props.core._config.lowerLeftNotification?.showUserJoinAndLeave
        ) {
          userList.forEach((u) => {
            notificationList.push({
              content:
                u.userName +
                " " +
                (updateType === "ADD" ? formatMessage({ id: "global.enter" }) : formatMessage({ id: "global.quit" })) +
                formatMessage({ id: "global.room" }),
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
          // 当呼叫发起者离开通话时，整个通话要结束时，离开房间
          const inviterID = this.props.core._zimManager?.callInfo?.inviter?.userID
          const endCallWhenInitiatorLeave = this.props.core._zimManager?.config?.endCallWhenInitiatorLeave
          if (endCallWhenInitiatorLeave && userList.some(({ userID }) => userID === inviterID)) {
            this.confirmLeaveRoom(false, false);
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
      // ios手机 && 低于 14版本的Safari不支持多条流同时播放
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
        // 拷贝一下userList
        let userListCopy: ZegoCloudUserList = JSON.parse(
          JSON.stringify(userList)
        );
        // 有流且有一个设备是打开状态的用户数
        const userNum = userListCopy.filter(
          (user) =>
            user.streamList.length > 0 &&
            (user.streamList[0].cameraStatus === "OPEN" ||
              user.streamList[0].micStatus === "OPEN")
        ).length;
        // 最大可以同时播放的video
        let limitNum = 1;
        if (this.isCDNLive && !isIOS()) {
          // 非ios 最多同时拉6条流， http连接数限制
          limitNum = this.state.screenSharingUserList.length > 0 ? 5 : 6;
        }
        // 如果当前推流人数大于最大拉流数限制
        // 取最早进房间的user进行拉流展示
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
          // 更新用户列表
          this.setState(
            {
              zegoCloudUserList: targetUsers, // 需要拉流用户列表
              memberList: users, // 成员列表
            },
            () => {
              this.handleLayoutChange(this.state.userLayoutStatus, true);
            }
          );

          if (isIOS() && this.isCDNLive && this.iosLimitationNoticed === 0) {
            this.iosLimitationNoticed = 1;
            ZegoModelShow({
              header: formatMessage({ id: "global.notice" }),
              contentText: formatMessage({ id: "moblieRoom.systemNotSupport" }),
              okText: "Okay",
            });
          }
          return;
        }
      } else if (notSupportPhone) {
        // 只支持播放一个video的情况
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
            header: formatMessage({ id: "global.notice" }),
            contentText: formatMessage({ id: "mobileRoom.browserNotSupport" }),
            okText: "Okay",
            onOk: () => {
              this.safariLimitationNoticed = 1;
              this.handleLayoutChange(this.state.userLayoutStatus, true);
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
          this.handleLayoutChange(this.state.userLayoutStatus, true);
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
              preState.liveCountdown === -1 || preState.liveCountdown === 0
                ? res === "1"
                  ? 0
                  : -1
                : preState.liveCountdown,
          };
        },
        () => {
          //   console.error("【ZEGOCLOUD】 liveStatus", this.state.liveStatus);
        }
      );
    });
    this.props.core.onRoomMixingStateUpdate((isMixing: "0" | "1") => {
      this.setState({
        isMixing,
      });
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
            header: formatMessage({ id: "global.notice" }),
            contentText: formatMessage({ id: "global.serviceNotAvailable" }),
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
        this.props.core.localStream = undefined;

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
            content: formatMessage({ id: "room.turnedCameraOff" }, { user: fromUser.userName }),
          });
        }
        if (type === "Microphone" && status === "CLOSE" && this.state.micOpen) {
          await this.toggleMic();
          ZegoToast({
            content: formatMessage({ id: "room.turnedMicOff" }, { user: fromUser.userName }),
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
      massage = formatMessage({ id: "global.joinRoomFailedDesc" });;
    } else if ([1002031, 1002053].includes(logInRsp)) {
      //登录房间超时，可能是由于网络原因导致。
      massage = formatMessage({ id: "global.joinRoomFailedNetwork" });
    } else if ([1102018, 1102016, 1102020].includes(logInRsp)) {
      // 登录 token 错误，
      massage = formatMessage({ id: "global.joinRoomFailedToken" });
    } else if (1002056 === logInRsp) {
      // 用户重复进行登录。
      massage = formatMessage({ id: "global.joinRoomFailedRepeat" });
    } else {
      massage = formatMessage({ id: "global.joinRoomFailed" }, { code: logInRsp });
    }
    ZegoModelShow({
      header: formatMessage({ id: "global.loginRoomFailed" }),
      contentText: massage,
      okText: "OK",
    });
  }
  initInRoomInviteMgListener() {
    // 收到邀请上麦的通知
    const { formatMessage } = this.props.core.intl;
    this.props.core._zimManager?._inRoomInviteMg.notifyInviteToCoHost(
      (inviterName: string) => {
        this.inviteModelRoot = ZegoConfirm({
          title: formatMessage({ id: "room.invitationDialogTitle" }),
          content: formatMessage({ id: "room.invitationDialogDesc" }),
          confirm: formatMessage({ id: "global.agree" }),
          cancel: formatMessage({ id: "global.disagree" }),
          countdown: 60,
          closeCallBack: async (confirm: boolean) => {
            if (confirm) {
              this.props.core._zimManager?._inRoomInviteMg.audienceAcceptInvitation();
              // TODO 角色变更，更新config，开始推流,
              await this.props.core.changeAudienceToCohostInLiveStream();
              const res = await this.createStream();
              if (!res) {
                this.props.core.changeCohostToAudienceInLiveStream();
              }
            } else {
              this.props.core._zimManager?._inRoomInviteMg.audienceRefuseInvitation();
            }
          },
        });
      }
    );
    this.props.core._zimManager?._inRoomInviteMg.notifyInviteToCoHostRefused(
      (
        reason: ReasonForRefusedInviteToCoHost,
        user: { inviteeName: string; inviteeID?: string }
      ) => {
        const { inviteeName, inviteeID } = user;
        if (reason === ReasonForRefusedInviteToCoHost.Disagree) {
          ZegoToast({
            content: formatMessage({ id: "room.disagreedInvitationToast" }, { user: inviteeName }),
          });
        } else if (reason === ReasonForRefusedInviteToCoHost.Busy) {
          ZegoToast({
            content: formatMessage({ id: "room.InvitationSent" }),
          });
        } else if (reason === ReasonForRefusedInviteToCoHost.Timeout) {
        }
        this.updateUserAttr(inviteeID!, "invited", false);
      }
    );
    this.props.core._zimManager?._inRoomInviteMg.notifyRemoveCoHost(() => {
      // Cohost 变成 Audience，停止推流
      this.cohostToBeAudience();
    });
    this.props.core._zimManager?._inRoomInviteMg.notifyRequestCoHost(
      (inviter: ZegoUser, state: 0 | 1) => {
        //收到观众连麦通知，0 取消|超时， 1 申请
        // 左侧通知
        if (state === 1) {
          const notify = {
            content: formatMessage({ id: "room.requestingConnectionToast" }, { user: inviter.userName }),
            type: "INVITE",
            userName: inviter.userName,
            messageID: randomNumber(5),
          };
          this.setState({
            notificationList: [...this.state.notificationList, notify],
          });
        }
        // 设置红点

        if (state === 1) {
          this.state.unreadInviteList.add(inviter.userID);
        } else {
          this.state.unreadInviteList.delete(inviter.userID);
        }
        this.setState({
          unreadInviteList: this.state.unreadInviteList,
        });

        // 设置观众状态
        this.updateUserAttr(
          inviter.userID,
          "requestCohost",
          state ? Date.now() : ""
        );
      }
    );
    this.props.core._zimManager?._inRoomInviteMg.notifyHostRespondRequestCohost(
      async (respond: 0 | 1 | 2 | 3) => {
        if (respond === 0) {
          await this.props.core.changeAudienceToCohostInLiveStream();
          const res = await this.createStream();
          if (!res) {
            this.props.core.changeCohostToAudienceInLiveStream();
          }
        } else if (respond === 1) {
          ZegoToast({
            content: formatMessage({ id: "room.rejectedRequestToast" }),
          });
        } else if (respond === 2) {
          this.inviteModelRoot?.unmount();
        }
        this.setState({
          isRequestingCohost: false,
        });
      }
    );
    // 观众的连麦申请超时（观众端）
    this.props.core._zimManager?._inRoomInviteMg.notifyRequestCohostTimeout(
      () => {
        this.setState({
          isRequestingCohost: false,
        });
      }
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
        let localStream: MediaStream | null = null;
        try {
          const solution = getVideoResolution(this.state.selectVideoResolution);
          localStream = await this.props.core.createStream({
            camera: {
              video: !this.props.core.status.videoRefuse,
              audio: !this.props.core.status.audioRefuse,
              videoInput: this.state.selectCamera,
              audioInput: this.state.selectMic,
              videoQuality: 4,
              facingMode: this.faceModel ? "user" : "environment",
              channelCount: this.props.core._config.enableStereo ? 2 : 1,
              ...solution,
              //   width: 640,
              //   height: 360,
              //   bitrate: 400,
              //   frameRate: 15,
            },
          });
          this.props.core.localStream = localStream;
        } catch (error: any) {
          if (JSON.stringify(error).includes("constrain")) {
            localStream = await this.props.core.createStream({
              camera: {
                video: !this.props.core.status.videoRefuse,
                audio: !this.props.core.status.audioRefuse,
                facingMode: this.faceModel ? "user" : "environment",
                channelCount: this.props.core._config.enableStereo ? 2 : 1,
              },
            });
            this.props.core.localStream = localStream;
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
          cameraOpen: !!this.props.core._config.turnOnCameraWhenJoining,
          micOpen: !!this.props.core._config.turnOnMicrophoneWhenJoining,
        });
        const extraInfo = JSON.stringify({
          isCameraOn: !!this.props.core._config.turnOnCameraWhenJoining,
          isMicrophoneOn: this.props.core._config.turnOnMicrophoneWhenJoining,
          hasVideo: !this.props.core.status.videoRefuse,
          hasAudio: !this.props.core.status.audioRefuse,
        });
        try {
          const res = this.props.core.publishLocalStream(
            localStream,
            "main",
            extraInfo
          );
          if (res !== false) {
            this.localStreamID = res as string;
          }
        } catch (error) {
          // 推流失败就销毁创建的流
          console.error("【ZEGOCLOUD】publishStream failed:", error);
          this.props.core.destroyStream(localStream);
          this.setState({
            localStream: null,
          });
          return false;
        }

        return true;
      } catch (error: any) {
        console.error(
          "【ZEGOCLOUD】createStream or publishLocalStream failed,Reason: ",
          JSON.stringify(error)
        );
        if (error?.code === 1103065 || error?.code === 1103061) {
          ZegoToast({
            content: this.props.core.intl.formatMessage({ id: "room.occupiedToast" }),
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
        return false;
      }
    } else {
      return false;
    }
  }
  stopPublish() {
    try {
      this.localStreamID &&
        this.props.core.stopPublishingStream(this.localStreamID);
      this.state.localStream &&
        this.props.core.destroyStream(this.state.localStream);
      this.props.core.localStream = undefined;

      this.setState({
        localStream: null,
      });
      this.localStreamID = "";
    } catch (error) {
      console.error(error);
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
      try {
        await this.props.core.setStreamExtraInfo(
          this.localStreamID as string,
          JSON.stringify({
            isCameraOn: this.state.cameraOpen,
            isMicrophoneOn: !this.state.micOpen,
            hasVideo: !this.props.core.status.videoRefuse,
            hasAudio: !this.props.core.status.audioRefuse,
          })
        );
      } catch (error: any) {
        console.log('setStreamExtraInfo error', error);
      }
    }

    this.micStatus = !this.state.micOpen ? 1 : 0;
    if (result) {
      ZegoToast({
        content: this.props.core.intl.formatMessage({ id: "room.microphoneStatus" }) + (this.micStatus ? this.props.core.intl.formatMessage({ id: "room.on" }) : this.props.core.intl.formatMessage({ id: "room.off" })),
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
      try {
        await this.props.core.setStreamExtraInfo(
          this.localStreamID as string,
          JSON.stringify({
            isCameraOn: !this.state.cameraOpen,
            isMicrophoneOn: this.state.micOpen,
            hasVideo: !this.props.core.status.videoRefuse,
            hasAudio: !this.props.core.status.audioRefuse,
          })
        );
      } catch (error: any) {
        console.log('setStreamExtraInfo error', error);
      }
    }
    this.cameraStatus = !this.state.cameraOpen ? 1 : 0;
    if (result) {
      ZegoToast({
        content: this.props.core.intl.formatMessage({ id: "room.cameraStatus" }) + (this.cameraStatus ? this.props.core.intl.formatMessage({ id: "room.on" }) : this.props.core.intl.formatMessage({ id: "room.off" })),
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
    if (this.cameraDevices.length === 0) {
      this.cameraDevices = await this.props.core.getCameras();
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
          channelCount: this.props.core._config.enableStereo ? 2 : 1,
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
    layOutStatus: LayOutStatus
  ) {
    this.setState(
      (state: {
        layOutStatus: LayOutStatus;
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
      let message
      if (this.props.core._config.addInRoomMessageAttributes) {
        message = JSON.stringify({
          msg,
          attrs: this.props.core._config.addInRoomMessageAttributes(),
        })
      } else {
        message = msg
      }

      resp = await this.props.core.sendRoomMessage(message)
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
    if (!this.props.core._config.showLeaveRoomConfirmDialog) {
      this.confirmLeaveRoom();
    } else {
      ZegoConfirm({
        title: this.props.core._config.leaveRoomDialogConfig?.titleText ?? this.props.core.intl.formatMessage({ id: "global.leaveDialogTitle" }),
        content: this.props.core._config.leaveRoomDialogConfig?.descriptionText ?? this.props.core.intl.formatMessage({ id: "global.leaveDialogDesc" }),
        cancel: this.props.core.intl.formatMessage({ id: "global.cancel" }),
        confirm: this.props.core.intl.formatMessage({ id: "global.confirm" }),
        closeCallBack: (confirm: boolean) => {
          if (confirm) {
            this.confirmLeaveRoom();
          }
        },
      });
    }

  }
  private cohostToBeAudience() {
    this.stopPublish();
    // this.setState({
    //   showLayoutSettings: false,
    //   showSettings: false,
    // });
    this.props.core.changeCohostToAudienceInLiveStream();
  }
  async handleRequestCohost() {
    const { formatMessage } = this.props.core.intl;
    if (this.state.isRequestingCohost) {
      await this.props.core._zimManager?._inRoomInviteMg.audienceCancelRequest();
      this.setState({
        isRequestingCohost: false,
      });
    } else {
      const res =
        await this.props.core._zimManager?._inRoomInviteMg.requestCohost();
      if (res?.code === 0) {
        ZegoToast({
          content: formatMessage({ id: "room.appliedConnectionToast" }),
        });
        this.setState({
          isRequestingCohost: true,
        });
      } else if (res?.code === 1) {
        ZegoToast({
          content: formatMessage({ id: "room.hostLeftToast" }),
        });
      } else {
        ZegoToast({
          content: formatMessage({ id: "room.appliedFailToast" }),
        });
      }
    }
  }
  private updateUserAttr(
    userID: string,
    attr: keyof ZegoCloudUser,
    value: any
  ) {
    const userList = this.state.zegoCloudUserList.map((user: ZegoCloudUser) => {
      if (user.userID === userID) {
        user[attr] = value as never;
      }
      return user;
    });
    this.setState({
      zegoCloudUserList: userList,
    });
  }
  private confirmLeaveRoom(isKickedOut = false, isCallQuit = true) {
    if (this.props.core._config.scenario?.config?.role !== LiveRole.Audience) {
      this.props.core._config.turnOnCameraWhenJoining = this.state.cameraOpen;
      this.props.core._config.turnOnMicrophoneWhenJoining = this.state.micOpen;
    }
    this.props.core._zimManager?._inRoomInviteMg?.audienceCancelRequest();
    this.state.localStream &&
      this.props.core.destroyStream(this.state.localStream);
    this.props.core.localStream = undefined;

    this.props.core.status.micDeviceID = this.state.selectMic;
    this.props.core.status.cameraDeviceID = this.state.selectCamera;
    this.props.core.status.speakerDeviceID = this.state.selectSpeaker;
    this.props.core.status.videoResolution = this.state.selectVideoResolution;

    this.props.core.leaveRoom();
    this.props.leaveRoom && this.props.leaveRoom(isKickedOut, isCallQuit);
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

  getWaitingUser(): ZegoCloudUserList {
    if (!this.props.core._zimManager) return []
    const { callInfo } = this.props.core._zimManager
    const { showWaitingCallAcceptAudioVideoView } = this.props.core._config
    const waitingUsers = showWaitingCallAcceptAudioVideoView
      ? callInfo.waitingUsers || []
      : []
    return waitingUsers
      .filter(({ type }) => type === UserTypeEnum.CALLING_WAITTING)
      .map((waitingUser) => ({
        ...waitingUser,
        streamList: [],
        pin: false,
      }))
  }

  getShownUser(showWaitingUser = true) {
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

    if (showWaitingUser) {
      const waittingUser = this.getWaitingUser()
      return [...shownUser, ...waittingUser] as ZegoCloudUserList;
    }
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
              userInfo={user}></ZegoAudio>
          );
        })}
      </>
    );
  }
  async manageSelectCallback(type: UserListMenuItemType, value?: boolean) {
    this.menuOptions[type](value);
  }
  menuOptions: { [key in UserListMenuItemType]: Function } = {
    [UserListMenuItemType.ChangePin]: (value: boolean) => {
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
    },
    [UserListMenuItemType.MuteMic]: async () => {
      let res;
      if (
        this._selectedUser.userID === this.props.core._expressConfig.userID &&
        this.state.micOpen
      ) {
        res = await this.toggleMic();
        res && (this._selectedUser.streamList[0].micStatus = "MUTE");
      } else if (this._selectedUser.streamList?.[0]?.micStatus === "OPEN") {
        res = await this.props.core.turnRemoteMicrophoneOff(
          this._selectedUser.userID
        );
      }
      res &&
        ZegoToast({
          content: this.props.core.intl.formatMessage({ id: "room.turnOffMicToast" }),
        });
    },
    [UserListMenuItemType.MuteCamera]: async () => {
      let res;
      if (
        this._selectedUser.userID === this.props.core._expressConfig.userID &&
        this.state.cameraOpen
      ) {
        res = await this.toggleCamera();

        res && (this._selectedUser.streamList[0].cameraStatus = "MUTE");
        console.warn(this._selectedUser);
      } else if (this._selectedUser.streamList?.[0]?.cameraStatus === "OPEN") {
        res = await this.props.core.turnRemoteCameraOff(
          this._selectedUser.userID
        );
      }
      res &&
        ZegoToast({
          content: this.props.core.intl.formatMessage({ id: "room.turnOffCameraToast" }),
        });
    },
    [UserListMenuItemType.RemoveUser]: () => {
      this.setState({
        layOutStatus: "ONE_VIDEO",
      });
      const { formatMessage } = this.props.core.intl;
      ZegoConfirm({
        title: formatMessage({ id: "room.remove" }),
        content: formatMessage({ id: "room.removeDesc" }, { user: this._selectedUser.userName }),
        cancel: formatMessage({ id: "global.cancel" }),
        confirm: formatMessage({ id: "global.confirm" }),
        closeCallBack: (confirm: boolean) => {
          if (confirm) {
            this.props.core.removeMember(this._selectedUser.userID);
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }
        },
      });
    },
    [UserListMenuItemType.InviteCohost]: async () => {
      const res =
        await this.props.core._zimManager?._inRoomInviteMg.inviteJoinToCohost(
          this._selectedUser.userID,
          this._selectedUser.userName || ""
        );
      this.updateUserAttr(this._selectedUser.userID, "invited", true);
      let text = "";
      if (res?.code === 2) {
        text = this.props.core.intl.formatMessage({ id: "room.sendInvitation" });;
      } else if (res?.code === 0) {
        text = this.props.core.intl.formatMessage({ id: "room.sendInvitationSuccessToast" });
      } else {
        text = this.props.core.intl.formatMessage({ id: "room.sendInvitationFailToast" });
      }
      ZegoToast({
        content: text,
      });
    },
    [UserListMenuItemType.RemoveCohost]: async () => {
      this.setState({
        layOutStatus: "ONE_VIDEO",
      });
      const isSelf =
        this._selectedUser.userID === this.props.core._expressConfig.userID;
      const { formatMessage } = this.props.core.intl;
      ZegoConfirm({
        title: formatMessage({ id: "room.endConnection" }),
        content: isSelf
          ? formatMessage({ id: "room.endConnectionDesc" }, { user: "the host" })
          : formatMessage({ id: "room.endConnectionDesc" }, { user: this._selectedUser.userName }),
        cancel: formatMessage({ id: "global.cancel" }),
        confirm: formatMessage({ id: "global.confirm" }),
        closeCallBack: (confirm: boolean) => {
          if (confirm) {
            if (isSelf) {
              this.cohostToBeAudience();
            } else {
              this.props.core._zimManager?._inRoomInviteMg.removeCohost(
                this._selectedUser.userID
              );
            }
          }
        },
      });
    },
    [UserListMenuItemType.DisagreeRequestCohost]: async () => {
      const res =
        await this.props.core._zimManager?._inRoomInviteMg.hostRefuseRequest(
          this._selectedUser.userID
        );
      this.updateUserAttr(this._selectedUser.userID, "requestCohost", "");
      this.state.unreadInviteList.delete(this._selectedUser.userID);
      this.setState({
        unreadInviteList: this.state.unreadInviteList,
      });
      console.warn("DisagreeRequestCohost", res);
    },
    [UserListMenuItemType.AgreeRequestCohost]: async () => {
      const res =
        await this.props.core._zimManager?._inRoomInviteMg.hostAcceptRequest(
          this._selectedUser.userID
        );
      if (res?.code === 6000276) {
        ZegoToast({
          content: this.props.core.intl.formatMessage({ id: "room.requestExpired" }),
        });
      }
      this.updateUserAttr(this._selectedUser.userID, "requestCohost", "");
      this.state.unreadInviteList.delete(this._selectedUser.userID);
      this.setState({
        unreadInviteList: this.state.unreadInviteList,
      });
      console.warn("AgreeRequestCohost", res);
    },
  };
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
    selectLayout: "Auto" | "Grid" | "Sidebar",
    stopUpdateUser?: boolean
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
      let sidebarEnabled = false;

      if (selectLayout === "Sidebar") {
        if (this.state.cameraOpen || this.state.micOpen) {
          sidebarEnabled = !this.localUserPin;
        } else {
          sidebarEnabled = true;
        }
      }
      await this.props.core.setSidebarLayOut(
        this.state.screenSharingUserList.length > 0 ? false : sidebarEnabled,
        stopUpdateUser
      );
      resolve(true)
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
    if (this.props.core.isHost(this._selectedUser.userID)) return false;
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
          !!this.props.core._config.showOnlyAudioUser)) &&
      this.getShownUser().length > 1
    );
  }
  get showRemoveCohostButton(): boolean {
    if (!this.props.core._config.showRemoveCohostButton) return false;
    if (this.state.liveStatus === "0") return false;
    if (!this._selectedUser.streamList?.[0]?.media) return false;
    if (this.props.core.isHost(this.props.core._expressConfig.userID)) {
      return (
        this._selectedUser.userID !== this.props.core._expressConfig.userID
      );
    } else {
      return (
        this._selectedUser.userID === this.props.core._expressConfig.userID
      );
    }
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
          }}></ZegoRoomInvite>
      );
    } else if (this.state.layOutStatus === "USER_LIST") {
      pages = (
        <ZegoUserList
          core={this.props.core}
          userList={this.getAllMemberList()}
          closeCallBack={(_user?: ZegoCloudUser) => {
            _user && (this._selectedUser = _user);
            if (_user?.requestCohost) return;
            this.setState({
              layOutStatus: this.showManager(_user) ? "MANAGE" : "ONE_VIDEO",
            });
          }}
          handleMenuItem={(type: UserListMenuItemType, user: ZegoCloudUser) => {
            user && (this._selectedUser = user);
            this.menuOptions[type]();
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }}></ZegoUserList>
      );
    } else if (this.state.layOutStatus === "MESSAGE") {
      pages = (
        <ZegoMessage
          core={this.props.core}
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
          }}></ZegoMessage>
      );
    } else if (this.state.layOutStatus === "LAYOUT") {
      pages = (
        <ZegoLayout
          core={this.props.core}
          selectLayout={this.state.userLayoutStatus}
          closeCallBac={() => {
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }}
          selectCallBack={this.handleLayoutChange.bind(this)}></ZegoLayout>
      );
    } else if (this.state.layOutStatus === "MANAGE") {
      pages = (
        <ZegoManage
          core={this.props.core}
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
          showRemoveCohostButton={this.showRemoveCohostButton}
          showInviteToCohostButton={this.showInviteToCohostButton}></ZegoManage>
      );
    } else if (this.state.layOutStatus === "INVITE_LIST") {
      pages = (
        <ZegoInvitationList
          core={this.props.core}
          callingInvitationListConfig={this.getCallingInvitationListConfig()}
          userList={this.getShownUser()}
          handleInvitation={(invitees: ZegoUser[]) => {
            this.handleInvitation(invitees)
          }}
          closeCallBack={() => {
            this.setState({
              layOutStatus: "ONE_VIDEO",
            });
          }}
        />
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
          }}>
          {pages}
        </div>
      );
    }
  }

  getLiveNotStartedText() {
    const { _config: { liveNotStartedTextForAudience }, intl } = this.props.core
    return liveNotStartedTextForAudience || intl.formatMessage({ id: "room.liveNotStarted" })
  }

  getLayoutScreen() {
    if (
      this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming
    ) {
      const hasVideo = [
        ...this.getAllUser(),
        ...this.state.screenSharingUserList,
      ].some((u) => {
        if (u.streamList) {
          return u.streamList.some((s) => {
            return s.cameraStatus === "OPEN" || s.micStatus === "OPEN";
          });
        }
        return false;
      });
      if (
        this.props.core._config.scenario?.config?.role === LiveRole.Audience
      ) {
        if (this.state.liveStatus !== "1") {
          return (
            <div className={`${ZegoRoomCss.liveNotStart} zegoUserVideo_click`}>
              <i></i>
              <span>{this.getLiveNotStartedText()}</span>
            </div>
          );
        } else if (
          hasVideo &&
          this.props.core._config.scenario.config.enableVideoMixing &&
          this.props.core._config.scenario.config.role === LiveRole.Audience
        ) {
          return (
            <div className={ZegoRoomCss.mixVideoWrapper}>
              {this.state.isScreenPortrait &&
                this.state.screenSharingUserList.length > 0 && (
                  <div className={ZegoRoomCss.screenTopBar}>
                    <p>
                      {this.props.core.intl.formatMessage({ id: "mobileRoom.presenting" }, { user: this.state.screenSharingUserList[0].userName })}
                    </p>
                  </div>
                )}
              <ZegoMixPlayer
                userInfo={this.props.core.mixUser}
                showFullScreen={
                  this.state.liveStatus === "1" &&
                  this.props.core._config.scenario?.config?.enableVideoMixing
                }
                isPureAudio={this.props.core.zum.isPureAudio}></ZegoMixPlayer>
            </div>
          );
        }
      }
      if (!hasVideo) {
        return (
          <div className={`${ZegoRoomCss.noOneStreaming} zegoUserVideo_click`}>
            <i></i>
            <FormattedMessage id="room.noOneStreaming" />
          </div>
        );
      }
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
            core={this.props.core}
            selfInfo={{
              userID: this.props.core._expressConfig.userID,
            }}
            userList={this.getShownUser()}
            screenSharingUser={this.state.screenSharingUserList[0]}
            videoShowNumber={5}
            soundLevel={this.state.soundLevel}></ZegoScreen>
        </>
      );
    }

    if (this.state.isZegoWhiteboardSharing) {
      const { formatMessage } = this.props.core.intl;
      return (
        <>
          {this.state.isScreenPortrait && this.showRoomTimerUI && (
            <div
              className={`${ZegoRoomCss.screenTopBar} ${ZegoRoomCss.center}`}>
              <ZegoTimer time={this.state.roomTime}></ZegoTimer>
            </div>
          )}
          <ZegoWhiteboard
            core={this.props.core}
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
                      header: formatMessage({ id: "global.notice" }),
                      contentText: formatMessage({ id: "global.tooFrequent" }),
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
            onImageAdd={async () => { }}
            zegoSuperBoardView={this.state.zegoSuperBoardView}></ZegoWhiteboard>
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
              className={`${ZegoRoomCss.screenTopBar} ${ZegoRoomCss.center} ${ZegoRoomCss.flexStart}`}>
              <ZegoTimer time={this.state.roomTime}></ZegoTimer>
            </div>
          )}
          <ZegoOne2One
            core={this.props.core}
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
            showTimerUI={this.showRoomTimerUI}></ZegoOne2One>
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
              className={`${ZegoRoomCss.screenTopBar} ${ZegoRoomCss.center} ${ZegoRoomCss.flexStart}`}>
              <ZegoTimer time={this.state.roomTime}></ZegoTimer>
            </div>
          )}
          <ZegoGrid
            core={this.props.core}
            myClass={this.backgroundUrl && ZegoRoomCss.transparent}
            selfInfo={{
              userID: this.props.core._expressConfig.userID,
            }}
            userList={this.getShownUser()}
            videoShowNumber={6}
            soundLevel={this.state.soundLevel}></ZegoGrid>
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
              className={`${ZegoRoomCss.screenTopBar} ${ZegoRoomCss.center} ${ZegoRoomCss.flexStart}`}>
              <ZegoTimer time={this.state.roomTime}></ZegoTimer>
            </div>
          )}
          <ZegoSidebar
            core={this.props.core}
            myClass={this.backgroundUrl && ZegoRoomCss.transparent}
            selfInfo={{
              userID: this.props.core._expressConfig.userID,
            }}
            userList={this.getShownUser()}
            videoShowNumber={5}
            soundLevel={this.state.soundLevel}></ZegoSidebar>
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
        if (this.state.layOutStatus !== "ONE_VIDEO") {
          this.setState({
            layOutStatus: "ONE_VIDEO",
          });
          clearTimeout(this.footerTimer);
          this.footerTimer = setTimeout(() => {
            this.setState({
              showFooter:
                this.state.isZegoWhiteboardSharing &&
                  !this.state.isScreenPortrait
                  ? false
                  : !this.props.core._config.autoHideFooter,
              showMore: false,
            });
          }, 5000);
        } else {
          this.setState({
            showFooter:
              this.state.isZegoWhiteboardSharing && !this.state.isScreenPortrait
                ? false
                : !this.props.core._config.autoHideFooter,
            showMore: false,
          });
        }
      }
      !whiteboardClick && e.stopPropagation();
    } else {
      clearTimeout(this.footerTimer);
      this.footerTimer = setTimeout(() => {
        !this.state.showMore &&
          this.setState({
            showFooter:
              this.state.isZegoWhiteboardSharing && !this.state.isScreenPortrait
                ? false
                : !this.props.core._config.autoHideFooter,
            showMore: false,
          });
      }, 5000);
    }
  }

  async setLive() {
    if (this.state.liveCountdown === 0) {
      const { formatMessage } = this.props.core.intl;
      ZegoModelShow({
        header: formatMessage({ id: "room.stopLive" }),
        contentText: formatMessage({ id: "room.stopLiveDesc" }),
        okText: formatMessage({ id: "global.stop" }),
        cancelText: formatMessage({ id: "global.cancel" }),
        onOk: async () => {
          // stop live
          await this.props.core.setLive("stop");
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
          await this.props.core.setLive("live");
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
    const { formatMessage } = this.props.core.intl;
    if (this.state.screenSharingUserList.length > 0) {
      ZegoToast({
        content: formatMessage({ id: "room.otherScreenPresentingToast" }, { user: this.state.screenSharingUserList[0].userName }),
      });

      return;
    } else if (this.state.zegoSuperBoardView) {
      ZegoToast({
        content: formatMessage({ id: "room.otherWhiteboardPresentingToast" }, { user: this.state.zegoSuperBoardView.getCurrentSuperBoardSubView()?.getModel.name }),
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
    let isScreenPortrait = this.state.isScreenPortrait;
    this.props.core._config.container
      ?.querySelectorAll("input")
      .forEach((el) => el.blur());
    if (window.orientation === 180 || window.orientation === 0) {
      // 竖屏
      isScreenPortrait = true;
    }
    if (window.orientation === 90 || window.orientation === -90) {
      // 横屏
      isScreenPortrait = false;
    }

    this.setState({});

    this.setState(
      {
        isScreenPortrait: isScreenPortrait,
        showFooter:
          this.state.isZegoWhiteboardSharing && !isScreenPortrait
            ? false
            : !this.props.core._config.autoHideFooter,
      },
      () => {
        if (!isScreenPortrait && !isIOS()) {
          this.setViewportMeta();
        } else {
          if (this.setViewportMetaTimer) {
            clearTimeout(this.setViewportMetaTimer);
            this.setViewportMetaTimer = null;
          }
        }
        setTimeout(() => {
          this.state.zegoSuperBoardView
            ?.getCurrentSuperBoardSubView()
            ?.reloadView();
        }, 300);
      }
    );
  }
  // 解决横屏时键盘弹起导致视窗高度变小，页面缩小的问题
  setViewportMeta() {
    if (this.viewportHeight) return;
    let metaEl: HTMLMetaElement | null = document.querySelector(
      "meta[name=viewport]"
    );
    let content = "";
    if (window.outerHeight > window.outerWidth) {
      this.setViewportMetaTimer = setTimeout(() => {
        this.setViewportMeta();
        this.setViewportMetaTimer = null;
      }, 100);
      return;
    } else {
      this.viewportHeight = window.outerHeight;
    }
    const height = "height=" + this.viewportHeight;
    if (metaEl) {
      let contentArr = metaEl.content
        .split(",")
        .filter((attr) => !attr.includes("height="));
      contentArr.push(height);
      content = contentArr.join(",");
    } else {
      metaEl = document.createElement("meta");
      metaEl.name = "viewport";
      document.querySelector("header")?.appendChild(metaEl);
    }
    metaEl.content = content;
  }

  // 打开设置弹框
  handleSetting() {
    this.setState({
      showZegoSettings: true,
    });
  }

  // 设置扬声器 ID
  private setAllSinkId(speakerId: string) {
    const room = document.querySelector(`.${ZegoRoomCss.ZegoRoom}`);
    room?.querySelectorAll("video").forEach((video: any) => {
      video?.setSinkId?.(speakerId || "");
    });
    room?.querySelectorAll("audio").forEach((audio: any) => {
      audio?.setSinkId?.(speakerId || "");
    });
  }

  get backgroundUrl() {
    return this.props.core._config.backgroundUrl || "";
  }

  get contentStyle() {
    const { backgroundUrl } = this.props.core._config;
    return {
      backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : '',
    }
  }

  getLiveButtonText() {
    const { liveCountdown } = this.state
    const { startLiveButtonText } = this.props.core._config
    if (liveCountdown === 0) {
      return <FormattedMessage id="global.stop" />
    }
    return startLiveButtonText || <FormattedMessage id="room.live" />
  }

  showInvitationButton() {
    if (!this.props.core._zimManager) return false
    const { config, callInfo } = this.props.core._zimManager
    const { userID } = this.props.core._expressConfig
    if (!config.canInvitingInCalling) return false
    if (!config.onlyInitiatorCanInvite) return true
    return userID === callInfo.inviter?.userID
  }

  getCallingInvitationListConfig() {
    return this.props.core._config.callingInvitationListConfig || {
      defaultChecked: true,
      waitingSelectUsers: [],
    }
  }

  handleInvitation(invitees: ZegoUser[]) {
    if (invitees.length) {
      const { formatMessage } = this.props.core.intl;
      this.props.core._zimManager?.addInvitation?.(invitees, {})
        ?.catch((err) => {
          ZegoToast({
            content: formatMessage({ id: "room.sendInvitationFailToast" }),
          });
        })
    }
    this.setState({
      layOutStatus: "ONE_VIDEO",
    })
  }

  render(): React.ReactNode {
    const startIndex =
      this.state.notificationList.length < 4
        ? 0
        : this.state.notificationList.length - 2;
    const { formatMessage } = this.props.core.intl
    return (
      <ShowManageContext.Provider
        value={{
          enableVideoMixing: this.props.core._config.scenario?.config?.enableVideoMixing,
          show: (_user: ZegoCloudUser) => {
            _user && (this._selectedUser = _user)
            this.setState({
              layOutStatus: this.showManager(_user) ? "MANAGE" : "ONE_VIDEO",
            })
          },
          liveStatus: this.state.liveStatus,
          showPinButton:
            (!!this.props.core._config.showPinButton ||
              !!this.props.core._config.showTurnOffRemoteCameraButton ||
              !!this.props.core._config.showTurnOffRemoteMicrophoneButton ||
              !!this.props.core._config.showRemoveUserButton) &&
            this.getShownUser().length > 1,
          speakerId: this.state.selectSpeaker,
          whiteboard_page: this.state.zegoSuperBoardView?.getCurrentSuperBoardSubView()?.getCurrentPage() || 1,
          whiteboard_toolType: this.props.core.zegoSuperBoard?.getToolType() || 0,
          whiteboard_fontSize: this.props.core.zegoSuperBoard?.getFontSize() || 0,
          whiteboard_brushSize: this.props.core.zegoSuperBoard?.getBrushSize() || 0,
          whiteboard_brushColor: this.props.core.zegoSuperBoard?.getBrushColor() || "",
          whiteboard_isFontBold: this.props.core.zegoSuperBoard?.isFontBold(),
          whiteboard_isFontItalic: this.props.core.zegoSuperBoard?.isFontItalic(),
          whiteboard_showAddImage: this.props.core._config.whiteboardConfig?.showAddImageButton,
          whiteboard_showCreateClose: this.props.core._config.whiteboardConfig?.showCreateAndCloseButton,
          userInfo: { userID: this.props.core._expressConfig.userID },
        }}>
        <div
          className={`${ZegoRoomCss.ZegoRoom} ZegoRoomMobile_ZegoRoom ${this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming
            ? this.props.core._config.scenario?.config?.role === LiveRole.Host
              ? ZegoRoomCss.host
              : this.props.core._config.scenario?.config?.role === LiveRole.Audience
                ? ZegoRoomCss.audience
                : ""
            : ""
            } `}
          style={this.contentStyle}
          onClick={(e) => {
            // @ts-ignore
            this.clickVideo(e)
          }}>
          {this.getLayoutScreen()}
          {this.state.isNetworkPoor && <div className={ZegoRoomCss.network}></div>}
          {(this.state.showFooter || false) && (
            <div className={ZegoRoomCss.footer}>
              {this.props.core._config.showMyCameraToggleButton &&
                (this.props.core._config.scenario?.mode !== ScenarioModel.LiveStreaming ||
                  this.props.core._config.scenario?.config?.role === LiveRole.Cohost) && (
                  <a
                    className={`${ZegoRoomCss.switchCamera}`}
                    onClick={() => {
                      this.switchCamera()
                    }}></a>
                )}

              {this.props.core._config.showMyCameraToggleButton && (
                <a
                  className={this.state.cameraOpen ? ZegoRoomCss.toggleCamera : ZegoRoomCss.cameraClose}
                  onClick={() => {
                    this.toggleCamera()
                  }}></a>
              )}

              {this.props.core._config.showMyMicrophoneToggleButton && (
                <a
                  className={this.state.micOpen ? ZegoRoomCss.toggleMic : ZegoRoomCss.micClose}
                  onClick={() => {
                    this.toggleMic()
                  }}></a>
              )}

              <a
                className={
                  this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming
                    ? ZegoRoomCss.liveLeaveButton
                    : ZegoRoomCss.leaveRoom
                }
                onClick={() => {
                  this.leaveRoom()
                }}></a>

              {(this.props.core._config.showTextChat ||
                this.props.core._config.showUserList ||
                this.props.core._config.sharedLinks) && (
                  <a
                    id="ZegoRoomCssMobileMore"
                    className={`${ZegoRoomCss.more} ${!this.state.showMore && this.state.unreadInviteList.size > 0
                      ? ZegoRoomCss.moreRedPoint
                      : ""
                      }`}
                    onClick={() => {
                      this.openMore()
                    }}>
                    {(this.state.showMore || false) && (
                      <div
                        id="ZegoRoomCssMobilePopMore"
                        className={`${ZegoRoomCss.popMore} ${ZegoRoomCss.popLiveMore}`}>
                        <div className={ZegoRoomCss.popMoreContent}>
                          {this.props.core._config.showMyCameraToggleButton &&
                            this.props.core._config.scenario?.mode ===
                            ScenarioModel.LiveStreaming &&
                            this.props.core._config.scenario.config?.role === LiveRole.Host && (
                              <div
                                className={`${ZegoRoomCss.switchCamera} zegoUserVideo_click`}
                                onClick={() => {
                                  this.switchCamera()
                                }}>
                                <i
                                  className={`${ZegoRoomCss.switchCamera} zegoUserVideo_click`}></i>
                                <span>{formatMessage({ id: "global.flip" })}</span>
                              </div>
                            )}

                          {this.props.core._config.showRoomDetailsButton && (
                            <div
                              className={ZegoRoomCss.roomDetail}
                              onClick={(ev) => {
                                ev.stopPropagation()
                                this.toggleLayOut("INVITE")
                              }}>
                              <i className={ZegoRoomCss.details}></i>
                              <span>{formatMessage({ id: "global.roomDetails" })}</span>
                            </div>
                          )}

                          {this.props.core._config.showUserList && (
                            <div
                              className={`${this.state.unreadInviteList.size > 0 ? ZegoRoomCss.unread : ""
                                }`}
                              onClick={(ev) => {
                                ev.stopPropagation()
                                this.toggleLayOut("USER_LIST")
                              }}>
                              <i className={ZegoRoomCss.member}></i>
                              <span>{formatMessage({ id: "mobileRoom.member" })}</span>
                            </div>
                          )}
                          {this.props.core._config.showTextChat && (
                            <div
                              onClick={(ev) => {
                                ev.stopPropagation()
                                this.toggleLayOut("MESSAGE")
                              }}>
                              <i className={ZegoRoomCss.chat}></i>
                              <span>{formatMessage({ id: "mobileRoom.chat" })}</span>
                            </div>
                          )}
                          {this.props.core._config.showLayoutButton && (
                            <div
                              onClick={(ev) => {
                                ev.stopPropagation()
                                this.toggleLayOut("LAYOUT")
                              }}>
                              <i className={ZegoRoomCss.layout}></i>
                              <span>{formatMessage({ id: "mobileRoom.layout" })}</span>
                            </div>
                          )}
                          {this.showRequestToCohostButton && (
                            <div
                              onClick={(ev) => {
                                ev.stopPropagation()
                                this.handleRequestCohost()
                              }}>
                              <i
                                className={`${this.state.isRequestingCohost
                                  ? ZegoRoomCss.connected
                                  : ZegoRoomCss.connect
                                  } `}></i>
                              <span>Connect</span>
                            </div>
                          )}

                          {this.props.core._config.plugins?.ZegoSuperBoardManager &&
                            this.props.core._config.whiteboardConfig?.showCreateAndCloseButton && (
                              <div
                                onClick={(ev) => {
                                  ev.stopPropagation()
                                  this.toggleLayOut("WHITEBOARD")
                                  this.toggleWhiteboardSharing()
                                }}>
                                <i
                                  className={`${ZegoRoomCss.whiteboard} ${this.state.isZegoWhiteboardSharing
                                    ? ZegoRoomCss.sharing
                                    : ""
                                    } ${this.state.screenSharingUserList.length > 0
                                      ? ZegoRoomCss.forbiddenSharing
                                      : ""
                                    }`}></i>
                                <span>{formatMessage({ id: "mobileRoom.whiteboard" })}</span>
                              </div>
                            )}

                          {
                            <div onClick={() => { this.handleSetting() }}>
                              <i className={ZegoRoomCss.settings}></i>
                              <span>{formatMessage({ id: "global.settings" })}</span>
                            </div>
                          }
                          {this.showInvitationButton() && (
                            <div
                              onClick={(ev) => {
                                ev.stopPropagation()
                                this.toggleLayOut("INVITE_LIST")
                              }}>
                              <i className={ZegoRoomCss.member}></i>
                              <span>{formatMessage({ id: "global.invitation" })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {(this.state.showMore || false) && <div className={ZegoRoomCss.popMoreArray}></div>}
                  </a>
                )}

              {this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
                this.props.core._config.scenario.config?.role === LiveRole.Host && (
                  <a
                    className={`${ZegoRoomCss.goLive}  ${this.state.liveCountdown === 0 ? ZegoRoomCss.goLiveEnabled : ""
                      }`}
                    id="ZegoLiveButton"
                    onClick={() => {
                      this.setLive()
                    }}>
                    <span>
                      {this.getLiveButtonText()}
                    </span>
                  </a>
                )}
            </div>
          )}
          {this.getListScreen()}
          <>{this.getHiddenUser()}</>
          <div className={ZegoRoomCss.notify} id="zego_left_notify_wrapper">
            {this.state.notificationList.slice(startIndex).map((notify) => {
              if (notify.type === "MSG") {
                return (
                  <div key={notify.content} className={ZegoRoomCss.notifyContent}>
                    <h5>{notify.userName}</h5>
                    <span>{notify.content}</span>
                  </div>
                )
              } else {
                return (
                  <div key={notify.content} className={ZegoRoomCss.notifyContent}>
                    <span>{notify.content}</span>
                  </div>
                )
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
                this.state.firstLoading || false ? formatMessage({ id: "global.joining" }) : formatMessage({ id: "global.networkMobile" })
              }></ZegoReconnect>
          )}
          {this.props.core._config.scenario?.mode === ScenarioModel.LiveStreaming &&
            (this.state.liveCountdown === 0 || this.state.liveStatus === "1") && (
              <button
                className={`${ZegoRoomCss.LiveStateButton}  ${this.state.showFooter ? "" : ZegoRoomCss.LiveStateButtonNoFooter
                  }`}>
                Live
              </button>
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
                })
              }}
              onMicChange={(deviceID: string) => {
                this.setState(
                  {
                    selectMic: deviceID,
                  },
                  () => {
                    if (this.state.localStream) {
                      this.props.core.useMicrophoneDevice(this.state.localStream, deviceID)
                    }
                  }
                )
              }}
              onCameraChange={(deviceID: string) => {
                this.setState(
                  {
                    selectCamera: deviceID,
                  },
                  async () => {
                    if (this.state.localStream) {
                      await this.props.core.useCameraDevice(this.state.localStream, deviceID)
                      this.setState({
                        cameraOpen: true,
                      })
                    }
                  }
                )
              }}
              onSpeakerChange={(deviceID: string) => {
                this.setState(
                  {
                    selectSpeaker: deviceID,
                  },
                  () => {
                    this.setAllSinkId(deviceID)
                  }
                )
              }}
              onVideoResolutionChange={(level: string) => {
                this.setState(
                  {
                    selectVideoResolution: level,
                  },
                  () => {
                    if (this.state.localStream) {
                      const { width, height, bitrate, frameRate } = getVideoResolution(level)
                      this.props.core.setVideoConfig(this.state.localStream, {
                        width,
                        height,
                        maxBitrate: bitrate,
                        frameRate,
                      })
                    }
                  }
                )
              }}
              onShowNonVideoChange={(selected: boolean) => {
                this.props.core._config.showNonVideoUser = selected
                this.props.core.setShowNonVideo(selected)
                this.setState({
                  showNonVideoUser: selected,
                })
              }}></ZegoSettings>
          )}
        </div>
      </ShowManageContext.Provider>
    )
  }
}
