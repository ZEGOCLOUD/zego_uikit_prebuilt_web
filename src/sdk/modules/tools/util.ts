export function generateVideoView(
  isVideo: boolean,
  userID: string
): HTMLMediaElement {
  const mediaDom = document.createElement(isVideo ? "video" : "audio");
  mediaDom.id = "zego-video-" + userID;
  mediaDom.autoplay = true;

  return mediaDom;
}

export function getConfig(token: string) {
  if (token.split("#").length > 1) {
    const tokenInfo = JSON.parse(window.atob(token.split("#")[1]));
    return {
      appID: tokenInfo.appID * 1,
      userID: tokenInfo.userID as string,
      userName: tokenInfo.userName as string,
      roomID: tokenInfo.roomID as string,
      token: token.split("#")[0] as string,
    };
  } else {
    console.error("【ZEGOCLOUD】Token error");
  }
}

function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("【ZEGOCLOUD】 Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("【ZEGOCLOUD】Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}
export function copy(text: string) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function () {
      console.log("【ZEGOCLOUD】Async: Copying to clipboard was successful!");
    },
    function (err) {
      console.error("【ZEGOCLOUD】 Async: Could not copy text: ", err);
    }
  );
}

export function formatTime(s: number): string {
  return [s / 3600, s / 60, s % 60]
    .map((item) => (item < 10 ? "0" : "") + Math.floor(item))
    .join(":");
}
