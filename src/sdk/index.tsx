import ReactDOM, { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
import { ZegoCloudRTCKitComponent } from "./view/index";

export class ZegoUIkitPrebuiltMeeting {
  static core: ZegoCloudRTCCore;
  static _instance: ZegoUIkitPrebuiltMeeting;

  root: Root | undefined;

  static init(token: string): ZegoUIkitPrebuiltMeeting {
    if (!ZegoUIkitPrebuiltMeeting.core && token) {
      ZegoUIkitPrebuiltMeeting.core = ZegoCloudRTCCore.getInstance(token);
      ZegoUIkitPrebuiltMeeting._instance = new ZegoUIkitPrebuiltMeeting();
    }
    return ZegoUIkitPrebuiltMeeting._instance;
  }

  joinRoom(roomConfig?: ZegoCloudRoomConfig) {
    if (!ZegoUIkitPrebuiltMeeting.core) {
      console.error("【ZEGOCLOUD】 please call init first !!");
      return;
    }

    if (!roomConfig || !roomConfig.container) {
      console.warn("【ZEGOCLOUD】joinRoom/roomConfig/container required !!");
      const div = document.createElement("div");
      div.style.position = "fixed";
      div.style.width = "100vw";
      div.style.height = "100vh";
      div.style.minWidth = "345px";
      div.style.top = "0px";
      div.style.left = "0px";
      div.style.zIndex = "100";
      div.style.backgroundColor = "#FFFFFF";
      div.style.overflow = "auto";
      document.body.appendChild(div);
      roomConfig = {
        ...roomConfig,
        ...{
          container: div,
        },
      };
    }

    ZegoUIkitPrebuiltMeeting.core.setConfig(roomConfig);
    this.root = ReactDOM.createRoot(roomConfig.container as HTMLDivElement);
    this.root.render(
      <ZegoCloudRTCKitComponent
        core={ZegoUIkitPrebuiltMeeting.core}
      ></ZegoCloudRTCKitComponent>
    );
  }

  destroyRoom() {
    ZegoUIkitPrebuiltMeeting.core.leaveRoom();
    this.root?.unmount();
    this.root = undefined;
  }
}
