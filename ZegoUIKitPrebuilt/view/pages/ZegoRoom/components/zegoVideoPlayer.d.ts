import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ShowManageContext, { ShowManageType } from "../../context/showManage";
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
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowManageContext>;
    state: {
        hovered: boolean;
    };
    render(): React.ReactNode;
}
