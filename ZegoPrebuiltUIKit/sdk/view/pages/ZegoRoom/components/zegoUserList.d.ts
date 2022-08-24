import React from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
import { SoundLevelMap } from "../../../../model";
export declare class ZegoUserList extends React.Component<{
    core: ZegoCloudRTCCore;
    userList: ZegoCloudUserList;
    selfUserID: string;
    handleSetPin: Function;
    soundLevel?: SoundLevelMap;
}> {
    componentDidMount(): void;
    componentWillUnmount(): void;
    onBodyClick(e: Event): void;
    expandMemberMenu(userID: string | null): void;
    getHeight(userID: string, streamID: string): number;
    render(): React.ReactNode;
}