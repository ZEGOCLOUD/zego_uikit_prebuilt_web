import { stringify } from "querystring";

declare function generatePrebuiltToken(
  appID: Number,
  serverSecret: string,
  roomID: string,
  userID: string,
  userName: string
): string;
// 生成token
export function generateToken(
  userID: string,
  roomID: string,
  userName: string
): Promise<{ token: string }> {
  console.log("generateToken:", process.env);
  if (process.env.REACT_APP_ENV === "test") {
    return fetch(
      `https://nextjs-token-7berndqqr-choui666.vercel.app/api/access_token?userID=${userID}&userName=${userName}&roomID=${roomID}&expired_ts=86400`,
      {
        method: "GET",
      }
    ).then((res) => res.json());
  } else {
    return fetch("https://console-api.zegocloud.com/demo/prebuilt_token", {
      method: "POST",
      body: JSON.stringify({
        user_id: userID,
        room_id: roomID,
        user_name: userName,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      const result = await res.json();
      return {
        token: result.data.token,
      };
    });
  }
}
export function generateTokenForCallInvitation(
  userID: string,
  roomID: string,
  userName: string
): Promise<{ token: string }> {
  console.log("generateToken:", process.env);
  return fetch(
    `https://nextjs-token-callinvitation.vercel.app/api/access_token?userID=${userID}&expired_ts=86400`,
    {
      method: "GET",
    }
  )
    .then((res) => res.json())
    .then((result) => {
      return {
        token:
          result.token +
          "#" +
          window.btoa(
            JSON.stringify({ userID, roomID, userName, appID: 252984006 })
          ),
      };
    });
}
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
export function randomNumID(len: number): string {
  len = len || 5;
  var r = Math.floor(Math.random() * Math.pow(10, len)).toString();
  if (r.length < len) {
    r = randomNumID(len);
  }
  return r;
}
export function getRandomName() {
  const names = [
    "Oliver",
    "Jake",
    "Noah",
    "James",
    "Jack",
    "Connor",
    "Liam",
    "John",
    "Harry",
    "Callum",
    "Mason",
    "Robert",
    "Jacob",
    "Jacob",
    "Jacob",
    "Michael",
    "Charlie",
    "Kyle",
    "William",
    "William",
    "Thomas",
    "Joe",
    "Ethan",
    "David",
    "George",
    "Reece",
    "Michael",
    "Richard",
    "Oscar",
    "Rhys",
    "Alexander",
    "Joseph",
    "James",
    "Charlie",
    "James",
    "Charles",
    "William",
    "Damian",
    "Daniel",
    "Thomas",
  ];
  let index = Math.round(Math.random() * names.length);
  index = index == names.length ? index - 1 : index;
  return names[index];
}
export function isAndroid(): boolean {
  let u = navigator.userAgent;
  return u.indexOf("Android") > -1 || u.indexOf("Adr") > -1;
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
export function getUrlParams(
  url: string = window.location.href
): URLSearchParams {
  let urlStr = url.split("?")[1];
  return new URLSearchParams(urlStr);
}
