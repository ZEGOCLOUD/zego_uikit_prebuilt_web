export function randomID(len: number): string {
  let result = "";
  if (result) return result;
  var chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
    maxPos = chars.length,
    i;
  len = len || 5;
  for (i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

export function isPc(): boolean {
  return false;
  const p = navigator.platform;
  let system = { win: p.indexOf("Win") == 0, mac: p.indexOf("Mac") == 0 };
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
      console.error(k, RegExp.$1, v);
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? v : ("00" + v).substr(("" + v).length)
      );
    }
  });

  return fmt;
}
