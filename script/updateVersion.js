const fs = require('fs');
const path = require('path');


const version = process.argv.slice(-1)[0];

function isValidVersion(version) {
  // 使用正则表达式校验版本号格式
  const versionPattern = /^\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?$/;
  return versionPattern.test(version);
}

if (!isValidVersion(version)) {
  console.error('Invalid version');
  process.exit(1);
}

function updateVersion(version) {
  // 1. Update public/package.json
  const publicPkgPath = path.resolve(__dirname, `../public/package.json`);
  const publicPkg = JSON.parse(fs.readFileSync(publicPkgPath, 'utf8'));
  publicPkg.version = version;
  fs.writeFileSync(publicPkgPath, JSON.stringify(publicPkg, null, 2), 'utf8');
  console.log(`public/package.json version: ${version} update success`);

  // // 2. Update ZegoUIKitPrebuilt/package.json
  // const prebuiltPkgPath = path.resolve(__dirname, `../ZegoUIKitPrebuilt/package.json`);
  // if (fs.existsSync(prebuiltPkgPath)) {
  //   const prebuiltPkg = JSON.parse(fs.readFileSync(prebuiltPkgPath, 'utf8'));
  //   prebuiltPkg.version = version;
  //   fs.writeFileSync(prebuiltPkgPath, JSON.stringify(prebuiltPkg, null, 2), 'utf8');
  //   console.log(`ZegoUIKitPrebuilt/package.json version: ${version} update success`);
  // }

}

updateVersion(version)