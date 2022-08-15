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

export function getUrlParams(url: string) {
  let urlStr = url.split("?")[1];
  const urlSearchParams = new URLSearchParams(urlStr);
  const result = Object.fromEntries(urlSearchParams.entries());
  return result;
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
