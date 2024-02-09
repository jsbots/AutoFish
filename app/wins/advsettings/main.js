const { BrowserWindow, ipcMain, dialog } = require("electron");
const { readFileSync, writeFileSync } = require("fs");
const path = require("path");

const getJson = (path) => JSON.parse(readFileSync(path), "utf8");

const showWarning = (win, warning, title) => {
  return result = dialog.showMessageBoxSync(win, {
    type: "warning",
    title: `Warning!`,
    message: warning,
    buttons: [`Ok`]
  });
};

const createAdvSettings = (appPath) => {
  let win = new BrowserWindow({
    title: 'Advanced Settings',
    width: 455,
    height: 627,
    show: false,
    resizable: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    icon: "./app/img/icon.png"
  });

  win.loadFile(path.join(__dirname, `index.html`));
  win.removeMenu();
  win.on("closed", () => {
    ipcMain.removeAllListeners(`advanced-click`);
    ipcMain.removeAllListeners(`unsupported-key-win`);
    ipcMain.removeAllListeners(`lures-warn`);
    ipcMain.removeAllListeners(`whitelist-warn`);
    ipcMain.removeAllListeners(`start-by-fishing-key-warn`);
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
    showWarning(win, `Don't forget to make a macros as described in the Guide and assign it to the same key you have assigned for Lures Key.`);
  });

  ipcMain.on("start-by-fishing-key-warn", () => {
      showWarning(win, `The key you assigned for Fishing Key will be blocked on your machine and if used will start the bot even if you are not in the game!\n\nTurn this feature on only after you have configured all the settings and turn it off before making any changes.`);
  });

  ipcMain.on("whitelist-warn", () => {
    showWarning(win, `Turn off AutoLoot option in the game.\n\nTurn off UI addons and UI scaling in the game.\n\nTurn on Open Loot Window at Mouse option in the game. (optional for Retail, Vanilla, Vanilla(splash), Turtle WoW, but if you do then check respective option in this section).\n\nBest works with standard resolutions like: 1366x768, 1920x1080 and 3840x2160.`);
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
