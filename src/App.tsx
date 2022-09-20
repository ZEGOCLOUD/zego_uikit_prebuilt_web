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
    showPreviewHeader: "show",
  };
  constructor(props: Readonly<{}>) {
    super(props);
    // zegocloud.com
    this.state.showPreviewHeader =
      getUrlParams(window.location.href)["preHeader"] || "show";
    const userName = getUrlParams(window.location.href)["UserName"];

    const roomID = getUrlParams(window.location.href)["roomID"] || randomID(5);

    let role_p = getUrlParams(window.location.href)["role"] || "Host";
    let role: LiveRole =
      role_p === "Host"
        ? LiveRole.Host
        : role_p === "Cohost"
        ? LiveRole.Cohost
        : LiveRole.Audience;

    let sharedLinks: { name: string; url: string }[] = [];
    let maxUsers = 50;
    console.warn("process.env.REACT_APP_PATH:", process.env.REACT_APP_PATH);

    let mode = ScenarioModel.OneONoneCall;
    if (process.env.REACT_APP_PATH === "1on1_call") {
      maxUsers = 2;
      sharedLinks.push({
        name: "Join As Host",
        url:
          window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID +
          "&role=Host",
      });
    } else if (process.env.REACT_APP_PATH === "live_stream") {
      mode = ScenarioModel.LiveStreaming;
      if (role === LiveRole.Host || role === LiveRole.Cohost) {
        sharedLinks.push({
          name: "Join As Cohost",
          url:
            window.location.origin +
            window.location.pathname +
            "?roomID=" +
            roomID +
            "&role=Cohost",
        });
      }
      sharedLinks.push({
        name: "Join As Audience",
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
        name: "Join As Host",
        url:
          window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID +
          "&role=Host",
      });
    }

    this.myMeeting = async (element: HTMLDivElement) => {
      let { token } = await generateToken(
        randomID(5),
        roomID,
        userName || getRandomName()
      );
      // token =
      //   "04AAAAAGLiKBcAEDFnZnlqZDV3bHQwNDZrZG4AcMdjPKlN5VTcl8PDi9mwY+rY1pZs4h1HKQKow/i1ZaZmoNNvF+mq6L/mm4ootCh5pEHmMg4S+PB70H1VReSgbBpb5QaH9FobMo1snaAxft66+T3DxUCThSuSEYxavGLO2fwWIEALNNPNvg+hO/o58G0=#eyJ1c2VyX2lkIjoiMTIzZmFkcyIsInJvb21faWQiOiJmYXNmIiwidXNlcl9uYW1lIjoiZmFqZmQiLCJhcHBfaWQiOiIxNDg0NjQ3OTM5In0=";
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
