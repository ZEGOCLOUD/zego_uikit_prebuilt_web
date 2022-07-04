export declare function generateVideoView(isVideo: boolean, userID: string): HTMLMediaElement;
export declare function getConfig(token: string): {
    appID: number;
    userID: string;
    userName: string;
    roomID: string;
    token: string;
} | undefined;
export declare function copy(text: string, dom: HTMLTextAreaElement | HTMLInputElement): void;
export declare function formatTime(s: number): string;
