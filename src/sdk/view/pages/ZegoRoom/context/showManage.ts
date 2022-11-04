import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
export type ShowPCManageType = {
  show?: (user: ZegoCloudUser) => void;
  showPinButton: boolean;
  speakerId?: string;
  canAutoPlay?: boolean;
  setAutoPlay?: (bool: boolean) => void;
};

const ShowPCManageContext = React.createContext<ShowPCManageType>({
  showPinButton: true,
  speakerId: "default",
  canAutoPlay: false,
  setAutoPlay(bool: boolean) {
    this.canAutoPlay = bool;
  },
});
export default ShowPCManageContext;
