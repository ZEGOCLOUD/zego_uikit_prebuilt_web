import React from "react";
import { userNameColor } from "../../../../util";
import zegoOne2OneCss from "./zegoOne2One.module.scss";
import { ZegoMore } from "./zegoMore";
import { ZegoCloudUserList } from "../../../../modules/tools/UserListManager";
export class ZegoOne2One extends React.Component<{
  userList: ZegoCloudUserList;
  onLocalStreamPaused: () => void;
}> {
  getVideoScreen() {
    if (this.props.userList.length > 1) {
      return (
        <>
          <div className={zegoOne2OneCss.bigVideo}>
            {this.props.userList[1].streamList[0] &&
              this.props.userList[1].streamList[0].media && (
                <video
                  style={{ width: "100%" }}
                  autoPlay
                  playsInline={true}
                  ref={(el) => {
                    el &&
                      el.srcObject !==
                        this.props.userList[1].streamList[0].media &&
                      (el.srcObject =
                        this.props.userList[1].streamList[0].media);
                  }}
                ></video>
              )}

            <div className={zegoOne2OneCss.name}>
              <p>{this.props.userList[1].userName}</p>
              <span
                className={
                  this.props.userList[1].streamList[0] &&
                  this.props.userList[1].streamList[0].micStatus === "OPEN"
                    ? zegoOne2OneCss.bigVideoMicOpen
                    : ""
                }
              ></span>
            </div>
            {(!this.props.userList[1].streamList[0] ||
              this.props.userList[1].streamList[0].cameraStatus !== "OPEN") && (
              <i
                style={{
                  color: userNameColor(this.props.userList[1].userName!),
                }}
              >
                {this.props.userList[1].userName?.substring(0, 1)}
              </i>
            )}
            <ZegoMore user={this.props.userList[1]} />
          </div>
          <div className={zegoOne2OneCss.smallVideo}>
            {this.props.userList[0].streamList[0] &&
              this.props.userList[0].streamList[0].media && (
                <video
                  muted
                  playsInline={true}
                  autoPlay
                  ref={(el) => {
                    el &&
                      el.srcObject !==
                        this.props.userList[0].streamList[0].media &&
                      (el.srcObject =
                        this.props.userList[0].streamList[0].media);
                  }}
                  onPause={() => {
                    this.props.onLocalStreamPaused();
                  }}
                ></video>
              )}

            <div className={zegoOne2OneCss.smallName}>
              <p> {this.props.userList[0].userName + "（YOU）"} </p>
              <span
                className={
                  this.props.userList[0].streamList[0] &&
                  this.props.userList[0].streamList[0].micStatus === "OPEN"
                    ? zegoOne2OneCss.smallVideoMicOpen
                    : ""
                }
              ></span>
            </div>
            {(!this.props.userList[0].streamList[0] ||
              this.props.userList[0].streamList[0].cameraStatus !== "OPEN") && (
              <i
                style={{
                  color: userNameColor(this.props.userList[0].userName!),
                }}
              >
                {this.props.userList[0].userName!.substring(0, 1)}
              </i>
            )}
            <ZegoMore user={this.props.userList[0]} />
          </div>
        </>
      );
    } else if (this.props.userList.length > 0) {
      return (
        <div className={zegoOne2OneCss.bigVideo}>
          {this.props.userList[0].streamList[0] &&
            this.props.userList[0].streamList[0].media && (
              <video
                style={{
                  top: 0,
                  transform: "translateX(-50%)",
                  left: "50%",
                  position: "absolute",
                }}
                muted
                autoPlay
                playsInline={true}
                ref={(el) => {
                  el &&
                    el.srcObject !==
                      this.props.userList[0].streamList[0].media &&
                    (el.srcObject = this.props.userList[0].streamList[0].media);
                }}
                onPause={() => {
                  this.props.onLocalStreamPaused();
                }}
              ></video>
            )}

          <div className={zegoOne2OneCss.name}>
            <p>{this.props.userList[0].userName}</p>
            <span
              className={
                this.props.userList[0].streamList[0] &&
                this.props.userList[0].streamList[0].micStatus === "OPEN"
                  ? zegoOne2OneCss.bigVideoMicOpen
                  : ""
              }
            ></span>
          </div>
          {(!this.props.userList[0].streamList[0] ||
            this.props.userList[0].streamList[0].cameraStatus === "MUTE") && (
            <i
              style={{
                color: userNameColor(this.props.userList[0].userName!),
              }}
            >
              {this.props.userList[0].userName?.substring(0, 1)}
            </i>
          )}
          <ZegoMore user={this.props.userList[0]} />
        </div>
      );
    }
  }

  render(): React.ReactNode {
    return <>{this.getVideoScreen()}</>;
  }
}
