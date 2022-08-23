export declare function randomNumber(len: number): number;
export declare function isPc(): boolean;
export declare function DateFormat(date: number, fmt: string): string;
export declare function userNameColor(userName: string): string;
export declare function getUrlParams(url: string): {
    [k: string]: string;
};
export declare function getVideoResolution(level: string): {
    width: number;
    height: number;
    bitrate: number;
    frameRate: number;
};
export declare const throttle: (fn: Function, wait: number) => () => void;
