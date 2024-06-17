import React from "react";
import zegoLayoutCss from "./zegoLayout.module.scss";
import { ZegoCloudRTCCore } from "../../../../modules";
export class ZegoLayout extends React.PureComponent<{
  core: ZegoCloudRTCCore
  selectLayout: "Sidebar" | "Grid" | "Auto";
  closeCallBac: () => void;
  selectCallBack?: (
    selectLayout: "Sidebar" | "Grid" | "Auto"
  ) => Promise<boolean>;
}> {
  state: { selectLayout: "Sidebar" | "Grid" | "Auto" } = {
    selectLayout: this.props.selectLayout || "Auto",
  };

  checking = false;

  async select(selectLayout: "Sidebar" | "Grid" | "Auto") {
    if (this.props.selectCallBack && !this.checking) {
      this.checking = true;
      this.setState({ selectLayout });
      await this.props.selectCallBack(selectLayout);
      this.checking = false;
    }
  }
  render(): React.ReactNode {
    const { formatMessage } = this.props.core.intl
    return (
      <div className={zegoLayoutCss.layoutList}>
        <div className={zegoLayoutCss.layoutHeader}>
          <div
            className={zegoLayoutCss.layoutHide}
            onClick={(ev) => {
              ev.stopPropagation();
              this.props.closeCallBac && this.props.closeCallBac();
            }}
          ></div>
          {formatMessage({ id: "mobileRoom.layout" })}
        </div>

        <div className={zegoLayoutCss.layoutListContent}>
          <div
            className={zegoLayoutCss.layoutContent}
            onClick={() => {
              this.select("Auto");
            }}
          >
            <div className={zegoLayoutCss.layoutContentLeft}>
              <i className={zegoLayoutCss.default}></i>
              <span>{formatMessage({ id: "room.autoLayout" })}</span>
            </div>
            <i
              className={
                this.state.selectLayout === "Auto" ? zegoLayoutCss.selected : ""
              }
            >
              {" "}
            </i>
          </div>
          <div
            className={zegoLayoutCss.layoutContent}
            onClick={() => {
              this.select("Grid");
            }}
          >
            <div className={zegoLayoutCss.layoutContentLeft}>
              <i className={zegoLayoutCss.grid}></i>
              <span>{formatMessage({ id: "room.gridLayout" })}</span>
            </div>
            <i
              className={
                this.state.selectLayout === "Grid" ? zegoLayoutCss.selected : ""
              }
            >
              {" "}
            </i>
          </div>
          <div
            className={zegoLayoutCss.layoutContent}
            onClick={() => {
              this.select("Sidebar");
            }}
          >
            <div className={zegoLayoutCss.layoutContentLeft}>
              <i className={zegoLayoutCss.sidebar}></i>
              <span>{formatMessage({ id: "room.sidebarLayout" })}</span>
            </div>
            <i
              className={
                this.state.selectLayout === "Sidebar"
                  ? zegoLayoutCss.selected
                  : ""
              }
            >
              {" "}
            </i>
          </div>
        </div>
      </div>
    );
  }
}
