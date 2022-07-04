import React from "react";
import { ZegoBrowserCheckProp } from "../../../model";

export class ZegoRejoinRoom extends React.Component<ZegoBrowserCheckProp> {
  async joinRoom() {
    const loginRsp = await this.props.core.enterRoom();
    if (loginRsp) {
      this.props.joinRoom && this.props.joinRoom();
    } else {
      // alert
      console.error("【ZEGOCLOUD】Room is full !!");
    }
  }

  render(): React.ReactNode {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => {
            this.joinRoom();
          }}
        >
          RejoinRoom
        </button>
      </div>
    );
  }
}
