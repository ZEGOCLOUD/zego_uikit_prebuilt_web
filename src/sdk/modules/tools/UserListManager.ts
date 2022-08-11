import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { ZegoCloudRemoteMedia } from "../../model";
export type ZegoCloudUserList = (ZegoUser & {
  pin: boolean;
  streamList: ZegoCloudRemoteMedia[];
})[];

export class ZegoCloudUserListManager {
  constructor(private zg: ZegoExpressEngine) {}

  showNonVideo = true;
  screenNumber = 0;
  remoteUserList: ZegoCloudUserList = [];
  setPing(userID: string): void {
    this.remoteUserList.map((u) => {
      u.pin = u.userID === userID;
    });
  }

  setShowNonVideo(enable: boolean): Promise<boolean> {
    this.showNonVideo = enable;
    return this.updateStream();
  }

  async setScreenNumber(num: number): Promise<boolean> {
    this.screenNumber = num;
    return this.updateStream();
  }

  async updateStream(): Promise<boolean> {
    let count = 0;
    for (let index = 0; index < this.remoteUserList.length; index++) {
      if (
        this.showNonVideo ||
        this.remoteUserList[index].streamList.length > 0
      ) {
        count++;
      }
      if (count > this.screenNumber) {
        if (this.remoteUserList[index].streamList.length) {
          for (
            let s_index = 0;
            s_index < this.remoteUserList[index].streamList.length;
            s_index++
          ) {
            if (
              this.remoteUserList[index].streamList[s_index].cameraStatus ===
              "OPEN"
            ) {
              await this.zg.mutePlayStreamVideo(
                this.remoteUserList[index].streamList[s_index].streamID,
                true
              );
            }
          }
        }
      } else {
        if (this.remoteUserList[index].streamList.length) {
          for (
            let s_index = 0;
            s_index < this.remoteUserList[index].streamList.length;
            s_index++
          ) {
            if (
              this.remoteUserList[index].streamList[s_index].cameraStatus ===
              "MUTE"
            ) {
              await this.zg.mutePlayStreamVideo(
                this.remoteUserList[index].streamList[s_index].streamID,
                false
              );
            }
          }
        }
      }
    }
    return true;
  }

  userUpdate(roomID: string, updateType: "DELETE" | "ADD", users: ZegoUser[]) {
    if (updateType === "ADD") {
      users.map((user) => {
        if (!this.remoteUserList.some((u) => u.userID === user.userID)) {
          this.remoteUserList.push({
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
      users.map((user) => {
        const index = this.remoteUserList.findIndex(
          (u) => u.userID === user.userID
        );
        index > -1 && this.remoteUserList.splice(index, 1);
      });
    }
  }

  streamNumUpdate(
    updateType: "DELETE" | "ADD" | "UPDATE",
    streamList: ZegoCloudRemoteMedia[]
  ): void {
    streamList.map((stream) => {
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

        if (updateType === "DELETE") {
          this.remoteUserList[u_index].streamList.splice(s_index, 1);
        } else if (updateType === "UPDATE") {
          this.remoteUserList[u_index].streamList[s_index] = stream;
        }
      } else {
        if (updateType === "ADD") {
          this.remoteUserList.push({
            userID: stream.fromUser.userID,
            userName: stream.fromUser.userName,
            streamList: [],
            pin: false,
          });
        }
      }
    });
  }
}
