const generateName = (size) => {
  let alphabet = `AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890`;
  return new Array(size)
  .fill(true)
  .map(slot => alphabet[Math.floor(Math.random() * alphabet.length)])
  .join(``);
};

module.exports = {
  packagerConfig: {
    "name": generateName(10),
    "icon": "./app/img/icon.ico"
  },
  makers: [
    {
      "name": "@electron-forge/maker-squirrel",
      "config": {
        "name": "AutoFish",
        "setupIcon": "./app/img/icon.ico",
        "setupExe": "AutoFish Setup.exe",
        "loadingGif": "./app/img/install.gif"
      }
    }
  ]
};
