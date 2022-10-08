import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ZegoMoreCss from "./zegoMore.module.scss";
import ShowManageContext, { ShowManageType } from "../context/showManage";
export class ZegoMore extends React.PureComponent<{ user: ZegoCloudUser }> {
  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;
  render(): React.ReactNode {
    let { show, showPinButton } = this.context;
    return (
      <div
        style={{ display: showPinButton ? "block" : "none" }}
        className={`${ZegoMoreCss.more} zegoMore_more`}
        onClick={() => {
          show(this.props.user);
        }}
      ></div>
    );
  }
}
