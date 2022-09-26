import { ZegoCloudRTCCore } from "@zegocloud/zego-uikit-prebuilt/sdk/modules";
import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import { ZegoUserList } from "../../ZegoRoom/components/zegoUserList";
export type ShowManageType = {
  show: (user: ZegoCloudUser) => void;
  showPinButton: boolean;
  userInfo: { userID: string };
};

const ShowManageContext = React.createContext<ShowManageType>({
  show: () => {},
  showPinButton: true,
  userInfo: { userID: "" },
});
export default ShowManageContext;
