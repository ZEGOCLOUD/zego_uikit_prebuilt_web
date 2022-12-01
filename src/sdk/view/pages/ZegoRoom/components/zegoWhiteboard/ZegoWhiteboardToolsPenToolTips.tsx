import React from "react";
import ShowPCManageContext, {
  ShowManageType,
} from "../../../context/showManage";
import ZegoWhiteboardToolsPenToolTipsCss from "./ZegoWhiteboardToolsPenToolTips.module.scss";

export class ZegoWhiteboardToolsPenTooTips extends React.PureComponent<{
  onToolChange: (fontSize: number, color: string) => void;
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
          item.className.includes("ZegoWhiteboardToolsPenToolTips")
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
        className={`${ZegoWhiteboardToolsPenToolTipsCss.penTools} ${
          this.props.rows === 2 ? ZegoWhiteboardToolsPenToolTipsCss.twoRows : ""
        } ZegoWhiteboardToolsPenToolTips`}
      >
        <div className={ZegoWhiteboardToolsPenToolTipsCss.penTools_bold}>
          <h3>笔触粗细</h3>
          <ul>
            {[4, 6, 8, 10].map((fontSize) => {
              return (
                <li
                  key={fontSize}
                  onClick={(e) => {
                    this.setState({
                      fontSize,
                    });
                    this.props.onToolChange(
                      fontSize,
                      this.context.whiteboard_brushColor!
                    );
                  }}
                >
                  <i
                    className={
                      this.context.whiteboard_brushSize === fontSize
                        ? ZegoWhiteboardToolsPenToolTipsCss.selected
                        : ""
                    }
                    style={{ width: fontSize, height: fontSize }}
                  ></i>
                </li>
              );
            })}
          </ul>
        </div>
        <div className={ZegoWhiteboardToolsPenToolTipsCss.penTools_color}>
          <h3>笔触颜色</h3>
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
                    this.props.onToolChange(
                      this.context.whiteboard_brushSize!,
                      fontColor
                    );
                  }}
                  className={
                    this.context.whiteboard_brushColor === fontColor
                      ? ZegoWhiteboardToolsPenToolTipsCss.selected
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
