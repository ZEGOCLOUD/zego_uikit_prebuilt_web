import React from "react";
import { ZegoCloudRTCCore } from "../modules";
import { ZegoBrowserCheck } from "./pages/ZegoBrowserCheck";
import { ZegoRoom } from "./pages/ZegoRoom";
import { IntlProvider } from "react-intl";
import index from "./index.module.scss";
import { ZegoRejoinRoom } from "./pages/ZegoRejoinRoom";

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
      page = (
        <ZegoBrowserCheck
          core={this.props.core}
          joinRoom={() => {
            this.nextPage();
          }}
        ></ZegoBrowserCheck>
      );
    } else if (this.state.step === 1 && this.props.core) {
      page = (
        <ZegoRoom
          core={this.props.core}
          leaveRoom={() => {
            this.props.core._config.leftScreen && this.nextPage();
            this.props.core._config.leaveRoomCallback &&
              this.props.core._config.leaveRoomCallback();
          }}
        ></ZegoRoom>
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
