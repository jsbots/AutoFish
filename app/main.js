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
    title: `Warning`,
    message: warning,
    buttons: [`I understand`, `I don't understand`],
    defaultId: 0,
    cancelId: 1,
  });
};

const setFishingZone = async ({workwindow}, relZone) => {
  workwindow.setForeground();
  while(!workwindow.isForeground()) {
    workwindow.setForeground();
  }
  const screenSize = workwindow.getView();
  const pos = {
    x: screenSize.x + relZone.x * screenSize.width,
    y: screenSize.y + relZone.y * screenSize.height,
    width: relZone.width * screenSize.width,
    height: relZone.height * screenSize.height
  }

  const result = await createFishingZone({pos, screenSize});
  if(!result) return;
  return {
    x: (result.x - screenSize.x) / screenSize.width,
    y: (result.y - screenSize.y) / screenSize.height,
    width: result.width / screenSize.width,
    height: result.height / screenSize.height
  }
}

const createWindow = async () => {
  let win = new BrowserWindow({
    title: generateName(10),
    width: 325,
    height: 695,
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

    log.send(`Looking for the windows...`)

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
      log.err(`Can't find any window of the game!`);
      win.webContents.send("stop-bot");
      return;
    } else {
      log.ok(`Found ${games.length} window${games.length > 1 ? `s` : ``} of the game!`);
    }

    if(type == `setFishingZone`) {
      log.send(`Setting fishing zone...`);
      let data = await setFishingZone(games[0], config.patch[settings.game].relZone);
      if(data) {
        config.patch[settings.game].relZone = data;
        writeFileSync(path.join(__dirname, "./config/bot.json"), JSON.stringify(config));
      }
      log.ok(`Done!`);
      win.focus();
      return;
    }

    if (settings.initial && (settings.game == "Retail" || settings.game == "Classic&TBCC")) {
      if(showChoiceWarning(win, `Using bots on official servers is prohibited. Your account might be banned for a long time! \n
- Switch to DirectX11 \n
- Don't fish for a long time. \n
- Use "Miss on purpose" and "Log out/Log in" options.`)) {
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
    globalShortcut.register("space", stopAppAndBots);

    win.blur();
    startBots(stopAppAndBots);
  });

  ipcMain.on("open-link-youtube", () =>
    shell.openExternal("https://www.youtube.com/jsbots")
  );

  ipcMain.on("open-link-donate", () =>
    shell.openExternal("https://www.paypal.com/donate/?hosted_button_id=XPWU6DUWNTSBJ")
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
  Menu.setApplicationMenu(null);
  createWindow();
});
