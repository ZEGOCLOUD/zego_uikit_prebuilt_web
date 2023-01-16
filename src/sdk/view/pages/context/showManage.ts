import React from "react";
import { ZegoCloudUser } from "../../../modules/tools/UserListManager";
export type ShowManageType = {
  show?: (user: ZegoCloudUser) => void;
  showPinButton: boolean;
  userInfo: { userID: string };
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
  showTurnOffMicrophoneButton?: (user: ZegoCloudUser) => boolean;
  showTurnOffCameraButton?: (user: ZegoCloudUser) => boolean;
  showRemoveButton?: (user: ZegoCloudUser) => boolean;
  isShownPin?: (user: ZegoCloudUser) => boolean;
};

const ShowManageContext = React.createContext<ShowManageType>({
  showPinButton: true,
  speakerId: "default",
  userInfo: { userID: "" },
  show: () => {},
});
export default ShowManageContext;
