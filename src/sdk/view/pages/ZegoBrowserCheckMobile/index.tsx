import React, { ChangeEvent, RefObject } from "react";
import ZegoBrowserCheckCss from "./index.module.scss";
import { copy } from "../../../modules/util";
import { ZegoBrowserCheckProp } from "../../../model";
import { ZegoSettingsAlert } from "../../components/zegoSetting";
import { ZegoModel } from "../../components/zegoModel";
export class ZegoBrowserCheckMobile extends React.Component<
  ZegoBrowserCheckProp
> {
  state = {
    isSupportWebRTC: false,
    localStream: undefined,
    localVideoStream: undefined,
    localAudioStream: undefined,
    userName: "xxx",
    videoOpen: true,
    audioOpen: true,
    copied: false,
  };
  videoRef: RefObject<HTMLVideoElement>;
  inviteRef: RefObject<HTMLInputElement>;

  audioRefuse = false;
  videoRefuse = false;

  constructor(props: ZegoBrowserCheckProp) {
    super(props);
    this.videoRef = React.createRef();
    this.inviteRef = React.createRef();
  }

  async componentDidMount() {
    const res = await this.props.core.checkWebRTC();
    const videoOpen = !!this.props.core._config.cameraEnabled;
    const audioOpen = !!this.props.core._config.micEnabled;
    let localStream: MediaStream | undefined = undefined;
    this.setState({
      videoOpen,
      audioOpen,
    });
    if (res && (videoOpen || audioOpen)) {
      localStream = await this.createStream(videoOpen, audioOpen);
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
            facingMode: "user",
            videoQuality: 4,
            width: 480,
            height: 640,
            bitrate: 500,
            frameRate: 15,
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
      const videoOpen = !this.state.videoOpen;
      if (!this.state.localVideoStream) {
        const res = await this.createStream(videoOpen, false);
      } else {
        (this.state.localVideoStream as MediaStream)
          .getTracks()
          .reverse()
          .forEach((track) => track.stop());
        this.setState({ localVideoStream: undefined });
      }
      this.setState({ videoOpen });
    } else if (type === "audio" && !this.audioRefuse) {
      const audioOpen = !this.state.audioOpen;
      if (!this.state.localAudioStream) {
        const res = await this.createStream(this.state.videoOpen, audioOpen);
      } else {
        this.props.core.muteMicrophone(audioOpen);
      }
      this.setState({ audioOpen });
    }
  }

  async joinRoom() {
    this.props.core._expressConfig.userName = this.state.userName;
    this.props.core._config.micEnabled =
      this.state.audioOpen && !this.audioRefuse;
    this.props.core._config.cameraEnabled =
      this.state.videoOpen && !this.videoRefuse;
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

  render(): React.ReactNode {
    let page;
    if (!this.state.isSupportWebRTC) {
      page = page = (
        <ZegoModel
          header={"Browser not supported"}
          contentText={
            "The current browser is not available for you to join the room."
          }
        ></ZegoModel>
      );
    } else {
      page = (
        <div className={ZegoBrowserCheckCss.ZegoBrowserCheckSupport}>
          <div className={ZegoBrowserCheckCss.videoScree}>
            <video
              className={ZegoBrowserCheckCss.video}
              autoPlay
              muted
              ref={this.videoRef}
            ></video>
            <div className={ZegoBrowserCheckCss.handler}>
              {this.props.core._config.userCanToggleSelfMic && (
                <a
                  className={
                    this.state.audioOpen
                      ? ZegoBrowserCheckCss.micOpen
                      : ZegoBrowserCheckCss.micClose
                  }
                  onClick={() => {
                    this.toggleStream("audio");
                  }}
                ></a>
              )}
              {this.props.core._config.userCanToggleSelfCamera && (
                <a
                  className={
                    this.state.videoOpen
                      ? ZegoBrowserCheckCss.cameraOpen
                      : ZegoBrowserCheckCss.cameraClose
                  }
                  onClick={() => {
                    this.toggleStream("video");
                  }}
                ></a>
              )}
            </div>
          </div>
          <div className={ZegoBrowserCheckCss.joinScreen}>
            <div
              className={`${ZegoBrowserCheckCss.joinRoom} ${ZegoBrowserCheckCss.focus}`}
            >
              {this.state.userName && <label>Your Name</label>}
              <input
                placeholder="Your Name"
                value={this.state.userName}
                onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                  this.handleChange(ev);
                }}
              ></input>
              <button
                className={this.state.userName && ZegoBrowserCheckCss.active}
                onClick={() => {
                  this.joinRoom();
                }}
              >
                Join
              </button>
            </div>
            <div className={ZegoBrowserCheckCss.inviteLink}>
              <input
                placeholder="inviteLink"
                readOnly
                value={this.props.core._config.joinScreen?.inviteURL}
                ref={this.inviteRef}
              ></input>
              <button
                className={this.state.copied ? ZegoBrowserCheckCss.copied : ""}
                onClick={() => {
                  this.inviteRef.current &&
                    copy(this.inviteRef.current.value, this.inviteRef.current);
                  this.setState({
                    copied: true,
                  });
                  setTimeout(() => {
                    this.setState({
                      copied: false,
                    });
                  }, 5000);
                }}
              ></button>
            </div>
          </div>
        </div>
      );
    }
    return page;
  }
}
