import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export declare type ShowManageType = {
    show: (user: ZegoCloudUser) => void;
    showPinButton: boolean;
    userInfo: {
        userID: string;
    };
};
declare const ShowManageContext: React.Context<ShowManageType>;
export default ShowManageContext;
