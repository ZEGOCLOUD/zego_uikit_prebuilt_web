import React, { ChangeEvent, RefObject } from "react";
import ZegoBrowserCheckCss from "./index.module.scss";
import { copy } from "../../../modules/util";
import { ZegoBrowserCheckProp } from "../../../model";
import { ZegoModel } from "../../components/zegoModel";
import { ZegoToast } from "../../components/mobile/zegoToast";
import { ZegoConfirm } from "../../components/mobile/zegoConfirm";
export class ZegoBrowserCheckMobile extends React.Component<ZegoBrowserCheckProp> {
  state = {
    isSupportWebRTC: undefined,
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
    if (res && (videoOpen || audioOpen)) {
      await this.createStream(videoOpen, audioOpen);
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
            width: 640,
            height: 480,
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
        audioOpen: audioOpen && !this.audioRefuse,
        videoOpen: videoOpen && !this.videoRefuse,
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
    if (type === "video") {
      if (this.videoRefuse) {
        ZegoConfirm({
          title: "Equipment authorization",
          content:
            "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
          confirm: "OK",
        });
        return;
      }
      const videoOpen = !this.state.videoOpen;
      if (!this.state.localVideoStream) {
        const res = await this.createStream(videoOpen, this.state.audioOpen);
      } else {
        (this.state.localVideoStream as MediaStream)
          .getTracks()
          .reverse()
          .forEach((track) => track.stop());
        this.setState({ localVideoStream: undefined });
      }
      this.setState({ videoOpen });
    } else if (type === "audio") {
      if (this.audioRefuse) {
        ZegoConfirm({
          title: "Equipment authorization",
          content:
            "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
          confirm: "OK",
        });
        return;
      }
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
    this.props.core.status.audioRefuse = this.audioRefuse;
    this.props.core.status.videoRefuse = this.videoRefuse;

    const loginRsp = await this.props.core.enterRoom();
    let massage = "";
    if (loginRsp === 0) {
      this.state.localStream &&
        this.props.core.destroyStream(this.state.localStream);
      this.props.joinRoom && this.props.joinRoom();
    } else if (loginRsp === 1002034) {
      // 登录房间的用户数超过该房间配置的最大用户数量限制（测试环境下默认房间最大用户数为 50，正式环境无限制）。
      massage =
        "Failed to join the room, the number of people in the room has reached the maximum.(2 people)";
    } else if ([1002031, 1002053].includes(loginRsp)) {
      //登录房间超时，可能是由于网络原因导致。
      massage =
        "There's something wrong with your network. Please check it and try again.";
    } else if ([1102018, 1102016, 1102020].includes(loginRsp)) {
      // 登录 token 错误，
      massage = "Failed to join the room, token authentication error.";
    } else if (1002056 === loginRsp) {
      // 用户重复进行登录。
      massage =
        "You are on a call in another room, please leave that room first.";
    } else {
      massage =
        "Failed to join the room, please try again.(error code:" +
        loginRsp +
        ")";
    }
    massage && ZegoToast({ content: massage });
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ userName: event.target.value });
  }

  render(): React.ReactNode {
    let page;
    if (this.state.isSupportWebRTC === false) {
      page = page = (
        <ZegoModel
          header={"Browser not supported"}
          contentText={
            "The current browser is not available for you to join the room."
          }
        ></ZegoModel>
      );
    } else if (this.state.isSupportWebRTC === true) {
      page = (
        <div className={ZegoBrowserCheckCss.ZegoBrowserCheckSupport}>
          <div className={ZegoBrowserCheckCss.videoScree}>
            <video
              playsInline={true}
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
                  this.inviteRef.current && copy(this.inviteRef.current.value);
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
