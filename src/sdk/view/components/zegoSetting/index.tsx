import React, { ChangeEvent, RefObject } from "react";
import ReactDOM from "react-dom/client";
import {
  ZegoDeviceInfo,
  ZegoLocalStreamConfig,
} from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { ZegoCloudRTCCore } from "../../../modules";
import ZegoSettingsCss from "./index.module.scss";
import { ZegoSelect } from "../../components/zegoSelect";
export class ZegoSettings extends React.Component<{
  core: ZegoCloudRTCCore;
  theme?: string;
  localVideoStream?: MediaStream;
  localAudioStream?: MediaStream;
  closeCallBack?: () => void;
}> {
  state: {
    visible: boolean;
    selectTab: "AUDIO" | "VIDEO";
    seletMic: string | undefined;
    seletSpeaker: string | undefined;
    seletCamera: string | undefined;
    seletVideoResolve: string | undefined;
    micDevices: ZegoDeviceInfo[];
    speakerDevices: ZegoDeviceInfo[];
    cameraDevices: ZegoDeviceInfo[];
    localVideoStream: MediaStream | undefined;
    localAudioStream: MediaStream | undefined;
    audioVolume: number;
    speakerVolume: number;
    isSpeakerPlaying: boolean;
  } = {
    visible: true,
    selectTab: "AUDIO",
    seletMic: undefined,
    seletSpeaker: undefined,
    seletCamera: undefined,
    micDevices: [],
    speakerDevices: [],
    cameraDevices: [],
    localVideoStream: undefined,
    localAudioStream: undefined,
    seletVideoResolve: "360",
    audioVolume: 0,
    speakerVolume: 0,
    isSpeakerPlaying: false,
  };
  videoRef = React.createRef<HTMLDivElement>();
  //   micAudioRef = React.createRef<HTMLAudioElement>();
  solutionList = [
    {
      name: "180p",
      value: "180",
    },
    {
      name: "360p",
      value: "360",
    },
    {
      name: "480p",
      value: "480",
    },
    {
      name: "720p",
      value: "720",
    },
  ];
  componentDidMount() {
    this.getDevices();
    if (!this.props.localAudioStream && !this.props.localVideoStream) {
      this.props.core._config.cameraEnabled &&
        this.createVideoStream({ camera: { video: true, audio: false } });
      this.props.core._config.micEnabled &&
        this.createAudioStream({ camera: { video: false, audio: true } });
    } else if (this.props.localAudioStream && this.props.localVideoStream) {
      this.setState({
        localAudioStream: this.props.localAudioStream,
        localVideoStream: this.props.localVideoStream,
      });
    }
  }
  componentDidUpdate(prevProps: any, preState: any) {
    if (
      preState.localAudioStream === undefined &&
      this.state.localAudioStream
    ) {
      this.captureMicVolume();
    }
    if (preState.seletSpeaker !== this.state.seletSpeaker) {
      document
        .querySelectorAll(".settings_audio audio")
        .forEach((audio: any) => {
          audio.setSinkId(this.state.seletSpeaker);
        });
    }
  }
  componentWillUnmount() {
    this.props.core.stopCapturedSoundLevelUpdate("micTest");
    if (this.state.isSpeakerPlaying) {
      this.props.core.stopCapturedSoundLevelUpdate("speakerTest");
    }
  }
  async getDevices() {
    const micDevices = await this.props.core.getMicrophones();
    const speakerDevices = await this.props.core.getSpeakers();
    const cameraDevices = await this.props.core.getCameras();
    this.setState({
      micDevices: micDevices.filter((device) => device.deviceID),
      speakerDevices: speakerDevices.filter((device) => device.deviceID),
      cameraDevices: cameraDevices.filter((device) => device.deviceID),
      seletMic: sessionStorage.getItem("seletMic") || undefined,
      seletSpeaker: sessionStorage.getItem("seletSpeaker") || undefined,
      seletCamera: sessionStorage.getItem("seletCamera") || undefined,
      seletVideoResolve:
        sessionStorage.getItem("seletVideoResolve") || undefined,
    });
  }

  async createVideoStream(source?: ZegoLocalStreamConfig): Promise<boolean> {
    try {
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
      this.props.core._config.cameraEnabled = false;
      return false;
    }
  }

  async createAudioStream(source?: ZegoLocalStreamConfig): Promise<boolean> {
    try {
      const localAudioStream = await this.props.core.createStream(source);
      this.setState({
        localAudioStream,
      });

      return true;
    } catch (error) {
      console.error(
        "【ZEGOCLOUD】settings/localAudioStream failed !!",
        JSON.stringify(error)
      );
      this.props.core._config.micEnabled = false;
      return false;
    }
  }
  toggleTab(type: string) {
    if (type === this.state.selectTab) return;
    if (type === "AUDIO") {
      this.captureMicVolume();
    } else {
      this.props.core.stopCapturedSoundLevelUpdate("micTest");
      if (this.state.isSpeakerPlaying) {
        this.props.core.stopCapturedSoundLevelUpdate("speakerTest");
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
    this.props.core.stopCapturedSoundLevelUpdate("micTest");
    this.captureMicVolume();
    res.errorCode === 0 && this.setState({ seletMic: deviceID });
  }
  async toggleSpeaker(deviceID: string) {
    if (!this.state.localAudioStream) return;
    this.setState({ seletSpeaker: deviceID });
  }
  async toggleCamera(deviceID: string) {
    if (!this.state.localVideoStream) return;

    const res = await this.props.core.useCameraDevice(
      this.state.localVideoStream,
      deviceID
    );
    res.errorCode === 0 && this.setState({ seletCamera: deviceID });
  }
  async toggleVideoResolve(level: string) {
    if (!this.state.localVideoStream) return;

    let { width, height, maxBitrate, frameRate } = {
      width: 640,
      height: 480,
      maxBitrate: 500,
      frameRate: 15,
    };

    if (level === "180") {
      width = 320;
      height = 180;
      maxBitrate = 140;
    } else if (level === "360") {
      width = 640;
      height = 360;
      maxBitrate = 400;
    } else if (level === "480") {
      width = 640;
      height = 480;
      maxBitrate = 500;
    } else if (level === "720") {
      width = 1280;
      height = 720;
      maxBitrate = 1130;
    }
    const res = await this.props.core.setVideoConfig(
      this.state.localVideoStream,
      {
        width,
        height,
        maxBitrate,
        frameRate,
      }
    );

    res && this.setState({ seletVideoResolve: level });
  }
  toggleSpeakerTest() {
    if (!this.state.speakerDevices.length) return;
    this.setState(
      {
        isSpeakerPlaying: !this.state.isSpeakerPlaying,
      },
      () => {
        const dom = document.querySelector(
          "#speakerAudioTest"
        ) as HTMLMediaElement;
        // @ts-ignore
        const stream = dom.captureStream();
        if (!stream.active) return;
        if (this.state.isSpeakerPlaying) {
          dom.play();
          this.props.core.capturedSoundLevelUpdate(
            stream,
            "speakerTest",
            (soundLevel) => {
              this.setState({
                speakerVolume: (soundLevel * 1000) / 12,
              });
            }
          );
        } else {
          dom.pause();
          this.setState({
            speakerVolume: 0,
          });
          this.props.core.stopCapturedSoundLevelUpdate("speakerTest");
        }
      }
    );
  }
  close() {
    sessionStorage.setItem("seletMic", this.state.seletMic || "");
    sessionStorage.setItem("seletCamera", this.state.seletCamera || "");
    sessionStorage.setItem("seletSpeaker", this.state.seletSpeaker || "");
    sessionStorage.setItem(
      "seletVideoResolve",
      this.state.seletVideoResolve || ""
    );
    this.setState({ visible: false });
    this.props.closeCallBack && this.props.closeCallBack();
  }
  captureMicVolume() {
    if (!this.state.localAudioStream) return;
    this.props.core.capturedSoundLevelUpdate(
      this.state.localAudioStream as MediaStream,
      "micTest",
      (soundLevel) => {
        this.setState({
          audioVolume: (soundLevel * 1000) / 5,
        });
      }
    );
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
        }`}
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
                className={`${ZegoSettingsCss.leftAudioTab} ${this.state
                  .selectTab === "AUDIO" && ZegoSettingsCss.tabActive}`}
                onClick={() => {
                  this.toggleTab("AUDIO");
                }}
              >
                Audio
              </div>
              <div
                className={`${ZegoSettingsCss.leftVideoTab} ${this.state
                  .selectTab === "VIDEO" && ZegoSettingsCss.tabActive}`}
                onClick={() => {
                  this.toggleTab("VIDEO");
                }}
              >
                Video
              </div>
            </div>
            <div className={`${ZegoSettingsCss.right} settings_audio`}>
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
                      initValue={this.state.seletMic}
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
                      initValue={this.state.seletSpeaker}
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
                        Test
                      </div>
                    </div>
                  </div>
                  <audio
                    style={{ width: "1px", height: "1px" }}
                    id="micTestAudio"
                    ref={(el: HTMLAudioElement | null) => {
                      if (
                        el &&
                        this.state.localAudioStream &&
                        el.srcObject !== this.state.localAudioStream
                      ) {
                        el.srcObject = this.state.localAudioStream;
                      }
                      if (
                        el &&
                        this.state.localAudioStream &&
                        el.srcObject &&
                        // @ts-ignore
                        el.sinkId &&
                        // @ts-ignore
                        el.sinkId !== this.state.seletSpeaker
                      ) {
                        // @ts-ignore
                        el.setSinkId(this.state.seletSpeaker);
                      }
                    }}
                    autoPlay
                    loop
                  ></audio>
                  <audio
                    style={{ width: "1px", height: "1px" }}
                    id="speakerAudioTest"
                    ref={(el: HTMLAudioElement | null) => {
                      if (
                        el &&
                        // @ts-ignore
                        el.sinkId &&
                        // @ts-ignore
                        el.sinkId !== this.state.seletSpeaker
                      ) {
                        // @ts-ignore
                        el.setSinkId(this.state.seletSpeaker);
                      }
                    }}
                    loop
                    src={require("../../../sdkAssets/speaker_test.wav")}
                  ></audio>
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
                      initValue={this.state.seletCamera}
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
                        this.toggleVideoResolve(value);
                      }}
                      initValue={this.state.seletVideoResolve}
                      placeholder=""
                      theme={this.props.theme}
                    ></ZegoSelect>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const ZegoSettingsAlert = (config: {
  core: ZegoCloudRTCCore;
  closeCallBack: () => void;
  localVideoStream?: MediaStream;
  localAudioStream?: MediaStream;
  theme?: string;
}) => {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const root = ReactDOM.createRoot(div);
  root.render(
    <ZegoSettings
      core={config.core}
      closeCallBack={() => {
        root.unmount();
        config.closeCallBack();
      }}
      theme={config.theme}
      localVideoStream={config.localVideoStream}
      localAudioStream={config.localAudioStream}
    ></ZegoSettings>
  );
};
