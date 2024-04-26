import React from "react";
import ShowPCManageContext, {
  ShowManageType,
} from "../../../context/showManage";
import ZegoWhiteboardToolsTextToolTipsCss from "./ZegoWhiteboardToolsTextToolTips.module.scss";
const fontMap: { [index: number]: number } = {
  12: 18,
  14: 24,
  16: 36,
  18: 48,
};

const fontMapRevers: { [index: number]: number } = {
  18: 12,
  24: 14,
  36: 16,
  48: 18,
};
export class ZegoWhiteboardToolsTextTooTips extends React.PureComponent<{
  onFontChange: (
    font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC",
    fontSize?: number,
    color?: string
  ) => void;
  onClose: () => void;
}> {
  static contextType?: React.Context<ShowManageType> = ShowPCManageContext;
  context!: React.ContextType<typeof ShowPCManageContext>;

  OnDocumentClick(ev: MouseEvent) {
    // @ts-ignore
    const path: HTMLElement[] = ev.path || ev.composedPath();
    if (
      !path.some((item) => {
        console.log(item.className);
        return (
          item.className &&
          item.className.includes("ZegoWhiteboardToolsTextToolTips")
        );
      })
    ) {
      this.props.onClose();
    }
  }

  state = {
    font: "",
    fontColor: "",
    fontSize: 0,
    isFontBold: false,
    isFontItalic: false,
  };

  componentDidMount() {
    this.setState({
      isFontBold: this.context.whiteboard_isFontBold,
      isFontItalic: this.context.whiteboard_isFontItalic,
      fontColor: this.context.whiteboard_brushColor,
      fontSize: fontMapRevers[this.context.whiteboard_fontSize!],
    });
    window.document.addEventListener(
      "touchstart",
      //@ts-ignore
      this.OnDocumentClick.bind(this)
    );
  }

  componentWillUnmount(): void {
    //@ts-ignore
    window.document.removeEventListener("touchstart", this.OnDocumentClick);
  }

  render(): React.ReactNode {
    return (
      <div
        className={`${ZegoWhiteboardToolsTextToolTipsCss.textTools} ZegoWhiteboardToolsTextToolTips`}
      >
        <div className={ZegoWhiteboardToolsTextToolTipsCss.textTools_font}>
          <h3>Font</h3>
          <ul>
            {["BOLD", "ITALIC"].map((font) => {
              return (
                <li
                  key={font}
                  onClick={() => {
                    let wbFont;
                    if (font === "BOLD") {
                      if (this.state.isFontBold) {
                        wbFont = "NO_BOLD";
                      } else {
                        wbFont = "BOLD";
                      }
                      this.setState((preState: { isFontBold: boolean }) => {
                        return { isFontBold: !preState.isFontBold };
                      });
                    } else if (font === "ITALIC") {
                      if (this.state.isFontItalic) {
                        wbFont = "NO_ITALIC";
                      } else {
                        wbFont = "ITALIC";
                      }
                      this.setState((preState: { isFontItalic: boolean }) => {
                        return { isFontItalic: !preState.isFontItalic };
                      });
                    }
                    this.props.onFontChange(
                      wbFont as "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC",
                      this.context.whiteboard_fontSize,
                      this.context.whiteboard_brushColor!
                    );
                  }}
                  className={
                    (font === "BOLD" && this.state.isFontBold) ||
                    (font === "ITALIC" && this.state.isFontItalic)
                      ? ZegoWhiteboardToolsTextToolTipsCss.selected
                      : ""
                  }
                  style={{ fontStyle: font }}
                ></li>
              );
            })}
          </ul>
        </div>
        <div className={ZegoWhiteboardToolsTextToolTipsCss.textTools_size}>
          <h3>Thickness</h3>
          <ul>
            {[12, 14, 16, 18].map((fontSize: number) => {
              return (
                <li
                  key={fontSize}
                  onClick={(e) => {
                    this.setState({
                      fontSize,
                    });
                    this.props.onFontChange(
                      undefined,
                      fontMap[fontSize],
                      this.context.whiteboard_brushColor!
                    );
                  }}
                  className={
                    this.state.fontSize === fontSize
                      ? ZegoWhiteboardToolsTextToolTipsCss.selected
                      : ""
                  }
                  style={{ fontSize: fontSize + "px" }}
                >
                  A
                </li>
              );
            })}
          </ul>
        </div>
        <div className={ZegoWhiteboardToolsTextToolTipsCss.textTools_color}>
          <h3>Color</h3>
          <ul>
            {[
              "#FFFFFF",
              "#A4A4A4",
              "#333333",
              "#000000",
              "#F64326",
              "#FD7803",
              "#FBE605",
              "#3FBB54",
              "#00EAE7",
              "#0484FE",
              "#825FD0",
              "#FB7D7D",
            ].map((fontColor) => {
              return (
                <li
                  key={fontColor}
                  style={{ backgroundColor: fontColor }}
                  onClick={(e) => {
                    this.setState({
                      fontColor,
                    });
                    this.props.onFontChange(
                      undefined,
                      this.context.whiteboard_fontSize!,
                      fontColor
                    );
                  }}
                  className={
                    this.state.fontColor === fontColor
                      ? ZegoWhiteboardToolsTextToolTipsCss.selected
                      : ""
                  }
                ></li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}
