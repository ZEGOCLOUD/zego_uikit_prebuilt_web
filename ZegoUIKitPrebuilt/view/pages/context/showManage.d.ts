import React from "react";
import { ZegoCloudUser } from "../../../modules/tools/UserListManager";
export type ShowManageType = {
    show?: (user: ZegoCloudUser) => void;
    showPinButton: boolean;
    userInfo: {
        userID: string;
    };
    speakerId?: string;
    whiteboard_page?: number;
    whiteboard_toolType?: number;
    whiteboard_fontSize?: number;
    whiteboard_brushSize?: number;
    whiteboard_brushColor?: string;
    whiteboard_isFontBold?: boolean;
    whiteboard_isFontItalic?: boolean;
    whiteboard_showAddImage?: boolean;
    whiteboard_showCreateClose?: boolean;
};
declare const ShowManageContext: React.Context<ShowManageType>;
export default ShowManageContext;
