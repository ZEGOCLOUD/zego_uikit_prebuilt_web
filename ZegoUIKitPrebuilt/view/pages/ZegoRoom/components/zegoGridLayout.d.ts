import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import ShowPCManageContext, { ShowPCManageType } from "../context/showManage";
export declare class ZegoGridLayout extends React.Component<ZegoGridLayoutProps> {
    static contextType?: React.Context<ShowPCManageType>;
    context: React.ContextType<typeof ShowPCManageContext>;
    render(): React.ReactNode;
}
