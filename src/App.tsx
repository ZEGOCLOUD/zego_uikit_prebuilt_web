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
import { ZIM } from "zego-zim-web";
export default class App extends React.PureComponent {
  myMeeting: (element: HTMLDivElement) => Promise<void>;
  docsLink = {
    live_stream: "https://docs.zegocloud.com/article/14885",
    "1on1_call": "https://docs.zegocloud.com/article/14728",
    video_conference: "https://docs.zegocloud.com/article/14922",
    call_invitation: "https://docs.zegocloud.com/article/15385",
  };
  state: any = {
    showPreviewHeader: getUrlParams().get("preHeader") || "show",
    docs: this.docsLink[process.env.REACT_APP_PATH || "video_conference"],
    showSettings: false,
    showSettingsBtn: false,
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
    lang: ZegoUIKitLanguage.ENGLISH,
  };

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
    const userName = getUrlParams().get("UserName");

    const roomID = getUrlParams().get("roomID") || randomID(5);
    const userID = getUrlParams().get("userID") || randomNumID(8);
    const enableMixing = getUrlParams().get("mixing") === "1" || false;

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
    if (!getUrlParams().get("roomID")) {
      window.history.replaceState(
        "",
        "You have logged into room: " + roomID,
        window.location.origin +
        window.location.pathname +
        "?roomID=" +
        roomID +
        "&role=Host&userID=" +
        userID
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
          "&role=Cohost",
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
            liveStreamingMode,
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
          liveStreamingMode,
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
          "&role=Cohost",
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
      this.initCallInvitation(userID, roomID);
    } else {
      this.myMeeting = async (element: HTMLDivElement) => {
        // let { token } = await generateToken(randomID(5), roomID, userName || getRandomName())
        let token = ZegoUIKitPrebuilt.generateKitTokenForTest(
          252984006, // 1484647939,
          "16435f3bdb307f3020b3f9e4259a29f0", //"22076fd0a8388f31dc1f6e344171b2b1",
          roomID,
          userID,
          userName || getRandomName(),
          7200
        );
        const zp = ZegoUIKitPrebuilt.create(token)
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
            console.log("test:leaveRoomCallback")
            window?.parent?.postMessage("leaveRoom", "*")
          }, // 退出房间回调
          onLeaveRoom: () => {
            window?.parent?.postMessage("joinRoom", "*")
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
          // language: ZegoUIKitLanguage.ENGLISH
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
  }
  private async initCallInvitation(userID: string, roomID: string) {

    this.state.userID = userID;
    this.state.userName = "user_" + userID;
    this.state.callInvitation = true;
    // this.state.showPreviewHeader = isPc() ? "show" : "hide";
    // let { token } = await generateTokenForCallInvitation(userID, roomID, "user_" + userID);
    // console.warn(token);
    let token = ZegoUIKitPrebuilt.generateKitTokenForTest(
      252984006,
      "16435f3bdb307f3020b3f9e4259a29f0",
      roomID,
      userID,
      "user_" + userID,
      60 * 60 * 24
    );
    this.zp = ZegoUIKitPrebuilt.create(token);
    this.zp.addPlugins({ ZegoSuperBoardManager, ZIM });
    //@ts-ignore // just for debugger
    window.zp = this.zp;
    this.zp.setCallInvitationConfig({
      // language: ZegoUIKitLanguage.CHS,
      enableNotifyWhenAppRunningInBackgroundOrQuit: true,
      onConfirmDialogWhenReceiving: (callType, caller, refuse, accept, data) => {
        console.warn("【demo】onCallInvitationDialogShowed", callType, caller, refuse, accept, data);
        this.inviter = caller;
      },
      onWaitingPageWhenSending: (callType, callees, cancel) => {
        console.warn("【demo】onCallInvitationWaitingPageShowed", callType, callees, cancel);
      },
      onSetRoomConfigBeforeJoining: (callType) => {
        console.warn("【demo】onSetRoomConfigBeforeJoining", callType);
        if (this.state.invitees.length > 1) {
          this.showToast("Waiting for others to join the call.");
        }
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
        };
      },
      onCallInvitationEnded: (reason, data) => {
        console.warn("【demo】onCallInvitationEnded", reason, data);
        if (reason === "Canceled") {
          this.showToast("The call has been canceled.");
        }
        if (this.state.invitees.length === 1) {
          // 单人呼叫提示
          if (reason === "Busy" || (reason === "Timeout" && this.inviter?.userID === this.state.userID)) {
            this.showToast(this.state.invitees[0].userName + " is busy now.");
          }
          if (reason === "Declined" && this.inviter?.userID === this.state.userID) {
            this.showToast(this.state.invitees[0].userName + " declined the call.");
          }
        }

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
      },
      // 当被叫者接受邀请后，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
      onOutgoingCallAccepted: (callID: string, callee: ZegoUser) => {
        console.warn("onOutgoingCallAccepted", callID, callee);
      },
      // 当被叫者正在通话中，拒接邀请后，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
      onOutgoingCallRejected: (callID: string, callee: ZegoUser) => {
        console.warn("onOutgoingCallRejected", callID, callee);
      },
      // 当被叫者主动拒绝通话时，呼叫者会收到该回调，将内部数据转成对应数据后抛出。
      onOutgoingCallDeclined: (callID: string, callee: ZegoUser) => {
        console.warn("onOutgoingCallDeclined", callID, callee);
      },
      //当被叫者超时没回应邀请时，被叫者会收到该回调，将内部数据转成对应数据后抛出。
      onIncomingCallTimeout: (callID: string, caller: ZegoUser) => {
        console.warn("onIncomingCallTimeout", callID, caller);
      },
      //当呼叫超过固定时间后，如果还有被叫者没有响应，则呼叫者会收到该回调，将内部数据转成对应数据后抛出。
      onOutgoingCallTimeout: (callID: string, callees: ZegoUser[]) => {
        console.warn("onOutgoingCallTimeout", callID, callees);
      },
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
  handleSendCallInvitation(type: number) {
    if (this.inOperation) return;
    if (this.invitationInput.current?.value) {
      this.inOperation = true;
      const values = this.invitationInput.current?.value.split(",");
      const invitees = values
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
          }
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
    window.zp.setLanguage(language);
    this.setState({
      showLangBox: false,
      lang: language,
    })
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
                    this.setState({
                      showSettings: true,
                      liveStreamingMode:
                        getUrlParams().get("liveStreamingMode") ||
                        "RealTimeLive",
                    });
                  }}>
                  <span className={APP.icon_settings}></span>{" "}
                  {isPc() && (this.state.lang === ZegoUIKitLanguage.ENGLISH ? "Settings" : "设置")}
                </div>
              )}
              <a
                href={this.state.docs}
                target="_blank"
                className={APP.link_item}
                rel="noreferrer">
                <span className={APP.icon__doc}></span>{" "}
                {isPc() && (this.state.lang === ZegoUIKitLanguage.ENGLISH ? "Documentation" : "文档")}
              </a>
              <a
                href="https://github.com/ZEGOCLOUD/zego_uikit_prebuilt_web/"
                target="_blank"
                className={APP.link_item}
                rel="noreferrer">
                <span className={APP.icon__github}></span>
                {isPc() && (this.state.lang === ZegoUIKitLanguage.ENGLISH ? "View demo code" : "查看演示代码")}
              </a>
              <div
                className={APP.link_item}
                onClick={() => { this.setState({ showLangBox: !this.state.showLangBox }) }}
              >
                <span className={APP.icon__doc}></span>{" "}
                <div className={APP.text}>{isPc() && (this.state.lang === ZegoUIKitLanguage.ENGLISH ? "Language" : "语言")}</div>
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
              <p className={APP.invitationTitle}>{this.state.lang === ZegoUIKitLanguage.ENGLISH ? 'Make a direct call' : '直接进行呼叫'}</p>
              <p className={APP.inputPlaceholder}>
                {this.state.lang === ZegoUIKitLanguage.ENGLISH ? "Enter invitees' user id, separate them by \",\"" : "输入受邀者的用户 ID，用“, ”分隔"}
              </p>
              <input
                ref={this.invitationInput}
                className={APP.invitationInput}
                type="text"
                placeholder={
                  isPc()
                    ? this.state.lang === ZegoUIKitLanguage.ENGLISH ? 'Enter invitees\' user id, separate them by ","' : "输入受邀者的用户 ID，用“, ”分隔"
                    : this.state.lang === ZegoUIKitLanguage.ENGLISH ? "User id" : "用户 ID"
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
                {this.state.lang === ZegoUIKitLanguage.ENGLISH ? "Video call" : "视频通话"}
              </div>
              <div
                className={APP.invitationVoiceCallBtn}
                onClick={this.handleSendCallInvitation.bind(this, 0)}>
                {this.state.lang === ZegoUIKitLanguage.ENGLISH ? "Voice call" : "语音通话"}
              </div>
            </div>
          </div>
        )}
        <div
          className={`${APP.serviceTips}  ${isPc() ? APP.pcServiceTips : APP.mobileServiceTips
            } preView_services`}>
          {this.state.lang === ZegoUIKitLanguage.ENGLISH ? 'By clicking "Join", you agree to' : "点击 “加入”，即表示您同意"}{!isPc() && <br />}{this.state.lang === ZegoUIKitLanguage.ENGLISH ? " our" : "我们的"}{" "}
          <a
            href="https://www.zegocloud.com/policy?index=1"
            target="_blank"
            rel="noreferrer">
            {this.state.lang === ZegoUIKitLanguage.ENGLISH ? "Terms of Services" : "服务条款"}
          </a>{" "}
          {this.state.lang === ZegoUIKitLanguage.ENGLISH ? "and" : "和"}{" "}
          <a
            href="https://www.zegocloud.com/policy?index=0"
            target="_blank"
            rel="noreferrer">
            {this.state.lang === ZegoUIKitLanguage.ENGLISH ? "Privacy Policy" : "隐私政策"}
          </a>
          {this.state.lang === ZegoUIKitLanguage.ENGLISH ? "." : "。"}
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
        {this.state.toastShow && (
          <div className={`${APP.toast}`}>{this.state.toastText}</div>
        )}
      </div>
    );
  }
}
