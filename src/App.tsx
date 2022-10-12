import "polyfill-object.fromentries";
import React from "react";
// @ts-ignore
import APP from "./App.module.scss";
import { ZegoUIKitPrebuilt } from "./sdk/index";
import { LiveRole, ScenarioModel, ZegoCloudRoomConfig } from "./sdk/model";
import { getUrlParams, isPc } from "./sdk/util";
import { generateToken, getRandomName, randomID } from "./util";
export default class App extends React.Component {
  myMeeting: (element: HTMLDivElement) => Promise<void>;
  state = {
    showPreviewHeader: getUrlParams().get("preHeader") || "show",
    docs:
      process.env.REACT_APP_PATH === "live_stream"
        ? "https://docs.zegocloud.com/article/14885"
        : "https://docs.zegocloud.com/article/14728",
  };
  constructor(props: any) {
    super(props);
    const userName = getUrlParams().get("UserName");

    const roomID = getUrlParams().get("roomID") || randomID(5);

    if (!getUrlParams().get("roomID")) {
      window.history.replaceState(
        "",
        "You have logged into room: " + roomID,
        window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID +
          "&role=Host"
      );
    }

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

    let mode = ScenarioModel.OneONoneCall;
    if (process.env.REACT_APP_PATH === "1on1_call") {
      maxUsers = 2;
      sharedLinks.push({
        name: "Personal link",
        url:
          window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID,
      });
    } else if (process.env.REACT_APP_PATH === "live_stream") {
      mode = ScenarioModel.LiveStreaming;
      if (role === LiveRole.Host || role === LiveRole.Cohost) {
        sharedLinks.push({
          name: "Join as co-host",
          url:
            window.location.origin +
            window.location.pathname +
            "?roomID=" +
            roomID +
            "&role=Cohost",
        });
      }
      sharedLinks.push({
        name: "Join as audience",
        url:
          window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID +
          "&role=Audience",
      });
    } else if (process.env.REACT_APP_PATH === "video_conference") {
      mode = ScenarioModel.VideoConference;
      sharedLinks.push({
        name: "Personal link",
        url:
          window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID,
      });
    }

    this.myMeeting = async (element: HTMLDivElement) => {
      let { token } = await generateToken(
        randomID(5),
        roomID,
        userName || getRandomName()
      );

      const zp = ZegoUIKitPrebuilt.create(token);
      const param: ZegoCloudRoomConfig = {
        // @ts-ignore
        container: element, // 挂载容器
        preJoinViewConfig: {
          title: "Join Room",
        },
        maxUsers,
        leaveRoomCallback: () => {
          console.log("test:leaveRoomCallback");
          window?.parent?.postMessage("leaveRoom", "*");
        }, // 退出房间回调
        joinRoomCallback: () => {
          window?.parent?.postMessage("joinRoom", "*");
        },
        branding: {
          logoURL:
            "https://www.zegocloud.com/_nuxt/img/zegocloud_logo_white.ddbab9f.png",
        },
        sharedLinks,
        scenario: {
          mode,
          config: {
            role,
          },
        },
      };
      if (showNonVideoUser !== undefined) {
        param.showNonVideoUser = showNonVideoUser == "true";
      }
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
                href={this.state.docs}
                target="_blank"
                className={APP.link_item}
                rel="noreferrer"
              >
                <span className={APP.icon__doc}></span>{" "}
                {isPc() && "Documentation"}
              </a>
              <a
                href="https://github.com/ZEGOCLOUD/zego_uikit_prebuilt_web/"
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
