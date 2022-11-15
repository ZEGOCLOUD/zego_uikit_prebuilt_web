import React from "react";
import clsx from "clsx";
import { ZegoWhiteboardSharingLayoutProps } from "../../../../model";
import ZegoSidebarCss from "./zegoSidebarLayout.module.scss";
import zegoWhiteboardSharingLayout from "./zegoWhiteboardSharingLayout.module.scss";
import ShowPCManageContext, { ShowPCManageType } from "../context/showManage";
import { OthersVideo } from "./zegoOthersVideo";
import { VideoPlayer } from "./zegoVideoPlayer";

export class ZegoWhiteboardSharingLayout extends React.PureComponent<ZegoWhiteboardSharingLayoutProps> {
  container: HTMLDivElement | null = null;
  containerWidth: number = 0;
  containerHeight: number = 0;
  state: {
    currentZoom: number;
    currentPage: number;
    hideTools: boolean;
    selectedTool: number;
    fontSize: number;
    fontColor: string;
  } = {
    currentZoom: 100,
    currentPage: 1,
    hideTools: false,
    selectedTool: 3,
    fontSize: 12,
    fontColor: "#F64326",
  };
  static contextType?: React.Context<ShowPCManageType> = ShowPCManageContext;
  context!: React.ContextType<typeof ShowPCManageContext>;
  componentDidMount() {
    setTimeout(() => {
      const currentZoom = this.props.zegoSuperBoardView
        ?.getCurrentSuperBoardSubView()
        ?.getScaleFactor().scaleFactor;
      const currentPage = this.props.zegoSuperBoardView
        ?.getCurrentSuperBoardSubView()
        ?.getCurrentPage();

      this.setState({
        currentZoom: currentZoom ? currentZoom * 100 : 100,
        currentPage: currentPage ? currentPage : 1,
      });
    }, 1000);
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
                    this.setState(
                      (preState: {
                        currentZoom: number;
                        currentPage: number;
                      }) => {
                        return {
                          currentPage:
                            preState.currentPage - 1 < 1
                              ? 1
                              : preState.currentPage - 1 > 5
                              ? 5
                              : preState.currentPage - 1,
                        };
                      },
                      () => {
                        this.props.zegoSuperBoardView
                          ?.getCurrentSuperBoardSubView()
                          ?.flipToPrePage();
                      }
                    );
                  }}
                ></a>
                <span className={zegoWhiteboardSharingLayout.page_value}>
                  {this.state.currentPage}
                </span>
                <span className={zegoWhiteboardSharingLayout.page_value_total}>
                  /5
                </span>
                <a
                  className={zegoWhiteboardSharingLayout.page_add}
                  onClick={() => {
                    this.setState(
                      (preState: {
                        currentZoom: number;
                        currentPage: number;
                      }) => {
                        return {
                          currentPage:
                            preState.currentPage + 1 < 1
                              ? 1
                              : preState.currentPage + 1 > 5
                              ? 5
                              : preState.currentPage + 1,
                        };
                      },
                      () => {
                        this.props.zegoSuperBoardView
                          ?.getCurrentSuperBoardSubView()
                          ?.flipToNextPage();
                      }
                    );
                  }}
                ></a>
              </div>
            </div>

            <div
              className={zegoWhiteboardSharingLayout.stop}
              onClick={() => {
                this.props.onclose();
              }}
            >
              Stop Presenting
            </div>
          </div>
          <div className={zegoWhiteboardSharingLayout.content}>
            <div className={zegoWhiteboardSharingLayout.contentLeft}>
              {!this.state.hideTools && (
                <div
                  className={`${zegoWhiteboardSharingLayout.tool_select} ${
                    this.state.selectedTool === 1
                      ? zegoWhiteboardSharingLayout.selected
                      : ""
                  }`}
                  onClick={() => {
                    this.setState({ selectedTool: 1 });
                    this.props.onToolChange(32);
                  }}
                ></div>
              )}
              {!this.state.hideTools && (
                <div
                  className={`${zegoWhiteboardSharingLayout.tool_drag} ${
                    this.state.selectedTool === 2
                      ? zegoWhiteboardSharingLayout.selected
                      : ""
                  }`}
                  onClick={() => {
                    this.setState({ selectedTool: 2 });
                    this.props.onToolChange(0);
                  }}
                ></div>
              )}

              <div
                className={`${zegoWhiteboardSharingLayout.tool_pen} ${
                  this.state.selectedTool === 3
                    ? zegoWhiteboardSharingLayout.selected
                    : ""
                }`}
                onClick={() => {
                  this.setState({ selectedTool: 3 });
                  this.props.onToolChange(1);
                }}
              >
                <div className={zegoWhiteboardSharingLayout.penTools}>
                  <div className={zegoWhiteboardSharingLayout.penTools_bold}>
                    <h3>笔触粗细</h3>
                    <ul>
                      {[4, 6, 8, 12].map((fontSize) => {
                        return (
                          <li
                            onClick={() => {
                              this.setState({
                                fontSize,
                              });
                              this.props.onToolChange(
                                1,
                                fontSize,
                                this.state.fontColor
                              );
                            }}
                          >
                            <i
                              className={
                                this.state.fontSize === fontSize
                                  ? zegoWhiteboardSharingLayout.selected
                                  : ""
                              }
                              style={{ width: fontSize, height: fontSize }}
                            ></i>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className={zegoWhiteboardSharingLayout.penTools_color}>
                    <h3>笔触颜色</h3>
                    <ul>
                      {[
                        "#FFFFFF",
                        "#A4A4A4",
                        "#333333",
                        "#000000",
                        "#F64326",
                        "#FD7803",
                        "#FBE605",
                        "#3FBB54",
                        "#00EAE7",
                        "#0484FE",
                        "#825FD0",
                        "#FB7D7D",
                      ].map((fontColor) => {
                        return (
                          <li
                            style={{ backgroundColor: fontColor }}
                            onClick={() => {
                              this.setState({
                                fontColor,
                              });
                              this.props.onToolChange(
                                1,
                                this.state.fontSize,
                                fontColor
                              );
                            }}
                            className={
                              this.state.fontColor === fontColor
                                ? zegoWhiteboardSharingLayout.selected
                                : ""
                            }
                          ></li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              {!this.state.hideTools && (
                <div
                  className={`${zegoWhiteboardSharingLayout.tool_text} ${
                    this.state.selectedTool === 4
                      ? zegoWhiteboardSharingLayout.selected
                      : ""
                  }`}
                  onClick={() => {
                    this.setState({ selectedTool: 4 });
                    this.props.onToolChange(2);
                  }}
                ></div>
              )}
              {!this.state.hideTools && (
                <div
                  className={`${zegoWhiteboardSharingLayout.tool_react} ${
                    this.state.selectedTool === 5
                      ? zegoWhiteboardSharingLayout.selected
                      : ""
                  }`}
                  onClick={() => {
                    this.setState({ selectedTool: 5 });
                    this.props.onToolChange(8);
                  }}
                ></div>
              )}
              {!this.state.hideTools && (
                <div
                  className={`${zegoWhiteboardSharingLayout.tool_image} ${
                    this.state.selectedTool === 6
                      ? zegoWhiteboardSharingLayout.selected
                      : ""
                  }`}
                  onClick={() => {
                    this.setState({ selectedTool: 6 });
                    this.props.onToolChange(512);
                  }}
                ></div>
              )}
              {!this.state.hideTools && (
                <div
                  className={`${zegoWhiteboardSharingLayout.tool_eraser} ${
                    this.state.selectedTool === 7
                      ? zegoWhiteboardSharingLayout.selected
                      : ""
                  }`}
                  onClick={() => {
                    this.setState({ selectedTool: 7 });
                    this.props.onToolChange(64);
                  }}
                ></div>
              )}
              {!this.state.hideTools && (
                <div
                  className={`${zegoWhiteboardSharingLayout.tool_delete} ${
                    this.state.selectedTool === 8
                      ? zegoWhiteboardSharingLayout.selected
                      : ""
                  }`}
                  onClick={() => {
                    this.setState({ selectedTool: 8 });
                    this.props.zegoSuperBoardView
                      ?.getCurrentSuperBoardSubView()
                      ?.clearCurrentPage();
                    this.props.onToolChange(512);
                  }}
                ></div>
              )}
              {!this.state.hideTools && (
                <div
                  className={`${zegoWhiteboardSharingLayout.tool_snapshot} ${
                    this.state.selectedTool === 9
                      ? zegoWhiteboardSharingLayout.selected
                      : ""
                  }`}
                  onClick={() => {
                    this.setState({ selectedTool: 9 });
                  }}
                ></div>
              )}
              <p></p>
              <div
                className={
                  this.state.hideTools
                    ? zegoWhiteboardSharingLayout.tool_show
                    : zegoWhiteboardSharingLayout.tool_hide
                }
                onClick={() => {
                  this.setState((preState: { hideTools: boolean }) => {
                    return {
                      hideTools: !preState.hideTools,
                    };
                  });
                }}
              ></div>
            </div>
            <div
              className={`${ZegoSidebarCss.screenVideo}  ${zegoWhiteboardSharingLayout.contentRight}`}
              id="ZegoCloudWhiteboardContainer"
              ref={(el: HTMLDivElement) => {
                if (el) {
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
                        users={[
                          arr[index].userName!,
                          arr[index + 1]?.userName!,
                        ]}
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
