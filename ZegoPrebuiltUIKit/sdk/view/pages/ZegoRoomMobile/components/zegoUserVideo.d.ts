import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export declare class ZegoUserVideo extends React.Component<{
    user: ZegoCloudUser;
    onLocalStreamPaused?: () => void;
    volume: {
        [streamID: string]: number;
    };
}> {
    render(): React.ReactNode;
}
export declare class ZegoUserOtherVideo extends React.Component<{
    user: ZegoCloudUser;
    nextUser: ZegoCloudUser;
    othersNumber: number;
    onLocalStreamPaused?: () => void;
}> {
    render(): React.ReactNode;
}
