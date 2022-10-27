import { ZegoUIKitPrebuilt } from "../ZegoUIKitPrebuilt";

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
  // const { token } = await generateToken(
  //   "https://choui-prebuilt.herokuapp.com",
  //   randomID(5),
  //   roomID,
  //   randomID(5)
  // );
  // const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
  //   1484647939,
  //   "22076fd0a8388f31dc1f6e344171....",
  //   roomID,
  //   randomID(5),
  //   randomID(5),
  //   7200
  // );

  const token = ZegoUIKitPrebuilt.generateKitTokenForProduction(
    1715619064,
    "04AAAAAGNbrH8AEDVvdW1kOGt2emIxZ....",
    roomID,
    "choui",
    "choui"
  );

  const zp = ZegoUIKitPrebuilt.create(token);
  zp.joinRoom({
    container: document.querySelector("#root") as HTMLDivElement,
    scenario: { mode: ZegoUIKitPrebuilt.GroupCall },
    sharedLinks: [
      {
        name: "join Room:" + roomID,
        url:
          window.location.origin +
          window.location.pathname +
          "?roomID=" +
          roomID,
      },
    ],
    onJoinRoom: () => {
      console.warn("choui:onJoinRoom");
    },
    onLeaveRoom: () => {
      console.warn("choui:onLeaveRoom");
    },
    onUserLeave: (user) => {
      console.warn("choui:onUserLeave", user);
    },
    onUserJoin: (user) => {
      console.warn("choui:onUserJoin", user);
    },
  });
}

window.onload = init;
