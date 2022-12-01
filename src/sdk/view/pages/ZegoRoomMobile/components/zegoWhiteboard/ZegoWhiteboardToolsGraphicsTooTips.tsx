import React from "react";
import ShowPCManageContext, {
  ShowManageType,
} from "../../../context/showManage";
import ZegoWhiteboardToolsGraphicsTooTipsCss from "./ZegoWhiteboardToolsGraphicsTooTips.module.scss";

export class ZegoWhiteboardToolsGraphicsTooTips extends React.PureComponent<{
  onToolChange: (type: number, fontSize: number, color: string) => void;
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
          item.className.includes("ZegoWhiteboardToolsGraphicsTooTips")
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
        className={`${ZegoWhiteboardToolsGraphicsTooTipsCss.graphicsTools} ZegoWhiteboardToolsGraphicsTooTips`}
        ref={(el) => {
          // console.error("graphicsTools", el);
        }}
      >
        <div
          className={ZegoWhiteboardToolsGraphicsTooTipsCss.graphicsTools_react}
        >
          <h3>形状选择</h3>
          <ul>
            {[8, 16, 4].map((react) => {
              return (
                <li
                  key={react}
                  onClick={(e) => {
                    this.setState({
                      react,
                    });
                    this.props.onToolChange(
                      react,
                      this.context.whiteboard_brushSize!,
                      this.context.whiteboard_brushColor!
                    );
                  }}
                  className={
                    this.context.whiteboard_toolType === react
                      ? ZegoWhiteboardToolsGraphicsTooTipsCss.selected
                      : ""
                  }
                ></li>
              );
            })}
          </ul>
        </div>

        <div
          className={ZegoWhiteboardToolsGraphicsTooTipsCss.graphicsTools_bold}
        >
          <h3>笔触粗细</h3>
          <ul>
            {[4, 6, 8, 12].map((fontSize) => {
              return (
                <li
                  key={fontSize}
                  onClick={(e) => {
                    this.setState({
                      fontSize,
                    });
                    this.props.onToolChange(
                      this.context.whiteboard_toolType!,
                      fontSize,
                      this.context.whiteboard_brushColor!
                    );
                  }}
                >
                  <i
                    className={
                      this.context.whiteboard_brushSize === fontSize
                        ? ZegoWhiteboardToolsGraphicsTooTipsCss.selected
                        : ""
                    }
                    style={{ width: fontSize, height: fontSize }}
                  ></i>
                </li>
              );
            })}
          </ul>
        </div>
        <div
          className={ZegoWhiteboardToolsGraphicsTooTipsCss.graphicsTools_color}
        >
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
                      this.context.whiteboard_toolType!,
                      this.context.whiteboard_brushSize!,
                      fontColor
                    );
                  }}
                  className={
                    this.context.whiteboard_brushColor === fontColor
                      ? ZegoWhiteboardToolsGraphicsTooTipsCss.selected
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
