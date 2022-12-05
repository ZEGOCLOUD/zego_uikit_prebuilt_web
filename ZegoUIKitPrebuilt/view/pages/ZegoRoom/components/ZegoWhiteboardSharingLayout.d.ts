import React from "react";
import { ZegoWhiteboardSharingLayoutProps } from "../../../../model";
import ShowPCManageContext, { ShowManageType } from "../../context/showManage";
export declare class ZegoWhiteboardSharingLayout extends React.PureComponent<ZegoWhiteboardSharingLayoutProps> {
    container: HTMLDivElement | null;
    containerWidth: number;
    containerHeight: number;
    state: {
        currentZoom: number;
        rows: 1 | 2;
    };
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowPCManageContext>;
    componentDidMount(): void;
    render(): React.ReactNode;
}
