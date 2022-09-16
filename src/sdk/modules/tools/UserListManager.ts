import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudRemoteMedia } from "../../model";
export type ZegoCloudUserList = ZegoCloudUser[];

export type ZegoCloudUser = ZegoUser & {
  pin: boolean;
  overScreenMuteVideo?: boolean;
  streamList: ZegoCloudRemoteMedia[];
};
export class ZegoCloudUserListManager {
  constructor(private zg: ZegoExpressEngine) {}
  showNonVideo = true;
  screenNumber = 0;
  sidebarEnabled = false;
  remoteUserList: ZegoCloudUserList = [];
  remoteScreenStreamList: ZegoCloudUserList = [];
  setPin(userID?: string, pined?: boolean): void {
    this.remoteUserList.forEach((u) => {
      if (u.userID === userID) {
        u.pin = !u.pin;
      } else {
        u.pin = false;
      }
    });
  }

  setShowNonVideo(enable: boolean): Promise<boolean> {
    this.showNonVideo = enable;
    return this.updateStream();
  }

  async setMaxScreenNum(num: number): Promise<boolean> {
    this.screenNumber = num;
    return this.updateStream();
  }

  async setSidebarLayOut(enable: boolean) {
    this.sidebarEnabled = enable;
    return this.updateStream();
  }
  async updateStream(): Promise<boolean> {
    if (!this.remoteUserList.length) return true;
    let count = 0,
      noPinUserList = [];
    if (this.sidebarEnabled) {
      const pIndex = this.remoteUserList.findIndex((user) => user.pin);
      if (pIndex > -1) {
        noPinUserList = this.remoteUserList.filter((user) => !user.pin);
        this.openVideo(this.remoteUserList[pIndex]);
      } else {
        noPinUserList = this.remoteUserList.slice(
          0,
          this.remoteUserList.length - 1
        );
        this.openVideo(this.remoteUserList[this.remoteUserList.length - 1]);
      }
      count++;
    } else {
      noPinUserList = this.remoteUserList;
    }

    for (let index = 0; index < noPinUserList.length; index++) {
      if (
        this.showNonVideo ||
        (noPinUserList[index].streamList.length > 0 &&
          (noPinUserList[index].streamList[0].cameraStatus === "OPEN" ||
            noPinUserList[index].overScreenMuteVideo))
      ) {
        count++;
        if (
          count > this.screenNumber ||
          (count === this.screenNumber &&
            noPinUserList[index + 1] &&
            noPinUserList[index + 1].streamList.length > 0)
        ) {
          await this.muteVideo(noPinUserList[index]);
        } else {
          await this.openVideo(noPinUserList[index]);
        }
      }
    }
    return true;
  }

  async openVideo(user: ZegoCloudUser) {
    if (user.streamList.length) {
      for (let s_index = 0; s_index < user.streamList.length; s_index++) {
        if (user.overScreenMuteVideo) {
          await this.zg.mutePlayStreamVideo(
            user.streamList[s_index].streamID,
            false
          );
          user.overScreenMuteVideo = false;
        }
      }
    }
  }

  async muteVideo(user: ZegoCloudUser) {
    if (user.streamList.length) {
      for (let s_index = 0; s_index < user.streamList.length; s_index++) {
        if (!user.overScreenMuteVideo) {
          await this.zg.mutePlayStreamVideo(
            user.streamList[s_index].streamID,
            true
          );
          user.overScreenMuteVideo = true;
        }
      }
    }
  }

  userUpdate(roomID: string, updateType: "DELETE" | "ADD", users: ZegoUser[]) {
    if (updateType === "ADD") {
      users.forEach((user) => {
        if (!this.remoteUserList.some((u) => u.userID === user.userID)) {
          this.remoteUserList.unshift({
            userID: user.userID,
            userName: user.userName,
            streamList: [],
            pin: false,
          });
        } else {
          console.error("【ZEGOCLOUD】 repeat user add!!");
        }
      });
    } else if (updateType === "DELETE") {
      users.forEach((user) => {
        const index = this.remoteUserList.findIndex(
          (u) => u.userID === user.userID
        );
        index > -1 && this.remoteUserList.splice(index, 1);
      });
    }
  }

  mainStreamUpdate(
    updateType: "DELETE" | "ADD" | "UPDATE",
    streamList: ZegoCloudRemoteMedia[]
  ): void {
    streamList
      .filter((s) => s.streamID.includes("_main"))
      .forEach((stream) => {
        // 已经在列表中才处理删除和更新，否则只处理新增
        if (
          this.remoteUserList.some((u) => u.userID === stream.fromUser.userID)
        ) {
          const u_index = this.remoteUserList.findIndex(
            (u) => u.userID === stream.fromUser.userID
          );
          const s_index = this.remoteUserList[u_index].streamList.findIndex(
            (s) => s.media === stream.media
          );

          if (updateType === "ADD") {
            this.remoteUserList[u_index].streamList.push(stream);
          } else if (updateType === "DELETE" && s_index > -1) {
            this.remoteUserList[u_index].streamList.splice(s_index, 1);
          } else if (updateType === "UPDATE" && s_index > -1) {
            this.remoteUserList[u_index].streamList[s_index] = stream;
          }
        } else {
          if (updateType === "ADD") {
            this.remoteUserList.push({
              userID: stream.fromUser.userID,
              userName: stream.fromUser.userName,
              streamList: [stream],
              pin: false,
            });
          }
        }
      });
  }
  screenStreamUpdate(
    updateType: "DELETE" | "ADD" | "UPDATE",
    streamList: ZegoCloudRemoteMedia[]
  ): void {
    streamList
      .filter((s) => s.streamID.includes("_screensharing"))
      .forEach((stream) => {
        // 已经在列表中才处理删除和更新，否则只处理新增
        if (
          this.remoteScreenStreamList.some(
            (u) => u.userID === stream.fromUser.userID
          )
        ) {
          const u_index = this.remoteScreenStreamList.findIndex(
            (u) => u.userID === stream.fromUser.userID
          );
          const s_index = this.remoteScreenStreamList[
            u_index
          ].streamList.findIndex((s) => s.media === stream.media);

          if (updateType === "ADD") {
            this.remoteScreenStreamList[u_index].streamList.push(stream);
          } else if (updateType === "DELETE" && s_index > -1) {
            this.remoteScreenStreamList.splice(u_index, 1);
          } else if (updateType === "UPDATE" && s_index > -1) {
            this.remoteScreenStreamList[u_index].streamList[s_index] = stream;
          }
        } else {
          if (updateType === "ADD") {
            this.remoteScreenStreamList.push({
              userID: stream.fromUser.userID,
              userName: stream.fromUser.userName,
              streamList: [stream],
              pin: false,
            });
          }
        }
      });
  }
  clearUserList() {
    this.remoteUserList = [];
  }
  clearScreenStreamList() {
    this.remoteScreenStreamList = [];
  }
}
