const path = require("path");
const fs = require("fs");

function getPackageVersion(p, packageName, fileName) {
  const files0 = fs.readdirSync(p);
  const targetDir = files0.find(file => file === packageName);
  if (targetDir) {
    const packageDir = path.resolve(p, packageName);
    const stats = fs.statSync(packageDir);
    if (stats.isDirectory()) {
      const files1 = fs.readdirSync(packageDir);
      if (files1.indexOf(fileName) > -1) {
        const filePath = path.resolve(packageDir, fileName);
        const package = fs.statSync(filePath);
        if (package.isFile()) {
          try {
            const json = JSON.parse(fs.readFileSync(filePath), "utf8");
            if (json && json.version) {
              return json.version;
            }
          } catch (error) {
            console.log("package ver err");
          }
        }
      }
    }
  }
  return "";
}

function compareVersion(version1, version2) {
  const nums1 = version1.split(".");
  const nums2 = version2.split(".");
  const n1 = nums1.length;
  const n2 = nums2.length;
  for (let i = 0; i < Math.max(n1, n2); i++) {
    const num1 = i < n1 ? parseInt(nums1[i]) : 0;
    const num2 = i < n2 ? parseInt(nums2[i]) : 0;
    if (num1 !== num2) {
      return num1 < num2 ? -1 : 1;
    }
  }
  return 0;
}

function showTips(tips) {
  tips.forEach(tip => {
    console.error("\x1B[40mnpm\x1B[0m \x1B[40m\x1B[31mERR!\x1B[0m " + tip);
  });
}

module.exports = { getPackageVersion, compareVersion, showTips }