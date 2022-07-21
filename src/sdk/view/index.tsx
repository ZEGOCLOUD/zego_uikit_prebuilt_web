import React from "react";
import { ZegoCloudRTCCore } from "../modules";
import { ZegoBrowserCheck } from "./pages/ZegoBrowserCheck";
import { ZegoBrowserCheckMobile } from "./pages/ZegoBrowserCheckMobile";
import { ZegoRoom } from "./pages/ZegoRoom";
import { ZegoRoomMobile } from "./pages/ZegoRoomMobile";
import { IntlProvider } from "react-intl";
import index from "./index.module.scss";
import { ZegoRejoinRoom } from "./pages/ZegoRejoinRoom";
import { isPc } from "../util";

declare const SDK_ENV: boolean;
export class ZegoCloudRTCKitComponent extends React.Component<{
  core: ZegoCloudRTCCore;
}> {
  state = {
    step: this.props.core._config.joinScreen?.visible ? 0 : 1,
  };

  nextPage() {
    this.setState((state: { step: number }) => {
      return {
        step: ++state.step,
      };
    });
  }

  render(): React.ReactNode {
    let page;
    if (this.state.step === 0 && this.props.core) {
      if (typeof SDK_ENV === "undefined") {
        const root = document.getElementById("root");
        const nav = document.querySelector(
          "#root div div:first-child"
        ) as HTMLDivElement;
        const privacy = document.querySelectorAll(
          "#root > div > div"
        )[2] as HTMLDivElement;
        if (root && !isPc()) {
          root.style.display = "flex";
        }
        if (nav && isPc()) {
          const meetingEl = nav.nextElementSibling as HTMLDivElement;
          nav.style.display = "flex";
          meetingEl.style.height = "auto";
          privacy.style.display = "block";
        }
      }

      page = isPc() ? (
        <ZegoBrowserCheck
          core={this.props.core}
          joinRoom={() => {
            this.nextPage();
          }}
        ></ZegoBrowserCheck>
      ) : (
        <ZegoBrowserCheckMobile
          core={this.props.core}
          joinRoom={() => {
            this.nextPage();
          }}
        ></ZegoBrowserCheckMobile>
      );
    } else if (this.state.step === 1 && this.props.core) {
      if (typeof SDK_ENV === "undefined") {
        const root = document.getElementById("root");
        const nav = document.querySelector(
          "#root div div:first-child"
        ) as HTMLDivElement;
        const privacy = document.querySelectorAll(
          "#root > div > div"
        )[2] as HTMLDivElement;
        const meetingEl = nav.nextElementSibling as HTMLDivElement;
        if (root && !isPc()) {
          root.style.display = "none";
        }

        if (nav && isPc()) {
          nav.style.display = "none";
          meetingEl.style.height = "100%";
          privacy.style.display = "none";
        }
      }

      page = isPc() ? (
        <ZegoRoom
          core={this.props.core}
          leaveRoom={() => {
            this.props.core._config.leftScreen && this.nextPage();
            this.props.core._config.leaveRoomCallback &&
              this.props.core._config.leaveRoomCallback();
          }}
        ></ZegoRoom>
      ) : (
        <ZegoRoomMobile
          core={this.props.core}
          leaveRoom={() => {
            this.props.core._config.leftScreen && this.nextPage();
            this.props.core._config.leaveRoomCallback &&
              this.props.core._config.leaveRoomCallback();
          }}
        ></ZegoRoomMobile>
      );
    } else {
      page = (
        <ZegoRejoinRoom
          core={this.props.core}
          joinRoom={() => {
            this.setState({
              step: 1,
            });
          }}
          returnHome={() => {
            this.setState({
              step: 0,
            });
          }}
        ></ZegoRejoinRoom>
      );
    }

    return (
      <IntlProvider locale="en">
        <div className={index.index}>{page}</div>
      </IntlProvider>
    );
  }
}
