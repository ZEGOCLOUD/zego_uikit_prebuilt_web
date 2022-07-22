import ReactDOM, { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
import { isPc } from "./util";
import { ZegoCloudRTCKitComponent } from "./view/index";

export class ZegoPrebuilt {
  static core: ZegoCloudRTCCore;
  static _instance: ZegoPrebuilt;

  root: Root | undefined;

  static init(token: string): ZegoPrebuilt {
    if (!ZegoPrebuilt.core && token) {
      ZegoPrebuilt.core = ZegoCloudRTCCore.getInstance(token);
      ZegoPrebuilt._instance = new ZegoPrebuilt();
    }
    return ZegoPrebuilt._instance;
  }

  joinRoom(roomConfig?: ZegoCloudRoomConfig) {
    if (!ZegoPrebuilt.core) {
      console.error("【ZEGOCLOUD】 please call init first !!");
      return;
    }

    if (!roomConfig || !roomConfig.container || !isPc()) {
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

    ZegoPrebuilt.core.setConfig(roomConfig);
    this.root = ReactDOM.createRoot(roomConfig.container as HTMLDivElement);
    this.root.render(
      <ZegoCloudRTCKitComponent
        core={ZegoPrebuilt.core}
      ></ZegoCloudRTCKitComponent>
    );
  }

  destroyRoom() {
    ZegoPrebuilt.core.leaveRoom();
    this.root?.unmount();
    this.root = undefined;
  }
}
