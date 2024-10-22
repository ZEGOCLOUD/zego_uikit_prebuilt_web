import "polyfill-object.fromentries";
import React, { ChangeEvent, RefObject } from "react";
// @ts-ignore
import APP from "./App.module.scss";
import { ZegoUIKitPrebuilt } from "./sdk/index";
import {
  LiveRole,
  RightPanelExpandedType,
  ScenarioModel,
  ZegoCloudRoomConfig,
  ZegoInvitationType,
  ZegoUIKitLanguage,
  ZegoUser,
} from "./sdk/model";
import {
  generateToken,
  getRandomName,
  randomID,
  randomNumID,
  isAndroid,
  isPc,
  getUrlParams,
  isIOS,
  generateTokenForCallInvitation,
} from "./util";
import { ZegoSuperBoardManager } from "zego-superboard-web";
import ZIM from "zego-zim-web";
export default class App extends React.PureComponent {
  myMeeting: (element: HTMLDivElement) => Promise<void>;
  docsLink = {
    live_stream: {
      "en": "https://docs.zegocloud.com/article/14885",
      "zh": "https://doc-zh.zego.im/article/20316",
    },
    "1on1_call": {
      "en": "https://docs.zegocloud.com/article/14728",
      "zh": "https://doc-zh.zego.im/article/20194",
    },
    video_conference: {
      "en": "https://docs.zegocloud.com/article/14922",
      "zh": "https://docs.zegocloud.com/article/14922",
    },
    call_invitation: {
      "en": "https://docs.zegocloud.com/article/15385",
      "zh": "https://doc-zh.zego.im/article/20194",
    },
  };
  state: any = {
    showPreviewHeader: getUrlParams().get("preHeader") || "show",
    docs: this.docsLink[process.env.REACT_APP_PATH || "video_conference"][getUrlParams().get("lang") || "en"],
    showSettings: false,
    showSettingsBtn: false,
    showInvitationSettings: false,
    liveStreamingMode:
      getUrlParams().get("liveStreamingMode") || "RealTimeLive",
    userID: "",
    userName: "",
    callInvitation: false,
    invitees: [],
    toastShow: false,
    toastText: "",
    isScreenPortrait: false,
    showLangBox: false,
    lang: getUrlParams().get("lang") || "en",
    showWaitingPage: false,
    // showConfirmDialog: false,
    callees: [],
    roomTimer: null,
    roomTime: 0,
    canInvitingInCalling: false,
    endCallWhenInitiatorLeave: false,
    onlyInitiatorCanInvite: false,
    showWaitingCallAcceptAudioVideoView: false,
    waitingUsers: [],
  };
  refuseBtn = React.createRef();
  settingsEl = null;
  invitationInput: RefObject<HTMLInputElement> = React.createRef();
  zp: ZegoUIKitPrebuilt;
  toastTimer: NodeJS.Timer | null;
  clientHeight = 0;
  isAndroid = isAndroid();
  isIOS = isIOS();
  inOperation = false;
  inviter: {
    userID?: string;
    userName?: string;
  } = {} as any;
  setViewportMetaTimer: NodeJS.Timer | null = null;
  viewportHeight = 0;
  constructor(props: any) {
    super(props);
    const userName = getUrlParams().get("userName");
    const roomID = getUrlParams().get("roomID") || randomID(5);
    const userID = getUrlParams().get("userID") || randomNumID(8);
    const enableMixing = getUrlParams().get("mixing") === "1" || false;
    const urlToken = getUrlParams().get("token")?.replace(/\s/g, '+') || "";
    const urlAppID = Number(getUrlParams().get("appID"));

    let role_p = getUrlParams().get("role") || "Host";
    let role: LiveRole =
      role_p === "Host"
        ? LiveRole.Host
        : role_p === "Cohost"
          ? LiveRole.Cohost
          : LiveRole.Audience;

    let sharedLinks: { name: string; url: string }[] = [];
    let maxUsers = 50;
    let showNonVideoUser = getUrlParams().get("showNonVideoUser") || undefined;
    let liveStreamingMode;
    let mode = ScenarioModel.OneONoneCall;

    //@ts-ignore // just for debugger
    window.ZegoUIKitPrebuilt = ZegoUIKitPrebuilt;
    if (urlToken) {
      window.history.replaceState(
        "",
        "You have logged into room: " + roomID,
        window.location.origin +
        window.location.pathname +
        "?roomID=" + roomID +
        "&userID=" + userID +
        "&lang=" + this.state.lang +
        "&appID=" + urlAppID +
        "&token=" + urlToken
      )
    } else {
      if (!getUrlParams().get("roomID")) {
        window.history.replaceState(
          "",
          "You have logged into room: " + roomID,
          window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID +
          "&role=Host&userID=" +
          userID +
          "&lang=" + this.state.lang
        );
      }

      if (!getUrlParams().get("userID")) {
        window.history.replaceState(
          "",
          "You have logged into room: " + roomID,
          window.location.origin +
          window.location.pathname +
          window.location.search +
          "&userID=" +
          userID
        );
      }
    }

    if (process.env.REACT_APP_PATH === "1on1_call") {
      console.warn("【Zego Demo】app 1on1_call");
      maxUsers = 2;
      sharedLinks.push({
        name: "Personal link",
        url:
          window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID +
          "&role=Cohost" +
          "&lang=" + this.state.lang,
      });
    } else if (process.env.REACT_APP_PATH === "live_stream") {
      console.warn("【Zego Demo】app live_stream");
      mode = ScenarioModel.LiveStreaming;
      liveStreamingMode = this.getLiveStreamingMode();
      if (role === LiveRole.Host || role === LiveRole.Cohost) {
        sharedLinks.push({
          name: "Join as co-host",
          url:
            window.location.origin +
            window.location.pathname +
            "?roomID=" +
            roomID +
            "&role=Cohost&liveStreamingMode=" +
            liveStreamingMode +
            "&lang=" + this.state.lang,
        });
        this.state.showSettingsBtn = true;
      }
      sharedLinks.push({
        name: "Join as audience",
        url:
          window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID +
          "&role=Audience&liveStreamingMode=" +
          liveStreamingMode +
          "&lang=" + this.state.lang,
      });
    } else if (process.env.REACT_APP_PATH === "video_conference") {
      console.warn("【Zego Demo】app video_conference");
      mode = ScenarioModel.VideoConference;
      sharedLinks.push({
        name: "Personal link",
        url:
          window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID +
          "&role=Cohost" +
          "&lang=" + this.state.lang,
      });
    }
    if (process.env.REACT_APP_PATH === "call_invitation") {
      console.warn("【Zego Demo】app call_invitation");
      window.addEventListener(
        "orientationchange",
        this.onOrientationChange.bind(this),
        false
      );
      this.onOrientationChange();
      this.initCallInvitation(urlAppID, userID, roomID, urlToken);
      this.state.showSettingsBtn = true;
    } else {
      this.myMeeting = async (element: HTMLDivElement) => {
        let token;
        if (urlToken) {
          token = urlToken + '#' + window.btoa(JSON.stringify({
            userID,
            roomID,
            userName: userName || getRandomName(),
            appID: urlAppID
          }));
        } else {
          token = (await generateToken(this.state.lang === 'en' ? 1590146318 : 2013980891, userID, roomID, userName || getRandomName())).token;
        }
        const zp = ZegoUIKitPrebuilt.create(token);
        //@ts-ignore // just for debugger
        window.zp = zp
        zp.express!.on("audioDeviceStateChanged", async (updateType, deviceType, deviceInfo) => {
          if (isPc()) return
          if (updateType === "ADD") {
            if (deviceType === "Input") {
              zp.express?.useAudioDevice(zp.localStream!, deviceInfo.deviceID)
            }
          } else if (updateType === "DELETE") {
            const microphones = await zp.express?.getMicrophones()
            if (microphones?.length) {
              zp.express?.useAudioDevice(zp.localStream!, microphones[0].deviceID)
            }
          }
        })
        if (process.env.REACT_APP_PATH !== "live_stream") {
          zp.addPlugins({ ZegoSuperBoardManager })
        } else {
          zp.addPlugins({ ZIM })
          // @ts-ignore
          ZIM.getInstance().setLogConfig({
            logLevel: "error",
          })
        }
        const param: ZegoCloudRoomConfig = {
          console: ZegoUIKitPrebuilt.ConsoleNone,
          //   turnOnMicrophoneWhenJoining: true, // 是否开启自己的麦克风,默认开启
          //   turnOnCameraWhenJoining: false, // 是否开启自己的摄像头 ,默认开启
          //   showMyCameraToggleButton: false, // 是否显示控制自己的麦克风按钮,默认显示
          //   showMyMicrophoneToggleButton: true, // 是否显示控制自己摄像头按钮,默认显示
          //   showAudioVideoSettingsButton: true, // 是否显示音视频设置按钮,默认显示
          //   showNonVideoUser: true,
          enableUserSearch: true,
          // @ts-ignore
          container: element, // 挂载容器
          //   showPreJoinView: false,
          preJoinViewConfig: {
            title: "Join Room",
          },
          //   showRoomDetailsButton: false,
          showTextChat: true,
          showUserList: true,
          showLeavingView: true,
          maxUsers,
          //   layout: "Auto",
          onJoinRoom: () => {
            // sessionStorage.setItem('roomID', zp.getRoomID());
            console.warn("join room callback");
            // window?.parent?.postMessage("joinRoom", "*")
            this.postMessage({ type: 'joinRoom', data: null })
            // demo 和 goenjoy 都设置20分钟体验限制 
            // goenjoy 直播体验设置为20分钟
            // const inGoEnjoyExperience = process.env.REACT_APP_PATH === "live_stream" && this.inIframe()
            // const experienceTime = inGoEnjoyExperience ? 1200 : 300
            // const experienceTimeTip = inGoEnjoyExperience ? 5 : 20
            this.state.roomTimer = setInterval(() => {
              this.state.roomTime = ++this.state.roomTime;
              if (this.state.roomTime === 1200) {
                this.showToast(this.state.lang === "en" ? `Only for functional experience, not for commercial use. Each session should not exceed 20 minutes.` : `仅功能体验，不作商业用途。每次不超过 20 分钟。`);
                zp.hangUp();
              }
            }, 1000);
          }, // 退出房间回调
          onLeaveRoom: () => {
            console.warn("leave room callback");
            // window?.parent?.postMessage("joinRoom", "*")
            this.postMessage({ type: 'leaveRoom', data: null })
            // 刷新20分钟限制
            if (this.state.roomTimer) {
              clearInterval(this.state.roomTimer);
              this.state.roomTimer = null;
              this.state.roomTime = 0;
            }
          },
          onInRoomMessageReceived: (messageInfo) => {
            console.warn("onInRoomMessageReceived", messageInfo)
          },
          onInRoomCommandReceived: (fromUser, command) => {
            console.warn("onInRoomCommandReceived", fromUser, JSON.parse(command))
          },
          onInRoomTextMessageReceived(messages) {
            console.warn("onInRoomTextMessageReceived", messages)
          },
          onInRoomCustomCommandReceived(command) {
            console.warn("onInRoomCustomCommandReceived", command)
          },
          //   showScreenSharingButton: true,
          // screenSharingConfig: {
          //   onError: (code) => {
          //     let string = '';
          //     switch (code) {
          //       case 1103010: {
          //         string = '无屏幕共享权限'
          //         break;
          //       }
          //     }
          //     return string;
          //   }
          // },
          lowerLeftNotification: {
            showTextChat: true,
          },
          showOnlyAudioUser: true,
          branding: {
            logoURL: require("./assets/zegocloud_logo.png"),
          },
          sharedLinks,
          scenario: {
            mode,
            config: {
              role,
              liveStreamingMode,
              enableVideoMixing: enableMixing,
              videoMixingOutputResolution: ZegoUIKitPrebuilt.VideoMixinOutputResolution._540P,
            },
          },
          onUserAvatarSetter: (user) => {
            user.forEach((u) => {
              u.setUserAvatar &&
                u.setUserAvatar(
                  // "https://images.pexels.com/photos/4172877/pexels-photo-4172877.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
                  `https://api.multiavatar.com/${u.userID}.svg?apikey=XqHm465NYsdLfb` // random avatar
                )
            })
          },
          videoResolutionList: [
            ZegoUIKitPrebuilt.VideoResolution_360P,
            ZegoUIKitPrebuilt.VideoResolution_180P,
            ZegoUIKitPrebuilt.VideoResolution_480P,
            ZegoUIKitPrebuilt.VideoResolution_720P,
          ],
          videoResolutionDefault: ZegoUIKitPrebuilt.VideoResolution_360P,
          onLiveStart: (user) => {
            console.warn("onLiveStart", user)
          },
          onLiveEnd: (user) => {
            console.warn("onLiveEnd", user)
            this.postMessage({ type: 'onLiveEnd', data: user })
          },
          onYouRemovedFromRoom: () => {
            console.warn("【demo】onYouRemovedFromRoom")
            this.showToast(`You've been removed by the host.`)
          },
          showRoomTimer: true,
          showTurnOffRemoteCameraButton: true,
          showTurnOffRemoteMicrophoneButton: true,
          showRemoveUserButton: true,
          showPinButton: true,
          showInviteToCohostButton: true,
          showRemoveCohostButton: true,
          showRequestToCohostButton: true,
          rightPanelExpandedType: RightPanelExpandedType.None,
          // addInRoomMessageAttributes: () => {
          //   return { lv: "9" }
          // },
          // customMessageUI: (msg) => {
          // 	const wrapper = document.createElement("div")
          // 	wrapper.classList.add("custom-message-wrapper")
          //     if (userID === msg.fromUser.userID) {
          //         wrapper.classList.add("send-message")
          //     }
          //     wrapper.innerHTML = `<div class="msgNameWrapper">
          // 					<span class="name">${msg.fromUser.userName}</span>
          // 					<span class="sendTime">
          // 						${new Date(msg.sendTime).getHours() >= 12 ? "PM" : "AM"}  ${msg.sendTime}
          // 					</span>
          // 				</div>
          // 				<p
          // 					class="${msg.status === "SENDING" && 'loading'} ${
          // 						msg.status === "FAILED" && 'error'
          // 					}">
          // 					${msg.message}
          // 				</p>`
          // 	return wrapper
          // },
          language: getUrlParams().get("lang") === "zh" ? ZegoUIKitLanguage.CHS : ZegoUIKitLanguage.ENGLISH,
          // leaveRoomDialogConfig: {
          //   descriptionText: '',
          //   confirmCallback: () => {
          //     console.log('===demo confirmCallback');
          //   }
          // },
          whiteboardConfig: {
            // showAddImageButton: true,
            // showCreateAndCloseButton: true,
          }
        }
        if (showNonVideoUser !== undefined) {
          param.showNonVideoUser = showNonVideoUser === "true"
        }
        if (process.env.REACT_APP_PATH !== "live_stream") {
          param.whiteboardConfig = {
            showAddImageButton: true,
            showCreateAndCloseButton: true,
          }
        }
        zp.joinRoom(param);
      };
    }

    // test 通话恢复
    // if (sessionStorage.getItem('roomID')) {
    //   let token = ZegoUIKitPrebuilt.generateKitTokenForTest(
    //     252984006,
    //     "16435f3bdb307f****b3f9e4259a29f0",
    //     sessionStorage.getItem('roomID') as string,
    //     userID,
    //     "user_" + userID,
    //     60 * 60 * 24
    //   );
    //   this.zp = ZegoUIKitPrebuilt.create(token);
    //   this.zp.addPlugins({ ZegoSuperBoardManager, ZIM });
    //   this.zp.joinRoom({
    //     showPreJoinView: false,
    //   });
    //   console.log('===roomid', sessionStorage.getItem('roomID'))
    // }
  }
  private async initCallInvitation(appID: number, userID: string, roomID: string, urlToken: string) {
    this.state.userID = userID;
    this.state.userName = "user_" + userID;
    this.state.callInvitation = true;
    const { canInvitingInCalling, endCallWhenInitiatorLeave, onlyInitiatorCanInvite } = this.state
    // this.state.showPreviewHeader = isPc() ? "show" : "hide";
    let token;
    if (urlToken) {
      token = urlToken + '#' + window.btoa(JSON.stringify({
        userID,
        roomID,
        userName: "user_" + userID,
        appID,
      }));
    } else {
      token = (await generateToken(this.state.lang === 'en' ? 1590146318 : 2013980891, userID, roomID, "user_" + userID)).token;
    }
    this.zp = ZegoUIKitPrebuilt.create(token);
    this.zp.addPlugins({ ZegoSuperBoardManager, ZIM });
    //@ts-ignore // just for debugger
    window.zp = this.zp;
    this.zp.setCallInvitationConfig({
      // enableCustomCallInvitationDialog: true,
      language: getUrlParams().get("lang") === "zh" ? ZegoUIKitLanguage.CHS : ZegoUIKitLanguage.ENGLISH,
      enableNotifyWhenAppRunningInBackgroundOrQuit: true,
      canInvitingInCalling,
      endCallWhenInitiatorLeave,
      onlyInitiatorCanInvite,
      onConfirmDialogWhenReceiving: (callType, caller, refuse, accept, data) => {
        console.warn("【demo】onCallInvitationDialogShowed", callType, caller, data, refuse);
        this.inviter = caller;
        // this.setState({
        //   showConfirmDialog: true,
        // })
        // console.warn("【demo】onCallInvitationDialogShowed", document.querySelector('.refuse-btn'), this.refuseBtn.current);
        // const refuseBtn = document.querySelector('.refuse-btn') as HTMLElement;
        // refuseBtn && (refuseBtn.onclick = () => {
        //   console.log('====click refuse')
        //   refuse();
        // })
      },
      // enableCustomCallInvitationWaitingPage: true,
      onWaitingPageWhenSending: (callType, callees, cancel) => {
        console.warn("【demo】onCallInvitationWaitingPageShowed", callType, callees, cancel, this.state.showWaitingPage);
        this.setState({
          callees,
          // showWaitingPage: true
        })
      },
      onSetRoomConfigBeforeJoining: (callType) => {
        console.warn("【demo】onSetRoomConfigBeforeJoining", callType, this.zp.getRoomID());
        // sessionStorage.setItem('roomID', this.zp.getRoomID());
        if (this.state.invitees.length > 1) {
          this.showToast("Waiting for others to join the call.");
        }
        const waitingSelectUsers = this.state.waitingUsers.map((id) => ({
          userID: id,
          userName: `user_${id}`,
        }));
        // demo 设置20分钟体验限制
        this.state.roomTimer = setInterval(() => {
          this.state.roomTime = ++this.state.roomTime;
          if (this.state.roomTime === 1200) {
            this.showToast(this.state.lang === "en" ? "Only for functional experience, not for commercial use. Each session should not exceed 20 minutes." : "仅功能体验，不作商业用途。每次不超过 20 分钟。");
            this.zp.hangUp();
          }
        }, 1000);
        return {
          branding: {
            logoURL: require("./assets/zegocloud_logo.png"),
          },
          onYouRemovedFromRoom: () => {
            console.warn("【demo】onYouRemovedFromRoom");
            this.showToast(`You've been removed by the host.`);
          },
          showRoomTimer: true,
          showTurnOffRemoteCameraButton: true,
          showTurnOffRemoteMicrophoneButton: true,
          showRemoveUserButton: true,
          showWaitingCallAcceptAudioVideoView: this.state.showWaitingCallAcceptAudioVideoView,
          callingInvitationListConfig: {
            waitingSelectUsers,
            defaultChecked: true
          },
          // turnOnCameraWhenJoining: false,
          // turnOnMicrophoneWhenJoining: false,
          // autoLeaveRoomWhenOnlySelfInRoom: false,
          // turnOnMicrophoneWhenJoining: true, // 是否开启自己的麦克风,默认开启
          // turnOnCameraWhenJoining: false, // 是否开启自己的摄像头 ,默认开启
        };
      },
      onCallInvitationEnded: (reason, data) => {
        console.warn("【demo】onCallInvitationEnded", reason, data);
        // if (reason === "Canceled") {
        //   this.showToast("The call has been canceled.");
        // }
        // if (this.state.invitees.length === 1) {
        //   // 单人呼叫提示
        //   if (reason === "Busy" || (reason === "Timeout" && this.inviter?.userID === this.state.userID)) {
        //     this.showToast(this.state.invitees[0].userName + " is busy now.");
        //   }
        //   if (reason === "Declined" && this.inviter?.userID === this.state.userID) {
        //     this.showToast(this.state.invitees[0].userName + " declined the call.");
        //   }
        // }

        if (isPc()) {
          const nav = document.querySelector(`.${APP.nav}`) as HTMLDivElement;
          const serviceTips = document.querySelector(`.${APP.serviceTips}`) as HTMLDivElement;
          const meetingEl = serviceTips.previousElementSibling as HTMLDivElement;
          nav.style.display = "flex";
          serviceTips.style.display = "block";
          meetingEl.style.height = "auto";
        }
        this.inviter = {};

        document.querySelector(".preView_services") &&
          // @ts-ignore
          (document.querySelector(".preView_services")!.style.display = "block");

        // 刷新 5分钟限制
        if (this.state.roomTimer) {
          clearInterval(this.state.roomTimer);
          this.state.roomTimer = null;
          this.state.roomTime = 0;
        }
      },
      // Prebuilt内部收到呼叫邀请后，将内部数据转成对应数据后抛出
      onIncomingCallReceived: (
        callID: string,
        caller: ZegoUser,
        callType: ZegoInvitationType,
        callees: ZegoUser[]
      ) => {
        console.warn("onIncomingCallReceived", callID, caller, callType, callees);
      },
      // 当呼叫者取消呼叫后，将内部数据转成对应数据后抛出。
      onIncomingCallCanceled: (callID: string, caller: ZegoUser) => {
        console.warn("onIncomingCallCanceled", callID, caller);
        this.showToast("The call has been canceled.");
      },
      // 当被叫者接受邀请后，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
      onOutgoingCallAccepted: (callID: string, caller: ZegoUser) => {
        console.warn("onOutgoingCallAccepted", callID, caller);
      },
      // 当被叫者正在通话中，拒接邀请后，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
      onOutgoingCallRejected: (callID: string, caller: ZegoUser) => {
        console.warn("onOutgoingCallRejected", callID, caller);
        this.showToast(caller.userName + " is busy now.");
      },
      // 当被叫者主动拒绝通话时，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
      onOutgoingCallDeclined: (callID: string, callee: ZegoUser) => {
        console.warn("onOutgoingCallDeclined", callID, callee); this.showToast(callee.userName + " declined the call.");
      },
      //当被叫者超时没回应邀请时，被叫者会收到该回调，将内部数据转成对应数据后抛出。
      onIncomingCallTimeout: (callID: string, caller: ZegoUser) => {
        console.warn("onIncomingCallTimeout", callID, caller);
      },
      //当呼叫超过固定时间后，如果还有被叫者没有响应，则呼叫者会收到该回调，将内部数据转成对应数据后抛出。
      onOutgoingCallTimeout: (callID: string, callees: ZegoUser[]) => {
        console.warn("onOutgoingCallTimeout", callID, callees);
        this.showToast(`call ${callees[0].userName} timeout`);
      },
      onIncomingCallDeclineButtonPressed: () => {
        console.warn('onIncomingCallDeclineButtonPressed');
      },
      onIncomingCallAcceptButtonPressed: () => {
        console.warn('onIncomingCallAcceptButtonPressed');
      }
    });
  }
  private getLiveStreamingMode(): string {
    const mode = getUrlParams().get("liveStreamingMode");
    if (mode === "StandardLive" || mode === "LiveStreaming")
      return ZegoUIKitPrebuilt.LiveStreamingMode.LiveStreaming;
    if (mode === "PremiumLive" || mode === "InteractiveLiveStreaming")
      return ZegoUIKitPrebuilt.LiveStreamingMode.InteractiveLiveStreaming;
    return ZegoUIKitPrebuilt.LiveStreamingMode.RealTimeLive;
  }
  componentDidMount(): void {
    this.clientHeight =
      document.documentElement.clientHeight || document.body.clientHeight;

    window.addEventListener("resize", this.onResize, { passive: false });
  }
  componentWillUnmount(): void {
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener(
      "orientationchange",
      this.onOrientationChange.bind(this),
      false
    );
  }
  handleSelectMode(mode: string) {
    this.setState(
      {
        liveStreamingMode: mode,
      },
      () => {
        !isPc() && this.handleSettingsConfirm();
      }
    );
  }
  handleSettingsConfirm() {
    let param = getUrlParams();
    if (param.get("liveStreamingMode") === this.state.liveStreamingMode) {
      this.setState({
        showSettings: false,
      });
      return;
    }
    param.set("liveStreamingMode", this.state.liveStreamingMode);
    window.location.href =
      window.location.origin +
      window.location.pathname +
      "?" +
      param.toString();
  }
  onInvitationInputChange(e: ChangeEvent<HTMLInputElement>) {
    e.target.value = e.target.value.replace(/[^\d,]/gi, "");
  }
  onWaitingUsersChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/[^\d,]/gi, "");
    const waitingUsers = value.split(",");
    this.setState({
      waitingUsers,
    })
  }
  handleSendCallInvitation(type: number) {
    if (this.inOperation) return;
    if (this.invitationInput.current?.value) {
      this.inOperation = true;
      const values = this.invitationInput.current?.value.split(",");
      // id 去重并重新赋值给input框
      const deduplicationValues = Array.from(new Set(values));
      this.invitationInput.current.value = deduplicationValues.join(',');
      const invitees = deduplicationValues
        .filter((v) => v.length)
        .map((v) => ({
          userID: v,
          userName: "user_" + v,
        }));
      console.warn(type, invitees);
      this.setState({
        invitees: invitees,
      });
      this.zp
        .sendCallInvitation({
          callees: invitees,
          callType: type,
          timeout: 60,
        })
        .then((res) => {
          if (invitees.length === 1) {
            res.errorInvitees.length &&
              this.showToast("The user dose not exist or is offline.");
          }
          console.warn(res);
          this.inviter = {
            userID: this.state.userID,
            userName: this.state.userName,
          };
        })
        .catch((err) => {
          if (err === "The call invitation service has not been activated.") {
            this.showToast(err);
            return
          }
          err && this.showToast(err);
        })
        .finally(() => {
          this.inOperation = false;
        });
    }
  }
  showToast(text: string) {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.setState({
      toastText: text,
      toastShow: true,
    });
    this.toastTimer = setTimeout(() => {
      this.setState({
        toastText: "",
        toastShow: false,
      });
      this.toastTimer = null;
    }, 2000);
  }
  onResize = () => {
    if (this.isAndroid) {
      const clientHeight =
        document.documentElement.clientHeight || document.body.clientHeight;
      if (this.clientHeight <= clientHeight) {
        setTimeout(() => {
          this.invitationInput?.current?.scrollIntoView({
            block: "start",
          });
        }, 20);
      }
    }
  };
  onOrientationChange() {
    let isScreenPortrait = this.state.isScreenPortrait;
    document
      .querySelector(`.${APP.app}`)
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
    if (!isScreenPortrait) {
      this.setState({ showFooter: false });
    }
    this.setState(
      {
        isScreenPortrait: isScreenPortrait,
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
  // 设置语言
  setLanguage(language: ZegoUIKitLanguage) {
    // @ts-ignore
    this.zp ? this.zp.setLanguage(language) : window.zp.setLanguage(language);
    this.setState({
      showLangBox: false,
      lang: language === ZegoUIKitLanguage.CHS ? "zh" : "en",
      docs: this.docsLink[process.env.REACT_APP_PATH || "video_conference"][language === ZegoUIKitLanguage.CHS ? "zh" : "en"],
    })
  }

  updateInvitationConfig() {
    const { canInvitingInCalling, onlyInitiatorCanInvite, endCallWhenInitiatorLeave } = this.state;
    this.zp.setCallInvitationConfig({
      canInvitingInCalling,
      onlyInitiatorCanInvite,
      endCallWhenInitiatorLeave,
    });
  }
  inIframe() {
    const isInIframe = window.self !== window.top
    return isInIframe
  }
  postMessage = ({ type, data }) => {
    const _win = window.parent
    if (!this.inIframe() || !_win) return
    console.log('postMessage', JSON.stringify({ type, data }))
    _win.postMessage(JSON.stringify({ type, data }), '*')
  }
  render(): React.ReactNode {
    return (
      <div
        className={`${APP.app} ${isPc() ? APP.pcApp : APP.mobileApp} ${this.state.callInvitation ? APP.callInvitation : ""
          }`}>
        {this.state.showPreviewHeader === "show" && (
          <div
            className={`${APP.nav} ${isPc() ? "" : APP.mobileNav} preView_nav`}>
            <div
              className={`${APP.LOGO} ${isPc() ? "" : APP.mobileLOGO}`}
              onClick={() => {
                window.open("https://www.zegocloud.com", "_blank");
              }}></div>
            <div className={`${APP.link} ${isPc() ? "" : APP.mobileLink}`}>
              {this.state.showSettingsBtn && (
                <div
                  className={APP.link_item}
                  onClick={() => {
                    if (process.env.REACT_APP_PATH === "call_invitation") {
                      this.setState({
                        showInvitationSettings: true
                      })
                      return
                    }
                    this.setState({
                      showSettings: true,
                      liveStreamingMode:
                        getUrlParams().get("liveStreamingMode") ||
                        "RealTimeLive",
                    });
                  }}>
                  <span className={APP.icon_settings}></span>{" "}
                  {isPc() && (this.state.lang === "en" ? "Settings" : "设置")}
                </div>
              )}
              <a
                href={this.state.docs}
                target="_blank"
                className={APP.link_item}
                rel="noreferrer">
                <span className={APP.icon__doc}></span>{" "}
                {isPc() && (this.state.lang === "en" ? "Documentation" : "文档")}
              </a>
              <a
                href="https://github.com/ZEGOCLOUD/zego_uikit_prebuilt_web/"
                target="_blank"
                className={APP.link_item}
                rel="noreferrer">
                <span className={APP.icon__github}></span>
                {isPc() && (this.state.lang === "en" ? "View demo code" : "查看演示代码")}
              </a>
              <div
                className={APP.link_item}
                onClick={() => { this.setState({ showLangBox: !this.state.showLangBox }) }}
              >
                <span className={APP.icon__doc}></span>{" "}
                <div className={APP.text}>{isPc() && (this.state.lang === "en" ? "Language" : "语言")}</div>
                {this.state.showLangBox && (
                  <div className={APP.lang_box} >
                    <span onClick={this.setLanguage.bind(this, ZegoUIKitLanguage.CHS)}>中文</span>
                    <span onClick={this.setLanguage.bind(this, ZegoUIKitLanguage.ENGLISH)}>English</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {!this.state.callInvitation && (
          <div
            ref={this.myMeeting}
            className={`${APP.myMeeting}  ${isPc() ? "" : APP.mobileMeeting
              }`}></div>
        )}
        {this.state.callInvitation && (
          <div className={APP.callInvitationWrapper}>
            <div className={APP.invitationModel}>
              <div className={APP.invitationUserHeader}>
                <div className={APP.invitationAvatar}>
                  {this.state.userName.slice(0, 1)}
                </div>
                <div className={APP.invitationUserInfo}>
                  <p>{this.state.userName}</p>
                  <span>userID: {this.state.userID}</span>
                </div>
              </div>
              <p className={APP.invitationTitle}>{this.state.lang === "en" ? 'Make a direct call' : '直接进行呼叫'}</p>
              <p className={APP.inputPlaceholder}>
                {this.state.lang === "en" ? "Enter invitees' user id, separate them by \",\"" : "输入受邀者的用户 ID，用“, ”分隔"}
              </p>
              <input
                ref={this.invitationInput}
                className={APP.invitationInput}
                type="text"
                placeholder={
                  isPc()
                    ? this.state.lang === "en" ? 'Enter invitees\' user id, separate them by ","' : "输入受邀者的用户 ID，用“, ”分隔"
                    : this.state.lang === "en" ? "User id" : "用户 ID"
                }
                required
                onInput={this.onInvitationInputChange.bind(this)}
                onChange={this.onInvitationInputChange.bind(this)}
                onFocus={(ev: ChangeEvent<HTMLInputElement>) => {
                  this.isIOS &&
                    !isPc() &&
                    setTimeout(() => {
                      ev.target.scrollIntoView({
                        block: "start",
                      });
                    }, 50);
                }}
                onBlur={(ev: ChangeEvent<HTMLInputElement>) => {
                  this.isAndroid &&
                    !isPc() &&
                    setTimeout(() => {
                      ev.target.scrollIntoView({
                        block: "start",
                      });
                    }, 100);
                }}
              />
              <div
                className={APP.invitationVideoCallBtn}
                onClick={this.handleSendCallInvitation.bind(this, 1)}>
                {this.state.lang === "en" ? "Video call" : "视频通话"}
              </div>
              <div
                className={APP.invitationVoiceCallBtn}
                onClick={this.handleSendCallInvitation.bind(this, 0)}>
                {this.state.lang === "en" ? "Voice call" : "语音通话"}
              </div>
            </div>
          </div>
        )}
        <div
          className={`${APP.serviceTips}  ${isPc() ? APP.pcServiceTips : APP.mobileServiceTips
            } preView_services`}>
          {this.state.lang === "en" ? 'By clicking "Join", you agree to' : "点击 “加入”，即表示您同意"}{!isPc() && <br />}{this.state.lang === "en" ? " our" : "我们的"}{" "}
          <a
            href={this.state.lang === "en" ? "https://www.zegocloud.com/policy?index=1" : "https://www.zego.im/terms"}
            target="_blank"
            rel="noreferrer">
            {this.state.lang === "en" ? "Terms of Services" : "服务条款"}
          </a>{" "}
          {this.state.lang === "en" ? "and" : "和"}{" "}
          <a
            href={this.state.lang === "en" ? "https://www.zegocloud.com/policy?index=0" : "https://www.zego.im/privacy"}
            target="_blank"
            rel="noreferrer">
            {this.state.lang === "en" ? "Privacy Policy" : "隐私政策"}
          </a>
          {this.state.lang === "en" ? "." : "。"}
        </div>

        {this.state.showSettings && (
          <div
            className={`${isPc() ? APP.pcSettingsModel : APP.mobileSettingsModel
              }`}>
            <div className={APP.settingsWrapper}>
              <div className={APP.settingsHeader}>
                <p>{isPc() ? "Settings" : "Live streaming mode"}</p>
                <span
                  className={APP.settingsClose}
                  onClick={() => {
                    this.setState({
                      showSettings: false,
                    });
                  }}></span>
              </div>
              <div className={APP.settingsBody}>
                {isPc() && (
                  <div className={APP.settingsMode}>Live streaming mode</div>
                )}
                <div className={APP.settingsModeList}>
                  <div
                    className={`${APP.settingsModeItem} ${this.state.liveStreamingMode === "LiveStreaming"
                      ? APP.settingsModeItemSelected
                      : ""
                      }`}
                    onClick={() => {
                      this.handleSelectMode("LiveStreaming");
                    }}>
                    <p>Live Streaming</p>
                    <span></span>
                  </div>
                  <div
                    className={`${APP.settingsModeItem} ${this.state.liveStreamingMode ===
                      "InteractiveLiveStreaming"
                      ? APP.settingsModeItemSelected
                      : ""
                      }`}
                    onClick={() => {
                      this.handleSelectMode("InteractiveLiveStreaming");
                    }}>
                    <p>Interactive Live Streaming</p>
                    <span></span>
                  </div>
                  <div
                    className={`${APP.settingsModeItem} ${this.state.liveStreamingMode === "RealTimeLive"
                      ? APP.settingsModeItemSelected
                      : ""
                      }`}
                    onClick={() => {
                      this.handleSelectMode("RealTimeLive");
                    }}>
                    <p>Real-time Live</p>
                    <span></span>
                  </div>
                </div>
                {isPc() && (
                  <div
                    className={APP.settingsBtn}
                    onClick={() => {
                      this.handleSettingsConfirm();
                    }}>
                    Confirm
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {this.state.showInvitationSettings && (
          <div
            className={`${isPc() ? APP.pcSettingsModel : APP.mobileSettingsModel
              }`}>
            <div className={APP.settingsWrapper}>
              <div className={APP.settingsHeader}>
                <p>{this.state.lang === "en" ? 'call out settings' : '呼叫设置'}</p>
                <span
                  className={APP.settingsClose}
                  onClick={() => {
                    this.setState({
                      showInvitationSettings: false,
                    });
                  }}></span>
              </div>
              <div className={APP.settingsBody}>
                <div className={APP.settingsModeList}>
                  <div
                    className={`${APP.settingsModeItem} ${this.state.canInvitingInCalling
                      ? APP.settingsModeItemSelected
                      : ""
                      }`}
                    onClick={() => {
                      this.setState({
                        canInvitingInCalling: !this.state.canInvitingInCalling
                      }, () => {
                        this.updateInvitationConfig()
                      })
                    }}>
                    <p>canInvitingInCalling</p>
                    <span></span>
                  </div>
                  <div
                    className={`${APP.settingsModeItem} ${this.state.onlyInitiatorCanInvite
                      ? APP.settingsModeItemSelected
                      : ""
                      }`}
                    onClick={() => {
                      this.setState({
                        onlyInitiatorCanInvite: !this.state.onlyInitiatorCanInvite
                      }, () => {
                        this.updateInvitationConfig()
                      })
                    }}>
                    <p>onlyInitiatorCanInvite</p>
                    <span></span>
                  </div>
                  <div
                    className={`${APP.settingsModeItem} ${this.state.endCallWhenInitiatorLeave
                      ? APP.settingsModeItemSelected
                      : ""
                      }`}
                    onClick={() => {
                      this.setState({
                        endCallWhenInitiatorLeave: !this.state.endCallWhenInitiatorLeave
                      }, () => {
                        this.updateInvitationConfig()
                      })
                    }}>
                    <p>endCallWhenInitiatorLeave</p>
                    <span></span>
                  </div>
                  <div
                    className={`${APP.settingsModeItem} ${this.state.showWaitingCallAcceptAudioVideoView
                      ? APP.settingsModeItemSelected
                      : ""
                      }`}
                    onClick={() => {
                      this.setState({
                        showWaitingCallAcceptAudioVideoView: !this.state.showWaitingCallAcceptAudioVideoView
                      })
                    }}>
                    <p>showWaitingCallAcceptAudioVideoView</p>
                    <span></span>
                  </div>
                </div>
                <input
                  className={APP.invitationInput}
                  type="text"
                  placeholder={
                    this.state.lang === "en" ? 'invitees user id, separate by ","' : "受邀者的 ID，用“, ”分隔"
                  }
                  value={this.state.waitingUsers}
                  onInput={this.onWaitingUsersChange.bind(this)}
                  onChange={this.onWaitingUsersChange.bind(this)}
                  onFocus={(ev: ChangeEvent<HTMLInputElement>) => {
                    this.isIOS &&
                      !isPc() &&
                      setTimeout(() => {
                        ev.target.scrollIntoView({
                          block: "start",
                        });
                      }, 50);
                  }}
                  onBlur={(ev: ChangeEvent<HTMLInputElement>) => {
                    this.isAndroid &&
                      !isPc() &&
                      setTimeout(() => {
                        ev.target.scrollIntoView({
                          block: "start",
                        });
                      }, 100);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {this.state.toastShow && (
          <div className={`${APP.toast}`}>{this.state.toastText}</div>
        )}

        {this.state.showWaitingPage && (
          <div className="wait-page" style={{ position: "absolute", top: 0, width: "100%", height: "100%", background: "#3b3b3b" }}>
            {this.state.callees.map((item) => {
              return (
                <div>
                  <div>{item.userID}</div>
                  <div>{item.userName}</div>

                </div>
              )
            })}
          </div>
        )}

        {/* {(
          <div className="confirm-dialog" style={{ position: "absolute", top: 0, width: "100px", height: "100px", background: "#3b3b3b" }}>
            <div ref={this.refuseBtn} className="refuse-btn" style={{ width: "100px", height: "40px", backgroundColor: "#fff" }}>refuse</div>
          </div>
        )} */}
      </div>
    );
  }
}
