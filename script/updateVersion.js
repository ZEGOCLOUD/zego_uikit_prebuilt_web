const fs = require('fs');
const path = require('path');

const _package = require('../public/package.json');
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
  const _path = path.resolve(__dirname, `../public/package.json`);
  _package.version = version;
  fs.writeFile(_path, JSON.stringify(_package, null, 2), 'utf8', (err) => {
    if (err) {
      console.error(`version: ${version} update fail`)
    } else {
      console.log(`version: ${version} update success`)
    }
  });
}

updateVersion(version)