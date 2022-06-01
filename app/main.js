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

/* Bot modules */
const keysender = require("keysender");
const generateName = require('./utils/generateName.js');
const { createLog } = require("./utils/logger.js");
const createGame = require("./game/createGame.js");
const createBots = require("./bot/createBots.js");
/* Bot modules end */

/* Squirrel */

if (require("electron-squirrel-startup")) return app.quit();
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}
function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require("child_process");

  const appFolder = path.resolve(process.execPath, "..");
  const rootAtomFolder = path.resolve(appFolder, "..");
  const updateDotExe = path.resolve(path.join(rootAtomFolder, "Update.exe"));
  const exeName = path.basename(process.execPath);

  const spawn = function (command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case "--squirrel-install":
    case "--squirrel-updated":
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(["--createShortcut", exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case "--squirrel-uninstall":
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(["--removeShortcut", exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case "--squirrel-obsolete":
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
}

/* Squirrel end */

const getJson = (jsonPath) => {
  return JSON.parse(readFileSync(path.join(__dirname, jsonPath), "utf8"));
};

const showChoiceWarning = (warning) => {
  return result = dialog.showMessageBoxSync(win, {
    type: "warning",
    title: `Warning`,
    message: warning,
    buttons: [`I understand`, `I don't understand`],
    defaultId: 0,
    cancelId: 1,
  });
};


function createWindow() {
  let win = new BrowserWindow({
    title: generateName(10),
    width: 325,
    height: 505,
    show: false,
    resizable: false,
    webPreferences: {
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
  });

  ipcMain.on("start-bot", async (event, settings) => {
    const config = getJson("./config/bot.json");
    const log = createLog((data) => {
      win.webContents.send("log-data", data);
    });

    log.send(`Looking for the windows...`)

    const customName = config.patch[settings.game].customName;
    if(customName) {
      config.game.names.push(customName);
    }

    const games = createGame(keysender).findWindows(config.game);
    if (!games) {
      log.err(`Can't find any window of the game!`);
      win.webContents.send("stop-bot");
      return;
    } else {
      log.ok(`Found ${games.length} window${games.length > 1 ? `s` : ``} of the game!`);
    }

    if (settings.game == "Retail&Classic" &&
        showChoiceWarning(`Using bots on official servers is prohibited. Your account might be banned for a long time.`)) {
        win.webContents.send('stop-bot');
        return;
    }

    if(settings.fishingKey === `` || settings.luresKey === ``) {
      dialog.showErrorBox('', `Keys values can't be empty`);
      win.webContents.send('stop-bot');
      return;
    }

    const {startBots, stopBots} = createBots(games, settings, config, log);

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

  ipcMain.on("open-link", () =>
    shell.openExternal("https://www.youtube.com/jsbots")
  );

  ipcMain.on("save-settings", (event, settings) =>
  writeFileSync(path.join(__dirname, "./config/settings.json"), JSON.stringify(settings))
  );

  let settWin;
  ipcMain.on("advanced-settings", () => {
    if(!settWin || settWin.isDestroyed()) {
      settWin = createAdvSettingsWin()
    } else {
      settWin.focus();
    }
  });

  ipcMain.handle("get-settings", () => getJson("./config/settings.json"));
}


let powerBlocker = powerSaveBlocker.start("prevent-display-sleep");

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
});


const createAdvSettingsWin = () => {
  let settWin = new BrowserWindow({
    title: 'Advanced settings',
    width: 435,
    height: 580,
    show: false,
    resizable: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    icon: "./app/img/icon.png",
  });

  settWin.loadFile("./app/advSettings/index.html");

  settWin.on("closed", () => {
    ipcMain.removeAllListeners(`advanced-click`);
    ipcMain.removeHandler(`advanced-defaults`);
    ipcMain.removeHandler(`get-game-config`);
  });

  settWin.once("ready-to-show", () => {
    settWin.show();
  });

  ipcMain.on("advanced-click", (event, newConfig) => {
    if(newConfig) {
      const settings = getJson("./config/settings.json");
      const config = getJson("./config/bot.json");
      config.patch[settings.game] = newConfig;
      writeFileSync(path.join(__dirname, "./config/bot.json"), JSON.stringify(config));
    }
    settWin.close();
  });

  ipcMain.handle("advanced-defaults", () => {
    const settings = getJson("./config/settings.json");
    const defaults = getJson("./config/defaults.json");
    return defaults.patch[settings.game];
  })

  ipcMain.handle("get-game-config", () => {
    const settings = getJson("./config/settings.json");
    const config = getJson("./config/bot.json");
    return config.patch[settings.game];
  });

  return settWin;
};
