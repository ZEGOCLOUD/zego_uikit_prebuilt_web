export declare function generateVideoView(isVideo: boolean, userID: string): HTMLMediaElement;
export declare function getConfig(token: string): {
    appID: number;
    userID: string;
    userName: string;
    roomID: string;
    token: string;
} | undefined;
export declare function copy(text: string): void;
export declare function formatTime(s: number): string;
export declare function generateStreamID(userID: string, roomID: string, type?: "main" | "media" | "screensharing"): string;
