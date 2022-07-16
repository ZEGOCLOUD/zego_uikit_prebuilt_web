import React, { ChangeEvent, RefObject } from "react";
import ZegoBrowserCheckCss from "./index.module.scss";
import { copy } from "../../../modules/util";
import { ZegoBrowserCheckProp } from "../../../model";
import { ZegoSettingsAlert } from "../../components/zegoSetting";
import { ZegoModel } from "../../components/zegoModel";
export class ZegoBrowserCheck extends React.Component<ZegoBrowserCheckProp> {
  state = {
    isSupportWebRTC: undefined,
    localStream: undefined,
    localVideoStream: undefined,
    localAudioStream: undefined,
    userName: "xxx",
    videoOpen: true,
    audioOpen: true,
    isVideoOpening: false, // 摄像头正在开启中
    isCopied: false, //  是否已经点击复制链接
    isJoinRoomFailed: false, // 是否加入房间失败
    joinRoomErrorTip: `Failed to join the room.`, // 加入房间失败提示
    showDeviceAuthorAlert: false, // 控制设备权限警告弹窗
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
    this.setState({
      videoOpen: !!this.props.core._config.cameraEnabled,
      audioOpen: !!this.props.core._config.micEnabled,
    });

    if (res && (this.state.videoOpen || this.state.audioOpen)) {
      await this.createStream(this.state.videoOpen, this.state.audioOpen);
      //   TODO
      this.setState({
        isSupportWebRTC: res,
        // isSupportWebRTC: true, // 调试
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
        this.setState({
          isVideoOpening: true,
        });
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
          isVideoOpening: false,
          localVideoStream,
        });
      }
    } catch (error) {
      this.videoRefuse = true;
      this.setState({
        isVideoOpening: false,
      });
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
      this.setState({
        videoOpen: !this.state.videoOpen,
      });
      if (!this.state.localVideoStream) {
        this.setState({
          isVideoOpening: true,
        });
        const res = await this.createStream(this.state.videoOpen, false);
        res.getVideoTracks().length > 0 &&
          this.setState({
            videoOpen: !this.state.videoOpen,
            isVideoOpening: false,
          });
      } else {
        (this.state.localVideoStream as MediaStream)
          .getTracks()
          .reverse()
          .forEach((track) => track.stop());
        this.setState({ localVideoStream: undefined });
      }
    } else if (type === "audio" && !this.audioRefuse) {
      this.setState({
        audioOpen: !this.state.audioOpen,
      });
      if (!this.state.localAudioStream) {
        const res = await this.createStream(
          this.state.videoOpen,
          this.state.audioOpen
        );
        res.getAudioTracks().length > 0 &&
          this.setState({
            audioOpen: !this.state.audioOpen,
          });
      } else {
        this.props.core.muteMicrophone(this.state.audioOpen);
      }
    }
  }

  async joinRoom() {
    if (!this.state.userName.length) return;
    this.props.core._expressConfig.userName = this.state.userName;
    this.props.core._config.micEnabled =
      this.state.audioOpen && !this.audioRefuse;
    this.props.core._config.cameraEnabled =
      this.state.videoOpen && !this.videoRefuse;
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
    this.setState({
      isJoinRoomFailed: !!massage,
      joinRoomErrorTip: massage,
    });
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ userName: event.target.value });
  }
  handleCopy() {
    if (this.state.isCopied) return;
    setTimeout(() => {
      this.setState({
        isCopied: false,
      });
    }, 5000);
    this.inviteRef.current && copy(this.inviteRef.current.value);
    this.setState({
      isCopied: true,
    });
  }
  openSettings() {
    ZegoSettingsAlert({
      core: this.props.core,
      closeCallBack: () => {},
    });
  }
  render(): React.ReactNode {
    let page;
    if (this.state.isSupportWebRTC === false) {
      page = (
        <ZegoModel
          header={"Browser not supported"}
          contentText={
            "The current browser is not available for you to join the room."
          }
        ></ZegoModel>
      );
    } else if (this.state.isSupportWebRTC === true) {
      page = (
        <div className={ZegoBrowserCheckCss.support}>
          <div className={ZegoBrowserCheckCss.supportWrapper}>
            <div className={ZegoBrowserCheckCss.videoWrapper}>
              <video
                className={ZegoBrowserCheckCss.video}
                autoPlay
                muted
                ref={this.videoRef}
              ></video>
              {this.state.isVideoOpening && (
                <div className={ZegoBrowserCheckCss.videoTip}>
                  Camera is starting…
                </div>
              )}
              <div className={ZegoBrowserCheckCss.toolsWrapper}>
                {this.props.core._config.userCanToggleSelfMic && (
                  <div
                    className={`${ZegoBrowserCheckCss.audioButton} ${
                      !this.state.audioOpen && ZegoBrowserCheckCss.close
                    }`}
                    onClick={() => {
                      this.toggleStream("audio");
                    }}
                  >
                    <span className={ZegoBrowserCheckCss.buttonTip}>
                      {this.state.audioOpen
                        ? "Turn off the audio"
                        : "Turn on the audio"}
                    </span>
                  </div>
                )}
                {this.props.core._config.userCanToggleSelfCamera && (
                  <div
                    className={`${ZegoBrowserCheckCss.videoButton} ${
                      !this.state.videoOpen && ZegoBrowserCheckCss.close
                    }`}
                    onClick={() => {
                      this.toggleStream("video");
                    }}
                  >
                    <span className={ZegoBrowserCheckCss.buttonTip}>
                      {this.state.videoOpen
                        ? "Turn off the video"
                        : "Turn on the video"}
                    </span>
                  </div>
                )}
                {this.props.core._config.deviceSettings && (
                  <div
                    className={ZegoBrowserCheckCss.settingsButton}
                    onClick={() => {
                      this.openSettings();
                    }}
                  ></div>
                )}
              </div>
            </div>
            <div className={ZegoBrowserCheckCss.joinScreenWrapper}>
              <div className={ZegoBrowserCheckCss.joinFormWrapper}>
                <div className={ZegoBrowserCheckCss.title}>
                  {this.props.core._config.joinScreen?.title}
                </div>
                <input
                  className={ZegoBrowserCheckCss.userName}
                  placeholder="Your Name"
                  value={this.state.userName}
                  onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                    this.handleChange(ev);
                  }}
                ></input>
                <div className={ZegoBrowserCheckCss.joinRoomButtonWrapper}>
                  <button
                    className={ZegoBrowserCheckCss.joinRoomButton}
                    disabled={!this.state.userName.length}
                    onClick={() => {
                      this.joinRoom();
                    }}
                  >
                    joinRoom
                  </button>
                  {this.state.isJoinRoomFailed && (
                    <div className={ZegoBrowserCheckCss.joinRoomButtonTip}>
                      {this.state.joinRoomErrorTip}
                    </div>
                  )}
                </div>
              </div>

              <div className={ZegoBrowserCheckCss.shareLinkWrapper}>
                <div className={ZegoBrowserCheckCss.title}>Share the Link</div>
                <div className={ZegoBrowserCheckCss.inviteLinkWrapper}>
                  <input
                    className={ZegoBrowserCheckCss.inviteLink}
                    placeholder="inviteLink"
                    readOnly
                    value={this.props.core._config.joinScreen?.inviteURL}
                    ref={this.inviteRef}
                  ></input>
                  <button
                    className={ZegoBrowserCheckCss.copyLinkButton}
                    disabled={this.state.isCopied}
                    onClick={() => {
                      this.handleCopy();
                    }}
                  ></button>
                </div>
              </div>
            </div>
          </div>
          {this.state.showDeviceAuthorAlert && (
            <ZegoModel
              header={"Equipment authorization"}
              contentText={
                "Please allow us to access your camera and microphone in your browser's address bar."
              }
              okText="OK"
              onOk={() => {
                this.setState({ showDeviceAuthorAlert: false });
              }}
            ></ZegoModel>
          )}
        </div>
      );
    }
    return page;
  }
}
