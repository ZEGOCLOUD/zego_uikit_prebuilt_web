export function randomNumber(len: number): number {
  let result = "";
  let chars = "123456789",
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return Number.parseInt(result);
}
export function isPc(): boolean {
  const p = navigator.platform;
  let system = { win: p.indexOf("Win") === 0, mac: p.indexOf("Mac") === 0 };
  if (process.env.REACT_APP_MOBILE === "yes") {
    return false;
  }
  return system.win || system.mac;
}
export function isIOS() {
  let u = navigator.userAgent;
  return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}

export function IsLowVersionSafari() {
  const is_safari = navigator.userAgent.toLowerCase().indexOf("safari/") > -1;
  const is_chrome = navigator.userAgent.match("CriOS");
  const is_firefox = navigator.userAgent.match("FxiOS");

  // 获取操作系统版本
  const m1 = navigator.userAgent.match(/iPhone OS .*?(?= )/);
  let version = 0;
  if (m1 && m1.length > 0) {
    try {
      const versionWith_: string =
        m1[0].split(" ")[m1[0].split(" ").length - 1];
      const mainVersion = versionWith_.split("_")[0];
      version = Number.parseInt(mainVersion);
    } catch (error) {
      console.error("【ZEGOCLOUD】get safari version failed", error);
    }
  }

  return is_safari && !is_chrome && !is_firefox && version < 14;
}

export function DateFormat(date: number, fmt: string) {
  const myDate = new Date(date);
  const o = {
    "M+": myDate.getMonth() + 1 + "", // 月份
    "d+": myDate.getDate() + "", // 日
    "h+": myDate.getHours() + "", // 小时
    "m+": myDate.getMinutes() + "", // 分
    "s+": myDate.getSeconds() + "", // 秒
    "q+": Math.floor((myDate.getMonth() + 3) / 3) + "", // 季度
    S: myDate.getMilliseconds() + "", // 毫秒
  };

  Object.entries(o).forEach(([k, v]) => {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? v : ("00" + v).substr(("" + v).length)
      );
    }
  });

  return fmt;
}

const userColorMap: {
  [index: string]: string;
} = {};
export function userNameColor(userName: string): string {
  const colorArr = [
    "#557BFF",
    "#1FAD40",
    "#06A1E5",
    "#E9473A",
    "#BB9B21",
    "#B755FF",
    "#10BD8E",
    "#FF2F5F",
  ];
  if (!userColorMap[userName]) {
    userColorMap[userName] =
      colorArr[Object.keys(userColorMap).length % colorArr.length];
  }
  return userColorMap[userName];
}

export function getUrlParams(
  url: string = window.location.href
): URLSearchParams {
  let urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}

export function getVideoResolution(level: string): {
  width: number;
  height: number;
  bitrate: number;
  frameRate: number;
} {
  let { width, height, bitrate, frameRate } = {
    width: 640,
    height: 360,
    bitrate: 400,
    frameRate: 15,
  };
  if (level === "180") {
    width = 320;
    height = 180;
    bitrate = 140;
  } else if (level === "360") {
    width = 640;
    height = 360;
    bitrate = 400;
  } else if (level === "480") {
    width = 640;
    height = 480;
    bitrate = 500;
  } else if (level === "720") {
    width = 1280;
    height = 720;
    bitrate = 1130;
  }
  return {
    width,
    height,
    bitrate,
    frameRate,
  };
}

export const throttle = (fn: Function, wait: number) => {
  let canRun = true;
  return function () {
    if (!canRun) return;
    canRun = false;
    setTimeout(() => {
      // @ts-ignore
      fn.apply(this, arguments);
      canRun = true;
    }, wait);
  };
};

export function getBrowser(): { browser: string; version: string } {
  let sys: any = {};
  const ua = navigator.userAgent.toLowerCase();
  let s;
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-cond-assign
  (s = ua.match(/edge\/([\d.]+)/))
    ? (sys.edge = s[1])
    : (s = ua.match(/rv:([\d.]+)\) like gecko/))
    ? (sys.ie = s[1])
    : (s = ua.match(/msie ([\d.]+)/))
    ? (sys.ie = s[1])
    : (s = ua.match(/firefox\/([\d.]+)/))
    ? (sys.firefox = s[1])
    : (s = ua.match(/chrome\/([\d.]+)/))
    ? (sys.chrome = s[1])
    : (s = ua.match(/opera.([\d.]+)/))
    ? (sys.opera = s[1])
    : (s = ua.match(/version\/([\d.]+).*safari/))
    ? (sys.safari = s[1])
    : 0;

  if (sys.edge) return { browser: "Edge", version: sys.edge };
  if (sys.ie) return { browser: "IE", version: sys.ie };
  if (sys.firefox) return { browser: "Firefox", version: sys.firefox };
  if (sys.chrome) return { browser: "Chrome", version: sys.chrome };
  if (sys.opera) return { browser: "Opera", version: sys.opera };
  if (sys.safari) return { browser: "Safari", version: sys.safari };

  return { browser: "", version: "0" };
}

export function runes(string: string): string[] {
  const HIGH_SURROGATE_START = 0xd800;
  const HIGH_SURROGATE_END = 0xdbff;

  const LOW_SURROGATE_START = 0xdc00;

  const REGIONAL_INDICATOR_START = 0x1f1e6;
  const REGIONAL_INDICATOR_END = 0x1f1ff;

  const FITZPATRICK_MODIFIER_START = 0x1f3fb;
  const FITZPATRICK_MODIFIER_END = 0x1f3ff;

  const VARIATION_MODIFIER_START = 0xfe00;
  const VARIATION_MODIFIER_END = 0xfe0f;

  const DIACRITICAL_MARKS_START = 0x20d0;
  const DIACRITICAL_MARKS_END = 0x20ff;

  const ZWJ = 0x200d;

  const GRAPHEMS = [
    0x0308, 0x0937, 0x0937, 0x093f, 0x093f, 0x0ba8, 0x0bbf, 0x0bcd, 0x0e31,
    0x0e33, 0x0e40, 0x0e49, 0x1100, 0x1161, 0x11a8,
  ];
  function nextUnits(i: number, string: string) {
    const current = string[i];
    if (!isFirstOfSurrogatePair(current) || i === string.length - 1) {
      return 1;
    }
    const currentPair = current + string[i + 1];
    let nextPair = string.substring(i + 2, i + 5);
    if (isRegionalIndicator(currentPair) && isRegionalIndicator(nextPair)) {
      return 4;
    }
    if (isFitzpatrickModifier(nextPair)) {
      return 4;
    }
    return 2;
  }

  function isFirstOfSurrogatePair(string: string) {
    return (
      string &&
      betweenInclusive(
        string[0].charCodeAt(0),
        HIGH_SURROGATE_START,
        HIGH_SURROGATE_END
      )
    );
  }

  function isRegionalIndicator(string: string) {
    return betweenInclusive(
      codePointFromSurrogatePair(string),
      REGIONAL_INDICATOR_START,
      REGIONAL_INDICATOR_END
    );
  }

  function isFitzpatrickModifier(string: string) {
    return betweenInclusive(
      codePointFromSurrogatePair(string),
      FITZPATRICK_MODIFIER_START,
      FITZPATRICK_MODIFIER_END
    );
  }

  function isVariationSelector(string: string) {
    return (
      typeof string === "string" &&
      betweenInclusive(
        string.charCodeAt(0),
        VARIATION_MODIFIER_START,
        VARIATION_MODIFIER_END
      )
    );
  }

  function isDiacriticalMark(string: string) {
    return (
      typeof string === "string" &&
      betweenInclusive(
        string.charCodeAt(0),
        DIACRITICAL_MARKS_START,
        DIACRITICAL_MARKS_END
      )
    );
  }

  function isGraphem(string: string) {
    return (
      typeof string === "string" &&
      GRAPHEMS.indexOf(string.charCodeAt(0)) !== -1
    );
  }

  function isZeroWidthJoiner(string: string) {
    return typeof string === "string" && string.charCodeAt(0) === ZWJ;
  }

  function codePointFromSurrogatePair(pair: string) {
    const highOffset = pair.charCodeAt(0) - HIGH_SURROGATE_START;
    const lowOffset = pair.charCodeAt(1) - LOW_SURROGATE_START;
    return (highOffset << 10) + lowOffset + 0x10000;
  }

  function betweenInclusive(value: number, lower: number, upper: number) {
    return value >= lower && value <= upper;
  }
  if (typeof string !== "string") {
    throw new Error("string cannot be undefined or null");
  }
  const result = [];
  let i = 0;
  let increment = 0;
  while (i < string.length) {
    increment += nextUnits(i + increment, string);
    if (isGraphem(string[i + increment])) {
      increment++;
    }
    if (isVariationSelector(string[i + increment])) {
      increment++;
    }
    if (isDiacriticalMark(string[i + increment])) {
      increment++;
    }
    if (isZeroWidthJoiner(string[i + increment])) {
      increment++;
      continue;
    }
    result.push(string.substring(i, i + increment));
    i += increment;
    increment = 0;
  }
  return result;
}
export function getNameFirstLetter(name: string): string {
  return runes(name).shift() || "";
}
