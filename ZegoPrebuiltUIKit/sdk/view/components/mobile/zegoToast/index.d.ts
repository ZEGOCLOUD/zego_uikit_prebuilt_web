import React from "react";
export declare class ZegoToastComponents extends React.Component<{
    closeCallBack: () => void;
    content?: string;
    duration: number;
}> {
    state: {
        mounted: boolean;
    };
    componentDidMount(): void;
    render(): React.ReactNode;
}
export declare const ZegoToast: (config?: {
    closeCallBack?: () => void;
    content?: string;
    duration?: number;
}) => void;
