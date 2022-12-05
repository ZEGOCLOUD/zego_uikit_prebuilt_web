import React from "react";
import ShowPCManageContext, { ShowManageType } from "../../../context/showManage";
export declare class ZegoWhiteboardTools extends React.PureComponent<{
    onToolChange: (type: number, fontSize?: number, color?: string) => void;
    onFontChange: (font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC", fontSize?: number, color?: string) => void;
    onAddImage: (file: File) => void;
    onSnapshot: () => void;
}> {
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowPCManageContext>;
    state: {
        hideTools: boolean;
        selectedTool: number;
        showTextTools: boolean;
        showGraphicsTools: boolean;
        showFontTools: boolean;
    };
    showTool(type: number): boolean;
    render(): React.ReactNode;
}
