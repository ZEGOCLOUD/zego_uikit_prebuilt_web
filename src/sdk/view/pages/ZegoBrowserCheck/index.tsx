import React, { ChangeEvent, RefObject } from "react";
import ZegoBrowserCheckCss from "./index.module.scss";
import { copy } from "../../../modules/util";
import { ZegoBrowserCheckProp } from "../../../model";
import { ZegoSettingsAlert } from "../../components/zegoSetting";
export class ZegoBrowserCheck extends React.Component<ZegoBrowserCheckProp> {
  state = {
    isSupportWebRTC: false,
    localStream: undefined,
    localVideoStream: undefined,
    localAudioStream: undefined,
    userName: "xxx",
  };
  videoRef: RefObject<HTMLVideoElement>;
  inviteRef: RefObject<HTMLInputElement>;
  videoOpen = true;
  audioOpen = true;
  audioRefuse = false;
  videoRefuse = false;

  constructor(props: ZegoBrowserCheckProp) {
    super(props);
    this.videoRef = React.createRef();
    this.inviteRef = React.createRef();
  }

  async componentDidMount() {
    const res = await this.props.core.checkWebRTC();
    this.videoOpen = !!this.props.core._config.cameraEnabled;
    this.audioOpen = !!this.props.core._config.micEnabled;
    let localStream: MediaStream | undefined = undefined;
    if (res && (this.videoOpen || this.audioOpen)) {
      localStream = await this.createStream(this.videoOpen, this.audioOpen);
      this.setState({
        isSupportWebRTC: res,
        userName: this.props.core._expressConfig.userName,
      });
    }
  }

  async createStream(
    videoOpen: boolean,
    audioOpen: boolean
  ): Promise<MediaStream> {
    let localVideoStream,
      localAudioStream,
      localStream = new MediaStream();
    try {
      if (videoOpen) {
        localVideoStream = await this.props.core.createStream({
          camera: {
            video: true,
            audio: false,
          },
        });
        localVideoStream?.getVideoTracks().map((track) => {
          localStream.addTrack(track);
        });
        this.setState({
          localVideoStream,
        });
      }
    } catch (error) {
      this.videoRefuse = true;
      console.error(
        "【ZEGOCLOUD】toggleStream/createStream failed !!",
        JSON.stringify(error)
      );
    }

    try {
      if (audioOpen) {
        localAudioStream = await this.props.core.createStream({
          camera: {
            video: false,
            audio: true,
          },
        });
        localAudioStream?.getAudioTracks().map((track) => {
          localStream.addTrack(track);
        });
        this.setState({
          localAudioStream,
        });
      }
    } catch (error) {
      this.audioRefuse = true;
      console.error(
        "【ZEGOCLOUD】toggleStream/createStream failed !!",
        JSON.stringify(error)
      );
    }

    this.setState(
      {
        localStream,
      },
      () => {
        if (this.videoRef.current && localStream) {
          this.videoRef.current.srcObject = localStream;
        }
      }
    );

    return localStream;
  }

  async toggleStream(type: "video" | "audio") {
    if (type === "video" && !this.videoRefuse) {
      this.videoOpen = !this.videoOpen;
      if (!this.state.localVideoStream) {
        const res = await this.createStream(this.videoOpen, false);
        res.getVideoTracks().length > 0 && (this.videoOpen = !this.videoOpen);
      } else {
        (this.state.localVideoStream as MediaStream)
          .getTracks()
          .reverse()
          .forEach((track) => track.stop());
        this.setState({ localVideoStream: undefined });
      }
    } else if (type === "audio" && !this.audioRefuse) {
      this.audioOpen = !this.audioOpen;
      if (!this.state.localAudioStream) {
        const res = await this.createStream(this.videoOpen, this.audioOpen);
        res.getAudioTracks().length > 0 && (this.audioOpen = !this.audioOpen);
      } else {
        this.props.core.muteMicrophone(this.audioOpen);
      }
    }
  }

  async joinRoom() {
    this.props.core._expressConfig.userName = this.state.userName;
    this.props.core._config.micEnabled = this.audioOpen && !this.audioRefuse;
    this.props.core._config.cameraEnabled = this.videoOpen && !this.videoRefuse;
    const loginRsp = await this.props.core.enterRoom();
    if (loginRsp) {
      this.props.joinRoom && this.props.joinRoom();
      this.state.localStream &&
        this.props.core.destroyStream(this.state.localStream);
    } else {
      // alert
      console.error("【ZEGOCLOUD】Room is full !!");
    }
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ userName: event.target.value });
  }

  openSettings() {
    ZegoSettingsAlert({
      core: this.props.core,
      closeCallBack: () => {},
    });
  }
  render(): React.ReactNode {
    let page;
    if (!this.state.isSupportWebRTC) {
      page = (
        <div className={ZegoBrowserCheckCss.ZegoBrowserCheckNotSupport}>
          <div className={ZegoBrowserCheckCss.content}>
            <p className={ZegoBrowserCheckCss.tipsHeader}>
              Browser not supported
            </p>
            <p className={ZegoBrowserCheckCss.tipsText}>
              The current browser is not available for you to join the room.
            </p>
          </div>
        </div>
      );
    } else {
      page = (
        <div className={ZegoBrowserCheckCss.ZegoBrowserCheckSupport}>
          <div className={ZegoBrowserCheckCss.videoScree}>
            <a
              className={ZegoBrowserCheckCss.settings}
              onClick={() => {
                this.openSettings();
              }}
            >
              settings
            </a>
            <video
              className={ZegoBrowserCheckCss.video}
              autoPlay
              muted
              ref={this.videoRef}
            ></video>
            <div className={ZegoBrowserCheckCss.handler}>
              {this.props.core._config.userCanToggleSelfMic && (
                <a
                  onClick={() => {
                    this.toggleStream("audio");
                  }}
                >
                  mic
                </a>
              )}
              {this.props.core._config.userCanToggleSelfCamera && (
                <a
                  onClick={() => {
                    this.toggleStream("video");
                  }}
                >
                  camera
                </a>
              )}
            </div>
          </div>
          <div className={ZegoBrowserCheckCss.joinScreen}>
            <div className={ZegoBrowserCheckCss.title}>
              {this.props.core._config.joinScreen?.title}
            </div>
            <input
              className={ZegoBrowserCheckCss.userName}
              placeholder="enter userName"
              value={this.state.userName}
              onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                this.handleChange(ev);
              }}
            ></input>
            <button
              className={ZegoBrowserCheckCss.joinRoom}
              onClick={() => {
                this.joinRoom();
              }}
            >
              joinRoom
            </button>
            <input
              className={ZegoBrowserCheckCss.inviteLink}
              placeholder="inviteLink"
              readOnly
              value={this.props.core._config.joinScreen?.inviteURL}
              ref={this.inviteRef}
            ></input>
            <button
              className={ZegoBrowserCheckCss.copyLink}
              onClick={() => {
                this.inviteRef.current &&
                  copy(this.inviteRef.current.value, this.inviteRef.current);
              }}
            >
              copyLink
            </button>
          </div>
        </div>
      );
    }
    return page;
  }
}
