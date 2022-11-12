import React from "react";
import { ZegoCloudUser } from "../../../modules/tools/UserListManager";
import ShowManageContext, {
  ShowManageType,
} from "../../pages/context/showManage";
import flvjs from "flv.js";

export default class ZegoAudio extends React.PureComponent<{
  userInfo: ZegoCloudUser;
  muted?: boolean;
  classList?: string;
}> {
  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;
  audioRef: HTMLAudioElement | null = null;
  flvPlayer: any;
  initAudio(el: HTMLAudioElement) {
    if (el) {
      !this.audioRef && (this.audioRef = el);
      if ((el as any)?.sinkId !== this.context?.speakerId) {
        (el as any)?.setSinkId?.(this.context?.speakerId || "");
      }
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
    if (!flvjs.isSupported()) return;
    if (this.flvPlayer) return;
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
      this.flvPlayer.pause();
      this.flvPlayer.unload();
      this.flvPlayer.detachMediaElement();
      this.flvPlayer.destroy();
      this.flvPlayer = null;
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
        onCanPlay={(el) => {
          (el.target as HTMLAudioElement).play();
        }}
      ></audio>
    );
  }
}
