import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import { SoundLevelMap } from "../../../../model";
export declare class ZegoOne2One extends React.PureComponent<{
    selfInfo: {
        userID: string;
    };
    onLocalStreamPaused: () => void;
    handleSetPin?: Function;
    soundLevel?: SoundLevelMap;
    userList: ZegoCloudUser[];
}> {
    getVideoScreen(): JSX.Element | null;
    render(): React.ReactNode;
}
