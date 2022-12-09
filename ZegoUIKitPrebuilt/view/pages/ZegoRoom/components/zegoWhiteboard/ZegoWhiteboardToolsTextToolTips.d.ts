import React from "react";
import ShowPCManageContext, { ShowManageType } from "../../../context/showManage";
export declare class ZegoWhiteboardToolsTextTooTips extends React.PureComponent<{
    onFontChange: (font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC", fontSize?: number, color?: string) => void;
    onClose: () => void;
    rows: 1 | 2 | undefined;
}> {
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowPCManageContext>;
    OnDocumentClick(ev: MouseEvent): void;
    state: {
        font: string;
        fontColor: string;
        fontSize: number;
    };
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): React.ReactNode;
}
