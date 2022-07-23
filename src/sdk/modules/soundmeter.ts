export interface SoundLevel {
  instant: number;
  slow: number;
  clip: number;
}
// export class SoundMeter {
//   context: AudioContext | undefined;
//   states: {
//     [index: string]: {
//       isConnected: boolean;
//       script: any;
//       mic: any;
//       gainNode: any;
//       timer: any;
//       instant: number;
//       source: HTMLMediaElement | MediaStream;
//       type: "Element" | "Stream";
//       context: AudioContext | undefined;
//     };
//   } = {};

//   connectToSource(
//     source: MediaStream | HTMLMediaElement,
//     sourceId: string,
//     type: "Element" | "Stream",
//     callback: (level: number) => void
//   ) {
//     try {
//       window.AudioContext =
//         window.AudioContext || (window as any).webkitAudioContext;
//     } catch (e) {
//       alert("Web Audio API not supported.");
//     }
//     !this.context && (this.context = new AudioContext());

//     console.log("SoundMeter connecting");
//     let timer;

//     if (!this.states[sourceId]) {
//       // @ts-ignore
//       this.states[sourceId] = {};
//     }
//     try {
//       const script = this.context.createScriptProcessor(4096, 1, 1);
//       script.onaudioprocess = (event: AudioProcessingEvent) => {
//         const input = event.inputBuffer.getChannelData(0);
//         let i;
//         let sum = 0.0;
//         let clipcount = 0;
//         for (i = 0; i < input.length; ++i) {
//           sum += input[i] * input[i];
//           if (Math.abs(input[i]) > 0.99) {
//             clipcount += 1;
//           }
//         }
//         this.states[sourceId].instant = Math.sqrt(sum / input.length);
//       };
//       let mic;
//       if (type === "Element") {
//         if (this.states[sourceId].mic) {
//           mic = this.states[sourceId].mic;
//         } else {
//           mic = this.context.createMediaElementSource(
//             source as HTMLMediaElement
//           );
//         }
//       } else {
//         mic = this.context.createMediaStreamSource(source as MediaStream);
//       }

//       mic.connect(script);
//       //       // necessary to make sample run, but should not be.
//       //   script.connect(this.context.destination);
//       type === "Element" && mic.connect(this.context.destination);
//       if (typeof callback !== "undefined") {
//         timer = setInterval(() => {
//           callback(this.states[sourceId].instant);
//         }, 300);
//       }
//       this.states[sourceId] = Object.assign(this.states[sourceId], {
//         script,
//         source,
//         mic,
//         timer,
//         isConnected: true,
//         type,
//       });
//     } catch (e) {
//       console.error(e);
//       //   if (typeof callback !== "undefined") {
//       //     callback(e);
//       //   }
//     }
//   }
//   stop(sourceId: string) {
//     console.log("SoundMeter stopping");
//     this.states[sourceId]?.timer && clearTimeout(this.states[sourceId]?.timer);
//     if (!this.states[sourceId]?.isConnected) return;
//     this.states[sourceId].isConnected = false;
//     if (this.states[sourceId]?.type === "Element") {
//       this.states[sourceId]?.mic?.disconnect(this.states[sourceId].script);
//       this.states[sourceId].mic.disconnect(this.context?.destination);
//       this.states[sourceId]?.script?.disconnect(this.context?.destination);
//     } else {
//       this.states[sourceId]?.mic?.disconnect(this.states[sourceId]?.script);
//       this.states[sourceId]?.script?.disconnect(this.context?.destination);
//     }
//   }
// }

export class SoundMeter {
  context: AudioContext;
  instant = 0.0;
  slow = 0.0;
  clip = 0.0;
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
  connectToStreamSource(source: MediaStream, callback: Function) {
    console.log("SoundMeter connecting");
    try {
      this.mic = this.context.createMediaStreamSource(source);
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
    console.log("SoundMeter connecting");
    try {
      if (!this.mic) {
        this.mic = this.context.createMediaElementSource(source);
      }
      this.mic.connect(this.script);
      this.mic.connect(this.context.destination);
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
    this.mic?.disconnect();
    this.script?.disconnect();
    this.instant = 0.0;
    this.slow = 0.0;
    this.clip = 0.0;
  }
}
