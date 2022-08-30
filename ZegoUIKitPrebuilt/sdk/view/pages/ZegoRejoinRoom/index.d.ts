import React from "react";
import { ZegoBrowserCheckProp } from "../../../model";
export declare class ZegoRejoinRoom extends React.Component<ZegoBrowserCheckProp> {
    state: {
        isPc: boolean;
        isJoining: boolean;
    };
    joinRoom(): Promise<void>;
    returnHome(): void;
    render(): React.ReactNode;
}
