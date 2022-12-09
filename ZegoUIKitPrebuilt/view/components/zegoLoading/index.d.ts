import React from "react";
export declare class ZegoLoading extends React.Component<{
    contentText?: string;
}> {
    render(): React.ReactNode;
}
export declare const ZegoLoadingShow: (props: {
    contentText?: string;
}, parentDom?: Element | null | undefined) => void;
export declare const ZegoLoadingHide: () => void;
