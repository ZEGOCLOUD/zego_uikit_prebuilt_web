import { ZegoUIkitPrebuiltMeeting } from "@zego-uikit/prebuilt-meeting-web";
// get token
function generateToken(
  tokenServerUrl: string,
  userID: string,
  roomID: string,
  userName: string
) {
  // Obtain the token interface provided by the App Server
  return fetch(
    `${tokenServerUrl}/access_token?userID=${userID}&userName=${userName}&roomID=${roomID}&expired_ts=7200`,
    {
      method: "GET",
    }
  ).then((res) => res.json());
}

function randomID(len: number) {
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

function getUrlParams(url: string) {
  let urlStr = url.split("?")[1];
  const urlSearchParams = new URLSearchParams(urlStr);
  const result = Object.fromEntries(urlSearchParams.entries());
  return result;
}

async function init() {
  const roomID = getUrlParams(window.location.href)["roomID"] || randomID(5);
  const { token } = await generateToken(
    "https://choui-prebuilt.herokuapp.com",
    randomID(5),
    roomID,
    randomID(5)
  );
  const zp = ZegoUIkitPrebuiltMeeting.init(token);
  zp.joinRoom({
    container: document.querySelector("#root") as HTMLDivElement,
    joinScreen: {
      inviteURL:
        window.location.origin + window.location.pathname + "?roomID=" + roomID,
      visible: true,
    },
  });
}

window.onload = init;
