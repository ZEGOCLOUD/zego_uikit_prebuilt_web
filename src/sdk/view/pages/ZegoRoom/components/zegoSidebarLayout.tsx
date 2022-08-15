import React from "react";
import clsx from "clsx";
import { ZegoSidebarLayoutProps } from "../../../../model";
import { OthersVideo } from "./zegoCommonComponents";
import ZegoSidebarCss from "./zegoSidebarLayout.module.scss";

function VideoPlayer() {
  return (
    <div>
      <video
        muted
        autoPlay
        src="https://resource.zegocloud.com/office/avatar.mp4"
      ></video>
    </div>
  );
}

export class ZegoSidebarLayout extends React.Component<ZegoSidebarLayoutProps> {
  render(): React.ReactNode {
    let wrapClassName = clsx({
      [ZegoSidebarCss.rightWrapper]: true,
      [ZegoSidebarCss.fiveRow]: this.props.videoShowNumber === 5,
      [ZegoSidebarCss.fourRow]: this.props.videoShowNumber === 4,
      [ZegoSidebarCss.threeRow]: this.props.videoShowNumber === 3,
      [ZegoSidebarCss.twoRow]: this.props.videoShowNumber === 2,
      [ZegoSidebarCss.oneRow]: this.props.videoShowNumber === 1,
    });
    return (
      <>
        <div className={ZegoSidebarCss.sidebarWrapper}>
          <div className={ZegoSidebarCss.leftWrapper}>
            <video
              muted
              autoPlay
              src="https://resource.zegocloud.com/office/avatar.mp4"
            ></video>
          </div>
          <div className={wrapClassName}>
            {this.props.userList.map((value, index, arr) => {
              if (arr.length > this.props.videoShowNumber) {
                if (index === this.props.videoShowNumber - 1) {
                  return (
                    <OthersVideo
                      users={[arr[index].userName, arr[index + 1]?.userName]}
                      others={arr.length - this.props.videoShowNumber + 1}
                    ></OthersVideo>
                  );
                }
                if (index > this.props.videoShowNumber - 1) {
                  return <audio></audio>;
                }
              }
              return <VideoPlayer></VideoPlayer>;
            })}
          </div>
        </div>
      </>
    );
  }
}
