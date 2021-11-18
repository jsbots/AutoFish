const { app,
      BrowserWindow,
      ipcMain,
      Menu,
      dialog,
      desktopCapturer,
      shell,
      powerSaveBlocker
      } = require('electron');

const path = require('path');

let win;
Menu.setApplicationMenu(null)
let powerBlocker = powerSaveBlocker.start('prevent-display-sleep')

function createWindow() {
  win = new BrowserWindow({
    width: 800, // 350
    height: 690, // 630
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
     win.webContents.openDevTools()
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

  game.stopTheBot();
};

const startTheBot = (options, log) => {
  if(options.game == 'classic') {
     game = classic
   }
  else {
     game = wotlk
   };

  return game.startTheBot(options, log);
};


ipcMain.on('start-bot', (event, options) => {
  startTheBot(options, log)
  .then(timerOut => {
    if(timerOut) { stopTheBot() };
  })
  .catch(e => {
    log.err(`ERROR: ${e.message}`, 'err');
    win.webContents.send('stop-bot');
    stopTheBot();
  });
});

ipcMain.on('stop-bot', stopTheBot);
ipcMain.on('open-link', (event) => {
  shell.openExternal('https://www.youtube.com/olesgeras');
});
