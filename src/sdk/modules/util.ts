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

export function copy(
  text: string,
  dom: HTMLTextAreaElement | HTMLInputElement
) {
  if (navigator && navigator.clipboard) {
    navigator && navigator.clipboard && navigator.clipboard.writeText(text);
  } else {
    dom.select();
    document.execCommand("copy");
  }
}

export function formatTime(s: number): string {
  return [s / 3600, s / 60, s % 60]
    .map((item) => (item < 10 ? "0" : "") + Math.floor(item))
    .join(":");
}
