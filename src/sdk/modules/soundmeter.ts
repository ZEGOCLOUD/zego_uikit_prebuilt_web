export interface SoundLevel {
  instant: number;
  slow: number;
  clip: number;
}
export class SoundMeter {
  context: AudioContext | undefined;
  states: {
    [index: string]: {
      script: any;
      mic: any;
      timer: any;
      instant: number;
      source: HTMLMediaElement | MediaStream;
    };
  } = {};

  connectToSource(
    source: MediaStream,
    sourceId: string,
    callback: (level: number) => void
  ) {
    !this.context && (this.context = new AudioContext());
    console.log("SoundMeter connecting");
    let timer;

    if (!this.states[sourceId]) {
      // @ts-ignore
      this.states[sourceId] = {};
    }
    try {
      const script = this.context.createScriptProcessor(4096, 1, 1);
      script.onaudioprocess = (event: AudioProcessingEvent) => {
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
        this.states[sourceId].instant = Math.sqrt(sum / input.length);
      };
      let mic = this.context.createMediaStreamSource(source as MediaStream);

      mic.connect(script);
      //       // necessary to make sample run, but should not be.
      script.connect(this.context.destination);

      if (typeof callback !== "undefined") {
        timer = setInterval(() => {
          callback(this.states[sourceId].instant);
        }, 300);
      }
      this.states[sourceId] = Object.assign(this.states[sourceId], {
        script,
        source,
        mic,
        timer,
      });
    } catch (e) {
      console.error(e);
      //   if (typeof callback !== "undefined") {
      //     callback(e);
      //   }
    }
  }

  stop(sourceId: string) {
    console.log("SoundMeter stopping");
    this.states[sourceId]?.timer && clearTimeout(this.states[sourceId]?.timer);
    this.states[sourceId]?.mic?.disconnect();
    this.states[sourceId]?.script?.disconnect();
  }
}
