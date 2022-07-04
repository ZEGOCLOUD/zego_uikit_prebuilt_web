export interface SoundLevel {
  instant: number;
  slow: number;
  clip: number;
}
export class SoundMeter {
  instant = 0.0;
  slow = 0.0;
  clip = 0.0;
  context: AudioContext;
  states: {
    [index: string]: {
      script: any;
      mic: any;
    };
  } = {};

  constructor() {
    this.context = new AudioContext();
  }

  connectToSource(dom: HTMLMediaElement, callback: (err: SoundLevel) => void) {
    console.log("SoundMeter connecting");
    try {
      const script = this.context.createScriptProcessor(4096, 1, 1);
      let instant: number = 0,
        slow: number = 0,
        clip: number = 0;
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
        instant = Math.sqrt(sum / input.length);
        slow = 0.95 * slow + 0.05 * instant;
        clip = clipcount / input.length;
      };
      const mic = this.context.createMediaElementSource(dom);
      mic.connect(script);
      //       // necessary to make sample run, but should not be.
      script.connect(this.context.destination);
      if (typeof callback !== "undefined") {
        callback({
          instant,
          slow,
          clip,
        });
      }

      this.states[dom.getAttribute("id")!] = {
        script,
        mic,
      };
    } catch (e: any) {
      console.error(e);
      if (typeof callback !== "undefined") {
        callback(e);
      }
    }
  }

  stop(dom: HTMLMediaElement) {
    console.log("SoundMeter stopping");
    this.states[dom.getAttribute("id")!].mic &&
      this.states[dom.getAttribute("id")!].mic.disconnect();
    this.states[dom.getAttribute("id")!].script &&
      this.states[dom.getAttribute("id")!].script.disconnect();
  }
}
