import React from "react";
import APP from "./App.module.scss";
import ZegoCloudRTCKit from "./sdk";
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
      const zgc = ZegoCloudRTCKit.init(token);
      zgc.joinRoom({
        container: element,
        notification: { unreadMessageTips: true, userOnlineOfflineTips: true },
        joinScreen: {
          inviteURL:
            window.location.origin +
            window.location.pathname +
            "?roomID=" +
            roomID,
          visible: true,
        },
        branding: {
          logoURL:
            "https://www.zegocloud.com/_nuxt/img/zegocloud_logo_white.ddbab9f.png",
        },
      });
    };
  }

  render(): React.ReactNode {
    return (
      <div className={APP.app}>
        <div className={`${APP.nav} ${isPc() ? "" : APP.mobileNav}`}>
          <div className={`${APP.LOGO} ${isPc() ? "" : APP.mobileLOGO}`}></div>
          <div className={`${APP.link} ${isPc() ? "" : APP.mobileLink}`}>
            <a href="void()" className={APP.link_item}>
              <span className={APP.icon__doc}></span>{" "}
              {isPc() && "Documentation"}
            </a>
            <a href="void()" className={APP.link_item}>
              <span className={APP.icon__github}></span>
              {isPc() && "View demo code"}
            </a>
          </div>
        </div>
        <div ref={this.myMeeting} className={APP.myMeeting}></div>
      </div>
    );
  }
}
