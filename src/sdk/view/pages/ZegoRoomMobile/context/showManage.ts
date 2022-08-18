import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export type ShowManageType = {
  show: (user: ZegoCloudUser) => void;
};

const ShowManageContext = React.createContext<ShowManageType>({
  show: () => {},
});
export default ShowManageContext;
