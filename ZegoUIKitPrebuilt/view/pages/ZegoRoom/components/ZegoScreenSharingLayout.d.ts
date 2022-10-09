import React from "react";
import { ZegoScreenSharingLayoutProps } from "../../../../model";
import ShowPCManageContext, { ShowPCManageType } from "../context/showManage";
export declare class ZegoScreenSharingLayout extends React.PureComponent<ZegoScreenSharingLayoutProps> {
    state: {
        fullScreen: boolean;
        loadingMask: boolean;
        showBottomTip: boolean;
    };
    static contextType?: React.Context<ShowPCManageType>;
    context: React.ContextType<typeof ShowPCManageContext>;
    componentDidMount(): void;
    onCanPlay(): void;
    handleIgnore(): void;
    render(): React.ReactNode;
}
