import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export type ShowPCManageType = {
  show?: (user: ZegoCloudUser) => void;
  showPinButton: boolean;
};

const ShowPCManageContext = React.createContext<ShowPCManageType>({
  showPinButton: true,
});
export default ShowPCManageContext;
