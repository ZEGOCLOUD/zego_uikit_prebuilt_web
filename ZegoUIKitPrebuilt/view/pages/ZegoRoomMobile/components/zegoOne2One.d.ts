import React from "react";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import { SoundLevelMap } from "../../../../model";
export declare class ZegoOne2One extends React.PureComponent<{
    userList: ZegoCloudUserList;
    onLocalStreamPaused: () => void;
    soundLevel?: SoundLevelMap;
    selfInfo?: {
        userID: string;
    };
}> {
    getVideoScreen(): JSX.Element | undefined;
    render(): React.ReactNode;
}
