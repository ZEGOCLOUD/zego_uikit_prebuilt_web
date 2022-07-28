import ReactDOM, { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
import { ZegoCloudRTCKitComponent } from "./view/index";

export class ZegoUIkitPrebuilt {
  static core: ZegoCloudRTCCore;
  static _instance: ZegoUIkitPrebuilt;

  root: Root | undefined;

  static init(token: string): ZegoUIkitPrebuilt {
    if (!ZegoUIkitPrebuilt.core && token) {
      ZegoUIkitPrebuilt.core = ZegoCloudRTCCore.getInstance(token);
      ZegoUIkitPrebuilt._instance = new ZegoUIkitPrebuilt();
    }
    return ZegoUIkitPrebuilt._instance;
  }

  joinRoom(roomConfig?: ZegoCloudRoomConfig) {
    if (!ZegoUIkitPrebuilt.core) {
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

    ZegoUIkitPrebuilt.core.setConfig(roomConfig);
    this.root = ReactDOM.createRoot(roomConfig.container as HTMLDivElement);
    this.root.render(
      <ZegoCloudRTCKitComponent
        core={ZegoUIkitPrebuilt.core}
      ></ZegoCloudRTCKitComponent>
    );
  }

  destroyRoom() {
    ZegoUIkitPrebuilt.core.leaveRoom();
    this.root?.unmount();
    this.root = undefined;
  }
}
