const { BrowserWindow, ipcMain } = require("electron");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");

const getJson = (path) => JSON.parse(readFileSync(path), "utf8");

const createAdvSettings = (appPath) => {
  let win = new BrowserWindow({
    title: 'Advanced settings',
    width: 435,
    height: 705,
    show: false,
    resizable: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    icon: `./img/icon.png`
  });

  win.loadFile(path.join(__dirname, `index.html`));

  win.on("closed", () => {
    ipcMain.removeAllListeners(`advanced-click`);
    ipcMain.removeHandler(`advanced-defaults`);
    ipcMain.removeHandler(`get-game-config`);
  });

  win.once("ready-to-show", () => {
    win.show();
  });

  ipcMain.on("advanced-click", (event, newConfig) => {
    if(newConfig) {
      const settings = getJson(path.join(appPath, "./config/settings.json"));
      const config = getJson(path.join(appPath, "./config/bot.json"));
      config.patch[settings.game] = newConfig;
      writeFileSync(path.join(appPath, "./config/bot.json"), JSON.stringify(config));
    }
    win.close();
  });

  ipcMain.handle("advanced-defaults", () => {
    const settings = getJson(path.join(appPath, "./config/settings.json"));
    const defaults = getJson(path.join(appPath, "./config/defaults.json"));
    return defaults.patch[settings.game];
  })

  ipcMain.handle("get-game-config", () => {
    const settings = getJson(path.join(appPath, "./config/settings.json"));
    const config = getJson(path.join(appPath, "./config/bot.json"));
    return config.patch[settings.game];
  });

  return win;
};

module.exports = createAdvSettings;
