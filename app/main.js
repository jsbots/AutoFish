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

// this should be placed at top of main.js to handle setup events quickly
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
let powerBlocker = powerSaveBlocker.start('prevent-display-sleep')

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


/////////////////////////////////////////


const getCurrentTime = () => {
  let date = new Date();
  let times = {hr: date.getHours(),min: date.getMinutes(), sec: date.getSeconds()};
  for(let time of Object.keys(times)) {
    times[time] = times[time].toString();
    if(times[time].length < 2) {
      times[time] = times[time].padStart(2, `0`);
    }
  }

  return times;
};

class Log {
  constructor() {
    let types = {
                 err: 'red',
                 ok: 'green',
                 warn: 'orange',
                 msg: 'black'
               };

    for(let type of Object.keys(types)) {
      this[type] = (text) => {
          this.send(text, types[type]);
      };
    }
  }

  send(text, type = 'black') {
    let date = getCurrentTime();
    text = `[${date.hr}:${date.min}:${date.sec}] ${text}`;
    win.webContents.send('log-data', {text, type});
  }
}

const classic = require('./classic.js');
const wotlk = require('./wotlk.js');
const log = new Log();
let game;

const stopTheBot = () => {
  shell.beep();
  log.msg(`Stopping the bot...`);

  if(!win.isFocused()) {
    win.flashFrame(true);
    win.once('focus', () => win.flashFrame(false));
  }

  win.webContents.send('stop-bot');
  globalShortcut.unregisterAll();
  game.stopTheBot();
};

const startTheBot = (options, log) => {
  switch(options.game) {

    case "classic": {
      game = classic
      break;
    }

    case "wotlk": {
      game = wotlk
      globalShortcut.register('space', stopTheBot);
      win.blur();
      break;
    }
  }

  return game.startTheBot(options, log);
};


ipcMain.on('start-bot', (event, options) => {
  startTheBot(options, log)
  .then(timerOut => {
    if(timerOut) { stopTheBot() };
  })
  .catch(e => {
    log.err(`ERROR: ${e.message}`, 'err');
    stopTheBot();
  });
});

ipcMain.on('stop-bot', stopTheBot);
ipcMain.on('open-link', (event) => {
  shell.openExternal('https://www.youtube.com/olesjs');
});
