const {
      app,
      BrowserWindow,
      ipcMain,
      Menu,
      dialog,
      desktopCapturer,
      shell,
      powerSaveBlocker,
      globalShortcut
      } = require('electron');
const path = require('path');

if (require('electron-squirrel-startup')) return app.quit();
if (handleSquirrelEvent()) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}
function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};


let win;
Menu.setApplicationMenu(null)
let powerBlocker = powerSaveBlocker.start('prevent-display-sleep');

function createWindow() {
  win = new BrowserWindow({
    width: 350,
    height: 710,
    show: false,
    webPreferences: {
      contextIsolation: false,
  	  nodeIntegration: true
    },
    icon: './app/img/icon.png'
  });

  win.resizable = false;
  win.loadFile('./app/index.html');

  win.on('closed', () => {
    win = null;
  });


  win.once('ready-to-show', () => {
    win.show();
  })
}
app.whenReady().then(() => {
  createWindow();
})
app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    return false;
  }
  powerSaveBlocker.stop(powerBlocker);
  app.quit();
});

// const classic = require('./classic.js');

const createBot = require('./bot/createBot.js');
const log = require('./utils/logger.js');
const bot = createBot();

const stopApp = () => {
  shell.beep();
  if(!win.isFocused()) {
    win.flashFrame(true);
    win.once('focus', () => win.flashFrame(false));
  }
  win.webContents.send('stop-bot');
}

const stopBot = () => {
  bot.stop(stopApp);
  globalShortcut.unregisterAll();
};

const startBot = (event, settings) => {
  log.setWin(win);

  let config = {
    game: {
      names: ["World of Warcraft"],
      classNames: [`GxWindowClass`, `GxWindowClassD3d`]
    },
    bot: {
      delay: [75, 250],
      fishingKey: "2",
      castDelay: 1500,
      afterHookDelay: [1000, 2000],
      maxFishTime: 30000,
      relZone: {x: .300, y: .010, width: .400, height: .416}
    }
  };

  globalShortcut.register('space', stopBot);
  win.blur();

  bot.start(log, config)
  .then((stats) => log.ok(stats))
  .catch((error) => {
    log.err(`${error.message, error.stack}`);
    stopApp()
  });

  if(isFinite(settings.timer)) {
    setTimeout(stopBot, settings.timer);
  }
};

ipcMain.on('start-bot', startBot);
ipcMain.on('stop-bot', stopBot);
ipcMain.on('open-link', () => {
  shell.openExternal('https://www.youtube.com/olesjs');
});
