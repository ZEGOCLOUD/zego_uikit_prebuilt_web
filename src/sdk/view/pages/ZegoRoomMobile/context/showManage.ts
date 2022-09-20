import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export type ShowManageType = {
  show: (user: ZegoCloudUser) => void;
  showPinButton: boolean;
};

const ShowManageContext = React.createContext<ShowManageType>({
  show: () => {},
  showPinButton: true,
});
export default ShowManageContext;
