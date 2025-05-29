import React, { ChangeEvent, RefObject } from "react";
import ZegoBrowserCheckCss from "./index.module.scss";
import { copy } from "../../../modules/tools/util";
import { ZegoBrowserCheckProp } from "../../../model";
import { ZegoSettings } from "../../components/zegoSetting";
import { ZegoModelShow } from "../../components/zegoModel";
import { getVideoResolution, throttle } from "../../../util";
import { FormattedMessage } from "react-intl";
import ZegoLocalStream from "zego-express-engine-webrtc/sdk/code/zh/ZegoLocalStream.web"

export class ZegoBrowserCheck extends React.Component<ZegoBrowserCheckProp> {
  state = {
    localStream: undefined,
    // localVideoStream: undefined,
    // localAudioStream: undefined,
    userName: "xxx",
    videoOpen: true,
    audioOpen: true,
    isVideoOpening: true, // 摄像头正在开启中
    isCopied: false, //  是否已经点击复制链接
    isJoinRoomFailed: false, // 是否加入房间失败
    joinRoomErrorTip: `Failed to join the room.`, // 加入房间失败提示
    selectMic: undefined,
    selectSpeaker: undefined,
    selectCamera: undefined,
    selectVideoResolution: this.props.core._config.videoResolutionList![0],
    isJoining: false, // 是否正在加入房间，防止重复点击join
    showNonVideo: this.props.core._config.showNonVideoUser,
    sharedLinks: this.props.core._config.sharedLinks?.map((link) => {
      return {
        name: link.name,
        url: link.url,
        copied: false,
      };
    }),
    showZegoSettings: false,
    isSmallSize: false,
  };
  localVideoRef: RefObject<HTMLDivElement>;
  videoRef: RefObject<HTMLVideoElement>;
  inviteRef: RefObject<HTMLInputElement>;

  audioRefuse = this.props.core.status.audioRefuse;
  videoRefuse = this.props.core.status.videoRefuse;

  constructor(props: ZegoBrowserCheckProp) {
    super(props);
    this.videoRef = React.createRef();
    this.inviteRef = React.createRef();
    this.localVideoRef = React.createRef();
  }

  async componentDidMount() {
    this.onResize();
    window.addEventListener("resize", this.throttleResize.bind(this), false);
    this.props.core.zg.on("videoDeviceStateChanged", async (updateType: 'DELETE' | 'ADD', deviceInfo: { deviceName: string; deviceID: string; }) => {
      console.warn('[ZegoCloudRTCCore]videoDeviceStateChanged]', updateType, deviceInfo);
      if (updateType === 'DELETE') {
        const { selectCamera } = this.state;
        if (selectCamera === deviceInfo.deviceID) {
          const cameraDevices = await this.props.core.getCameras();
          this.setState({
            selectCamera: cameraDevices[0]?.deviceID,
          });
          this.props.core.useCameraDevice(this.state.localStream!, cameraDevices[0]?.deviceID);
        }
      }
    })
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
        isVideoOpening: false,
      });
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.throttleResize.bind(this), false);
    this.state.localStream &&
      this.props.core.destroyStream(this.state.localStream);
  }
  onResize() {
    if (
      this.props.core._config.container!.offsetWidth < 960 ||
      this.props.core._config.container!.offsetHeight <= 530
    ) {
      this.setState({
        isSmallSize: true,
      });
    } else {
      this.setState({
        isSmallSize: false,
      });
    }
  }
  throttleResize = throttle(this.onResize.bind(this), 300);
  async getDevices() {
    const micDevices = await this.props.core.getMicrophones();
    // 防止设备移出后，再次使用缓存设备ID
    const mic = micDevices.filter(
      (device) => device.deviceID === sessionStorage.getItem("selectMic")
    );

    let speakerDevices = await this.props.core.getSpeakers();
    if (!speakerDevices.length) {
      if (
        (/Safari/.test(navigator.userAgent) &&
          !/Chrome/.test(navigator.userAgent)) ||
        /Firefox/.test(navigator.userAgent)
      ) {
        speakerDevices.push({
          deviceID: "default",
          deviceName: "default speaker",
        });
      }
    }
    const speaker = speakerDevices.filter(
      (device) => device.deviceID === sessionStorage.getItem("selectSpeaker")
    );

    let cam, cameraDevices;
    if (
      !!this.props.core._config.turnOnCameraWhenJoining ||
      !!this.props.core._config.showMyCameraToggleButton
    ) {
      cameraDevices = await this.props.core.getCameras();
      cam = cameraDevices.filter(
        (device) => device.deviceID === sessionStorage.getItem("selectCamera")
      );
    }

    return {
      selectMic: mic[0]?.deviceID || micDevices[0]?.deviceID || undefined,
      selectSpeaker:
        speaker[0]?.deviceID || speakerDevices[0]?.deviceID || undefined,
      selectCamera:
        (cam && cam[0]?.deviceID) ||
        (cameraDevices && cameraDevices[0]?.deviceID) ||
        undefined,
      selectVideoResolution:
        sessionStorage.getItem("selectVideoResolution") ||
        this.props.core._config.videoResolutionList![0],
    };
  }
  async createStream(
    videoOpen: boolean,
    audioOpen: boolean
  ): Promise<ZegoLocalStream | undefined> {
    let localStream: ZegoLocalStream | undefined;
    console.warn('[ZegoBrowserCheck]createstream', videoOpen, audioOpen, this.state.selectCamera, this.state);
    try {
      // 开关摄像头时才提示
      if (videoOpen) {
        this.setState({
          isVideoOpening: true,
        });
      }
      const solution = getVideoResolution(this.state.selectVideoResolution);
      localStream = await this.props.core.createZegoStream({
        camera: {
          video: {
            input: this.state.selectCamera,
            quality: 4,
            ...solution,
          },
          audio: {
            input: this.state.selectMic
          },
        },
        videoBitrate: solution.bitrate
      }, true);
    } catch (error: any) {
      this.videoRefuse = true;
      this.audioRefuse = true;
      this.setState({
        isVideoOpening: false,
      });
      console.error(
        "【ZEGOCLOUD】toggleStream/createStream failed !!",
        JSON.stringify(error)
      );
      if (error && error.errorCode === 1103064) {
        //@ts-ignore
        navigator.permissions.query({ name: "microphone" }).then(permissionStatus => {
          console.log('麦克风权限状态:', permissionStatus.state);
          if (permissionStatus.state === 'granted') {
            this.audioRefuse = false;
          }
        });
        //@ts-ignore
        navigator.permissions.query({ name: "camera" }).then(permissionStatus => {
          console.log('摄像头权限状态:', permissionStatus.state);
          if (permissionStatus.state === 'granted') {
            this.videoRefuse = false;
          }
        });
        const { formatMessage } = this.props.core.intl;
        ZegoModelShow(
          {
            header: formatMessage({ id: "global.equipment" }),
            contentText: formatMessage({ id: "global.equipmentDesc" }),
            okText: "Okay",
          },
          document.querySelector(`.${ZegoBrowserCheckCss.support}`)
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
        if (this.localVideoRef.current && localStream) {
          if (videoOpen) {
            localStream.playVideo(this.localVideoRef.current, { mirror: this.props.core._config.videoScreenConfig?.mirror, objectFit: 'cover' });
          } else {
            localStream.stopVideo();
          }
          this.props.core.enableVideoCaptureDevice(localStream, videoOpen);
        }
      }
    );
    return localStream;
  }

  async toggleStream(type: "video" | "audio") {
    const { formatMessage } = this.props.core.intl;
    if (type === "video") {
      if (this.videoRefuse) {
        ZegoModelShow(
          {
            header: formatMessage({ id: "global.equipment" }),
            contentText: formatMessage({ id: "global.equipmentDesc" }),
            okText: "Okay",
          },
          document.querySelector(`.${ZegoBrowserCheckCss.support}`)
        );
        return;
      }
      const videoOpen = !this.state.videoOpen;
      if (!this.state.localStream) {
        if (!this.state.selectCamera || !this.state.selectMic || !this.state.selectSpeaker) {
          const devices = await this.getDevices();
          this.setState({
            ...devices
          }, async () => {
            await this.createStream(videoOpen, this.state.audioOpen);
          })
        } else {
          await this.createStream(videoOpen, this.state.audioOpen);
        }
      } else {
        if (videoOpen && this.localVideoRef.current) {
          (this.state.localStream as ZegoLocalStream).playVideo(this.localVideoRef.current, { objectFit: 'cover' });
        } else {
          (this.state.localStream as ZegoLocalStream).stopVideo();
        }
        this.props.core.enableVideoCaptureDevice(this.state.localStream, videoOpen);
        // if (
        //   /Firefox/.test(navigator.userAgent) &&
        //   this.videoRef.current &&
        //   this.state.localStream
        // ) {
        //   // eslint-disable-next-line no-self-assign
        //   this.videoRef.current.srcObject = this.videoRef.current.srcObject;
        // }
      }
      this.setState({ videoOpen });
    } else if (type === "audio") {
      if (this.audioRefuse) {
        ZegoModelShow(
          {
            header: formatMessage({ id: "global.equipment" }),
            contentText: formatMessage({ id: "global.equipmentDesc" }),
            okText: "Okay",
          },
          document.querySelector(`.${ZegoBrowserCheckCss.support}`)
        );
        return;
      }
      const audioOpen = !this.state.audioOpen;
      if (!this.state.localStream) {
        if (!this.state.selectCamera || !this.state.selectMic || !this.state.selectSpeaker) {
          const devices = await this.getDevices();
          this.setState({
            ...devices
          }, async () => {
            await this.createStream(this.state.videoOpen, audioOpen);
          })
        } else {
          await this.createStream(this.state.videoOpen, audioOpen);
        }
      } else {
        if (audioOpen) {
          (this.state.localStream as ZegoLocalStream).playAudio();
        } else {
          (this.state.localStream as ZegoLocalStream).stopAudio();
        }
        this.props.core.muteMicrophone(audioOpen);
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
        this.props.core._expressConfig.userName = this.state.userName.trim().substring(0, 255);
        this.props.core._config.turnOnMicrophoneWhenJoining = this.state.audioOpen && !this.audioRefuse;
        this.props.core._config.turnOnCameraWhenJoining = this.state.videoOpen && !this.videoRefuse;
        this.props.core.status.audioRefuse = this.audioRefuse;
        this.props.core.status.videoRefuse = this.videoRefuse;

        this.props.core.status.micDeviceID = this.state.selectMic;
        this.props.core.status.cameraDeviceID = this.state.selectCamera;
        this.props.core.status.speakerDeviceID = this.state.selectSpeaker;
        this.props.core.status.videoResolution = this.state.selectVideoResolution;
        this.props.core._config.showNonVideoUser = this.state.showNonVideo;
        const loginRsp = await this.props.core.enterRoom();

        let massage = "";
        if (loginRsp === 0) {
          // this.state.localAudioStream && this.props.core.destroyStream(this.state.localAudioStream);
          this.state.localStream && this.props.core.destroyStream(this.state.localStream);
          this.props.joinRoom && this.props.joinRoom();
        } else if (loginRsp === 1002034) {
          // 登录房间的用户数超过该房间配置的最大用户数量限制（测试环境下默认房间最大用户数为 50，正式环境无限制）。
          massage =
            "Failed to join the room, the number of people in the room has reached the maximum.(2 people)";
        } else if ([1002031, 1002053].includes(loginRsp)) {
          //登录房间超时，可能是由于网络原因导致。
          massage = "There's something wrong with your network. Please check it and try again.";
        } else if ([1102018, 1102016, 1102020].includes(loginRsp)) {
          // 登录 token 错误，
          massage = "Failed to join the room, token authentication error.";
        } else if (1002056 === loginRsp) {
          // 用户重复进行登录。
          massage = "You are on a call in another room, please leave that room first.";
        } else {
          massage = "Failed to join the room, please try again.(error code:" + loginRsp + ")";
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
    if (event.target.value.length <= 1) {
      const value = event.target.value.trim();
      this.setState({ userName: value.length > 0 ? value : "" });
    } else {
      this.setState({ userName: event.target.value.substring(0, 255) });
    }

  }

  openSettings() {
    this.setState({
      showZegoSettings: true,
    });
  }

  render(): React.ReactNode {
    const { formatMessage } = this.props.core.intl;
    return (
      <div
        className={`${ZegoBrowserCheckCss.support} ${this.state.isSmallSize ? ZegoBrowserCheckCss.smallSize : ""
          }`}>
        <div className={ZegoBrowserCheckCss.supportWrapper}>
          <div className={ZegoBrowserCheckCss.videoWrapper}>
            <div ref={this.localVideoRef}
              className={ZegoBrowserCheckCss.video}></div>
            {/* <video
              className={ZegoBrowserCheckCss.video}
              autoPlay
              muted
              ref={this.videoRef}></video> */}
            {!this.props.core._config.showMyCameraToggleButton &&
              !this.props.core._config.turnOnCameraWhenJoining && (
                <div className={ZegoBrowserCheckCss.noCamera}>
                  {this.state.userName.substring(0, 1) ||
                    this.props.core._expressConfig.userName.substring(0, 1) ||
                    "Z"}
                </div>
              )}
            {(this.props.core._config.showMyCameraToggleButton ||
              this.props.core._config.turnOnCameraWhenJoining) && (
                <div className={ZegoBrowserCheckCss.videoTip}>
                  {!this.state.videoOpen &&
                    !this.state.isVideoOpening &&
                    <FormattedMessage id="browserCheck.cameraDesc" />}
                  {this.state.isVideoOpening && <FormattedMessage id="browserCheck.cameraStart" />}
                </div>
              )}
            <div className={ZegoBrowserCheckCss.toolsWrapper}>
              {this.props.core._config.showMyMicrophoneToggleButton && (
                <div
                  className={`${ZegoBrowserCheckCss.audioButton} ${!this.state.audioOpen && ZegoBrowserCheckCss.close
                    }`}
                  onClick={() => {
                    this.toggleStream("audio");
                  }}>
                  <span className={ZegoBrowserCheckCss.buttonTip}>
                    {this.state.audioOpen
                      ? <FormattedMessage id="global.turnOffMicrophone" />
                      : <FormattedMessage id="global.turnOnMicrophone" />}
                  </span>
                </div>
              )}
              {this.props.core._config.showMyCameraToggleButton && (
                <div
                  className={`${ZegoBrowserCheckCss.videoButton} ${!this.state.videoOpen && ZegoBrowserCheckCss.close
                    }`}
                  onClick={() => {
                    this.toggleStream("video");
                  }}>
                  <span className={ZegoBrowserCheckCss.buttonTip}>
                    {this.state.videoOpen
                      ? <FormattedMessage id="global.turnOffCamera" />
                      : <FormattedMessage id="global.turnOnCamera" />}
                  </span>
                </div>
              )}
              {this.props.core._config.showAudioVideoSettingsButton && (
                <div
                  className={ZegoBrowserCheckCss.settingsButton}
                  onClick={() => {
                    this.openSettings();
                  }}>
                  <span className={ZegoBrowserCheckCss.buttonTip}>
                    <FormattedMessage id="global.settings" />
                  </span>
                </div>
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
                placeholder={formatMessage({ id: 'browserCheck.placeholder' })}
                value={this.state.userName}
                onChange={(ev: ChangeEvent<HTMLInputElement>) => {
                  this.handleChange(ev);
                }}></input>
              <div className={ZegoBrowserCheckCss.joinRoomButtonWrapper}>
                <button
                  className={ZegoBrowserCheckCss.joinRoomButton}
                  disabled={!this.state.userName.length}
                  onClick={() => {
                    this.joinRoom();
                  }}>
                  {this.state.isJoining && (
                    <span
                      className={
                        ZegoBrowserCheckCss.joinRoomButtonLoading
                      }></span>
                  )}
                  <FormattedMessage id="browserCheck.join" />
                  {/* {intl.formatMessage({ id: 'browserCheck.join' })} */}
                </button>
                {this.state.isJoinRoomFailed && (
                  <div className={ZegoBrowserCheckCss.joinRoomButtonTip}>
                    {this.state.joinRoomErrorTip}
                  </div>
                )}
              </div>
            </div>

            {this.state?.sharedLinks && this.state?.sharedLinks?.length > 0 && (
              <div className={ZegoBrowserCheckCss.shareLinkWrapper}>
                <div className={ZegoBrowserCheckCss.title}><FormattedMessage id="browserCheck.shareTitle" /></div>
                {this.state.sharedLinks?.map((link) => {
                  return (
                    <div
                      className={ZegoBrowserCheckCss.inviteLinkWrapper}
                      key={link.name}>
                      <div
                        className={ZegoBrowserCheckCss.inviteLinkWrapperLeft}>
                        <h3>{link.name}</h3>
                        <input
                          className={ZegoBrowserCheckCss.inviteLink}
                          placeholder="inviteLink"
                          readOnly
                          value={link.url}></input>
                      </div>
                      <button
                        className={ZegoBrowserCheckCss.copyLinkButton}
                        disabled={link.copied}
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
                            this.setState(
                              (preState: { sharedLinks: any[] }) => {
                                return {
                                  sharedLinks: preState.sharedLinks.map((l) => {
                                    if (l.name === link.name) {
                                      l.copied = false;
                                    }
                                    return l;
                                  }),
                                };
                              }
                            );
                          }, 5000);
                        }}></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {this.state.showZegoSettings && (
          <ZegoSettings
            core={this.props.core}
            initDevices={{
              mic: this.state.selectMic,
              cam: this.state.selectCamera,
              speaker: this.state.selectSpeaker,
              videoResolve: this.state.selectVideoResolution,
              showNonVideoUser: this.state.showNonVideo,
            }}
            closeCallBack={() => {
              this.setState({
                showZegoSettings: false,
              });
            }}
            onMicChange={(deviceID: string) => {
              this.setState(
                {
                  selectMic: deviceID,
                },
                () => {
                  this.props.core.useMicrophoneDevice(this.state.localStream!, this.state.selectMic!);
                }
              );
            }}
            onCameraChange={(deviceID: string) => {
              this.setState(
                {
                  selectCamera: deviceID,
                },
                () => {
                  this.props.core.useCameraDevice(this.state.localStream!, this.state.selectCamera!);
                }
              );
            }}
            onSpeakerChange={(deviceID: string) => {
              this.setState({
                selectSpeaker: deviceID,
              });
            }}
            onVideoResolutionChange={(level: string) => {
              this.setState(
                {
                  selectVideoResolution: level,
                },
                () => {
                  this.createStream(this.state.videoOpen, this.state.audioOpen);
                }
              );
            }}
            onShowNonVideoChange={(selected: boolean) => {
              this.setState({
                showNonVideoUser: selected,
              });
            }}></ZegoSettings>
        )}
      </div>
    );
  }
}