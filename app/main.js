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
const generateName = require('./utils/generateName.js');

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

/* Electron */

let win;
Menu.setApplicationMenu(null);
let powerBlocker = powerSaveBlocker.start("prevent-display-sleep");

function createWindow() {
  win = new BrowserWindow({
    title: generateName(10),
    width: 325,
    height: 650,
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
    win = null;
  });

  win.once("ready-to-show", () => {
    win.show();
  });
}
app.whenReady().then(() => {
  createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform === "darwin") {
    return false;
  }
  powerSaveBlocker.stop(powerBlocker);
  app.quit();
});

/* Electron end */

/* Bot */

const { readFileSync, writeFileSync } = require("fs");
const keysender = require("keysender");

const { createLog, createIdLog } = require("./utils/logger.js");
const EventLine = require("./utils/eventLine.js");

const createGame = require("./game/create.js");
const createWinSwitch = require("./game/winSwitch.js");

const createBot = require("./bot/createBot.js");
const createStates = require("./bot/createStates.js");

const { startStates, stopStates } = createStates();

const stopApp = () => {
  shell.beep();
  if (!win.isFocused()) {
    win.flashFrame(true);
    win.once("focus", () => win.flashFrame(false));
  }
};

const stopAppAndBot = () => {
  stopStates();
  stopApp();
  globalShortcut.unregisterAll();
  win.webContents.send("stop-bot");
};

const getJson = (jsonPath) => {
  return JSON.parse(readFileSync(path.join(__dirname, jsonPath), "utf8"));
};

const showWarning = (warning) => {
  return result = dialog.showMessageBoxSync(win, {
    type: "warning",
    title: `Warning`,
    message: warning,
    buttons: [`I understand`, `I don't understand`],
    defaultId: 0,
    cancelId: 1,
  });
};

ipcMain.on("start-bot", async (event, settings) => {
  const config = getJson("./config/bot.json");
  const log = createLog((data) => {
    win.webContents.send("log-data", data);
  });

  log.send(`Looking for windows...`)
  const games = createGame(keysender).findWindows(config.game);
  if (!games) {
    log.err(`Can't find any window of the game!`);
    win.webContents.send("stop-bot");
    return;
  } else {
    log.ok(`Found ${games.length} window${games.length > 1 ? `s` : ``} of the game!`);
  }

  if (settings.game == "Retail&Classic" &&
      showWarning(`Using bots on official servers is prohibited. Your account might be banned for a long time.`)) {
      win.webContenst.send('stop-bot');
      return;
  }

  const winSwitch = createWinSwitch(new EventLine());
  const bots = games.map((game, i) => {
    return {
      bot: createBot(game, { config: config.patch[settings.game], settings }, winSwitch),
      log: createIdLog(log, ++i),
      state: {
       status: "initial",
       startTime: Date.now(),
     }
    };
  });

  log.send("Starting the bot...");
  globalShortcut.register("space", stopAppAndBot);
  win.blur();
  startStates(bots, settings, stopAppAndBot);
});

ipcMain.on("stop-bot", stopAppAndBot);
ipcMain.on("open-link", () =>
  shell.openExternal("https://www.youtube.com/olesgeras")
);
ipcMain.on("save-settings", (event, settings) => {
    writeFileSync(path.join(__dirname, "./config/settings.json"), JSON.stringify(settings));
});
ipcMain.handle("get-settings", () => {
  let settings = getJson("./config/settings.json");
  let instructions = getJson("./config/instructions.json");
  return { settings, instructions };
});

/* Bot end */
