import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ShowManageContext, { ShowManageType } from "../context/showManage";
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
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowManageContext>;
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
