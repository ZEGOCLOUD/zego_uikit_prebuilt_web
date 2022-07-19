export function randomID(len: number): string {
  let result = "";
  let chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

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
