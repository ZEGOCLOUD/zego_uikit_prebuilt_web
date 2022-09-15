import React, { RefObject } from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { copy } from "../../../../modules/tools/util";
import { ZegoToast } from "../../../components/zegoToast";
import ZegoRoomInviteCss from "./zegoRoomInvite.module.scss";
export class ZegoRoomInvite extends React.Component<{
  core: ZegoCloudRTCCore;
}> {
  inviteRef: RefObject<HTMLInputElement> = React.createRef();
  handleCopy(url: string) {
    copy(url);
    ZegoToast({
      content: "Copied",
    });
  }
  render(): React.ReactNode {
    return this.props.core._config.sharedLinks?.map((link) => {
      return (
        <div className={ZegoRoomInviteCss.inviteLinkWrapper} key={link.name}>
          <div className={ZegoRoomInviteCss.title}>{link.name}</div>
          <input
            className={ZegoRoomInviteCss.inviteLink}
            placeholder="inviteLink"
            readOnly
            value={link.url}
            ref={this.inviteRef}
          ></input>
          <div
            className={ZegoRoomInviteCss.copyLinkButton}
            onClick={() => {
              this.handleCopy(link.url);
            }}
          >
            Copy
          </div>
        </div>
      );
    });
  }
}
