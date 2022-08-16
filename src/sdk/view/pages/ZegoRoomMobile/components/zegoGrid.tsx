import React from "react";
import { ZegoGridLayoutProps } from "../../../../model";
import { userNameColor } from "../../../../util";
import ZegoGridCss from "./zegoGrid.module.scss";
import clsx from "clsx";
export class ZegoGrid extends React.Component<ZegoGridLayoutProps> {
  render(): React.ReactNode {
    let wrapClassName = clsx({
      [ZegoGridCss.gridWrapper]: true,
      [ZegoGridCss.double]: this.props.userList.length <= 2,
      [ZegoGridCss.three]:
        this.props.userList.length === 4 || this.props.userList.length === 3,
      [ZegoGridCss.six]:
        this.props.userList.length === 6 || this.props.userList.length === 5,
      [ZegoGridCss.night]: this.props.userList.length >= 7,
    });

    return (
      <div className={wrapClassName}>
        {this.props.userList.map((value, index, arr) => {
          if (arr.length > this.props.videoShowNumber) {
            if (index === this.props.videoShowNumber - 1) {
              return (
                <div>
                  {/* <video muted className={ZegoCommonCss.videoCommon}></video>
                  <div className={ZegoCommonCss.otherVideoWrapper}>
                    <div className={ZegoCommonCss.nameWrapper}>
                      {props.users.map((value, i) => (
                        <div
                          className={ZegoCommonCss.nameCircle}
                          key={i}
                          style={{
                            color: userNameColor(value),
                          }}
                        >
                          {value.slice(0, 1)?.toUpperCase()}
                        </div>
                      ))}
                    </div>
                    {props.others > 0 && (
                      <p className={ZegoCommonCss.othersNumber}>
                        {props.others} others
                      </p>
                    )}
                  </div> */}
                </div>
              );
            }
            if (index > this.props.videoShowNumber - 1) {
              return <audio></audio>;
            }
          }
          return (
            <div>
              <video
                muted
                autoPlay
                className={ZegoGridCss.videoCommon}
                ref={(el) => {
                  el &&
                    el.srcObject !== value.streamList[0].media &&
                    (el.srcObject = value.streamList[0].media);
                }}
              ></video>
            </div>
          );
        })}
      </div>
    );
  }
}
