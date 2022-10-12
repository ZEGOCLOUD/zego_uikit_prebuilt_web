import React, { ChangeEvent, FocusEvent, RefObject } from "react";
import ZegoBrowserCheckCss from "./index.module.scss";
import { copy } from "../../../modules/tools/util";
import { ZegoBrowserCheckProp } from "../../../model";
import { ZegoModel } from "../../components/zegoModel";
import { ZegoToast } from "../../components/mobile/zegoToast";
import { ZegoConfirm } from "../../components/mobile/zegoConfirm";
import { ZegoLoading } from "./components/ZegoLoading";
export class ZegoBrowserCheckMobile extends React.Component<ZegoBrowserCheckProp> {
  state = {
    localStream: undefined,
    localVideoStream: undefined,
    localAudioStream: undefined,
    userName: "xxx",
    videoOpen: true,
    audioOpen: true,
    copied: false,
    isVideoOpening: true,
    isJoining: false,
    sharedLinks: this.props.core._config.sharedLinks?.map((link) => {
      return {
        name: link.name,
        url: link.url,
        copied: false,
      };
    }),
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
      await this.createStream(videoOpen, audioOpen);
    } else {
      this.setState({
        audioOpen: audioOpen,
        videoOpen: videoOpen,
        isVideoOpening: false,
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
      if (videoOpen && audioOpen) {
        this.setState({
          isVideoOpening: true,
        });
        localStream = await this.props.core.createStream({
          camera: {
            video: true,
            audio: true,
            facingMode: this.props.core._config.facingMode,
          },
        });
      }
    } catch (error) {
      try {
        if (videoOpen) {
          this.setState({
            isVideoOpening: true,
          });
          localVideoStream = await this.props.core.createStream({
            camera: {
              video: true,
              audio: false,
              facingMode: this.props.core._config.facingMode,
              // videoQuality: 4,
              // width: 640,
              // height: 360,
              // bitrate: 400,
              // frameRate: 15,
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

  async toggleStream2(type: "video" | "audio") {
    if (type === "video") {
      if (this.videoRefuse) {
        ZegoConfirm({
          title: "Equipment authorization",
          content:
            "We can't detect your devices. Please check your devices and allow us access your devices in your browser's address bar. Then reload this page and try again.",
          confirm: "Okay",
        });
        return;
      }
      const videoOpen = !this.state.videoOpen;
      if (!this.state.localVideoStream) {
        await this.createStream(videoOpen, this.state.audioOpen);
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
          confirm: "Okay",
        });
        return;
      }
      const audioOpen = !this.state.audioOpen;
      if (!this.state.localAudioStream) {
        await this.createStream(this.state.videoOpen, audioOpen);
      } else {
        this.props.core.muteMicrophone(audioOpen);
      }
      this.setState({ audioOpen });
    }
  }

  async toggleStream1(type: "video" | "audio") {
    if (type === "video" && this.state.localStream) {
      const videoOpen = !this.state.videoOpen;
      const videoStream: MediaStream = this.state.localStream;
      videoStream.getVideoTracks().map((track) => {
        track.enabled = videoOpen;
      });
      this.setState({ videoOpen });
    } else if (type === "audio" && this.state.localStream) {
      const audioOpen = !this.state.audioOpen;
      const audioStream: MediaStream = this.state.localStream;
      audioStream.getAudioTracks().map((track) => {
        track.enabled = audioOpen;
      });

      this.setState({ audioOpen });
    }
  }

  async toggleStream(type: "video" | "audio") {
    if (
      this.state.videoOpen &&
      this.state.audioOpen &&
      this.state.localStream &&
      !this.state.localAudioStream &&
      !this.state.localVideoStream
    ) {
      this.toggleStream1(type);
    } else {
      this.toggleStream2(type);
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
        this.setState(
          {
            isJoining: false,
          },
          () => {
            massage && ZegoToast({ content: massage });
          }
        );
      }
    );
  }

  handleChange(event: ChangeEvent<HTMLInputElement>) {
    this.setState({ userName: event.target.value.trim().substring(0, 255) });
  }

  render(): React.ReactNode {
    return (
      <div className={ZegoBrowserCheckCss.ZegoBrowserCheckSupport}>
        <div className={ZegoBrowserCheckCss.videoScree}>
          <video
            playsInline={true}
            className={`${ZegoBrowserCheckCss.video} ${
              this.state.videoOpen ? "" : ZegoBrowserCheckCss.hideVideo
            }`}
            autoPlay
            muted
            ref={this.videoRef}
          ></video>
          {!this.props.core._config.showMyCameraToggleButton &&
            !this.props.core._config.turnOnCameraWhenJoining && (
              <div className={ZegoBrowserCheckCss.noCamera}>
                {this.state.userName.substring(0, 1) ||
                  this.props.core._expressConfig.userName.substring(0, 1) ||
                  "Z"}
              </div>
            )}

          {(this.props.core._config.showMyCameraToggleButton ||
            this.props.core._config.turnOnCameraWhenJoining) &&
            !this.state.videoOpen &&
            !this.state.isVideoOpening && (
              <div className={ZegoBrowserCheckCss.videoTip}>Camera is off</div>
            )}
          {this.state.isVideoOpening && (
            <div className={ZegoBrowserCheckCss.videoTip}>
              Camera is starting…
            </div>
          )}
          <div className={ZegoBrowserCheckCss.handler}>
            {this.props.core._config.showMyMicrophoneToggleButton && (
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
            {this.props.core._config.showMyCameraToggleButton && (
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
                ev.target.scrollIntoView();
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
          {this.state.sharedLinks?.map((link) => {
            return (
              <div className={ZegoBrowserCheckCss.inviteLink} key={link.name}>
                <div className={ZegoBrowserCheckCss.inviteLinkWrapperLeft}>
                  <h3>{link.name}</h3>
                  <input
                    placeholder="inviteLink"
                    readOnly
                    value={link.url}
                  ></input>
                </div>
                <button
                  className={link.copied ? ZegoBrowserCheckCss.copied : ""}
                  onClick={() => {
                    link && link.url && copy(link.url);
                    this.setState((preState: { sharedLinks: any[] }) => {
                      return {
                        sharedLinks: preState.sharedLinks.map((l) => {
                          if (l.name === link.name) {
                            l.copied = true;
                          }
                          return l;
                        }),
                      };
                    });
                    setTimeout(() => {
                      this.setState((preState: { sharedLinks: any[] }) => {
                        return {
                          sharedLinks: preState.sharedLinks.map((l) => {
                            if (l.name === link.name) {
                              l.copied = false;
                            }
                            return l;
                          }),
                        };
                      });
                    }, 5000);
                  }}
                ></button>
              </div>
            );
          })}
        </div>

        {this.state.isJoining && (
          <ZegoLoading content="Loading..."></ZegoLoading>
        )}
      </div>
    );
  }
}
