/// <reference types="react" />
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export declare function VideoPlayer(props: {
    userInfo: ZegoCloudUser;
    muted: boolean;
    volume?: {
        [streamID: string]: number;
    };
    handlePin?: Function;
    onPause?: Function;
    myClass?: string;
}): JSX.Element;
