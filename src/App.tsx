import React from "react";
import APP from "./App.module.scss";
import { ZegoPrebuilt } from "./sdk/index";
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
      const { token } = await generateToken(
        "https://choui-prebuilt.herokuapp.com",
        randomID(5),
        roomID,
        randomID(5)
      );
      const zp = ZegoPrebuilt.init(token);
      zp.joinRoom({
        container: element,
        notification: { unreadMessageTips: true, userOnlineOfflineTips: true },
        joinScreen: {
          inviteURL:
            window.location.origin +
            window.location.pathname +
            "?roomID=" +
            roomID,
          visible: true,
          title: "Join Room",
        },
        // micEnabled: false, // 是否开启自己的麦克风,默认开启
        // cameraEnabled: true, // 是否开启自己的摄像头 ,默认开启
        // userCanToggleSelfCamera: false, // 是否可以控制自己的麦克风,默认开启
        // userCanToggleSelfMic: false, // 是否可以控制体自己的摄像头,默认开启
        // deviceSettings: false, // 是否显示设置,默认显示
        // chatEnabled: false, // 是否开启聊天，默认开启
        // userListEnabled: false, //是否显示成员列表，默认展示
        leaveRoomCallback: () => {
          //   alert("Leave Room");
        }, // 退出房间回调
        // roomTimerDisplayed: true, //是否计时，默认不计时 //TODO:
        branding: {
          logoURL:
            "https://www.zegocloud.com/_nuxt/img/zegocloud_logo_white.ddbab9f.png",
        },
        // leftScreen: false, // 离开房间后页面，默认有
      });
      // const param: ZegoCloudRoomConfig = {
      //   // @ts-ignore
      //   container: undefined, // 挂载容器
      //   joinScreen: {
      //     inviteURL:
      //       window.location.origin +
      //       window.location.pathname +
      //       "?roomID=" +
      //       roomID,
      //     visible: true,
      //     title: "Join Room",
      //   },
      //   // micEnabled: true, // 是否开启自己的麦克风,默认开启
      //   // cameraEnabled: true, // 是否开启自己的摄像头 ,默认开启
      //   // // userCanToggleSelfCamera: true, // 是否可以控制自己的麦克风,默认开启
      //   // userCanToggleSelfMic: true, // 是否可以控制体自己的摄像头,默认开启
      //   // deviceSettings: {
      //   //   audio: true, // 是否显示音频设置
      //   //   video: true, // 是否显示视频设置
      //   // },
      //   // chatEnabled: true, // 是否开启聊天，默认开启   joinScreen: boolean，// 通话前检测页面是否需要，默认需要
      //   // userListEnabled: true, //是否显示成员列表，默认不展示
      //   notification: {
      //     userOnlineOfflineTips: false, //是否显示成员进出，默认不显示
      //     unreadMessageTips: false, // 是否显示未读消息，默认不显示
      //   },
      //   // leaveRoomCallback: () => {}, // 退出房间回调
      //   // roomTimerDisplayed: false, //是否计时，默认不计时
      //   // branding: {
      //   //   logoURL: "",
      //   // },
      //   // leftScreen: true, // 离开房间后页面，默认有
      //   // i18nURL: "", // 自定义翻译文件，json地址，默认不需要，默认英文，需要先提供英文版key
      //   // i18nJSON: "", //者json对象
      // };
      // zp.joinRoom(param);
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
