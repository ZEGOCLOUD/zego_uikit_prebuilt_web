/* eslint-disable no-cond-assign */
import CryptoJS from "crypto-js";
import Fuse from "fuse.js";
import { ZegoCloudUserList } from "./modules/tools/UserListManager";
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
// 判断是否为移动设备
export function isPc(): boolean {
  if (process.env.REACT_APP_MOBILE === "yes") {
    return false;
  }
  return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
export function isIOS() {
  let u = navigator.userAgent;
  return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}
export function isAndroid(): boolean {
  let u = navigator.userAgent;
  return u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
}
export function isSafari(): boolean {
  return (
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
  );
}
export function isFireFox() {
  let u = navigator.userAgent;
  return !!u.match(/firefox|fxios/i);
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
    "h+":
      myDate.getHours() >= 12
        ? myDate.getHours() - 12 + ""
        : myDate.getHours() + "", // 小时
    "m+": myDate.getMinutes() + "", // 分
    "s+": myDate.getSeconds() + "", // 秒
    "q+": Math.floor((myDate.getMonth() + 3) / 3) + "", // 季度
    S: myDate.getMilliseconds() + "", // 毫秒
  };

  Object.entries(o).forEach(([k, v]) => {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? v : ("00" + v).substr(("" + v).length)
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
  if (level === "180p") {
    width = 320;
    height = 180;
    bitrate = 140;
  } else if (level === "360p") {
    width = 640;
    height = 360;
    bitrate = 400;
  } else if (level === "480p") {
    width = 640;
    height = 480;
    bitrate = 500;
  } else if (level === "540p") {
    width = 960;
    height = 540;
    bitrate = 800;
  } else if (level === "720p") {
    width = 1280;
    height = 720;
    bitrate = 1130;
  } else if (level === "1080p") {
    width = 1920;
    height = 1080;
    bitrate = 1500;
  }
  return {
    width,
    height,
    bitrate,
    frameRate,
  };
}
// 防抖
export const debounce = (fn: Function, wait: number) => {
  let timer: any;
  return function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      // @ts-ignore
      fn.apply(this, arguments);
    }, wait);
  };
};

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

export function chooseFile(callback: (file: File) => void): void {
  const oldInputDom: HTMLInputElement | null = document.querySelector(
    "#zego_whiteboard_UIKits_file"
  );
  if (oldInputDom) {
    oldInputDom.remove();
  }
  const inputObj = document.createElement("input");

  inputObj.setAttribute("id", "zego_whiteboard_UIKits_file");
  inputObj.setAttribute("type", "file");
  inputObj.setAttribute("name", "file");
  inputObj.setAttribute("style", "visibility:hidden");
  inputObj.setAttribute("accept", "image/jpeg,image/png");
  document.body.appendChild(inputObj);
  (
    document.querySelector("#zego_whiteboard_UIKits_file") as HTMLInputElement
  ).addEventListener("change", (ev) => {
    const target = ev.target as HTMLInputElement;
    target.files && callback(target.files[0]);
    document.body.removeChild(inputObj);
  });
  inputObj.click();
}

/**
 * Generate token
 *
 * Token = "04" + Base64.encode(expire_time + IV.length + IV + binary ciphertext.length + binary ciphertext)
 * Algorithm: AES<ServerSecret, IV>(token_json_str), use mode: CBC/PKCS5Padding
 *
 * Only the client-side sample code for generating token is provided here. Be sure to generate tokens in your business background to avoid leaking your ServerSecret
 */
export function generatePrebuiltToken(
  appID: number,
  serverSecret: string,
  roomID: string,
  userID: string,
  userName?: string,
  seconds?: number
) {
  //   if (!roomID) {
  //     console.error("【ZEGOCLOUD】:roomID required!!");
  //     return "";
  //   }
  if (!userID) {
    console.error("【ZEGOCLOUD】:userID required!!");
    return "";
  }
  if (!userName) {
    console.error("【ZEGOCLOUD】:userName required!!");
    return "";
  }
  if (!appID) {
    console.error("【ZEGOCLOUD】:appID required!!");
    return "";
  }

  if (typeof appID != "number") {
    console.error("【ZEGOCLOUD】:appID must be number!!");
    return "";
  }

  if (!serverSecret) {
    console.error("【ZEGOCLOUD】: serverSecret required!!");
    return "";
  }

  // construct encrypted data
  const time = (Date.now() / 1000) | 0;
  const body = {
    app_id: appID,
    user_id: userID,
    nonce: (Math.random() * 2147483647) | 0,
    ctime: time,
    expire: time + (seconds || 7200),
  };
  // encrypt body
  const key = CryptoJS.enc.Utf8.parse(serverSecret);
  let iv = Math.random().toString().substring(2, 18);
  if (iv.length < 16) iv += iv.substring(0, 16 - iv.length);

  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(body), key, {
    iv: CryptoJS.enc.Utf8.parse(iv),
  }).toString();
  const ciphert = Uint8Array.from(
    Array.from(atob(ciphertext)).map((val) => val.charCodeAt(0))
  );
  const len_ciphert = ciphert.length;

  // Assemble token data
  const uint8 = new Uint8Array(8 + 2 + 16 + 2 + len_ciphert);
  // expire: 8
  uint8.set([0, 0, 0, 0]);
  uint8.set(new Uint8Array(Int32Array.from([body.expire]).buffer).reverse(), 4);
  // iv length: 2
  uint8[8] = iv.length >> 8;
  uint8[9] = iv.length - (uint8[8] << 8);
  // iv: 16
  uint8.set(
    Uint8Array.from(Array.from(iv).map((val) => val.charCodeAt(0))),
    10
  );
  // ciphertext length: 2
  uint8[26] = len_ciphert >> 8;
  uint8[27] = len_ciphert - (uint8[26] << 8);
  // ciphertext
  uint8.set(ciphert, 28);

  const token = `04${btoa(String.fromCharCode(...Array.from(uint8)))}`;

  return (
    token +
    "#" +
    window.btoa(
      JSON.stringify({
        userID,
        roomID,
        userName: encodeURIComponent(userName),
        appID,
      })
    )
  );
}

/**
 * Performs a search for a given name in a list of members.
 *
 * @param {string[]} memberList - The list of members to search through.
 * @param {string} name - The name to search for.
 * @return {any[]} An array of search results.
 */
export function memberSearch(memberList: ZegoCloudUserList, name: string) {
    const option = {
        location: 0,
        distance: 100,
        threshold: 0.0,
        keys: ["userName"],
    };
    const fuse = new Fuse(memberList, option);
    return fuse.search(name);
}


