import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export declare type ShowPCManageType = {
    show?: (user: ZegoCloudUser) => void;
    showPinButton: boolean;
    speakerId?: string;
};
declare const ShowPCManageContext: React.Context<ShowPCManageType>;
export default ShowPCManageContext;
