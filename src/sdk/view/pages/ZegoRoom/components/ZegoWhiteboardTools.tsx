import React from "react";

export class ZegoWhiteboardSharingLayout extends React.PureComponent<any> {
  setToolType(type: number | null, ev: any) {}

  setBrushSize(type: number | null, ev: any) {}

  setBrushColor(type: string | null, ev: any) {}
  render(): React.ReactNode {
    return (
      <div id="main-whiteboard-tool">
        <ul className="tools-list">
          <li
            className="tool-item disabled clickType"
            data-toggle="tooltip"
            data-placement="right"
            title="点击"
            onClick={() => {
              this.setToolType(256, event);
            }}
          >
            <div></div>
          </li>
        </ul>
      </div>
    );
  }
}
