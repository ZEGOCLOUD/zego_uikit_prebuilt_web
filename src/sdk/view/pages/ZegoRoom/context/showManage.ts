import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export type ShowPCManageType = {
  show?: (user: ZegoCloudUser) => void;
  showPinButton: boolean;
  speakerId?: string;
};

const ShowPCManageContext = React.createContext<ShowPCManageType>({
  showPinButton: true,
  speakerId: "default",
});
export default ShowPCManageContext;
