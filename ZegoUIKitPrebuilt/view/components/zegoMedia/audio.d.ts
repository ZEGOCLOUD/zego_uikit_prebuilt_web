import React from "react";
import { ZegoCloudUser } from "../../../modules/tools/UserListManager";
import ShowManageContext, { ShowManageType } from "../../pages/context/showManage";
export default class ZegoAudio extends React.PureComponent<{
    userInfo: ZegoCloudUser;
    muted?: boolean;
    classList?: string;
}> {
    static contextType?: React.Context<ShowManageType>;
    context: React.ContextType<typeof ShowManageContext>;
    audioRef: HTMLAudioElement | null;
    flvPlayer: any;
    initAudio(el: HTMLAudioElement): void;
    initFLVPlayer(audioElement: HTMLAudioElement, url: string): void;
    isSafari(): boolean;
    componentWillUnmount(): void;
    render(): React.ReactNode;
}
