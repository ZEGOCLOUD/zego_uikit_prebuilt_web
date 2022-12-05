import React from "react";
import ShowPCManageContext, { ShowManageType } from "../../../context/showManage";
export declare class ZegoWhiteboardToolsGraphicsTooTips extends React.PureComponent<{
    onToolChange: (type: number, fontSize: number, color: string) => void;
    onClose: () => void;
}> {
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowPCManageContext>;
    OnDocumentClick(ev: MouseEvent): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): React.ReactNode;
}
