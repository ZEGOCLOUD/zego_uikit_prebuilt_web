/// <reference types="node" />
import React, { RefObject } from "react";
import {
  SoundLevelMap,
  ZegoBroadcastMessageInfo2,
  ZegoBrowserCheckProp,
  ZegoCloudRemoteMedia,
  ZegoNotification,
} from "../../../model";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudUserList } from "../../../modules/tools/UserListManager";
export declare class ZegoRoom extends React.Component<ZegoBrowserCheckProp> {
  state: {
    localStream: undefined | MediaStream;
    remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
    layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
    zegoCloudUserList: ZegoCloudUserList;
    messageList: ZegoBroadcastMessageInfo2[];
    notificationList: ZegoNotification[];
    micOpen: boolean;
    cameraOpen: boolean;
    showSettings: boolean;
    isNetworkPoor: boolean;
    connecting: boolean;
    firstLoading: boolean;
    selectMic: string | undefined;
    selectSpeaker: string | undefined;
    selectCamera: string | undefined;
    selectVideoResolution: string;
    showNonVideoUser: boolean;
    videoShowNumber: number;
    gridRowNumber: number;
    layout: "Default" | "Grid" | "Sidebar";
    showLayoutSettingsModel: boolean;
    isLayoutChanging: boolean;
    soundLevel: SoundLevelMap;
  };
  settingsRef: RefObject<HTMLDivElement>;
  moreRef: RefObject<HTMLDivElement>;
  micStatus: -1 | 0 | 1;
  cameraStatus: -1 | 0 | 1;
  notifyTimer: NodeJS.Timeout;
  msgDelayed: boolean;
  localUserPin: boolean;
  localStreamID: string;
  userUpdateCallBack: () => void;
  componentDidMount(): void;
  componentDidUpdate(
    preProps: ZegoBrowserCheckProp,
    preState: {
      localStream: undefined | MediaStream;
      remoteStreamInfo: ZegoCloudRemoteMedia | undefined;
      layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE";
      zegoCloudUserList: ZegoUser[];
      messageList: ZegoBroadcastMessageInfo2[];
      notificationList: ZegoNotification[];
      micOpen: boolean;
      cameraOpen: boolean;
      showMore: boolean;
      layout: string;
      videoShowNumber: number;
    }
  ): void;
  componentWillUnmount(): void;
  initSDK(): Promise<void>;
  createStream(): Promise<boolean>;
  toggleMic(): Promise<void>;
  toggleCamera(): Promise<boolean>;
  toggleLayOut(
    layOutStatus: "ONE_VIDEO" | "INVITE" | "USER_LIST" | "MESSAGE"
  ): void;
  sendMessage(msg: string): Promise<void>;
  openSettings(): void;
  onOpenSettings: (event: any) => void;
  handleSetting(): void;
  handleLeave(): void;
  leaveRoom(): void;
  computeByResize(): void;
  onWindowResize: () => void;
  showLayoutSettings(show: boolean): void;
  changeLayout(type: string): Promise<unknown>;
  getShownUser(forceShowNonVideoUser?: boolean): ZegoCloudUserList;
  getHiddenUser(): JSX.Element;
  getLayoutScreen(): JSX.Element | undefined;
  handleSetPin(userID: string): void;
  render(): React.ReactNode;
}
