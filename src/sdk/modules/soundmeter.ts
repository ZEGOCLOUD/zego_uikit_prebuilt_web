export interface SoundLevel {
  instant: number;
  slow: number;
  clip: number;
}
export class SoundMeter {
  instant = 0.0;
  slow = 0.0;
  clip = 0.0;
  context: AudioContext | undefined;
  states: {
    [index: string]: {
      script: any;
      mic: any;
    };
  } = {};
  timer!: NodeJS.Timer;
  constructor() {}

  callBack!: (level: SoundLevel) => void;

  startTimer() {
    this.timer = setTimeout(() => {
      this.callBack({
        instant: Number(this.instant.toFixed(2)),
        slow: this.slow,
        clip: this.clip,
      });
      this.startTimer();
    }, 200);
  }

  connectToSource(
    dom: HTMLMediaElement,
    callback: (level: SoundLevel) => void
  ) {
    this.context = new AudioContext();
    console.log("SoundMeter connecting");
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
        this.instant = Math.sqrt(sum / input.length);
        this.slow = 0.95 * this.slow + 0.05 * this.instant;
        this.clip = clipcount / input.length;
        console.warn("this.instant ", this.instant);
      };
      const mic = this.context.createMediaElementSource(dom);
      mic.connect(script);
      //       // necessary to make sample run, but should not be.
      script.connect(this.context.destination);
      if (typeof callback !== "undefined") {
        this.callBack = callback;
        this.startTimer();
      }

      this.states[dom.getAttribute("id")!] = {
        script,
        mic,
      };
    } catch (e) {
      console.error(e);
      //   if (typeof callback !== "undefined") {
      //     callback(e);
      //   }
    }
  }

  stop(dom: HTMLMediaElement) {
    console.log("SoundMeter stopping");
    this.timer && clearTimeout(this.timer);
    this.states[dom.getAttribute("id")!].mic &&
      this.states[dom.getAttribute("id")!].mic.disconnect();
    this.states[dom.getAttribute("id")!].script &&
      this.states[dom.getAttribute("id")!].script.disconnect();
  }
}
