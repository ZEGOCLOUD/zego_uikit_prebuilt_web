import React from "react";
import zegoLayoutCss from "./zegoLayout.module.scss";
export class ZegoLayout extends React.PureComponent<{
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
      const res = await this.props.selectCallBack(selectLayout);
      this.checking = false;
    }
  }
  render(): React.ReactNode {
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
          Layout
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
              <span>Auto</span>
            </div>
            <a
              className={
                this.state.selectLayout === "Auto" ? zegoLayoutCss.selected : ""
              }
            >
              {" "}
            </a>
          </div>
          <div
            className={zegoLayoutCss.layoutContent}
            onClick={() => {
              this.select("Grid");
            }}
          >
            <div className={zegoLayoutCss.layoutContentLeft}>
              <i className={zegoLayoutCss.grid}></i>
              <span>Grid</span>
            </div>
            <a
              className={
                this.state.selectLayout === "Grid" ? zegoLayoutCss.selected : ""
              }
            >
              {" "}
            </a>
          </div>
          <div
            className={zegoLayoutCss.layoutContent}
            onClick={() => {
              this.select("Sidebar");
            }}
          >
            <div className={zegoLayoutCss.layoutContentLeft}>
              <i className={zegoLayoutCss.sidebar}></i>
              <span>Sidebar</span>
            </div>
            <a
              className={
                this.state.selectLayout === "Sidebar"
                  ? zegoLayoutCss.selected
                  : ""
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
