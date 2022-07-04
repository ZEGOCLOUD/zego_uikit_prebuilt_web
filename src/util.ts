// 生成token
export function generateToken(
  tokenServerUrl: string,
  userID: string,
  roomID: string,
  userName: string
): Promise<{ token: string }> {
  // Obtain the token interface provided by the App Server
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
