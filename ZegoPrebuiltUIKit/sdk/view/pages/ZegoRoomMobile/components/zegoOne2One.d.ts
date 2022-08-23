import React from "react";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import { SoundLevelMap } from "../../../../model";
export declare class ZegoOne2One extends React.Component<{
    userList: ZegoCloudUserList;
    onLocalStreamPaused: () => void;
    soundLevel?: SoundLevelMap;
}> {
    getVideoScreen(): JSX.Element | undefined;
    render(): React.ReactNode;
}
