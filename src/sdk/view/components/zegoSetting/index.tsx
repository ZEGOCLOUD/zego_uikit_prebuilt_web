import React, { ChangeEvent, RefObject } from "react";
import ReactDOM from "react-dom/client";
import {
  ZegoDeviceInfo,
  ZegoLocalStreamConfig,
} from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { ZegoCloudRTCCore } from "../../../modules";
import ZegoSettingsCss from "./index.module.scss";
import { ZegoSelect } from "../../components/zegoSelect";
import { audioBase64 } from "./speakerFile";
import { ScenarioModel, ZegoSettingsProps } from "../../../model";
import { getVideoResolution } from "../../../util";
import { SoundMeter } from "../../../modules/soundmeter";
export class ZegoSettings extends React.Component<ZegoSettingsProps> {
  state: {
    visible: boolean;
    selectTab: "AUDIO" | "VIDEO";
    selectMic: string | undefined;
    selectSpeaker: string | undefined;
    selectCamera: string | undefined;
    selectVideoResolution: string | undefined;
    micDevices: ZegoDeviceInfo[];
    speakerDevices: ZegoDeviceInfo[];
    cameraDevices: ZegoDeviceInfo[];
    localVideoStream: MediaStream | undefined;
    localAudioStream: MediaStream | undefined;
    audioVolume: number;
    speakerVolume: number;
    isSpeakerPlaying: boolean;
    renderAudio: boolean;
    showNonVideo: boolean | undefined;
  } = {
    visible: true,
    selectTab: "AUDIO",
    selectMic: undefined,
    selectSpeaker: undefined,
    selectCamera: undefined,
    micDevices: [],
    speakerDevices: [],
    cameraDevices: [],
    localVideoStream: undefined,
    localAudioStream: undefined,
    selectVideoResolution: "360",
    audioVolume: 0,
    speakerVolume: 0,
    isSpeakerPlaying: false,
    renderAudio: false,
    showNonVideo: this.props.initDevices.showNonVideoUser,
  };
  videoRef = React.createRef<HTMLDivElement>();
  speakerTimer: NodeJS.Timer | null = null;
  micTimer: NodeJS.Timer | null = null;
  micSounder: SoundMeter = new SoundMeter();
  speakerSounder: SoundMeter = new SoundMeter();
  solutionList = this.sortResolution(
    this.props.core._config.videoResolutionList!
  );
  async componentDidMount() {
    const state = await this.getDevices();
    this.setState({ ...state }, () => {
      this.createVideoStream();
      this.createAudioStream();
    });
    const dom = document.querySelector("#speakerAudioTest") as HTMLMediaElement;
    dom.addEventListener("ended", this.onTestMusicEnded.bind(this));
  }
  componentWillUnmount() {
    if (this.state.isSpeakerPlaying) {
      this.speakerTimer && clearTimeout(this.speakerTimer);
      this.speakerSounder.stop();
    }
    if (this.state.localAudioStream) {
      this.state.localAudioStream.getAudioTracks().forEach((track: any) => {
        track.stop();
      });
      this.micTimer && clearTimeout(this.micTimer);
      this.micSounder.stop();
    }
    this.state.localVideoStream &&
      this.props.core.destroyStream(this.state.localVideoStream);
    const dom = document.querySelector("#speakerAudioTest") as HTMLMediaElement;
    dom?.removeEventListener("ended", this.onTestMusicEnded.bind(this));
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
          deviceName: "Default speaker",
        });
      }
    }
    // 防止设备移出后，再次使用缓存设备ID
    const mic = micDevices.filter(
      (device) => device.deviceID === this.props.initDevices.mic
    );
    const cam = cameraDevices.filter(
      (device) => device.deviceID === this.props.initDevices.cam
    );
    const speaker = speakerDevices.filter(
      (device) => device.deviceID === this.props.initDevices.speaker
    );
    return {
      micDevices: micDevices.filter((device) => device.deviceID),
      speakerDevices: speakerDevices.filter((device) => device.deviceID),
      cameraDevices: cameraDevices.filter((device) => device.deviceID),
      selectMic: mic[0]?.deviceID || micDevices[0]?.deviceID || undefined,
      selectSpeaker:
        speaker[0]?.deviceID || speakerDevices[0]?.deviceID || undefined,
      selectCamera: cam[0]?.deviceID || cameraDevices[0]?.deviceID || undefined,
      selectVideoResolution: this.props.initDevices.videoResolve || undefined,
    };
  }

  async createVideoStream(): Promise<boolean> {
    try {
      const config = getVideoResolution(
        this.state.selectVideoResolution as string
      );
      const source: ZegoLocalStreamConfig = {
        camera: {
          video: true,
          audio: false,
          videoInput: this.state.selectCamera,
          videoQuality: 4,
          ...config,
        },
      };
      const localVideoStream = await this.props.core.createStream(source);
      this.setState({
        localVideoStream,
      });
      return true;
    } catch (error) {
      console.error(
        "【ZEGOCLOUD】settings/localVideoStream failed !!",
        JSON.stringify(error)
      );
      this.props.core._config.turnOnCameraWhenJoining = false;
      return false;
    }
  }

  async createAudioStream(): Promise<boolean> {
    try {
      const source: ZegoLocalStreamConfig = {
        camera: {
          video: false,
          audio: true,
          audioInput: this.state.selectMic,
        },
      };
      const localAudioStream = await this.props.core.createStream(source);
      this.setState(
        {
          localAudioStream,
        },
        () => {
          this.captureMicVolume();
        }
      );

      return true;
    } catch (error) {
      console.error(
        "【ZEGOCLOUD】settings/localAudioStream failed !!",
        JSON.stringify(error)
      );
      this.props.core._config.turnOnMicrophoneWhenJoining = false;
      return false;
    }
  }
  toggleTab(type: string) {
    if (type === this.state.selectTab) return;
    if (type === "AUDIO") {
      this.captureMicVolume();
    } else {
      if (this.state.localAudioStream) {
        this.micSounder.stop();
        this.micTimer && clearTimeout(this.micTimer);
        this.setState({ audioVolume: 0 });
      }
      if (this.state.isSpeakerPlaying) {
        this.speakerTimer && clearTimeout(this.speakerTimer);
        this.speakerSounder.stop();
        this.setState({ isSpeakerPlaying: false, speakerVolume: 0 });
      }
    }
    this.setState({
      selectTab: type,
    });
  }
  async toggleMic(deviceID: string) {
    if (!this.state.localAudioStream) return;
    const res = await this.props.core.useMicrophoneDevice(
      this.state.localAudioStream,
      deviceID
    );
    this.micSounder.stop();
    this.micTimer && clearTimeout(this.micTimer);
    this.captureMicVolume();
    if (res.errorCode === 0) {
      this.setState({ selectMic: deviceID });
      this.props.onMicChange(deviceID);
    }
  }
  async toggleSpeaker(deviceID: string) {
    this.setState({ selectSpeaker: deviceID });
    this.props.onSpeakerChange(deviceID);
  }
  async toggleCamera(deviceID: string) {
    if (!this.state.localVideoStream) return;

    const res = await this.props.core.useCameraDevice(
      this.state.localVideoStream,
      deviceID
    );
    if (res.errorCode === 0) {
      this.setState({ selectCamera: deviceID });
      this.props.onCameraChange(deviceID);
    }
  }
  async toggleVideoResolution(level: string) {
    this.createVideoStream();
    this.setState({ selectVideoResolution: level });
    this.props.onVideoResolutionChange(level);
  }
  toggleSpeakerTest() {
    if (!this.state.speakerDevices.length) return;
    if (this.speakerTimer) {
      clearTimeout(this.speakerTimer);
    }

    this.setState(
      {
        isSpeakerPlaying: !this.state.isSpeakerPlaying,
      },
      async () => {
        const dom = document.querySelector("#speakerAudioTest") as any;
        const playDom = document.querySelector("#speakerAudio") as any;
        if (dom.paused) {
          playDom?.setSinkId &&
            (await playDom?.setSinkId(this.state.selectSpeaker || ""));
          playDom.play();
          dom.play();
          this.speakerSounder.connectToElementSource(dom, (error: any) => {
            if (error) {
              console.error(
                "[zegocloud] captureSpeakerVolume!!!",
                JSON.stringify(error)
              );
            }
            this.speakerTimer = setInterval(() => {
              this.setState({
                speakerVolume: this.speakerSounder.instant * 100,
              });
            });
          });
        } else {
          dom.pause();
          dom.currentTime = 0;
          playDom.pause();
          playDom.currentTime = 0;
          this.setState({
            speakerVolume: 0,
          });
        }
      }
    );
  }
  close() {
    sessionStorage.setItem("selectMic", this.state.selectMic || "");
    sessionStorage.setItem("selectCamera", this.state.selectCamera || "");
    sessionStorage.setItem("selectSpeaker", this.state.selectSpeaker || "");
    sessionStorage.setItem(
      "selectVideoResolution",
      this.state.selectVideoResolution || ""
    );
    this.setState({ visible: false });
    this.props.closeCallBack && this.props.closeCallBack();
  }
  captureMicVolume() {
    if (!this.state.localAudioStream) return;
    this.micSounder.connectToStreamSource(
      this.state.localAudioStream,
      (error: any) => {
        if (error) {
          console.error(
            "[zegocloud] captureMicVolume!!!",
            JSON.stringify(error)
          );
        }

        this.micTimer = setInterval(() => {
          this.setState({
            audioVolume: (this.micSounder.instant * 1000) / 5,
          });
        });
      }
    );
  }
  onTestMusicEnded() {
    const playDom = document.querySelector("#speakerAudio") as any;
    playDom.pause();
    playDom.currentTime = 0;
    this.speakerSounder.stop();
    if (this.speakerTimer) {
      clearTimeout(this.speakerTimer);
      this.speakerTimer = null;
    }
    this.setState({
      isSpeakerPlaying: false,
      speakerVolume: 0,
    });
  }
  handleShowNonVideo() {
    this.props?.onShowNonVideoChange(!this.state.showNonVideo);
    this.setState({
      showNonVideo: !this.state.showNonVideo,
    });
  }
  private sortResolution(list: string[]): { name: string; value: string }[] {
    return list
      .sort(
        (a: string, b: string) =>
          Number(a.replace("p", "")) - Number(b.replace("p", ""))
      )
      .map((l) => ({ name: l, value: l }));
  }
  render(): React.ReactNode {
    return (
      <div
        className={`${
          this.state.visible ? ZegoSettingsCss.frame : ZegoSettingsCss.noFrame
        } ${
          this.props.theme === "black"
            ? ZegoSettingsCss.blackTheme
            : ZegoSettingsCss.whiteTheme
        } settings_audio`}
      >
        <div className={ZegoSettingsCss.body}>
          <div className={ZegoSettingsCss.header}>
            <div>Settings</div>
            <div
              onClick={() => {
                this.close();
              }}
              className={ZegoSettingsCss.closeIcon}
            ></div>
          </div>
          <div className={ZegoSettingsCss.content}>
            <div className={ZegoSettingsCss.left}>
              <div
                className={`${ZegoSettingsCss.leftAudioTab} ${
                  this.state.selectTab === "AUDIO" && ZegoSettingsCss.tabActive
                }`}
                onClick={() => {
                  this.toggleTab("AUDIO");
                }}
              >
                Audio
              </div>
              <div
                className={`${ZegoSettingsCss.leftVideoTab} ${
                  this.state.selectTab === "VIDEO" && ZegoSettingsCss.tabActive
                }`}
                onClick={() => {
                  this.toggleTab("VIDEO");
                }}
              >
                Video
              </div>
            </div>
            <div className={`${ZegoSettingsCss.right} `}>
              {this.state.selectTab === "AUDIO" && (
                <div className={ZegoSettingsCss.rightAudio}>
                  <div className={ZegoSettingsCss.device}>
                    <ZegoSelect
                      label="Microphone"
                      options={this.state.micDevices.map((device) => ({
                        name: device.deviceName,
                        value: device.deviceID,
                      }))}
                      onChange={(value: string) => {
                        this.toggleMic(value);
                      }}
                      initValue={this.state.selectMic}
                      placeholder="No microphone detected"
                      theme={this.props.theme}
                    ></ZegoSelect>
                    <div className={ZegoSettingsCss.volumeWrapper}>
                      <span
                        className={`${ZegoSettingsCss.micIcon} ${
                          this.state.localAudioStream
                            ? ZegoSettingsCss.micIconAcitve
                            : ""
                        }`}
                      ></span>
                      {Array(20)
                        .fill(1)
                        .map((i, index) => (
                          <span
                            key={index}
                            className={`${
                              this.state.audioVolume >= index + 1
                                ? ZegoSettingsCss.volumeActive
                                : ""
                            } ${ZegoSettingsCss.volume}`}
                          ></span>
                        ))}
                    </div>
                  </div>
                  <div className={ZegoSettingsCss.device}>
                    <ZegoSelect
                      label="Speakers"
                      options={this.state.speakerDevices.map((device) => ({
                        name: device.deviceName,
                        value: device.deviceID,
                      }))}
                      onChange={(value: string) => {
                        this.toggleSpeaker(value);
                      }}
                      initValue={this.state.selectSpeaker}
                      placeholder="No speaker detected"
                      theme={this.props.theme}
                    ></ZegoSelect>
                    <div className={ZegoSettingsCss.volumeWrapper}>
                      <span
                        className={`${ZegoSettingsCss.speakerIcon} ${
                          this.state.isSpeakerPlaying
                            ? ZegoSettingsCss.speakerIconAcitve
                            : ""
                        }`}
                      ></span>
                      {Array(16)
                        .fill(1)
                        .map((i, index) => (
                          <span
                            key={index}
                            className={`${
                              this.state.speakerVolume >= index + 1
                                ? ZegoSettingsCss.volumeActive
                                : ""
                            } ${ZegoSettingsCss.volume}`}
                          ></span>
                        ))}
                      <div
                        className={ZegoSettingsCss.speakerTestButton}
                        onClick={() => {
                          this.toggleSpeakerTest();
                        }}
                      >
                        {this.state.isSpeakerPlaying ? "Stop" : "Test"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {this.state.selectTab === "VIDEO" && (
                <div className={ZegoSettingsCss.rightVideo}>
                  <div className={ZegoSettingsCss.device}>
                    <ZegoSelect
                      label="Camera"
                      options={this.state.cameraDevices.map((device) => ({
                        name: device.deviceName,
                        value: device.deviceID,
                      }))}
                      onChange={(value: string) => {
                        this.toggleCamera(value);
                      }}
                      initValue={this.state.selectCamera}
                      placeholder="No camera detected"
                      theme={this.props.theme}
                    ></ZegoSelect>
                  </div>
                  <div className={ZegoSettingsCss.device}>
                    <label>Preview</label>
                    <video
                      muted
                      autoPlay
                      className={ZegoSettingsCss.previewVideo}
                      ref={(el: HTMLVideoElement | null) => {
                        if (
                          el &&
                          this.state.localVideoStream &&
                          el.srcObject !== this.state.localVideoStream
                        ) {
                          el.srcObject = this.state.localVideoStream;
                        }
                      }}
                    ></video>
                  </div>
                  <div className={ZegoSettingsCss.device}>
                    <ZegoSelect
                      label="Send resolution"
                      options={this.solutionList}
                      onChange={(value: string) => {
                        this.toggleVideoResolution(value);
                      }}
                      initValue={this.state.selectVideoResolution}
                      placeholder=""
                      theme={this.props.theme}
                    ></ZegoSelect>
                  </div>
                  {this.props.core._config.scenario?.mode !==
                    ScenarioModel.LiveStreaming &&
                    this.props.core._config.scenario?.mode !==
                      ScenarioModel.OneONoneCall && (
                      <div className={ZegoSettingsCss.device}>
                        <div
                          className={ZegoSettingsCss.checkboxWrapper}
                          onClick={() => this.handleShowNonVideo()}
                        >
                          <span
                            className={`${ZegoSettingsCss.checkbox} ${
                              this.state.showNonVideo &&
                              ZegoSettingsCss.selected
                            }`}
                          ></span>
                          <p>Show non-video participant</p>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
          <audio
            style={{ width: "1px", height: "1px" }}
            id="speakerAudioTest"
            src={audioBase64}
            // muted
          ></audio>
          <audio
            style={{ width: "1px", height: "1px" }}
            id="speakerAudio"
            src={audioBase64}
            // loop
          ></audio>
        </div>
      </div>
    );
  }
}

export const ZegoSettingsAlert = (config: ZegoSettingsProps) => {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const root = ReactDOM.createRoot(div);
  root.render(
    <ZegoSettings
      {...config}
      closeCallBack={() => {
        root.unmount();
        config.closeCallBack && config.closeCallBack();
      }}
    ></ZegoSettings>
  );
};
