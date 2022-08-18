import React from "react";
export declare class ZegoConfirmComponents extends React.Component<{
    closeCallBack: (confirm: boolean) => void;
    title: string;
    content?: string;
    cancel?: string;
    confirm?: string;
}> {
    render(): React.ReactNode;
}
export declare const ZegoConfirm: (config?: {
    closeCallBack?: ((confirm: boolean) => void) | undefined;
    title?: string | undefined;
    content?: string | undefined;
    cancel?: string | undefined;
    confirm?: string | undefined;
} | undefined) => void;
