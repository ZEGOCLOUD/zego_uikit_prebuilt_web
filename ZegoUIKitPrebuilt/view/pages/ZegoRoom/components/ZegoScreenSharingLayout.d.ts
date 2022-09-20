import React from "react";
import { ZegoScreenSharingLayoutProps } from "../../../../model";
export declare class ZegoScreenSharingLayout extends React.Component<ZegoScreenSharingLayoutProps> {
    state: {
        fullScreen: boolean;
        loadingMask: boolean;
        showBottomTip: boolean;
    };
    componentDidMount(): void;
    onCanPlay(): void;
    handleIgnore(): void;
    render(): React.ReactNode;
}
