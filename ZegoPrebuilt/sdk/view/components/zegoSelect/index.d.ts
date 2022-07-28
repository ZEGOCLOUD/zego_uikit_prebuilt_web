import React from "react";
export interface ZegoSelectProps {
    label?: string;
    placeholder?: string;
    options?: Array<{
        name: string;
        value: string;
    }>;
    onChange?: Function;
    theme?: string;
    initValue?: string;
}
export declare class ZegoSelect extends React.Component<ZegoSelectProps> {
    state: {
        value: string;
        name: string;
        showList: boolean;
    };
    listRef: React.RefObject<HTMLDivElement>;
    selectRef: React.RefObject<HTMLDivElement>;
    handleChange(op: {
        value: string;
        name: string;
    }): void;
    handleClickInput(): void;
    onCloseList: (event: any) => void;
    setInitValue(): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    componentDidUpdate(prevProps: any): void;
    render(): React.ReactNode;
}
