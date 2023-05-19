/* Electron modules*/
const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  dialog,
  shell,
  powerSaveBlocker,
  globalShortcut,
  screen
} = require("electron");
const path = require("path");

const { readFileSync, writeFileSync } = require("fs");
const createAdvSettings = require(`./wins/advsettings/main.js`);
const createFishingZone = require(`./wins/fishingzone/main.js`);

const getJson = (jsonPath) => {
  return JSON.parse(readFileSync(path.join(__dirname, jsonPath), "utf8"));
};
/* Electron modules end */

/* Bot modules */
const generateName = require('./utils/generateName.js');
const { createLog } = require("./utils/logger.js");
const { findGameWindows, getAllWindows } = require("./game/createGame.js");
const createBots = require("./bot/createBots.js");
const getBitmapAsync = require("./utils/getBitmap.js");
/* Bot modules end */

/* Squirrel */
const handleSquirrelEvent = require(`./utils/handleSquirrel.js`);
if (require("electron-squirrel-startup")) return app.quit();
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}
/* Squirrel end */


const showChoiceWarning = (win, warning) => {
  return result = dialog.showMessageBoxSync(win, {
    type: "warning",
    title: `Disclaimer`,
    message: warning,
    buttons: [`I agree`, `I don't agree`],
    defaultId: 0,
    cancelId: 1,
  });
};


const showWarning = (win, warning) => {
  return result = dialog.showMessageBoxSync(win, {
    type: "warning",
    title: `Warning`,
    message: warning,
    buttons: [`Ok`]
  });
};

const random = (from, to) => {
  return from + Math.random() * (to - from);
};

const setFishingZone = async ({workwindow}, relZone, type, config, settings) => {
  workwindow.setForeground();
  while(!workwindow.isForeground()) {
    workwindow.setForeground();
  }
  const screenSize = workwindow.getView();
  const scale = screen.getPrimaryDisplay().scaleFactor || 1;

  const pos = {
    x: (screenSize.x + relZone.x * screenSize.width) / scale,
    y: (screenSize.y + relZone.y * screenSize.height) / scale,
    width: (relZone.width * screenSize.width) / scale,
    height: (relZone.height * screenSize.height) / scale
  }

  const result = await createFishingZone({pos, screenSize, type, config, settings, scale});
  if(!result) return;
  return {
    x: (result.x - screenSize.x) * scale / screenSize.width,
    y: (result.y - screenSize.y) * scale / screenSize.height,
    width: result.width * scale / screenSize.width,
    height: result.height * scale / screenSize.height
  }
}

const createWindow = async () => {
  let win = new BrowserWindow({
    title: generateName(Math.floor(random(5, 15))),
    width: 325,
    height: 760,
    show: false,
    resizable: false,
    webPreferences: {
      spellcheck: false,
      contextIsolation: false,
      nodeIntegration: true,
    },
    icon: "./app/img/icon.png",
  });

  win.loadFile("./app/index.html");

  win.on("closed", () => {
    if (process.platform === "darwin") {
      return false;
    }
    powerSaveBlocker.stop(powerBlocker);
    app.quit();
  });

  win.once("ready-to-show", () => {
    // win.openDevTools({mode: `detach`});
    win.show();
    let { version } = getJson('../package.json');
    win.webContents.send('set-version', version);
  });


  ipcMain.on("start-bot", async (event, type) => {
    const config = getJson("./config/bot.json");
    const settings = getJson("./config/settings.json");

    const log = createLog((data) => {
      win.webContents.send("log-data", data);
    });

    log.send(`Looking for the windows of the game...`);

    const useCustomWindow = config.patch[settings.game].useCustomWindow;
    if(useCustomWindow) {
      const customWindow = config.patch[settings.game].customWindow;
      const name = getAllWindows().find(({title}) => title == customWindow);
      if(!name) {
        log.err(`Can't access this window`);
        win.webContents.send("stop-bot");
        return;
      }
      const {title, className} = name;
      config.game.names.push(title);
      config.game.classNames.push(className);
    }

    const games = findGameWindows(config.game);

    if (!games) {
      log.err(`Can't find any window of the game! Go to the Advanced Settings and choose the window of the game manually.`);
      win.webContents.send("stop-bot");
      return;
    } else {
      log.ok(`Found ${games.length} window${games.length > 1 ? `s` : ``} of the game!`);
    }

    if(type == `relZone` || type == `chatZone`) {
      log.send(`Setting ${type == `relZone` ? `Fishing` : `Chat`} Zone...`);
      let data = await setFishingZone(games[0], config.patch[settings.game][type], type, config.patch[settings.game], settings);
      if(data) {
        config.patch[settings.game][type] = data;
        writeFileSync(path.join(__dirname, "./config/bot.json"), JSON.stringify(config));
      }
      log.ok(`Set ${type == `relZone` ? `Fishing` : `Chat`} Zone Succesfully!`);
      win.focus();
      return;
    }

    if (settings.initial && (settings.game == "Dragonflight" || settings.game == "WotLK Classic" || settings.game == "Classic")) {
      if(showChoiceWarning(win, `The software is provided "as is" and the author disclaims all warranties
with regard to this software. In no event shall the author be liable for
any special, direct, indirect, or consequential damages or any damages
whatsoever resulting from loss of use or data, whether in an
action of contract, negligence or other tortious action, arising out of
or in connection with the use or performance of this software.`)) {
        win.webContents.send('stop-bot');
        return;
      } else {
        settings.initial = false;
        writeFileSync(path.join(__dirname, "./config/settings.json"), JSON.stringify(settings));
      }
    }

    if(settings.fishingKey === `` || settings.luresKey === ``) {
      dialog.showErrorBox('', `Fishing and lures key values can't be empty`);
      win.webContents.send('stop-bot');
      return;
    }

    const {startBots, stopBots} = await createBots(games, settings, config, log);

    const stopAppAndBots = () => {
      stopBots();
      shell.beep();
      if (!win.isFocused()) {
        win.flashFrame(true);
        win.once("focus", () => win.flashFrame(false));
      }
      globalShortcut.unregisterAll();
      win.webContents.send("stop-bot");
    };

    ipcMain.on("stop-bot", stopAppAndBots);
    globalShortcut.register(settings.stopKey, stopAppAndBots);

    win.blur();
    startBots(stopAppAndBots);
  });


  ipcMain.on("open-link-youtube", () =>
    shell.openExternal("https://www.youtube.com/jsbots")
  );

  ipcMain.on("dx11-warn", () => {
    showWarning(win, `Don't use this if you don't know what you are doing. This is an alternative pixel recognition logic that requires DirectX 11 turned on in the game.`);
  });

  ipcMain.on("lures-warn", () => {
    showWarning(win, `Don't forget to make a macros as described in the Guide (Help -> Read Me) and assign it to the same key you have assigned for Lures Key.`);
  });

  ipcMain.on("whitelist-warn", () => {
    showWarning(win, `Turn off AutoLoot. Your resolution should be either 1366x768 or 1920x1080. UI addons and UI scale should be turned off. Turn on Open Loot Window at Mouse option (optional for Dragonflight and Vanilla).`);
  });

  ipcMain.on("open-link-donate", () =>
    shell.openExternal("https://www.buymeacoffee.com/jsbots/e/96734")
  );

  ipcMain.on("save-settings", (event, settings) =>
    writeFileSync(path.join(__dirname, "./config/settings.json"), JSON.stringify(settings))
  );

  let settWin;
  ipcMain.on("advanced-settings", () => {
    if(!settWin || settWin.isDestroyed()) {
      settWin = createAdvSettings(__dirname)
    } else {
      settWin.focus();
    }
  });

  ipcMain.handle("get-bitmap", getBitmapAsync);
  ipcMain.handle("get-all-windows", getAllWindows);
  ipcMain.handle("get-settings", () => getJson("./config/settings.json"));
}

let powerBlocker = powerSaveBlocker.start("prevent-display-sleep");
app.whenReady().then(() => {
  const menu = Menu.buildFromTemplate([{label: `Help`,     submenu: [
      { label: 'AutoFish 2.0.0 beta Public' },
      { type: 'separator' },
      { label: 'Read Me', click: () => shell.openExternal("https://github.com/jsbots/AutoFish#guide-blue_book")},
      { label: 'Video', click: () => shell.openExternal("https://youtu.be/A3W8UuVIZTo")},
      { type: 'separator' },
      { label: 'Report issue', click: () => shell.openExternal("https://github.com/jsbots/AutoFish/issues")},
      { type: 'separator' },
      { label: 'Discord Server', click: () => shell.openExternal("https://discord.gg/4sHFUtZ8tC")},
      { label: 'Donate', click: () => shell.openExternal("https://www.buymeacoffee.com/jsbots")},
      { type: 'separator' },
      { role: 'quit' }
    ]}])

  Menu.setApplicationMenu(menu);
  createWindow();
});
