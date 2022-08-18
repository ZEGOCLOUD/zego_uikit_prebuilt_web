import ReactDOM, { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
import { ZegoCloudRTCKitComponent } from "./view/index";

export class ZegoPrebuiltUIKit {
  static core: ZegoCloudRTCCore;
  static _instance: ZegoPrebuiltUIKit;

  root: Root | undefined;

  static create(token: string): ZegoPrebuiltUIKit {
    if (!ZegoPrebuiltUIKit.core && token) {
      ZegoPrebuiltUIKit.core = ZegoCloudRTCCore.getInstance(token);
      ZegoPrebuiltUIKit._instance = new ZegoPrebuiltUIKit();
    }
    return ZegoPrebuiltUIKit._instance;
  }

  joinRoom(roomConfig?: ZegoCloudRoomConfig) {
    if (!ZegoPrebuiltUIKit.core) {
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

    ZegoPrebuiltUIKit.core.setConfig(roomConfig);
    this.root = ReactDOM.createRoot(roomConfig.container as HTMLDivElement);
    this.root.render(
      <ZegoCloudRTCKitComponent
        core={ZegoPrebuiltUIKit.core}
      ></ZegoCloudRTCKitComponent>
    );
  }

  destroy() {
    ZegoPrebuiltUIKit.core.leaveRoom();
    this.root?.unmount();
    this.root = undefined;
  }
}
