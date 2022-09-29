import { ZegoExpressEngine } from "zego-express-engine-webrtc";
import { ZegoUser } from "zego-express-engine-webrtm/sdk/code/zh/ZegoExpressEntity.d";
import { LiveRole, ScenarioModel, ZegoCloudRemoteMedia } from "../../model";
import { isPc } from "../../util";
export type ZegoCloudUserList = ZegoCloudUser[];

export type ZegoCloudUser = ZegoUser & {
  pin: boolean;
  overScreenMuteVideo?: boolean;
  streamList: ZegoCloudRemoteMedia[];
};
export class ZegoCloudUserListManager {
  constructor(private zg: ZegoExpressEngine) {}
  showNonVideo = true;
  showOnlyAudioUser = false;
  screenNumber = !isPc() ? 10 : 6;
  sidebarEnabled = false;
  remoteUserList: ZegoCloudUserList = [];
  remoteScreenStreamList: ZegoCloudUserList = [];
  setPin(userID?: string, pined?: boolean): void {
    this.remoteUserList = this.remoteUserList.map((u) => {
      if (u.userID === userID) {
        u.pin = !u.pin;
      } else {
        u.pin = false;
      }
      return u;
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
    const remoteUserList = this.remoteUserList.filter((r) => {
      if (this.showNonVideo) {
        return r;
      } else {
        if (this.showOnlyAudioUser) {
          return (
            r.streamList.length > 0 &&
            (r.streamList[0].micStatus === "OPEN" ||
              r.streamList[0].cameraStatus === "OPEN")
          );
        } else {
          return (
            r.streamList.length > 0 && r.streamList[0].cameraStatus === "OPEN"
          );
        }
      }
    });
    if (this.sidebarEnabled) {
      const pIndex = remoteUserList.findIndex((user) => user.pin);
      if (pIndex > -1) {
        noPinUserList = this.remoteUserList.filter((user) => !user.pin);
        this.openVideo(this.remoteUserList[pIndex]);
      } else {
        noPinUserList = remoteUserList.slice(0, remoteUserList.length - 1);
        this.openVideo(remoteUserList[remoteUserList.length - 1]);
      }
      count++;
    } else {
      noPinUserList = remoteUserList;
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
          try {
            await this.zg.mutePlayStreamVideo(
              user.streamList[s_index].streamID,
              false
            );
          } catch (error) {
            console.error("【ZEGOCLOUD】openVideo failed:", error);
          }

          user.overScreenMuteVideo = false;
        }
      }
    }
  }

  async muteVideo(user: ZegoCloudUser) {
    if (user.streamList.length) {
      for (let s_index = 0; s_index < user.streamList.length; s_index++) {
        if (!user.overScreenMuteVideo) {
          try {
            await this.zg.mutePlayStreamVideo(
              user.streamList[s_index].streamID,
              true
            );
          } catch (error) {
            console.error("muteVideo failed:", error);
          }
          user.overScreenMuteVideo = true;
        }
      }
    }
  }

  userOrderList: string[] = [];
  async userUpdate(
    roomID: string,
    updateType: "DELETE" | "ADD",
    users: ZegoUser[]
  ): Promise<boolean> {
    if (updateType === "ADD") {
      this.userOrderList = [
        ...this.userOrderList,
        ...users.map((u) => u.userID),
      ];

      users.forEach((user) => {
        if (!this.remoteUserList.some((u) => u.userID === user.userID)) {
          this.remoteUserList.unshift({
            userID: user.userID,
            userName: user.userName,
            streamList: [],
            pin: false,
          });
        } else {
          this.remoteUserList.sort((a, b) => {
            return (
              this.userOrderList.findIndex((uid) => uid === b.userID) -
              this.userOrderList.findIndex((uid) => uid === a.userID)
            );
          });
          console.error("【ZEGOCLOUD】 repeat u ser add!!");
        }
      });
    } else if (updateType === "DELETE") {
      users.forEach((user) => {
        let index = this.remoteUserList.findIndex(
          (u) => u.userID === user.userID
        );
        index > -1 && this.remoteUserList.splice(index, 1);

        index = this.userOrderList.findIndex((uid) => uid === user.userID);
        index > -1 && this.userOrderList.splice(index, 1);
      });
    }

    console.warn("【ZEGOCLOUD】userUpdate", updateType, this.remoteUserList);
    const res = await this.updateStream();
    return res;
  }

  async mainStreamUpdate(
    updateType: "DELETE" | "ADD" | "UPDATE",
    streamList: ZegoCloudRemoteMedia[]
  ): Promise<boolean> {
    streamList
      .filter((s) => {
        if (s && s.streamID && s.streamID.includes("_main")) {
          return true;
        } else {
          console.error("【ZEGOCLOUD】mainStreamUpdate stream empty", s);
        }
      })
      .forEach((stream) => {
        console.warn("【ZEGOCLOUD】mainStreamUpdate", updateType, streamList);
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
            // 如果流全部删除了，且流对应用户不在用户变更数组中，则代表该用户也已经下线
            if (
              this.remoteUserList[u_index].streamList.length == 0 &&
              !this.userOrderList.some(
                (uid) => uid === this.remoteUserList[u_index].userID
              )
            ) {
              this.remoteUserList.splice(u_index, 1);
            }
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

    const res = await this.updateStream();
    return res;
  }
  screenStreamUpdate(
    updateType: "DELETE" | "ADD" | "UPDATE",
    streamList: ZegoCloudRemoteMedia[]
  ): void {
    streamList
      .filter((s) => {
        if (s && s.streamID && s.streamID.includes("_screensharing")) {
          return true;
        } else {
          // console.warn("【ZEGOCLOUD】screenStreamUpdate stream empty", s);
        }
      })
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

  waitingPullStreams: { streamID: string; userID: string }[] = [];
  isLive: 1 | 0 = 0;

  async setLiveStates(state: 1 | 0) {
    if (
      this.scenario === ScenarioModel.LiveStreaming &&
      this.role === LiveRole.Audience
    ) {
      this.isLive = state;
      if (state === 1) {
        for (let index = 0; index < this.waitingPullStreams.length; index++) {
          try {
            const stream = await this.zg.startPlayingStream(
              this.waitingPullStreams[index].streamID
            );

            if (
              this.waitingPullStreams[index].streamID.includes("_screensharing")
            ) {
              const u_index = this.remoteScreenStreamList.findIndex(
                (u) => u.userID === this.waitingPullStreams[index].userID
              );
              const s_index = this.remoteScreenStreamList[
                u_index
              ].streamList.findIndex(
                (s) => s.streamID === this.waitingPullStreams[index].streamID
              );
              this.remoteScreenStreamList[u_index].streamList[s_index].media =
                stream;
            } else {
              const u_index = this.remoteUserList.findIndex(
                (u) => u.userID === this.waitingPullStreams[index].userID
              );
              const s_index = this.remoteUserList[u_index].streamList.findIndex(
                (s) => s.streamID === this.waitingPullStreams[index].streamID
              );
              this.remoteUserList[u_index].streamList[s_index].media = stream;
            }
          } catch (error) {
            console.warn("【ZEGOCLOUD】 playStream failed ,ignore continue !!");
          }
        }
      } else {
        this.remoteUserList = this.remoteUserList.map((remoteUser) => {
          remoteUser.streamList = remoteUser.streamList.map((mediaInfo) => {
            this.zg.stopPlayingStream(mediaInfo.streamID);
            if (
              !this.waitingPullStreams.some(
                (ws) => ws.streamID == mediaInfo.streamID
              )
            ) {
              this.waitingPullStreams.push({
                streamID: mediaInfo.streamID,
                userID: mediaInfo.fromUser.userID,
              });
            }

            mediaInfo.media = undefined;
            return mediaInfo;
          });
          return remoteUser;
        });

        this.remoteScreenStreamList = this.remoteScreenStreamList.map(
          (remoteUser) => {
            remoteUser.streamList = remoteUser.streamList.map((mediaInfo) => {
              this.zg.stopPlayingStream(mediaInfo.streamID);
              if (
                !this.waitingPullStreams.some(
                  (ws) => ws.streamID == mediaInfo.streamID
                )
              ) {
                this.waitingPullStreams.push({
                  streamID: mediaInfo.streamID,
                  userID: mediaInfo.fromUser.userID,
                });
              }
              mediaInfo.media = undefined;
              return mediaInfo;
            });
            return remoteUser;
          }
        );
      }
    }
  }

  scenario: ScenarioModel = ScenarioModel.OneONoneCall;
  role: LiveRole = LiveRole.Host;

  async startPullStream(
    userID: string,
    streamID: string
  ): Promise<MediaStream | undefined> {
    if (
      this.scenario === ScenarioModel.LiveStreaming &&
      this.role === LiveRole.Audience
    ) {
      if (this.isLive === 1) {
        const stream = await this.zg.startPlayingStream(streamID);
        return stream;
      } else if (this.isLive === 0) {
        this.waitingPullStreams.push({ streamID, userID });
        return undefined;
      }
    } else {
      const stream = await this.zg.startPlayingStream(streamID);
      return stream;
    }

    return undefined;
  }

  stopPullStream(userID: string, streamID: string): void {
    if (
      this.scenario === ScenarioModel.LiveStreaming &&
      this.role === LiveRole.Audience
    ) {
      if (this.isLive === 1) {
        this.zg.stopPlayingStream(streamID);
      } else if (this.isLive === 0) {
        const _index = this.waitingPullStreams.findIndex((info) => {
          return info.streamID === streamID;
        });
        _index > -1 && this.waitingPullStreams.splice(_index, 1);
      }
    } else {
      this.zg.stopPlayingStream(streamID);
    }
  }

  reset() {
    this.remoteUserList = [];
    this.waitingPullStreams = [];
    this.isLive = 0;

    this.screenNumber = 0;
    this.sidebarEnabled = false;
    this.remoteUserList = [];
    this.remoteScreenStreamList = [];
  }
}
