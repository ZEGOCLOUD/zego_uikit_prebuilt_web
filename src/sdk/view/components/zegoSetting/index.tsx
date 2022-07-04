import React, { ChangeEvent } from "react";
import ReactDOM from "react-dom/client";
import {
  ZegoDeviceInfo,
  ZegoLocalStreamConfig,
} from "zego-express-engine-webrtc/sdk/code/zh/ZegoExpressEntity.web";
import { ZegoCloudRTCCore } from "../../../modules";
import ZegoSettingsCss from "./index.module.scss";
export class ZegoSettings extends React.Component<{
  core: ZegoCloudRTCCore;
  localVideoStream?: MediaStream;
  localAudioStream?: MediaStream;
  closeCallBack?: () => void;
}> {
  state: {
    visible: boolean;
    seletTab: "AUDIO" | "VIDEO";
    seletMic: string | undefined;
    seletSpeaker: string | undefined;
    seletCamera: string | undefined;
    seletVideoResolve: string | undefined;
    micDevices: ZegoDeviceInfo[];
    speakerDevices: ZegoDeviceInfo[];
    cameraDevices: ZegoDeviceInfo[];
    localVideoStream: MediaStream | undefined;
    localAudioStream: MediaStream | undefined;
  } = {
    visible: true,
    seletTab: "AUDIO",
    seletMic: undefined,
    seletSpeaker: undefined,
    seletCamera: undefined,
    micDevices: [],
    speakerDevices: [],
    cameraDevices: [],
    localVideoStream: undefined,
    localAudioStream: undefined,
    seletVideoResolve: "480",
  };
  videoRef = React.createRef<HTMLDivElement>();

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

  async getDevices() {
    const micDevices = await this.props.core.getMicrophones();
    const speakerDevices = await this.props.core.getSpeakers();
    const cameraDevices = await this.props.core.getCameras();
    this.setState({
      micDevices,
      speakerDevices,
      cameraDevices,
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

  async toggleMic(deviceID: string) {
    if (!this.state.localAudioStream) return;
    const res = await this.props.core.useMicrophoneDevice(
      this.state.localAudioStream,
      deviceID
    );
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

  render(): React.ReactNode {
    return (
      <div
        className={
          this.state.visible ? ZegoSettingsCss.frame : ZegoSettingsCss.noFrame
        }
      >
        <div className={ZegoSettingsCss.body}>
          <div className={ZegoSettingsCss.header}>
            <div>Header</div>
            <div
              onClick={() => {
                this.close();
              }}
            >
              close
            </div>
          </div>
          <div className={ZegoSettingsCss.content}>
            <div className={ZegoSettingsCss.left}>
              <button
                onClick={() => {
                  this.setState({
                    seletTab: "AUDIO",
                  });
                }}
              >
                音频
              </button>
              <button
                onClick={() => {
                  this.setState({
                    seletTab: "VIDEO",
                  });
                }}
              >
                视频
              </button>
            </div>
            {this.state.seletTab === "AUDIO" && (
              <div className={ZegoSettingsCss.rightAudio}>
                <div className={ZegoSettingsCss.device}>
                  mic:
                  <select
                    value={this.state.seletMic}
                    onChange={(el: ChangeEvent<HTMLSelectElement>) => {
                      this.toggleMic(el.target.value);
                    }}
                  >
                    {this.state.micDevices.map((device, index) => (
                      <option value={device.deviceID} key={index}>
                        {device.deviceName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={ZegoSettingsCss.device}>
                  speaker:
                  <select
                    value={this.state.seletSpeaker}
                    onChange={(el: ChangeEvent<HTMLSelectElement>) => {
                      this.toggleSpeaker(el.target.value);
                    }}
                  >
                    {this.state.speakerDevices.map((device, index) => (
                      <option value={device.deviceID} key={index}>
                        {device.deviceName}
                      </option>
                    ))}
                  </select>
                </div>
                <audio
                  style={{ width: "1px", height: "1px" }}
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
                      el.sinkId = this.state.seletSpeaker;
                    }
                  }}
                ></audio>
              </div>
            )}
            {this.state.seletTab === "VIDEO" && (
              <div className={ZegoSettingsCss.rightVideo}>
                <div className={ZegoSettingsCss.device}>
                  camera:
                  <select
                    value={this.state.seletCamera}
                    onChange={(el: ChangeEvent<HTMLSelectElement>) => {
                      this.toggleCamera(el.target.value);
                    }}
                  >
                    {this.state.cameraDevices.map((device, index) => (
                      <option value={device.deviceID} key={index}>
                        {device.deviceName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={ZegoSettingsCss.preview}>
                  <video
                    controls
                    muted
                    autoPlay
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
                  camera:
                  <select
                    value={this.state.seletVideoResolve}
                    onChange={(el: ChangeEvent<HTMLSelectElement>) => {
                      this.toggleVideoResolve(el.target.value);
                    }}
                  >
                    <option value="180">180p</option>
                    <option value="360">360p</option>
                    <option value="480">480p</option>
                    <option value="720">720p</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const div = document.createElement("div");
document.body.appendChild(div);

export const ZegoSettingsAlert = (config: {
  core: ZegoCloudRTCCore;
  closeCallBack: () => void;
  localVideoStream?: MediaStream;
  localAudioStream?: MediaStream;
}) => {
  const root = ReactDOM.createRoot(div);
  root.render(
    <ZegoSettings
      core={config.core}
      closeCallBack={() => {
        root.unmount();
        config.closeCallBack();
      }}
      localVideoStream={config.localVideoStream}
      localAudioStream={config.localAudioStream}
    ></ZegoSettings>
  );
};
