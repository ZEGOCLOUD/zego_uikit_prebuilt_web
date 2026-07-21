import { TracerConnect } from "./ZegoTracer";
import { SpanEvent } from "../../model/tracer";

export class ZegoLogger {
  static reportAllLogs = true;

  static getFormatString(moduleName: string): string {
    return `[ZEGOCLOUD] [${moduleName}]`;
  }

  static safeStringify(obj: any): string {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
          return `[HTMLElement: ${value.tagName}]`;
        }
        if (typeof MediaStream !== 'undefined' && value instanceof MediaStream) {
          return `[MediaStream: ${value.id}]`;
        }
        cache.add(value);
      }
      return value;
    });
  }

  static formatMessage(args: any[]): string {
    return args
      .map((a) => {
        if (typeof a === "object") {
          try {
            return this.safeStringify(a);
          } catch (e) {
            return String(a);
          }
        }
        return String(a);
      })
      .join(" ");
  }

  static reportToTracer(level: string, moduleName: string, args: any[]) {
    if (!this.reportAllLogs && (level === "info" || level === "log")) return;
    if (TracerConnect.tracer) {
      let event: string = moduleName;
      let options: any = { level, moduleName };
      let messageArgs = args;

      if (args.length > 0) {
        // Check if the first argument is a SpanEvent from the enum
        if (Object.values(SpanEvent).includes(args[0])) {
          event = args[0] as SpanEvent;
          messageArgs = args.slice(1);

          // If the second argument is an object (the option for Tracer), merge it
          if (
            messageArgs.length === 1 &&
            typeof messageArgs[0] === "object" &&
            messageArgs[0] !== null
          ) {
            options = { ...options, ...messageArgs[0] };
          } else {
            options.message = this.formatMessage(messageArgs);
          }
        } else {
          // If the first argument is a string, use it as the span event name to avoid a generic logger name
          if (typeof args[0] === "string") {
            event = args[0];
          }
          options.message = this.formatMessage(args);
        }
      }

      const span = TracerConnect.createSpan(event, options);
      span.end();
    }
  }

  static getLogger(moduleName: string) {
    return new LoggerInstance(moduleName);
  }
}

export class LoggerInstance {
  constructor(private moduleName: string) {}

  log(...args: any[]) {
    console.log(ZegoLogger.getFormatString(this.moduleName), ...args);
    this.reportToTracer("log", args);
  }
  warn(...args: any[]) {
    console.warn(ZegoLogger.getFormatString(this.moduleName), ...args);
    this.reportToTracer("warn", args);
  }
  error(...args: any[]) {
    console.error(ZegoLogger.getFormatString(this.moduleName), ...args);
    this.reportToTracer("error", args);
  }
  info(...args: any[]) {
    console.info(ZegoLogger.getFormatString(this.moduleName), ...args);
    this.reportToTracer("info", args);
  }
  private reportToTracer(level: string, args: any[]) {
    ZegoLogger.reportToTracer(level, this.moduleName, args);
  }
}
