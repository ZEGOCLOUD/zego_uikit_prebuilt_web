import React from "react";
export declare class ZegoLayout extends React.PureComponent<{
    selectLayout: "Sidebar" | "Grid" | "Auto";
    closeCallBac: () => void;
    selectCallBack?: (selectLayout: "Sidebar" | "Grid" | "Auto") => Promise<boolean>;
}> {
    state: {
        selectLayout: "Sidebar" | "Grid" | "Auto";
    };
    checking: boolean;
    select(selectLayout: "Sidebar" | "Grid" | "Auto"): Promise<void>;
    render(): React.ReactNode;
}
