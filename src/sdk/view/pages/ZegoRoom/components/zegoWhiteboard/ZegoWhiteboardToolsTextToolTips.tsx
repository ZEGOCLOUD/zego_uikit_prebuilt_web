import React from "react";
import ShowPCManageContext, {
  ShowManageType,
} from "../../../context/showManage";
import ZegoWhiteboardToolsTextToolTipsCss from "./ZegoWhiteboardToolsTextToolTips.module.scss";

export class ZegoWhiteboardToolsTextTooTips extends React.PureComponent<{
  onFontChange: (
    font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC",
    fontSize?: number,
    color?: string
  ) => void;
  onClose: () => void;
  rows: 1 | 2 | undefined;
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

  componentDidMount() {
    window.document.addEventListener("click", this.OnDocumentClick.bind(this));
  }

  componentWillUnmount(): void {
    window.document.removeEventListener("click", this.OnDocumentClick);
  }

  render(): React.ReactNode {
    return (
      <div
        className={`${ZegoWhiteboardToolsTextToolTipsCss.textTools} ${
          this.props.rows === 2
            ? ZegoWhiteboardToolsTextToolTipsCss.twoRows
            : ""
        } ZegoWhiteboardToolsTextToolTips`}
      >
        <div className={ZegoWhiteboardToolsTextToolTipsCss.textTools_font}>
          <h3>Font</h3>
          <ul>
            {["BOLD", "ITALIC"].map((font) => {
              return (
                <li
                  key={font}
                  onClick={() => {
                    if (font === "BOLD" && this.context.whiteboard_isFontBold) {
                      font = "NO_BOLD";
                    } else if (
                      font === "ITALIC" &&
                      this.context.whiteboard_isFontItalic
                    ) {
                      font = "NO_ITALIC";
                    }
                    this.setState({
                      font,
                    });
                    this.props.onFontChange(
                      font as "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC",
                      this.context.whiteboard_fontSize,
                      this.context.whiteboard_brushColor!
                    );
                  }}
                  className={
                    (font === "BOLD" && this.context.whiteboard_isFontBold) ||
                    (font === "ITALIC" && this.context.whiteboard_isFontItalic)
                      ? ZegoWhiteboardToolsTextToolTipsCss.selected
                      : ""
                  }
                  style={{ fontStyle: font }}
                >
                  {font.substring(0, 1)}
                </li>
              );
            })}
          </ul>
        </div>
        <div className={ZegoWhiteboardToolsTextToolTipsCss.textTools_size}>
          <h3>Thickness</h3>
          <ul>
            {[12, 14, 16, 18].map((fontSize: number) => {
              const fontMap: { [index: number]: number } = {
                12: 18,
                14: 24,
                16: 36,
                18: 48,
              };
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
                    this.context.whiteboard_fontSize === fontMap[fontSize]
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
                    this.context.whiteboard_brushColor === fontColor
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
