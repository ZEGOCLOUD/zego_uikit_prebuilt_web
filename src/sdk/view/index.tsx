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
import { ZegoModel } from "./components/zegoModel";

declare const SDK_ENV: boolean;
export class ZegoCloudRTCKitComponent extends React.Component<{
  core: ZegoCloudRTCCore;
}> {
  state = {
    step: this.props.core._config.showPreJoinView ? 0 : 1,
    isSupportWebRTC: true,
  };

  async componentDidMount() {
    // const notSupportPhone =
    //   !isPc() && isIOS() && IsSafari();
    const res = await this.props.core.checkWebRTC();
    this.setState({
      isSupportWebRTC: res,
    });
  }

  nextPage() {
    this.setState((state: { step: number }) => {
      return {
        step: ++state.step,
      };
    });
  }

  render(): React.ReactNode {
    let page;
    if (this.state.isSupportWebRTC) {
      if (this.state.step === 0 && this.props.core) {
        if (typeof SDK_ENV === "undefined") {
          const root = document.getElementById("root");
          const nav = document.querySelector(
            "#root .preView_nav"
          ) as HTMLDivElement;
          const privacy = document.querySelector(
            "#root .preView_services"
          ) as HTMLDivElement;

          const meetingEl = privacy.previousElementSibling as HTMLDivElement;
          nav && (nav.style.display = "flex");
          meetingEl.style.height = "auto";
          privacy.style.display = "block";
          if (!isPc()) {
            meetingEl.style.marginTop = "";
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
        this.props.core.setCurrentPage("BrowserCheckPage");
      } else if (this.state.step === 1 && this.props.core) {
        if (typeof SDK_ENV === "undefined") {
          const root = document.getElementById("root");
          const nav = document.querySelector(
            "#root .preView_nav"
          ) as HTMLDivElement;
          const privacy = document.querySelector(
            "#root .preView_services"
          ) as HTMLDivElement;
          const meetingEl = privacy.previousElementSibling as HTMLDivElement;

          nav.style.display = "none";
          meetingEl.style.height = "100%";
          privacy.style.display = "none";
          if (!isPc()) {
            meetingEl.style.marginTop = "0";
          }
        }

        setTimeout(() => {
          this.props.core._config.joinRoomCallback &&
            this.props.core._config?.joinRoomCallback();

          this.props.core._config.onJoinRoom &&
            this.props.core._config.onJoinRoom();
        }, 0);
        page = isPc() ? (
          <ZegoRoom
            core={this.props.core}
            leaveRoom={() => {
              this.props.core._config.showLeavingView && this.nextPage();
              setTimeout(() => {
                this.props.core._config.leaveRoomCallback &&
                  this.props.core._config.leaveRoomCallback();
                this.props.core._config.onLeaveRoom &&
                  this.props.core._config.onLeaveRoom();
              }, 0);
            }}
          ></ZegoRoom>
        ) : (
          <ZegoRoomMobile
            core={this.props.core}
            leaveRoom={() => {
              this.props.core._config.showLeavingView && this.nextPage();
              setTimeout(() => {
                this.props.core._config.leaveRoomCallback &&
                  this.props.core._config.leaveRoomCallback();
                this.props.core._config.onLeaveRoom &&
                  this.props.core._config.onLeaveRoom();
              }, 0);
            }}
          ></ZegoRoomMobile>
        );

        this.props.core.setCurrentPage("Room");
      } else if (this.state.step === 2 && this.props.core) {
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
        this.props.core.setCurrentPage("RejoinRoom");
      }
    } else {
      page = (
        <ZegoModel
          header={"Browser not supported"}
          contentText={
            /Firefox/.test(window.navigator.userAgent)
              ? "Your browser version does not support the features or something wrong with your network. Please check them and try again."
              : "The current browser is not available for you to join the room."
          }
        ></ZegoModel>
      );

      this.props.core.setCurrentPage("BrowserCheckPage");
    }
    return (
      <IntlProvider locale="en">
        <div className={index.index}>{page}</div>
      </IntlProvider>
    );
  }
}
