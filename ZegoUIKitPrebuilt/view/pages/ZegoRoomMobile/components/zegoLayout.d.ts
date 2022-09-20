import React from "react";
export declare class ZegoLayout extends React.Component<{
    selectLayout: "Sidebar" | "Grid" | "Default";
    closeCallBac: () => void;
    selectCallBack?: (selectLayout: "Sidebar" | "Grid" | "Default") => Promise<boolean>;
}> {
    state: {
        selectLayout: "Sidebar" | "Grid" | "Default";
    };
    checking: boolean;
    select(selectLayout: "Sidebar" | "Grid" | "Default"): Promise<void>;
    render(): React.ReactNode;
}
