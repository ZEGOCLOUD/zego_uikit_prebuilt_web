import React, { RefObject } from "react";
import { ZegoCloudRTCCore } from "../../../../modules";
import { copy } from "../../../../modules/tools/util";
import { ZegoToast } from "../../../components/zegoToast";
import ZegoRoomInviteCss from "./zegoRoomInvite.module.scss";
export class ZegoRoomInvite extends React.PureComponent<{
  core: ZegoCloudRTCCore;
}> {
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
          <div className={ZegoRoomInviteCss.inviteLink}>
            <input placeholder="inviteLink" readOnly value={link.url}></input>
            <div
              className={ZegoRoomInviteCss.copyLinkButton}
              onClick={() => {
                link && link.url && this.handleCopy(link.url);
              }}
            ></div>
          </div>
        </div>
      );
    });
  }
}
