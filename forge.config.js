const generatedName = require('./app/utils/generateName.js');

module.exports = {
  packagerConfig: {
    "name": generatedName(10),
    "icon": "./app/img/icon.ico"
  },
  makers: [
    {
      "name": "@electron-forge/maker-squirrel",
      "config": {
        "name": generatedName(10),
        "setupIcon": "./app/img/icon.ico",
        "setupExe": "AutoFish Setup.exe",
        "loadingGif": "./app/img/install.gif"
      }
    }
  ]
};
