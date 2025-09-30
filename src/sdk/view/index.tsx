import React from "react";
import { ZegoCloudRTCCore } from "../modules";
import { ZegoBrowserCheck } from "./pages/ZegoBrowserCheck";
import { ZegoBrowserCheckMobile } from "./pages/ZegoBrowserCheckMobile";
import { ZegoRoom } from "./pages/ZegoRoom";
import { ZegoRoomMobile } from "./pages/ZegoRoomMobile";
import index from "./index.module.scss";
import { ZegoRejoinRoom } from "./pages/ZegoRejoinRoom";
import { isPc } from "../util";
import { ZegoModel } from "./components/zegoModel";
import { CallInvitationEndReason, ZegoUIKitLanguage } from "../model";
import { IntlProvider } from "react-intl";
import { i18nMap } from '../locale';
import { ZegoModelShow } from "./components/zegoModel";
declare const SDK_ENV: boolean;
export class ZegoCloudRTCKitComponent extends React.Component<{
  core: ZegoCloudRTCCore;
  unmount: () => void;
}> {
  state = {
    step: this.props.core._config.showPreJoinView ? 0 : 1,
    isSupportWebRTC: true,
    lang: this.props.core._config.language || ZegoUIKitLanguage.ENGLISH,
  };
  async componentDidMount() {
    // const notSupportPhone =
    //   !isPc() && isIOS() && IsSafari();
    const res = await this.props.core.checkWebRTC();
    if (!res) {
      const { formatMessage } = this.props.core.intl;
      ZegoModelShow(
        {
          header: formatMessage({ id: "global.checkRTC" }),
          contentText: formatMessage({ id: "global.checkRTC" }),
          okText: "Okay",
        },
      );
    }
    this.props.core.eventEmitter.on("lang", (lang: string) => {
      this.setState({
        lang,
      })
    })
    // await this.deviceCheck();
    this.setState({
      isSupportWebRTC: res,
    });
    console.warn('[KitComponent]checkWebRTC res:', res)
  }
  componentWillUnmount(): void {
    console.warn('[KitComponent]componentWillUnmount')
    this.destroyNodeWhenNoView();
  }

  // async deviceCheck(): Promise<void> {
  //   // 没有预览页面才检查，预览页本身就会检查
  //   if (!this.props.core._config.showPreJoinView) {
  //     // 检查摄像头
  //     if (this.props.core._config.turnOnCameraWhenJoining) {
  //       try {
  //         const cameras = await this.props.core.getCameras();
  //         cameras.length < 1 && (this.props.core.status.videoRefuse = true);
  //       } catch (error) {
  //         this.props.core.status.videoRefuse = true;
  //       }
  //     } else {
  //       // this.props.core.status.videoRefuse = true;
  //     }
  //     // 检查麦克风
  //     if (this.props.core._config.turnOnMicrophoneWhenJoining) {
  //       try {
  //         const mics = await this.props.core.getMicrophones();
  //         mics.length < 1 && (this.props.core.status.audioRefuse = true);
  //       } catch (error) {
  //         this.props.core.status.audioRefuse = true;
  //       }
  //     } else {
  //       // this.props.core.status.audioRefuse = true;
  //     }
  //   }
  // }

  nextPage() {
    this.setState((state: { step: number }) => {
      return {
        step: ++state.step,
      };
    });
  }
  destroyNodeWhenNoView() {
    console.warn('[KitComponent]destroyNodeWhenNoView', this.props.core._config)
    //退出房间后，如果没有预览页面，就销毁渲染节点
    if (
      !this.props.core._config.showLeavingView &&
      !this.props.core._config.showPreJoinView
    ) {
      this.props.unmount();
    }
  }
  render(): React.ReactNode {
    let page;
    if (this.state.isSupportWebRTC) {
      if (this.state.step === 0 && this.props.core) {
        if (typeof SDK_ENV === "undefined") {
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
          const nav = document.querySelector(
            "#root .preView_nav"
          ) as HTMLDivElement;
          const privacy = document.querySelector(
            "#root .preView_services"
          ) as HTMLDivElement;
          const meetingEl = privacy.previousElementSibling as HTMLDivElement;

          nav && (nav.style.display = "none");
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
            leaveRoom={(isKickedOut = false, isCallQuit = true) => {
              console.log('[KitComponent]leave room, isKickedOut:', isKickedOut)
              if (isKickedOut) {
                // 被踢出房间回到预览页
                if (this.props.core._config.showPreJoinView) {
                  this.setState({ step: 0 });
                }
              } else {
                if (this.props.core._config.showLeavingView) {
                  this.nextPage();
                } else {
                  this.props.core._config.showPreJoinView && this.setState({ step: 0 });
                }
              }
              setTimeout(() => {
                if (!isKickedOut) {
                  this.props.core._config.leaveRoomCallback &&
                    this.props.core._config.leaveRoomCallback();
                  this.props.core._config.onLeaveRoom &&
                    this.props.core._config.onLeaveRoom();
                } else {
                  this.props.core._config?.onYouRemovedFromRoom?.();
                }
                console.warn('KitComponent]leaveRoom')
                this.destroyNodeWhenNoView();
                this.props.core._zimManager?.callInfo?.callID &&
                  this.props.core._zimManager.endCall(
                    CallInvitationEndReason.LeaveRoom,
                    isCallQuit,
                  );
              }, 0);
            }}
          ></ZegoRoom>
        ) : (
          <ZegoRoomMobile
            core={this.props.core}
            leaveRoom={(isKickedOut = false, isCallQuit = true) => {
              console.log('[KitComponent]leave room, isKickedOut:', isKickedOut)
              if (isKickedOut) {
                // 被踢出房间回到预览页
                if (this.props.core._config.showPreJoinView) {
                  this.setState({ step: 0 });
                }
              } else {
                this.props.core._config.showLeavingView && this.nextPage();
              }
              setTimeout(() => {
                if (!isKickedOut) {
                  this.props.core._config.leaveRoomCallback &&
                    this.props.core._config.leaveRoomCallback();
                  this.props.core._config.onLeaveRoom &&
                    this.props.core._config.onLeaveRoom();
                } else {
                  this.props.core._config?.onYouRemovedFromRoom?.();
                }
                this.destroyNodeWhenNoView();
                // 主动退出房间，呼叫邀请结束
                this.props.core._zimManager?.callInfo?.callID &&
                  this.props.core._zimManager.endCall(
                    CallInvitationEndReason.LeaveRoom,
                    isCallQuit
                  );
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
              if (this.props.core._config.onReturnToHomeScreenClicked) {
                this.props.core._config.onReturnToHomeScreenClicked();
              } else {
                this.setState({
                  step: 0,
                });
              }

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
      <IntlProvider locale={this.state.lang} messages={i18nMap[this.state.lang]}>
        <div className={index.index}>{page}</div>
      </IntlProvider>
    );
  }
}
