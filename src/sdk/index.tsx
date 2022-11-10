import ReactDOM, { Root } from "react-dom/client";
import {
  LiveRole,
  LiveStreamingMode,
  ScenarioModel,
  VideoResolution,
  ZegoCloudRoomConfig,
} from "./model/index";
import { ZegoCloudRTCCore } from "./modules/index";
import { generatePrebuiltToken } from "./util";
import { ZegoCloudRTCKitComponent } from "./view/index";

export class ZegoUIKitPrebuilt {
  static core: ZegoCloudRTCCore | undefined;
  static _instance: ZegoUIKitPrebuilt;
  static Host = LiveRole.Host;
  static Cohost = LiveRole.Cohost;
  static Audience = LiveRole.Audience;

  static OneONoneCall = ScenarioModel.OneONoneCall;
  static GroupCall = ScenarioModel.GroupCall;
  static LiveStreaming = ScenarioModel.LiveStreaming;
  static VideoConference = ScenarioModel.VideoConference;
  static VideoResolution = VideoResolution;
  static LiveStreamingMode = LiveStreamingMode;
  private hasJoinedRoom = false;
  root: Root | undefined;

  static generateKitTokenForTest(
    appID: number,
    serverSecret: string,
    roomID: string,
    userID: string,
    userName?: string,
    ExpirationSeconds?: number
  ) {
    return generatePrebuiltToken(
      appID,
      serverSecret,
      roomID,
      userID,
      userName,
      ExpirationSeconds
    );
  }

  static generateKitTokenForProduction(
    appID: number,
    token: string,
    roomID: string,
    userID: string,
    userName?: string
  ) {
    return (
      token +
      "#" +
      window.btoa(JSON.stringify({ userID, roomID, userName, appID }))
    );
  }

  static create(kitToken: string): ZegoUIKitPrebuilt {
    if (!ZegoUIKitPrebuilt.core && kitToken) {
      ZegoUIKitPrebuilt.core = ZegoCloudRTCCore.getInstance(kitToken);
      ZegoUIKitPrebuilt._instance = new ZegoUIKitPrebuilt();
    }
    return ZegoUIKitPrebuilt._instance;
  }

  joinRoom(roomConfig?: ZegoCloudRoomConfig) {
    if (!ZegoUIKitPrebuilt.core) {
      console.error("【ZEGOCLOUD】 please call init first !!");
      return;
    }
    if (this.hasJoinedRoom) {
      console.error("【ZEGOCLOUD】joinRoom repeat !!");
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

    const result = ZegoUIKitPrebuilt.core.setConfig(roomConfig);
    if (result) {
      this.root = ReactDOM.createRoot(roomConfig.container as HTMLDivElement);
      this.root.render(
        <ZegoCloudRTCKitComponent
          core={ZegoUIKitPrebuilt.core}
        ></ZegoCloudRTCKitComponent>
      );
      this.hasJoinedRoom = true;
    }
  }

  destroy() {
    ZegoUIKitPrebuilt.core?.leaveRoom?.();
    ZegoUIKitPrebuilt.core = undefined;
    // @ts-ignore
    ZegoCloudRTCCore._instance = undefined;
    this.root?.unmount?.();
    this.root = undefined;
    this.hasJoinedRoom = false;
  }
}

// 阻止移动端横屏 弹出提示
(function rotate() {
  const orientation = window.orientation;
  let pd: HTMLDivElement | null = null;
  function createPd() {
    if (document.getElementById("preventTran") === null) {
      const imgData =
        "data:image/png;base64,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";
      pd = document.createElement("div");
      pd.setAttribute("id", "preventTran");
      pd.style.position = "fixed";
      pd.style.left = "0";
      pd.style.top = "0";
      pd.style.width = "100%";
      pd.style.height = "100vh";
      pd.style.overflow = "hidden";
      pd.style.backgroundColor = "rgb(46 46 46 / 95%)";
      pd.style.textAlign = "center";
      pd.style.display = "flex";
      pd.style.flexDirection = "column";
      pd.style.justifyContent = "center";
      pd.style.alignItems = "center";
      document.getElementsByTagName("body")[0].appendChild(pd);
      var img = document.createElement("img");
      img.src = imgData;
      pd.appendChild(img);
      img.style.marginBottom = "0.2rem";
      img.style.width = "10%";
      var br = document.createElement("br");
      var p = document.createElement("p");
      p.style.width = "100%";
      p.style.height = "auto";
      p.style.fontSize = "1.2rem";
      p.style.color = "#626262";
      p.style.lineHeight = "1.5rem";
      p.style.textAlign = "center";
      p.innerHTML = "For your good experience";
      p.appendChild(br);
      p.innerHTML += "Please operate your phone/tablet in portrait orientation";
      pd.appendChild(p);
    }
  }
  if (orientation == 90 || orientation == -90) {
    if (pd == null && document.getElementById("preventTran") === null)
      createPd();
    document.getElementById("preventTran")!.style.zIndex = "9999";
  }
  //H5新特性 监听用户水平或垂直翻转设备（即方向发生改变）
  window.onorientationchange = function () {
    if (pd == null && document.getElementById("preventTran") == null)
      createPd();
    document.getElementById("preventTran")!.style.zIndex = "-1";
    rotate();
  };
})();
