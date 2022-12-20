import React from "react";
import clsx from "clsx";
import { ZegoWhiteboardSharingLayoutProps } from "../../../../model";
import ZegoSidebarCss from "./zegoSidebarLayout.module.scss";
import zegoWhiteboardSharingLayout from "./zegoWhiteboardSharingLayout.module.scss";
import ShowPCManageContext, { ShowManageType } from "../../context/showManage";
import { OthersVideo } from "./zegoOthersVideo";
import { VideoPlayer } from "./zegoVideoPlayer";
import { ZegoWhiteboardTools } from "./zegoWhiteboard/ZegoWhiteboardTools";
import { ZegoToast } from "../../../components/zegoToast";
import {
  ZegoLoadingHide,
  ZegoLoadingShow,
} from "../../../components/zegoLoading";

export class ZegoWhiteboardSharingLayout extends React.PureComponent<ZegoWhiteboardSharingLayoutProps> {
  container: HTMLDivElement | null = null;
  containerWidth: number = 0;
  containerHeight: number = 0;
  state: {
    currentZoom: number;
    rows: 1 | 2;
  } = {
    currentZoom: 100,
    rows: 1,
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
    let wrapClassName = clsx({
      [ZegoSidebarCss.rightWrapper]: true,
      [ZegoSidebarCss.fiveRow]: this.props.videoShowNumber === 5,
      [ZegoSidebarCss.fourRow]: this.props.videoShowNumber === 4,
      [ZegoSidebarCss.threeRow]: this.props.videoShowNumber === 3,
      [ZegoSidebarCss.twoRow]: this.props.videoShowNumber === 2,
      [ZegoSidebarCss.oneRow]: this.props.videoShowNumber === 1,
    });
    return (
      <div className={ZegoSidebarCss.sidebarWrapper}>
        <div
          className={`${ZegoSidebarCss.bigVideoWrapper}  ${zegoWhiteboardSharingLayout.whiteboardWrapper}`}
        >
          <div className={zegoWhiteboardSharingLayout.top}>
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
              <div className={zegoWhiteboardSharingLayout.zoom}>
                <a
                  className={zegoWhiteboardSharingLayout.zoom_sub}
                  onClick={() => {
                    this.setState(
                      (preState: {
                        currentZoom: number;
                        currentPage: number;
                      }) => {
                        return {
                          currentZoom:
                            preState.currentZoom - 25 > 300
                              ? 300
                              : preState.currentZoom - 25 < 100
                              ? 100
                              : preState.currentZoom - 25,
                        };
                      },
                      () => {
                        this.props.zegoSuperBoardView
                          ?.getCurrentSuperBoardSubView()
                          ?.setScaleFactor(this.state.currentZoom / 100);
                      }
                    );
                  }}
                ></a>
                <span className={zegoWhiteboardSharingLayout.zoom_value}>
                  {`${this.state.currentZoom}%`}
                </span>
                <a
                  className={zegoWhiteboardSharingLayout.zoom_add}
                  onClick={() => {
                    this.setState(
                      (preState: {
                        currentZoom: number;
                        currentPage: number;
                      }) => {
                        return {
                          currentZoom:
                            preState.currentZoom + 25 > 300
                              ? 300
                              : preState.currentZoom + 25 < 100
                              ? 100
                              : preState.currentZoom + 25,
                        };
                      },
                      () => {
                        this.props.zegoSuperBoardView
                          ?.getCurrentSuperBoardSubView()
                          ?.setScaleFactor(this.state.currentZoom / 100);
                      }
                    );
                  }}
                ></a>
              </div>
              <div className={zegoWhiteboardSharingLayout.page}>
                <a
                  className={zegoWhiteboardSharingLayout.page_sub}
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
                  className={zegoWhiteboardSharingLayout.page_add}
                  onClick={() => {
                    this.props.zegoSuperBoardView
                      ?.getCurrentSuperBoardSubView()
                      ?.flipToNextPage();
                  }}
                ></a>
              </div>
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
          <div className={zegoWhiteboardSharingLayout.content}>
            <ZegoWhiteboardTools
              rows={this.state.rows}
              onToolChange={async (
                type: number,
                fontSize?: number,
                color?: string
              ) => {
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
                        content:
                          "Failed to add image, error code:" + error.code,
                      });
                    }
                  });

                ZegoLoadingHide();
              }}
              onSnapshot={() => {
                const zegoSuperBoardSubView =
                  this.props.zegoSuperBoardView?.getCurrentSuperBoardSubView();
                zegoSuperBoardSubView
                  ?.snapshot()
                  .then(function (data: { image: string; userData?: string }) {
                    const link = document.createElement("a");
                    link.href = data.image;
                    link.download = "snapshot" + ".png";
                    link.click();
                  });
              }}
            ></ZegoWhiteboardTools>
            <div
              className={`${ZegoSidebarCss.screenVideo}  ${zegoWhiteboardSharingLayout.contentRight}`}
              id="ZegoCloudWhiteboardContainer"
              ref={(el: HTMLDivElement) => {
                if (el) {
                  this.setState({
                    rows: el.clientHeight < 410 ? 2 : 1,
                  });

                  if (!this.container) {
                    this.container = el;
                    this.containerHeight = el.clientHeight;
                    this.containerWidth = el.clientWidth;
                    this.props.onShow(el);
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
          </div>
        </div>
        {this.props.userList.length > 0 && (
          <div className={wrapClassName}>
            {this.props.userList.map((user, index, arr) => {
              if (arr.length > this.props.videoShowNumber) {
                if (index === this.props.videoShowNumber - 1) {
                  return (
                    <div key={"screen_container_" + user.userID}>
                      <OthersVideo
                        users={[arr[index]!, arr[index + 1]!]}
                        others={arr.length - this.props.videoShowNumber + 1}
                      ></OthersVideo>
                      <audio
                        autoPlay
                        muted={user.userID === this.props.selfInfo.userID}
                        ref={(el) => {
                          el &&
                            el.srcObject !== user?.streamList?.[0]?.media &&
                            (el.srcObject = user?.streamList?.[0]?.media!);
                          el &&
                            (el as any)?.setSinkId?.(
                              this.context.speakerId || ""
                            );
                        }}
                      ></audio>
                    </div>
                  );
                }
                if (index > this.props.videoShowNumber - 1) {
                  return (
                    <audio
                      key={user.userID}
                      autoPlay
                      muted={user.userID === this.props.selfInfo.userID}
                      ref={(el: HTMLAudioElement) => {
                        el &&
                          el.srcObject !== user?.streamList?.[0]?.media &&
                          (el.srcObject = user?.streamList?.[0]?.media!);
                        el &&
                          (el as any)?.setSinkId?.(
                            this.context.speakerId || ""
                          );
                      }}
                    ></audio>
                  );
                }
              }
              return (
                <VideoPlayer
                  key={user.userID}
                  userInfo={user}
                  muted={user.userID === this.props.selfInfo.userID}
                  handlePin={() => {
                    this.props.handleSetPin!(user.userID);
                  }}
                  volume={this.props.soundLevel![user.userID] || {}}
                ></VideoPlayer>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
