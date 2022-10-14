import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ShowManageContext, { ShowManageType } from "../context/showManage";
export declare class ZegoUserVideo extends React.PureComponent<{
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
    bigVideo?: boolean;
}> {
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowManageContext>;
    video: HTMLVideoElement | null;
    componentWillUnmount(): void;
    render(): React.ReactNode;
}
export declare class ZegoUserOtherVideo extends React.PureComponent<{
    user: ZegoCloudUser;
    nextUser: ZegoCloudUser;
    othersNumber: number;
    circleSize?: "GRID" | "SIDEBAR";
    onLocalStreamPaused?: () => void;
}> {
    render(): React.ReactNode;
}
