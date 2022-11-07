import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export type ShowPCManageType = {
  show?: (user: ZegoCloudUser) => void;
  showPinButton: boolean;
  speakerId?: string;
  canAutoPlay?: boolean;
  setAutoPlay?: () => void;
};

const ShowPCManageContext = React.createContext<ShowPCManageType>({
  showPinButton: true,
  speakerId: "default",
  canAutoPlay: false,
  setAutoPlay: () => {},
});
export default ShowPCManageContext;
