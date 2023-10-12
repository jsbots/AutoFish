const { BrowserWindow, ipcMain, dialog } = require("electron");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");

const getJson = (path) => JSON.parse(readFileSync(path), "utf8");

const showWarning = (win, warning, title) => {
  return result = dialog.showMessageBoxSync(win, {
    type: "warning",
    title: `Warning`,
    message: warning,
    buttons: [`Ok`]
  });
};

const createAdvSettings = (appPath) => {
  let win = new BrowserWindow({
    title: 'Advanced Settings',
    width: 455,
    height: 715,
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
    ipcMain.removeAllListeners(`unsupported-key-win`);
    ipcMain.removeAllListeners(`lures-warn`);
    ipcMain.removeHandler(`advanced-defaults`);
    ipcMain.removeHandler(`get-game-config`);
  });

  win.once("ready-to-show", () => {
    //win.openDevTools({mode: `detach`});
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

  ipcMain.on("unsupported-key-win", () => {
    showWarning(win, `The key you pressed is not supported by AutoFish.`);
  })

  ipcMain.on("lures-warn", () => {
    showWarning(win, `Don't forget to make a macros as described in the Guide (Help -> Read Me) and assign it to the same key you have assigned for Lures Key.`);
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
