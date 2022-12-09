import React from "react";
import ShowPCManageContext, { ShowManageType } from "../../../context/showManage";
export declare class ZegoWhiteboardToolsPenTooTips extends React.PureComponent<{
    onToolChange: (fontSize: number, color: string) => void;
    onClose: () => void;
}> {
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowPCManageContext>;
    OnDocumentClick(ev: MouseEvent): void;
    state: {
        fontColor: string;
        fontSize: number;
    };
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): React.ReactNode;
}
