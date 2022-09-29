import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

// Generate a Token by calling a method.
// @param 1: appID
// @param 2: serverSecret
// @param 3: Room ID
// @param 4: User ID
// @param 5: Username
const roomID = "room01";
const userID = Math.floor(Math.random() * 10000) + "";
const userName = "userName" + userID;
const TOKEN = generatePrebuiltToken(
  11111,
  "22076fd0a8388.......",
  roomID,
  userID,
  userName
);

const zp = ZegoUIKitPrebuilt.create(TOKEN);
zp.joinRoom({
  container: document.querySelector("#root"),
  sharedLinks: [
    {
      name: "Join as Host",
      url:
        window.location.origin + window.location.pathname + "?roomID=" + roomID,
    },
  ],
  scenario: {
    mode: ZegoUIKitPrebuilt.GroupCall, //  如果你要限制人数，切换为1v1 call , 这里的参数切换成 ZegoUIKitPrebuilt.OneONoneCall
  },
});
