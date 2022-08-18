import React from "react";
import { ZegoCloudUser } from "../../../../modules/tools/UserListManager";
import zegoManageCss from "./zegoManage.module.scss";
export class ZegoManage extends React.Component<{
  selectedUser: ZegoCloudUser;
  closeCallBac: () => void;
  selectCallBac: (type?: "Pin", value?: boolean) => void;
}> {
  async select(type?: "Pin", value?: boolean) {
    this.props.selectCallBac && this.props.selectCallBac("Pin", value);
  }
  render(): React.ReactNode {
    return (
      <div className={zegoManageCss.manageList}>
        <div className={zegoManageCss.manageHeader}>
          {this.props.selectedUser.userName}
          <div
            className={zegoManageCss.manageHide}
            onClick={(ev) => {
              ev.stopPropagation();
              this.props.closeCallBac && this.props.closeCallBac();
            }}
          ></div>
        </div>

        <div className={zegoManageCss.manageListContent}>
          <div
            className={zegoManageCss.manageContent}
            onClick={() => {
              this.select("Pin", !this.props.selectedUser.pin);
            }}
          >
            <div className={zegoManageCss.manageContentLeft}>
              <i></i>
              <span>Pin</span>
            </div>
            <a
              className={
                this.props.selectedUser.pin ? zegoManageCss.selected : ""
              }
            >
              {" "}
            </a>
          </div>
        </div>
      </div>
    );
  }
}
