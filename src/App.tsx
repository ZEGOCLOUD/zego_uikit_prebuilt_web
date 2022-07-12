import React from "react";
import APP from "./App.module.scss";
import ZegoCloudRTCKit from "./sdk";
import { generateToken, randomID } from "./util";
export class App extends React.Component {
  myMeeting: (element: HTMLDivElement) => Promise<void>;

  constructor(props: Readonly<{}>) {
    super(props);
    this.myMeeting = async (element: HTMLDivElement) => {
      const { token } = await generateToken(
        "https://choui-prebuilt.herokuapp.com",
        randomID(5),
        "choui3",
        randomID(5)
      );
      const zgc = ZegoCloudRTCKit.init(token);
      zgc.joinRoom({ container: element });
    };
  }

  render(): React.ReactNode {
    return (
      <div className={APP.app}>
        <div className={APP.nav}>
          <div className={APP.LOGO}></div>
          <div className={APP.link}>
            <a href="void()" className={APP.link_item}>
              <span className={APP.icon__doc}></span> Documentation
            </a>
            <a href="void()" className={APP.link_item}>
              <span className={APP.icon__github}></span> View demo code
            </a>
          </div>
        </div>
        <div ref={this.myMeeting} className={APP.myMeeting}></div>
      </div>
    );
  }
}

export default App;
