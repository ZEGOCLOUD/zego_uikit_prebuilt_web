import React from "react";
import { ZegoWhiteboardSharingLayoutProps } from "../../../../model";
import ZegoAudio from "../../../components/zegoMedia/audio";
import ZegoSidebarCss from "./zegoSidebar.module.scss";
import zegoWhiteboardSharingLayout from "./zegoWhiteboard.module.scss";
import { ZegoUserOtherVideo, ZegoUserVideo } from "./zegoUserVideo";
import ShowPCManageContext, { ShowManageType } from "../../context/showManage";
import { ZegoWhiteboardTools } from "./zegoWhiteboard/ZegoWhiteboardTools";
import { ZegoToast } from "../../../components/mobile/zegoToast";
import { FingerGestureUtils } from "../../../../fingerGestureUtil";
import {
  ZegoLoadingHide,
  ZegoLoadingShow,
} from "../../../components/zegoLoading";

export class ZegoWhiteboard extends React.PureComponent<ZegoWhiteboardSharingLayoutProps> {
  container: HTMLDivElement | null = null;
  containerWidth: number = 0;
  containerHeight: number = 0;
  state: {
    currentZoom: number;
  } = {
    currentZoom: 100,
  };
  static contextType?: React.Context<ShowManageType> = ShowPCManageContext;
  context!: React.ContextType<typeof ShowPCManageContext>;
  componentDidMount() {
    const currentZoom = this.props.zegoSuperBoardView
      ?.getCurrentSuperBoardSubView()
      ?.getScaleFactor().scaleFactor;

    this.setState({
      currentZoom: currentZoom ? currentZoom * 100 : 100,
    });
  }
  render(): React.ReactNode {
    return (
      <div
        className={`${ZegoSidebarCss.sidebarWrapper} ${
          ZegoSidebarCss.landscape
        }  ${
          this.props.userList.length === 0 ? ZegoSidebarCss.fullScreen : ""
        }`}
        style={{ padding: 0 }}
      >
        <div
          className={`${ZegoSidebarCss.upWrapper} ${zegoWhiteboardSharingLayout.upWrapper} zegoUserVideo_click`}
        >
          {this.props.userList.map((value, index, arr) => {
            if (arr.length > this.props.videoShowNumber - 1) {
              if (index === this.props.videoShowNumber - 2) {
                return (
                  <ZegoUserOtherVideo
                    key={value.userID + "_otherVideo"}
                    user={value}
                    circleSize="SIDEBAR"
                    nextUser={arr[index + 1]}
                    othersNumber={arr.length - this.props.videoShowNumber + 2}
                  ></ZegoUserOtherVideo>
                );
              }
              if (index > this.props.videoShowNumber - 2) {
                return (
                  value.streamList &&
                  value.streamList[0] && (
                    <ZegoAudio
                      muted={false}
                      classList={ZegoSidebarCss.videoCommon}
                      userInfo={value}
                      key={index + "_audio_" + value.userID}
                    ></ZegoAudio>
                  )
                );
              }
            }
            return (
              <ZegoUserVideo
                muted={this.props?.selfInfo?.userID === value.userID}
                user={value}
                circleSize="SIDEBAR"
                key={value.userID + "_video"}
                volume={this.props.soundLevel![value.userID] || {}}
              ></ZegoUserVideo>
            );
          })}
        </div>
        <div
          className={`${ZegoSidebarCss.bottomWrapper} ${zegoWhiteboardSharingLayout.whiteboardWrapper} zegoUserVideo_click`}
        >
          <div
            className={`${zegoWhiteboardSharingLayout.top} zegoUserVideo_click`}
          >
            <div className={zegoWhiteboardSharingLayout.toolLeft}>
              <div
                className={zegoWhiteboardSharingLayout.undo}
                onClick={() => {
                  this.props.zegoSuperBoardView
                    ?.getCurrentSuperBoardSubView()
                    ?.undo();
                }}
              ></div>
              <div
                className={zegoWhiteboardSharingLayout.redo}
                onClick={() => {
                  this.props.zegoSuperBoardView
                    ?.getCurrentSuperBoardSubView()
                    ?.redo();
                }}
              ></div>
            </div>

            {this.context.whiteboard_showCreateClose && (
              <div
                className={zegoWhiteboardSharingLayout.stop}
                onClick={() => {
                  this.props.onclose();
                }}
              >
                Stop Presenting
              </div>
            )}
          </div>
          <div
            className={`${zegoWhiteboardSharingLayout.content} zegoUserVideo_click`}
            id="ZegoCloudWhiteboardContainer"
            ref={(el: HTMLDivElement) => {
              if (el) {
                if (!this.container) {
                  this.container = el;
                  this.containerHeight = el.clientHeight;
                  this.containerWidth = el.clientWidth;
                  this.props.onShow(el);
                  new FingerGestureUtils().addDomListener(el, (x, y, scale) => {
                    this.props.zegoSuperBoardView
                      ?.getCurrentSuperBoardSubView()
                      ?.setScaleFactor(scale / 1);
                  });
                } else if (
                  el.clientWidth &&
                  el.clientHeight &&
                  (el.clientWidth != this.containerWidth ||
                    el.clientHeight != this.containerHeight)
                ) {
                  this.containerWidth = el.clientWidth;
                  this.containerHeight = el.clientHeight;
                  this.props.onResize(el);
                }
              }
            }}
          ></div>
          <div className={zegoWhiteboardSharingLayout.page}>
            <div>
              <a
                className={`${zegoWhiteboardSharingLayout.page_sub}  ${
                  this.context.whiteboard_page &&
                  this.context.whiteboard_page > 1
                    ? zegoWhiteboardSharingLayout.active
                    : ""
                }`}
                onClick={() => {
                  this.props.zegoSuperBoardView
                    ?.getCurrentSuperBoardSubView()
                    ?.flipToPrePage();
                }}
              ></a>
              <span className={zegoWhiteboardSharingLayout.page_value}>
                {this.context.whiteboard_page}
              </span>
              <span className={zegoWhiteboardSharingLayout.page_value_total}>
                /5
              </span>
              <a
                className={`${zegoWhiteboardSharingLayout.page_add} ${
                  this.context.whiteboard_page &&
                  this.context.whiteboard_page < 5
                    ? zegoWhiteboardSharingLayout.active
                    : ""
                }`}
                onClick={() => {
                  this.props.zegoSuperBoardView
                    ?.getCurrentSuperBoardSubView()
                    ?.flipToNextPage();
                }}
              ></a>
            </div>
          </div>

          <ZegoWhiteboardTools
            onToolChange={(type: number, fontSize?: number, color?: string) => {
              this.props.onToolChange(type, fontSize, color);
            }}
            onFontChange={(
              font?: "BOLD" | "ITALIC" | "NO_BOLD" | "NO_ITALIC",
              fontSize?: number,
              color?: string
            ) => {
              this.props.onFontChange(font, fontSize, color);
            }}
            onAddImage={async (file: File) => {
              ZegoLoadingShow({
                contentText: "The picture is being uploaded",
              });
              const result = await this.props.zegoSuperBoardView
                ?.getCurrentSuperBoardSubView()
                ?.addImage(0, 10, 10, file, (res: string) => {
                  ZegoLoadingHide();
                  ZegoToast({ content: "add Image Success!!" });
                })
                .catch((error: any) => {
                  ZegoLoadingHide();
                  console.error("onAddImage:", error);
                  if (error.code == 60022) {
                    ZegoToast({
                      content:
                        "Failed to add image, this feature is not supported.",
                    });
                  } else if (error.code == 3130009) {
                    ZegoToast({
                      content: "Failed to add image, Unsupported image type.",
                    });
                  } else {
                    ZegoToast({
                      content: "Failed to add image, error code:" + error.code,
                    });
                  }
                });
              ZegoLoadingHide();
              this.props.onImageAdd && this.props.onImageAdd();
            }}
            onSnapshot={() => {
              const zegoSuperBoardSubView =
                this.props.zegoSuperBoardView?.getCurrentSuperBoardSubView();
              zegoSuperBoardSubView
                ?.snapshot()
                .then(function (data: { image: string; userData?: string }) {
                  const link = document.createElement("a");
                  link.href = data.image;
                  link.download = "snapshot.png";
                  link.click();
                });
            }}
          ></ZegoWhiteboardTools>
        </div>
      </div>
    );
  }
}
