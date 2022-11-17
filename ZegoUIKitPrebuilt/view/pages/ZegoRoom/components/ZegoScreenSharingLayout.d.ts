import React from "react";
import { ZegoScreenSharingLayoutProps } from "../../../../model";
export declare class ZegoScreenSharingLayout extends React.PureComponent<ZegoScreenSharingLayoutProps> {
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
