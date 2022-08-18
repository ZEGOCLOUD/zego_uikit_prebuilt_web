import React, { RefObject } from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { copy } from "../../../../modules/tools/util";
import { ZegoToast } from "../../../components/zegoToast";
import ZegoRoomInviteCss from "./zegoRoomInvite.module.scss";
export class ZegoRoomInvite extends React.Component<{
  core: ZegoCloudRTCCore;
}> {
  inviteRef: RefObject<HTMLInputElement> = React.createRef();
  handleCopy() {
    this.inviteRef.current && copy(this.inviteRef.current.value);
    ZegoToast({
      content: "Copied",
    });
  }
  render(): React.ReactNode {
    return (
      <div className={ZegoRoomInviteCss.inviteLinkWrapper}>
        <div className={ZegoRoomInviteCss.title}>Share the Link</div>
        <input
          className={ZegoRoomInviteCss.inviteLink}
          placeholder="inviteLink"
          readOnly
          value={this.props.core._config.preJoinViewConfig?.invitationLink}
          ref={this.inviteRef}
        ></input>
        <div
          className={ZegoRoomInviteCss.copyLinkButton}
          onClick={() => {
            this.handleCopy();
          }}
        >
          Copy
        </div>
      </div>
    );
  }
}
