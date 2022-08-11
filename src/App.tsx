import React from "react";
// @ts-ignore
import APP from "./App.module.scss";
import { ZegoUIKitPrebuilt } from "./sdk/index";
import { ZegoCloudRoomConfig } from "./sdk/model";
import { getUrlParams, isPc } from "./sdk/util";
import { generateToken, randomID } from "./util";
export default class App extends React.Component {
  myMeeting: (element: HTMLDivElement) => Promise<void>;

  constructor(props: Readonly<{}>) {
    super(props);
    // @es
    const roomID = getUrlParams(window.location.href)["roomID"] || randomID(5);
    this.myMeeting = async (element: HTMLDivElement) => {
      let { token } = await generateToken(randomID(5), roomID, randomID(5));
      // token =
      //   "04AAAAAGLiKBcAEDFnZnlqZDV3bHQwNDZrZG4AcMdjPKlN5VTcl8PDi9mwY+rY1pZs4h1HKQKow/i1ZaZmoNNvF+mq6L/mm4ootCh5pEHmMg4S+PB70H1VReSgbBpb5QaH9FobMo1snaAxft66+T3DxUCThSuSEYxavGLO2fwWIEALNNPNvg+hO/o58G0=#eyJ1c2VyX2lkIjoiMTIzZmFkcyIsInJvb21faWQiOiJmYXNmIiwidXNlcl9uYW1lIjoiZmFqZmQiLCJhcHBfaWQiOiIxNDg0NjQ3OTM5In0=";
      const zp = ZegoUIKitPrebuilt.create(token);
      const param: ZegoCloudRoomConfig = {
        // @ts-ignore
        container: element, // 挂载容器
        preJoinViewConfig: {
          // 通话前检测页面是否需要，默认需要
          invitationLink:
            window.location.origin +
            window.location.pathname +
            "?roomID=" +
            roomID,
          title: "Join Room",
        },
        showPreJoinView: true, // 是否显示预览检测页面，默认显示
        turnOnMicrophoneWhenJoining: true, // 是否开启自己的麦克风,默认开启
        turnOnCameraWhenJoining: true, // 是否开启自己的摄像头 ,默认开启
        showMyCameraToggleButton: true, // 是否可以控制自己的麦克风,默认开启
        showMyMicrophoneToggleButton: true, // 是否可以控制体自己的摄像头,默认开启
        showAudioVideoSettingsButton: true,
        showTextChat: true, // 是否开启聊天，默认开启
        showUserList: true, //是否显示成员列表，默认不展示
        lowerLeftNotification: {
          showUserJoinAndLeave: true, //是否显示成员进出，默认不显示
          showTextChat: true, // 是否显示未读消息，默认不显示
        },
        leaveRoomCallback: () => {
          console.log("test:leaveRoomCallback");
        }, // 退出房间回调
        branding: {
          logoURL:
            "https://www.zegocloud.com/_nuxt/img/zegocloud_logo_white.ddbab9f.png",
        },
        showLeavingView: true, // 离开房间后页面，默认有
        // localizationJSON: "", //者json对象
      };
      zp.joinRoom(param);
    };
  }

  render(): React.ReactNode {
    return (
      <div className={`${APP.app} ${isPc() ? "" : APP.mobileApp}`}>
        <div className={`${APP.nav} ${isPc() ? "" : APP.mobileNav}`}>
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
        <div
          ref={this.myMeeting}
          className={`${APP.myMeeting}  ${isPc() ? "" : APP.mobileMeeting}`}
        ></div>
        <div
          className={`${APP.serviceTips}  ${
            isPc() ? APP.pcServiceTips : APP.mobileServiceTips
          }`}
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
