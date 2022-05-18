const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  dialog,
  desktopCapturer,
  shell,
  powerSaveBlocker,
  globalShortcut,
} = require("electron");
const path = require("path");

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
    width: 350,
    height: 700, //675
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    icon: "./app/img/icon7.png",
  });

  win.resizable = true;
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
  win.webContents.openDevTools();
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
const createBot = require("./bot/create.js");
const { startBot, stopBot } = createBot();

const stopApp = () => {
  shell.beep();
  if (!win.isFocused()) {
    win.flashFrame(true);
    win.once("focus", () => win.flashFrame(false));
  }
  win.webContents.send("stop-app");
};
const stopAppAndBot = () => {
  stopBot();
  stopApp();
  globalShortcut.unregisterAll();
};

const getJson = (jsonPath) => {
  return JSON.parse(readFileSync(path.join(__dirname, jsonPath), "utf8"));
}


ipcMain.handle("start-bot", async (event, settings) => {
  writeFileSync(path.join(__dirname, './config/settings.json'), JSON.stringify(settings));
  const config = getJson('./config/bot.json');
  globalShortcut.register("space", stopAppAndBot);

  if(settings.name == 'Retail&Classic') {
    let result =  dialog.showMessageBoxSync(win, {
      type: 'warning',
      title: `Warning`,
      message: `Using bots on official servers is prohibited. Your account might be banned for a long time.`,
      buttons: [`I understand`, `I don't understand`],
      defaultId: 1,
      cancelId: 0
    });

    if(result) {
      throw new Error();
    }
  }

  if (settings.timer) {
    setTimeout(stopAppAndBot, settings.timer * 1000 * 60);
  }

  return await startBot(win, {game: config.game, patch: {...config.patch[settings.game], ...settings}}, stopAppAndBot);
});

ipcMain.on("stop-bot", stopAppAndBot);
ipcMain.on("open-link", () =>
  shell.openExternal("https://www.youtube.com/olesgeras")
);
ipcMain.handle("get-settings", () => {
  let settings = getJson('./config/settings.json');
  let instructions = getJson('./config/instructions.json');
  return {settings, instructions};
});

/* Bot end */
