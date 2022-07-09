import ReactDOM, { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model";
import { ZegoCloudRTCCore } from "./modules";
import { isPc } from "./util";
import { ZegoCloudRTCKitComponent } from "./view";

export default class ZegoCloudRTCKit {
  static core: ZegoCloudRTCCore;
  static _instance: ZegoCloudRTCKit;

  root: Root | undefined;

  static init(token: string): ZegoCloudRTCKit {
    if (!ZegoCloudRTCKit.core && token) {
      ZegoCloudRTCKit.core = ZegoCloudRTCCore.getInstance(token);
      ZegoCloudRTCKit._instance = new ZegoCloudRTCKit();
    }
    return ZegoCloudRTCKit._instance;
  }

  joinRoom(roomConfig?: ZegoCloudRoomConfig) {
    if (!ZegoCloudRTCKit.core) {
      console.error("【ZEGOCLOUD】 please call init first !!");
      return;
    }

    if (!roomConfig || !roomConfig.container || !isPc()) {
      console.warn("【ZEGOCLOUD】joinRoom/roomConfig/container required !!");
      const div = document.createElement("div");
      div.style.position = "fixed";
      div.style.width = "100vw";
      div.style.height = "100vh";
      div.style.top = "0px";
      div.style.left = "0px";
      div.style.zIndex = "100";
      div.style.backgroundColor = "#FFFFFF";
      document.body.appendChild(div);
      roomConfig = {
        container: div,
      };
    }

    ZegoCloudRTCKit.core.setConfig(roomConfig);
    this.root = ReactDOM.createRoot(roomConfig.container as HTMLDivElement);
    this.root.render(
      <ZegoCloudRTCKitComponent
        core={ZegoCloudRTCKit.core}
      ></ZegoCloudRTCKitComponent>
    );
  }

  destroyRoom() {
    ZegoCloudRTCKit.core.leaveRoom();
    this.root?.unmount();
    this.root = undefined;
  }
}
