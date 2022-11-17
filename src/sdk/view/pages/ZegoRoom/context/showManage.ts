import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export type ShowPCManageType = {
  show?: (user: ZegoCloudUser) => void;
  showPinButton: boolean;
  speakerId?: string;
  whiteboard_page?: number;
  whiteboard_toolType?: number;
  whiteboard_fontSize?: number;
  whiteboard_brushSize?: number;
  whiteboard_brushColor?: string;
  whiteboard_isFontBold?: boolean;
  whiteboard_isFontItalic?: boolean;
};

const ShowPCManageContext = React.createContext<ShowPCManageType>({
  showPinButton: true,
  speakerId: "default",
});
export default ShowPCManageContext;
