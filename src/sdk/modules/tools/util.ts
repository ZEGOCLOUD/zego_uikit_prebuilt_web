import type { ZegoBroadcastMessageInfo } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity";

export function generateVideoView(isVideo: boolean, userID: string): HTMLMediaElement {
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
			userName: decodeURIComponent(tokenInfo.userName as string),
			roomID: tokenInfo.roomID as string,
			token: token.split("#")[0] as string,
		};
	} else {
		console.error("【ZEGOCLOUD】kitToken error");
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
	return [s / 3600, s / 60, s % 60].map((item) => (item < 10 ? "0" : "") + Math.floor(item)).join(":");
}

export function generateStreamID(userID: string, roomID: string, type?: "main" | "media" | "screensharing"): string {
	type = type || "main";
	return `${roomID}_${userID}_${type}`;
}
export function changeCDNUrlOrigin(url: string) {
	if (/^http:\/\//.test(url)) {
		return url.replace(/http:/, "https:");
	}
	return url;
}
type ThrottleFn = (func: Function, delay: number) => Function;

export const throttle: ThrottleFn = (func, delay) => {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	let lastExecTime = 0;

	return function (this: any, ...args: any[]) {
		const now = Date.now();

		if (now - lastExecTime < delay) {
			if (timeoutId) clearTimeout(timeoutId);

			timeoutId = setTimeout(() => {
				lastExecTime = now;
				func.apply(this, args);
			}, delay - (now - lastExecTime));
		} else {
			lastExecTime = now;
			func.apply(this, args);
		}
	};
};
// message maybe a string or a json string, need to be transformed
export function transformMsg(msgs: ZegoBroadcastMessageInfo[]) {
	return msgs.map((msg) => {
		try {
			const message = JSON.parse(msg.message);
			return {
				...msg,
				message: message.msg !== undefined ? message.msg : msg.message,
				attrs: message.attrs || "",
			}
		} catch (error) {
			return msg;
		}
	});
}
