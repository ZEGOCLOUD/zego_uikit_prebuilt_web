import ReactDOM, { Root } from "react-dom/client";
import { ZegoCloudRoomConfig } from "./model";
import { ZegoCloudRTCCore } from "./modules";
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

  joinRoom(roomConfig: ZegoCloudRoomConfig) {
    if (!ZegoCloudRTCKit.core) {
      console.error("【ZEGOCLOUD】 please call init first !!");
    } else if (!roomConfig.container) {
      console.error("【ZEGOCLOUD】joinRoom/roomConfig/container required !!");
    } else {
      ZegoCloudRTCKit.core.setConfig(roomConfig);
      this.root = ReactDOM.createRoot(roomConfig.container);
      this.root.render(
        <ZegoCloudRTCKitComponent
          core={ZegoCloudRTCKit.core}
        ></ZegoCloudRTCKitComponent>
      );
    }
  }

  destroyRoom() {
    ZegoCloudRTCKit.core.leaveRoom();
    this.root?.unmount();
    this.root = undefined;
  }
}
