import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ShowPCManageContext, { ShowPCManageType } from "../context/showManage";
export declare class VideoPlayer extends React.PureComponent<{
    userInfo: ZegoCloudUser;
    muted: boolean;
    volume?: {
        [streamID: string]: number;
    };
    handlePin?: Function;
    onPause?: Function;
    onCanPlay?: Function;
    myClass?: string;
    hiddenName?: boolean;
    hiddenMore?: boolean;
}> {
    static contextType?: React.Context<ShowPCManageType>;
    context: React.ContextType<typeof ShowPCManageContext>;
    video: HTMLVideoElement | null;
    state: {
        hovered: boolean;
    };
    componentWillUnmount(): void;
    render(): React.ReactNode;
}
