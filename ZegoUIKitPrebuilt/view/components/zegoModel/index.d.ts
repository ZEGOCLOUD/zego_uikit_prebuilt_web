import React from "react";
export interface ZegoModelProps {
    header: string;
    contentText: string;
    okText?: string;
    cancelText?: string;
    onOk?: Function;
    onCancel?: Function;
}
export declare class ZegoModel extends React.Component<ZegoModelProps> {
    render(): React.ReactNode;
}
export declare const ZegoModelShow: (props: ZegoModelProps, parentDom?: Element | null | undefined) => void;
