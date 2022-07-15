import { generateV4Token } from "./token/token";
// 生成token
export function generateToken(
  tokenServerUrl: string,
  userID: string,
  roomID: string,
  userName: string
): Promise<{ token: string }> {
  // Obtain the token interface provided by the App Server
  //   本地调试token
  //   return Promise.resolve({
  //     token:
  //       generateV4Token(userID) +
  //       "#" +
  //       window.btoa(
  //         JSON.stringify({ userID, roomID, userName, appID: 1715619064 })
  //       ),
  //   });
  return fetch(
    `${tokenServerUrl}/access_token?userID=${userID}&userName=${userName}&roomID=${roomID}&expired_ts=7200`,
    {
      method: "GET",
    }
  ).then((res) => res.json());
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
