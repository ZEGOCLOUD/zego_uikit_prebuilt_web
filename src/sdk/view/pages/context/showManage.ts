import React from "react";
import { ZegoCloudUser } from "../../../modules/tools/UserListManager";
export type ShowManageType = {
  show?: (user: ZegoCloudUser) => void;
  showPinButton: boolean;
  userInfo: { userID: string };
  speakerId?: string;
};

const ShowManageContext = React.createContext<ShowManageType>({
  showPinButton: true,
  speakerId: "default",
  userInfo: { userID: "" },
  show: () => {},
});
export default ShowManageContext;
