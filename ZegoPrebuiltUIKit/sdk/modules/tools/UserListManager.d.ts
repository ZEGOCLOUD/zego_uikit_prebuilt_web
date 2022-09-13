import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudRemoteMedia } from "../../model";
export declare type ZegoCloudUserList = ZegoCloudUser[];
export declare type ZegoCloudUser = ZegoUser & {
  pin: boolean;
  overScreenMuteVideo?: boolean;
  streamList: ZegoCloudRemoteMedia[];
};
export declare class ZegoCloudUserListManager {
  private zg;
  constructor(zg: ZegoExpressEngine);
  showNonVideo: boolean;
  screenNumber: number;
  sidebarEnabled: boolean;
  remoteUserList: ZegoCloudUserList;
  setPin(userID?: string, pined?: boolean): void;
  setShowNonVideo(enable: boolean): Promise<boolean>;
  setMaxScreenNum(num: number): Promise<boolean>;
  setSidebarLayOut(enable: boolean): Promise<boolean>;
  updateStream(): Promise<boolean>;
  openVideo(user: ZegoCloudUser): Promise<void>;
  muteVideo(user: ZegoCloudUser): Promise<void>;
  userUpdate(
    roomID: string,
    updateType: "DELETE" | "ADD",
    users: ZegoUser[]
  ): void;
  mainStreamUpdate(
    updateType: "DELETE" | "ADD" | "UPDATE",
    streamList: ZegoCloudRemoteMedia[]
  ): void;
  clearUserList(): void;
}
