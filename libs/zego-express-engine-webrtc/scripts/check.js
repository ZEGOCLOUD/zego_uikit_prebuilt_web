
const path = require("path");
const { getPackageVersion, compareVersion, showTips } = require("./util");

const p = path.resolve(__dirname, "../../");

const PACKAGES = [
  {
    name: "zego-superboard-web",
    version: "2.2.2"
  },
  { name: "zego-express-whiteboard-web", version: "2.2.2" }
];
const FILE_NAME = "package.json";



PACKAGES.forEach(package => {
  const packageVer = getPackageVersion(p, package.name, FILE_NAME);
  if (packageVer) {
    const verCompareRes = compareVersion(packageVer, package.version);
    if (verCompareRes < 0) {
      showTips([
        "The current version of package '" +
          package.name +
          "' is not compatible with package 'zego-express-engine-webrtc'.",
        "Please update the package '" + package.name + "'."
      ]);
    }
  }
});