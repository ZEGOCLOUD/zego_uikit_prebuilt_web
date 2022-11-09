import "polyfill-object.fromentries";
import React, { Ref } from "react";
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
        : process.env.REACT_APP_PATH === "1on1_call"
        ? "https://docs.zegocloud.com/article/14728"
        : "https://docs.zegocloud.com/article/14922",
    showSettings: false,
    showSettingsBtn: false,
    liveStreamingMode:
      getUrlParams().get("liveStreamingMode") || "RealTimeLive",
  };
  settingsEl = null;
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
    let liveStreamingMode;
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
      liveStreamingMode =
        getUrlParams().get("liveStreamingMode") || "RealTimeLive";
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
      console.log(" userName || getRandomName()", userName || getRandomName());
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
            liveStreamingMode,
          },
        },
        showUserList: true,
        onCanSetUserAvatar: (user) => {
          user.forEach((u) => {
            u.setUserAvatar &&
              u.setUserAvatar(
                // "https://images.pexels.com/photos/4172877/pexels-photo-4172877.jpeg?auto=compress&cs=tinysrgb&dpr=3&h=750&w=1260"
                `https://api.multiavatar.com/${u.userID}.svg?apikey=XqHm465NYsdLfb` // random avatar
              );
          });
        },
        videoResolutionList: [
          ZegoUIKitPrebuilt.VideoResolution["180P"],
          ZegoUIKitPrebuilt.VideoResolution["480P"],
          ZegoUIKitPrebuilt.VideoResolution["360P"],
          ZegoUIKitPrebuilt.VideoResolution["720P"],
        ],
      };
      if (showNonVideoUser !== undefined) {
        param.showNonVideoUser = showNonVideoUser === "true";
      }
      zp.joinRoom(param);
    };
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
              {this.state.showSettingsBtn && (
                <a
                  className={APP.link_item}
                  onClick={() => {
                    this.setState({
                      showSettings: true,
                      liveStreamingMode:
                        getUrlParams().get("liveStreamingMode"),
                    });
                  }}
                >
                  <span className={APP.icon_settings}></span>{" "}
                  {isPc() && "Settings"}
                </a>
              )}
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
        {this.state.showSettings && (
          <div
            className={`${
              isPc() ? APP.pcSettingsModel : APP.mobileSettingsModel
            }`}
          >
            <div className={APP.settingsWrapper}>
              <div className={APP.settingsHeader}>
                <p>{isPc() ? "Settings" : "Live streaming mode"}</p>
                <span
                  className={APP.settingsClose}
                  onClick={() => {
                    this.setState({
                      showSettings: false,
                    });
                  }}
                ></span>
              </div>
              <div className={APP.settingsBody}>
                {isPc() && (
                  <div className={APP.settingsMode}>Live streaming mode</div>
                )}
                <div className={APP.settingsModeList}>
                  <div
                    className={`${APP.settingsModeItem} ${
                      this.state.liveStreamingMode === "CDNLive"
                        ? APP.settingsModeItemSelected
                        : ""
                    }`}
                    onClick={() => {
                      this.handleSelectMode("CDNLive");
                    }}
                  >
                    <p>CDN Live</p>
                    <span></span>
                  </div>
                  <div
                    className={`${APP.settingsModeItem} ${
                      this.state.liveStreamingMode === "StandardLive"
                        ? APP.settingsModeItemSelected
                        : ""
                    }`}
                    onClick={() => {
                      this.handleSelectMode("StandardLive");
                    }}
                  >
                    <p>Standard Live</p>
                    <span></span>
                  </div>
                  <div
                    className={`${APP.settingsModeItem} ${
                      this.state.liveStreamingMode === "RealTimeLive"
                        ? APP.settingsModeItemSelected
                        : ""
                    }`}
                    onClick={() => {
                      this.handleSelectMode("RealTimeLive");
                    }}
                  >
                    <p>Real-time Live</p>
                    <span></span>
                  </div>
                </div>
                {isPc() && (
                  <div
                    className={APP.settingsBtn}
                    onClick={() => {
                      this.handleSettingsConfirm();
                    }}
                  >
                    Confirm
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
