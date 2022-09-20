import React, { ChangeEvent } from "react";
import zegoRoomInviteCss from "./zegoRoomInvite.module.scss";
import { ZegoCloudRTCCore } from "../../../../modules";
import { copy } from "../../../../modules/tools/util";
import { ZegoToast } from "../../../components/mobile/zegoToast";
export class ZegoRoomInvite extends React.Component<{
  core: ZegoCloudRTCCore;
  closeCallBack: () => void;
}> {
  render(): React.ReactNode {
    return (
      <div className={zegoRoomInviteCss.roomDetails}>
        <div className={zegoRoomInviteCss.inviteHeader}>
          <div
            className={zegoRoomInviteCss.inviteHide}
            onClick={(ev) => {
              ev.stopPropagation();
              this.props.closeCallBack();
            }}
          ></div>
          Room details
        </div>
        {this.props.core._config.sharedLinks?.map((link) => {
          return (
            <div
              className={zegoRoomInviteCss.inviteLinkWrapper}
              key={link.name}
            >
              <div className={zegoRoomInviteCss.title}>{link.name}</div>
              <div className={zegoRoomInviteCss.inviteLink}>
                <input
                  placeholder="inviteLink"
                  readOnly
                  value={link.url}
                ></input>
                <div
                  className={zegoRoomInviteCss.copyLinkButton}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    copy(link.url);
                    ZegoToast({
                      content: "Copy successfully",
                      duration: 3000,
                    });
                  }}
                >
                  Copy
                </div>
              </div>
            </div>
          );
        })}
        {/* <div className={zegoRoomInviteCss.inviteURL}>
          {this.props.core._config.sharedLinks &&
            this.props.core._config.sharedLinks[0] &&
            this.props.core._config.sharedLinks[0].url}
        </div>
        <div
          className={zegoRoomInviteCss.inviteCopy}
          onClick={(ev) => {
            ev.stopPropagation();
            if (
              this.props.core._config.sharedLinks &&
              this.props.core._config.sharedLinks.length > 0
            ) {
              copy(this.props.core._config.sharedLinks[0].url);
            }

            ZegoToast({
              content: "Copy successfully",
              duration: 3,
            });
          }}
        >
          <i></i>
          <span>Copy the link</span>
        </div> */}
      </div>
    );
  }
}
