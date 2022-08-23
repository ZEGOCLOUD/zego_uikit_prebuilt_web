import React, { ChangeEvent, RefObject } from "react";
import ZegoBrowserCheckCss from "./index.module.scss";
import { copy } from "../../../modules/tools/util";
import { ZegoBrowserCheckProp } from "../../../model";
import { ZegoSettingsAlert } from "../../components/zegoSetting";
import { ZegoModel, ZegoModelShow } from "../../components/zegoModel";
import { getVideoResolution } from "../../../util";
export class ZegoBrowserCheck extends React.Component<ZegoBrowserCheckProp> {
  state = {
    localStream: undefined,
    localVideoStream: undefined,
    localAudioStream: undefined,
    userName: "xxx",
    videoOpen: true,
    audioOpen: true,
    isVideoOpening: true, // 摄像头正在开启中
    isCopied: false, //  是否已经点击复制链接
    isJoinRoomFailed: false, // 是否加入房间失败
    joinRoomErrorTip: `Failed to join the room.`, // 加入房间失败提示
    showDeviceAuthorAlert: false, // 控制设备权限警告弹窗
    seletMic: undefined,
    seletSpeaker: undefined,
    seletCamera: undefined,
    seletVideoResolution: "360",
    isJoining: false, // 是否正在加入房间，防止重复点击join
    showNonVideo: this.props.core._config.showNonVideoUser,
  };
  videoRef: RefObject<HTMLVideoElement>;
  inviteRef: RefObject<HTMLInputElement>;

  audioRefuse = this.props.core.status.audioRefuse;
  videoRefuse = this.props.core.status.videoRefuse;

  constructor(props: ZegoBrowserCheckProp) {
    super(props);
    this.videoRef = React.createRef();
    this.inviteRef = React.createRef();
  }

  async componentDidMount() {
    this.setState({
      userName: this.props.core._expressConfig.userName,
    });
    const videoOpen = !!this.props.core._config.turnOnCameraWhenJoining;
    const audioOpen = !!this.props.core._config.turnOnMicrophoneWhenJoining;
    if (videoOpen || audioOpen) {
      const devices = await this.getDevices();
      this.setState(
        {
          ...devices,
        },
        async () => {
          if (videoOpen || audioOpen) {
            await this.createStream(videoOpen, audioOpen);
          } else {
            this.setState({
              audioOpen: audioOpen,
              videoOpen: videoOpen,
            });
          }
        }
      );
    } else {
      this.setState({
        audioOpen: audioOpen,
        videoOpen: videoOpen,
      });
    }
  }
  async getDevices() {
    const micDevices = await this.props.core.getMicrophones();
    let speakerDevices = await this.props.core.getSpeakers();
    const cameraDevices = await this.props.core.getCameras();
    if (!speakerDevices.length) {
      if (
        (/Safari/.test(navigator.userAgent) &&
          !/Chrome/.test(navigator.userAgent)) ||
        /Firefox/.test(navigator.userAgent)
      ) {
        speakerDevices.push({
          deviceID: "default",
          deviceName: "efault speaker",
        });
      }
    }
    // 防止设备移出后，再次使用缓存设备ID
    const mic = micDevices.filter(
      (device) => device.deviceID === sessionStorage.getItem("seletMic")
    );
    const cam = cameraDevices.filter(
      (device) => device.deviceID === sessionStorage.getItem("seletCamera")
    );
    const speaker = speakerDevices.filter(
      (device) => device.deviceID === sessionStorage.getItem("seletSpeaker")
    );
    return {
      seletMic: mic[0]?.deviceID || micDevices[0]?.deviceID || undefined,
      seletSpeaker:
        speaker[0]?.deviceID || speakerDevices[0]?.deviceID || undefined,
      seletCamera: cam[0]?.deviceID || cameraDevices[0]?.deviceID || undefined,
      seletVideoResolution:
        sessionStorage.getItem("seletVideoResolution") || "360",
    };
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
        const solution = getVideoResolution(this.state.seletVideoResolution);
        localVideoStream = await this.props.core.createStream({
          camera: {
            video: true,
            audio: false,
            videoInput: this.state.seletCamera,
            videoQuality: 4,
            ...solution,
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
            audioInput: this.state.seletMic,
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
        isVideoOpening: false,
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
        ZegoModelShow({
          header: "Equipment authorization",
          contentText:
            "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
          okText: "Okay",
        });
        return;
      }
      const videoOpen = !this.state.videoOpen;
      if (!this.state.localVideoStream) {
        await this.createStream(videoOpen, this.state.audioOpen);
      } else {
        this.props.core.destroyStream(this.state.localVideoStream);
        this.setState({ localVideoStream: undefined });
        if (
          /Firefox/.test(navigator.userAgent) &&
          this.videoRef.current &&
          this.state.localStream
        ) {
          this.videoRef.current.srcObject = this.videoRef.current.srcObject;
        }
      }
      this.setState({ videoOpen });
    } else if (type === "audio") {
      if (this.audioRefuse) {
        ZegoModelShow({
          header: "Equipment authorization",
          contentText:
            "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
          okText: "Okay",
        });
        return;
      }
      const audioOpen = !this.state.audioOpen;
      if (!this.state.localAudioStream) {
        await this.createStream(this.state.videoOpen, audioOpen);
      } else {
        this.props.core.muteMicrophone(this.state.audioOpen);
      }
      this.setState({ audioOpen });
    }
  }

  async joinRoom() {
    if (!this.state.userName.length) return;
    if (this.state.isJoining) return;
    this.setState(
      {
        isJoining: true,
      },
      async () => {
        this.props.core._expressConfig.userName = this.state.userName;
        this.props.core._config.turnOnMicrophoneWhenJoining =
          this.state.audioOpen && !this.audioRefuse;
        this.props.core._config.turnOnCameraWhenJoining =
          this.state.videoOpen && !this.videoRefuse;
        this.props.core.status.audioRefuse = this.audioRefuse;
        this.props.core.status.videoRefuse = this.videoRefuse;

        this.props.core.status.micDeviceID = this.state.seletMic;
        this.props.core.status.cameraDeviceID = this.state.seletCamera;
        this.props.core.status.speakerDeviceID = this.state.seletSpeaker;
        this.props.core.status.videoResolution =
          this.state.seletVideoResolution;
        this.props.core._config.showNonVideoUser = this.state.showNonVideo;
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
          isJoining: false,
        });
      }
    );
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ userName: event.target.value.trim().substring(0, 255) });
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
      initDevices: {
        mic: this.state.seletMic,
        cam: this.state.seletCamera,
        speaker: this.state.seletSpeaker,
        videoResolve: this.state.seletVideoResolution,
        showNonVideoUser: this.state.showNonVideo,
      },
      closeCallBack: () => {},
      onMicChange: (deviceID: string) => {
        this.setState(
          {
            seletMic: deviceID,
          },
          () => {
            this.createStream(this.state.videoOpen, this.state.audioOpen);
          }
        );
      },
      onCameraChange: (deviceID: string) => {
        this.setState(
          {
            seletCamera: deviceID,
          },
          () => {
            this.createStream(this.state.videoOpen, this.state.audioOpen);
          }
        );
      },
      onSpeakerChange: (deviceID: string) => {
        this.setState({
          seletSpeaker: deviceID,
        });
      },
      onVideoResolutionChange: (level: string) => {
        this.setState(
          {
            seletVideoResolution: level,
          },
          () => {
            this.createStream(this.state.videoOpen, this.state.audioOpen);
          }
        );
      },
      onShowNonVideoChange: (selected: boolean) => {
        this.setState({
          showNonVideoUser: selected,
        });
      },
    });
  }

  render(): React.ReactNode {
    return (
      <div className={ZegoBrowserCheckCss.support}>
        <div className={ZegoBrowserCheckCss.supportWrapper}>
          <div className={ZegoBrowserCheckCss.videoWrapper}>
            <video
              className={ZegoBrowserCheckCss.video}
              autoPlay
              muted
              ref={this.videoRef}
            ></video>
            {!this.state.videoOpen && !this.state.isVideoOpening && (
              <div className={ZegoBrowserCheckCss.videoTip}>Camera is off</div>
            )}
            {this.state.isVideoOpening && (
              <div className={ZegoBrowserCheckCss.videoTip}>
                Camera is starting…
              </div>
            )}

            <div className={ZegoBrowserCheckCss.toolsWrapper}>
              {this.props.core._config.showMyMicrophoneToggleButton && (
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
                      ? "Turn off microphone"
                      : "Turn on microphone"}
                  </span>
                </div>
              )}
              {this.props.core._config.showMyCameraToggleButton && (
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
                      ? "Turn off camera"
                      : "Turn on camera"}
                  </span>
                </div>
              )}
              {this.props.core._config.showAudioVideoSettingsButton && (
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
                {this.props.core._config.preJoinViewConfig?.title}
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
                  {this.state.isJoining && (
                    <span
                      className={ZegoBrowserCheckCss.joinRoomButtonLoading}
                    ></span>
                  )}
                  join
                </button>
                {this.state.isJoinRoomFailed && (
                  <div className={ZegoBrowserCheckCss.joinRoomButtonTip}>
                    {this.state.joinRoomErrorTip}
                  </div>
                )}
              </div>
            </div>

            {this.props.core._config.preJoinViewConfig?.invitationLink && (
              <div className={ZegoBrowserCheckCss.shareLinkWrapper}>
                <div className={ZegoBrowserCheckCss.title}>Share the Link</div>
                <div className={ZegoBrowserCheckCss.inviteLinkWrapper}>
                  <input
                    className={ZegoBrowserCheckCss.inviteLink}
                    placeholder="inviteLink"
                    readOnly
                    value={
                      this.props.core._config.preJoinViewConfig?.invitationLink
                    }
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
            )}
          </div>
        </div>
        {this.state.showDeviceAuthorAlert && (
          <ZegoModel
            header={"Equipment authorization"}
            contentText={
              "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again."
            }
            okText="Okay"
            onOk={() => {
              this.setState({ showDeviceAuthorAlert: false });
            }}
          ></ZegoModel>
        )}
      </div>
    );
  }
}
