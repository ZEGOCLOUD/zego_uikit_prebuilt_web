import ZegoLocalStream from "zego-express-engine-webrtc/sdk/code/zh/ZegoLocalStream.web";

export interface SoundLevel {
  instant: number;
  slow: number;
  clip: number;
}
export class SoundMeter {
  context: AudioContext;
  instant = 0.0;
  slow = 0.0;
  clip = 0.0;
  type = "";
  script: ScriptProcessorNode = {} as ScriptProcessorNode;
  mic:
    | MediaElementAudioSourceNode
    | MediaStreamAudioSourceNode = undefined as any;
  constructor() {
    window.AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    this.context = new AudioContext();
    this.script = this.context.createScriptProcessor(4096, 1, 1);
    this.script.onaudioprocess = (event: AudioProcessingEvent) => {
      const input = event.inputBuffer.getChannelData(0);
      let i;
      let sum = 0.0;
      let clipcount = 0;
      for (i = 0; i < input.length; ++i) {
        sum += input[i] * input[i];
        if (Math.abs(input[i]) > 0.99) {
          clipcount += 1;
        }
      }
      this.instant = Math.sqrt(sum / input.length);
      this.slow = 0.95 * this.slow + 0.05 * this.instant;
      this.clip = clipcount / input.length;
    };
  }
  connectToStreamSource(source: ZegoLocalStream, callback: Function) {
    console.log("SoundMeter connecting", source);
    try {
      this.type = "Stream";
      this.mic = this.context.createMediaStreamSource(source.audioCaptureStream!);
      this.mic.connect(this.script);
      this.script.connect(this.context.destination);
      if (typeof callback !== "undefined") {
        callback(null);
      }
    } catch (e) {
      console.error(e);
      if (typeof callback !== "undefined") {
        callback(e);
      }
    }
  }
  connectToElementSource(source: HTMLMediaElement, callback: Function) {
    console.log("connectToElementSource SoundMeter connecting");
    try {
      this.type = "Element";
      if (!this.mic) {
        this.mic = this.context.createMediaElementSource(source);
      }
      this.mic.connect(this.script);
      //   this.mic.connect(this.context.destination);
      this.script.connect(this.context.destination);
      if (typeof callback !== "undefined") {
        callback(null);
      }
    } catch (e) {
      console.error(e);
      if (typeof callback !== "undefined") {
        callback(e);
      }
    }
  }
  stop() {
    console.log("SoundMeter stopping");
    if (this.type === "Element") {
      this.mic?.disconnect(this.script);
      this.script?.disconnect(this.context.destination);
    } else {
      this.mic?.disconnect();
      this.script?.disconnect();
    }

    this.instant = 0.0;
    this.slow = 0.0;
    this.clip = 0.0;
  }
}
