import { type } from "os";
import React from "react";
// @ts-ignore
import APP from "./App.module.scss";
import { ZegoPrebuiltUIKit } from "./sdk/index";
import { ZegoCloudRoomConfig } from "./sdk/model";
import { getUrlParams, isPc } from "./sdk/util";
import { generateToken, getRandomName, randomID } from "./util";
export default class App extends React.Component {
  myMeeting: (element: HTMLDivElement) => Promise<void>;
  state = {
    showPreviewHeader: "show",
  };
  constructor(props: Readonly<{}>) {
    super(props);
    // zegocloud.com
    this.state.showPreviewHeader =
      getUrlParams(window.location.href)["preHeader"] || "show";
    // @es
    const roomID = getUrlParams(window.location.href)["roomID"] || randomID(5);
    const role = getUrlParams(window.location.href)["role"] || "HOST";
    this.myMeeting = async (element: HTMLDivElement) => {
      let { token } = await generateToken(randomID(5), roomID, getRandomName());
      const zp = ZegoPrebuiltUIKit.create(token);
      const param: ZegoCloudRoomConfig = {
        // @ts-ignore
        container: element, // 挂载容器
        preJoinViewConfig: {
          // 通话前检测页面是否需要，默认需要
          invitationLink:
            window.location.origin +
            window.location.pathname +
            "?roomID=" +
            roomID +
            "&role=GUEST",
          title: "Join Room",
        },
        showPreJoinView: true, // 是否显示预览检测页面，默认显示
        turnOnMicrophoneWhenJoining: role === "HOST", // 是否开启自己的麦克风,默认开启
        turnOnCameraWhenJoining: role === "HOST", // 是否开启自己的摄像头 ,默认开启
        showMyCameraToggleButton: role === "HOST", // 是否可以控制自己的麦克风,默认开启
        showMyMicrophoneToggleButton: role === "HOST", // 是否可以控制体自己的摄像头,默认开启
        showAudioVideoSettingsButton: role === "HOST",
        showTextChat: true, // 是否开启聊天，默认开启
        showUserList: true, //是否显示成员列表，默认不展示
        lowerLeftNotification: {
          showUserJoinAndLeave: true, //是否显示成员进出，默认不显示
          showTextChat: true, // 是否显示未读消息，默认不显示
        },
        showNonVideoUser: role === "HOST" && false,
        leaveRoomCallback: () => {
          console.log("test:leaveRoomCallback");
          window?.parent?.postMessage("leaveRoom", "*");
        }, // 退出房间回调
        joinRoomCallback: () => {
          window?.parent?.postMessage("joinRoom", "*");
        },
        userUpdateCallback: (type, users) => {
          console.log("userUpdateCallback", type, users);
        },
        branding: {
          logoURL:
            "https://www.zegocloud.com/_nuxt/img/zegocloud_logo_white.ddbab9f.png",
        },
        showLeavingView: true, // 离开房间后页面，默认有
        maxUsers: 50,
      };
      zp.joinRoom(param);
    };
  }

  render(): React.ReactNode {
    return (
      <div className={`${APP.app} ${isPc() ? "" : APP.mobileApp}`}>
        {this.state.showPreviewHeader === "show" && (
          <div
            className={`${APP.nav} ${isPc() ? "" : APP.mobileNav} preView_nav`}
          >
            <div
              className={`${APP.LOGO} ${isPc() ? "" : APP.mobileLOGO}`}
              onClick={() => {
                window.open("https://www.zegocloud.com", "_blank");
              }}
            ></div>
            <div className={`${APP.link} ${isPc() ? "" : APP.mobileLink}`}>
              <a
                href="https://docs.zegocloud.com/article/5546"
                target="_blank"
                className={APP.link_item}
                rel="noreferrer"
              >
                <span className={APP.icon__doc}></span>{" "}
                {isPc() && "Documentation"}
              </a>
              <a
                href="https://github.com/ZEGOCLOUD/zegocloud_prebuilt_webrtc"
                target="_blank"
                className={APP.link_item}
                rel="noreferrer"
              >
                <span className={APP.icon__github}></span>
                {isPc() && "View demo code"}
              </a>
            </div>
          </div>
        )}
        <div
          ref={this.myMeeting}
          className={`${APP.myMeeting}  ${isPc() ? "" : APP.mobileMeeting}`}
        ></div>
        <div
          className={`${APP.serviceTips}  ${
            isPc() ? APP.pcServiceTips : APP.mobileServiceTips
          } preView_services`}
        >
          By clicking "Join", you agree to {!isPc() && <br />} our{" "}
          <a
            href="https://www.zegocloud.com/policy?index=1"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Services
          </a>{" "}
          and{" "}
          <a
            href="https://www.zegocloud.com/policy?index=0"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>
    );
  }
}
