import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import ZegoMoreCss from "./zegoMore.module.scss";
import ShowManageContext, { ShowManageType } from "../context/showManage";
export class ZegoMore extends React.Component<{ user: ZegoCloudUser }> {
  static contextType?: React.Context<ShowManageType> = ShowManageContext;
  context!: React.ContextType<typeof ShowManageContext>;
  render(): React.ReactNode {
    let { show } = this.context;
    return (
      <div
        className={ZegoMoreCss.more}
        onClick={() => {
          show(this.props.user);
        }}
      >
        <div></div>
        <div></div>
        <div></div>
      </div>
    );
  }
}
