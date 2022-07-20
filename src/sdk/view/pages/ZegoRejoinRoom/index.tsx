import React from "react";
import { ZegoBrowserCheckProp } from "../../../model";
import { isPc } from "../../../util";
import * as PCZegoToast from "../../components/zegoToast";
import * as MZegoToast from "../../components/mobile/zegoToast";
import ZegoRejoinRoomCss from "./index.module.scss";

const ZegoToast = isPc() ? PCZegoToast.ZegoToast : MZegoToast.ZegoToast;

export class ZegoRejoinRoom extends React.Component<ZegoBrowserCheckProp> {
  state = {
    isPc: isPc(),
  };
  async joinRoom() {
    let massage = "";
    const loginRsp = await this.props.core.enterRoom();
    if (loginRsp === 0) {
      this.props.joinRoom && this.props.joinRoom();
    } else if (loginRsp === 1002034) {
      // 登录房间的用户数超过该房间配置的最大用户数量限制（测试环境下默认房间最大用户数为 50，正式环境无限制）。
      massage =
        "Failed to join the room, the number of people in the room has reached the maximum.(2 people)";
    } else if ([1002031, 1002053].includes(loginRsp)) {
      //登录房间超时，可能是由于网络原因导致。
      massage =
        "There's something wrong with your network. Please check it and try again.";
    } else if ([1102018, 1102016, 1102020].includes(loginRsp)) {
      // 登录 token 错误，
    } else if (1002056 === loginRsp) {
      // 用户重复进行登录。
      massage =
        "You are on a call in another room, please leave that room first.";
    } else {
      massage =
        "Failed to join the room, please try again.(error code:" +
        loginRsp +
        ")";
    }
    massage && ZegoToast({ content: massage });
  }

  returnHome() {
    this.props.returnHome && this.props.returnHome();
  }

  render(): React.ReactNode {
    return (
      <div
        className={`${ZegoRejoinRoomCss.rejoinRoomContainer} ${
          this.state.isPc ? ZegoRejoinRoomCss.isPC : ""
        }`}
      >
        <button className={ZegoRejoinRoomCss.title}>
          You have left the room.
        </button>
        <button
          className={ZegoRejoinRoomCss.rejoin}
          onClick={() => {
            this.joinRoom();
          }}
        >
          Rejoin
        </button>
        <button
          className={ZegoRejoinRoomCss.returnHome}
          onClick={() => {
            this.returnHome();
          }}
        >
          Return to home screen
        </button>
      </div>
    );
  }
}
