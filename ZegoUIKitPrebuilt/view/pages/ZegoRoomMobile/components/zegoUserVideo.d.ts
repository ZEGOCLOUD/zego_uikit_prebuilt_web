import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export declare class ZegoUserVideo extends React.Component<{
    user: ZegoCloudUser;
    onLocalStreamPaused?: () => void;
    onCanPlay?: () => void;
    volume: {
        [streamID: string]: number;
    };
    circleSize?: "GRID" | "SIDEBAR";
    muted: boolean;
    hiddenName?: boolean;
    hiddenMore?: boolean;
}> {
    render(): React.ReactNode;
}
export declare class ZegoUserOtherVideo extends React.Component<{
    user: ZegoCloudUser;
    nextUser: ZegoCloudUser;
    othersNumber: number;
    circleSize?: "GRID" | "SIDEBAR";
    onLocalStreamPaused?: () => void;
}> {
    render(): React.ReactNode;
}
