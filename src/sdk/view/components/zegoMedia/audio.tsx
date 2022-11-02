import React from "react";
import { ZegoCloudUser } from "../../../modules/tools/UserListManager";
import ShowPCManageContext from "../../pages/ZegoRoom/context/showManage";
import flvjs from "flv.js";

export default class ZegoAudio extends React.PureComponent<{
  userInfo: ZegoCloudUser;
  muted?: boolean;
  classList?: string;
  key?: string;
}> {
  context!: React.ContextType<typeof ShowPCManageContext>;
  audioRef: HTMLAudioElement | null = null;
  flvPlayer: any;
  initAudio(el: HTMLAudioElement) {
    if (el) {
      this.audioRef = el;
      (el as any)?.setSinkId?.(this.context.speakerId || "");
      if (this.props.userInfo?.streamList?.[0]?.media) {
        el.srcObject !== this.props.userInfo?.streamList?.[0]?.media &&
          (el.srcObject = this.props.userInfo?.streamList?.[0]?.media!);
      } else if (this.props.userInfo?.streamList?.[0]?.urlsHttpsFLV) {
        if (this.isSafari()) {
          el.src !== this.props.userInfo?.streamList?.[0]?.urlsHttpsHLS! &&
            (el.src = this.props.userInfo?.streamList?.[0]?.urlsHttpsHLS!);
        } else {
          this.initFLVPlayer(
            el,
            this.props.userInfo.streamList?.[0]?.urlsHttpsFLV
          );
        }
      }
    }
  }
  initFLVPlayer(audioElement: HTMLAudioElement, url: string) {
    this.flvPlayer = flvjs.createPlayer({
      type: "flv",
      isLive: true,
      url: url,
      cors: true,
      hasAudio: true, //是否需要音频
      hasVideo: false, //是否需要视频
    });
    this.flvPlayer.on(flvjs.Events.LOADING_COMPLETE, () => {
      console.error("LOADING_COMPLETE");
      this.flvPlayer.play();
    });
    this.flvPlayer.attachMediaElement(audioElement);
    this.flvPlayer.load();
  }
  isSafari(): boolean {
    return (
      /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    );
  }
  componentWillUnmount() {
    if (this.flvPlayer) {
      this.flvPlayer.unload();
      this.flvPlayer.detachMediaElement();
    } else {
      this.audioRef?.srcObject && (this.audioRef.srcObject = null);
      this.audioRef?.src && (this.audioRef.src = "");
    }
  }
  render(): React.ReactNode {
    return (
      <audio
        autoPlay
        style={{ width: "1px", height: "1px" }}
        muted={this.props.muted || false}
        className={this.props.classList}
        ref={this.initAudio.bind(this)}
        key={this.props.key + "_" + new Date().toString()}
        onCanPlay={(el) => {
          (el.target as HTMLAudioElement).play();
        }}
      ></audio>
    );
  }
}
