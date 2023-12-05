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

const fishQuotes = getJson(`./utils/fishingQuotes.json`);

/* Squirrel */
const handleSquirrelEvent = require(`./utils/handleSquirrel.js`);
if (require("electron-squirrel-startup")) return app.quit();
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}
/* Squirrel end */

app.setPath('sessionData', path.resolve(app.getAppPath(), `cache`)); // Set cache folder in the app folder

const showChoiceWarning = (win, warning, title, button1, button2) => {
  return dialog.showMessageBoxSync(win, {
    type: "warning",
    title: `${title}`,
    message: warning,
    buttons: [`${button1}`, `${button2}`],
    defaultId: 0,
    cancelId: 1,
  });
};


const showWarning = (win, warning) => {
  return dialog.showMessageBoxSync(win, {
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

let win;
const createWindow = async () => {
  win = new BrowserWindow({
    title: generateName(Math.floor(random(5, 15))),
    width: 340,
    height: 678,
    show: false,
    resizable: true,
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


let log;
  win.once("ready-to-show", async () => {
    //win.openDevTools({mode: `detach`});
    win.show();
    await new Promise(function(resolve, reject) {
      setTimeout(resolve, 350);
    });
    const settings = getJson("./config/settings.json");
    if(settings.initial) {
      showWarning(win, `The shortcut to AutoFish was created on your desktop`);

      if(showChoiceWarning(win, `This project was developed for educational purposes, aiming to explore the feasibility of creating a functional gaming bot using web-development technologies only. The software provided should never be used with real-life applications, games and servers outside private "sandbox".

You assume full responsibility for any outcomes that may arise from using this software. It's essential to acknowledge that this software is not designed to be "undetectable" in any way, nor was it ever intended for such purposes as stated above. As a result, no guarantees or assurances can be made regarding the functionality or outcomes of the bot.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

By pressing "Accept" you agree to everything stated above.`,
`MIT License | Copyright (c) 2023 jsbots`, `Accept`, `Decline`)) {
        app.quit();
      } else {
        settings.initial = false;
        writeFileSync(path.join(__dirname, "./config/settings.json"), JSON.stringify(settings));
      }
    }
  });

  ipcMain.on(`onload`, () => {
    let { version } = getJson('../package.json');
    win.webContents.send('set-version', version);
    log = createLog((data) => {
      win.webContents.send("log-data", data);
    });
    log.msg(fishQuotes[Math.floor(Math.random() * fishQuotes.length)]);

    if(screen.getAllDisplays().length > 1) {
      log.warn("The bot detected more than 1 display: use both the game and the bot on the primary one.")
    }
  })


  ipcMain.on("start-bot", async (event, type) => {
    const config = getJson("./config/bot.json");
    const settings = getJson("./config/settings.json");


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

    if(type != `relZone` && settings.initialZone){
      await new Promise(function(resolve, reject) {
        setTimeout(resolve, 50);
      });
      if(!(showChoiceWarning(win, `This is your first launch. Do you want to set your Fishing Zone first? (recommended)`, `Fishing Zone`, `Yes`, `No`))) {
        type = `relZone`;
        win.webContents.send("stop-bot");
      }
    }

    if(settings.initialZone) {
      settings.initialZone = false;
      writeFileSync(path.join(__dirname, "./config/settings.json"), JSON.stringify(settings));
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

    const {startBots, stopBots} = await createBots(games, settings, config, log);

    const stopAppAndBots = () => {

      games.forEach(({mouse, keyboard}) => {
         mouse.humanMoveTo.cancelCurrent();
         keyboard.sendKeys.cancelCurrent();
         keyboard.printText.cancelCurrent();
      });

      stopBots();
      if(config.patch[settings.game].hideWin) win.show();
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
  if(config.patch[settings.game].hideWin) {
    setTimeout(() => {
      win.hide();
    }, 500 + Math.random() * 1500);
  }
  startBots(stopAppAndBots);
  });


  ipcMain.on("open-link", (event, link) =>
    shell.openExternal(link)
  );

  ipcMain.on("dx11-warn", () => {
    showWarning(win, `Don't use this if you don't know what you are doing. This is an alternative pixel recognition logic that requires DirectX 11 turned on in the game.`);
  });

  ipcMain.on("open-link-donate", () =>
    shell.openExternal("https://www.buymeacoffee.com/jsbots/e/96734")
  );

  ipcMain.on("save-settings", (event, settings) =>
    writeFileSync(path.join(__dirname, "./config/settings.json"), JSON.stringify(settings))
  );

  ipcMain.on("unsupported-key", () => {
    showWarning(win, `The key you pressed is not supported by AutoFish.`);
  });

  ipcMain.on(`resize-win`, (event, size) => {
    win.setSize(size.width, size.height);
  });

  ipcMain.on("turtle-warn", () => {
    return showWarning(win, `For Turtle WoW you need to manually set Sensitivity in the Advanced Settings in the Critical section. If the bot often clicks too early - increase it. If the bot doesn't react at all (which might seem like it reacts with some delay), then decrease it.\n\nAs an alternative you can try "Vanilla (splash)" settings with the water textures from some newer patches.`);
  });

  ipcMain.on("ascension-warn", () => {
    return showWarning(win, `If you play on some custom servers like Ascension, don't forget to run the bot as admin, otherwise it won't work.`);
  })

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
      { label: `AutoFish ver. 2.4.0 Public` },
      { type: 'separator' },
      { label: "📘 Read Me", click: () => shell.openExternal("https://github.com/jsbots/AutoFish#guide-blue_book")},
      { label: 'Video', click: () => shell.openExternal("https://youtu.be/A3W8UuVIZTo")},
      { type: 'separator' },
      { label: 'Report issue', click: () => shell.openExternal("https://github.com/jsbots/AutoFish/issues")},
      { type: 'separator' },
      { label: 'Discord Server', click: () => shell.openExternal("https://discord.gg/4sHFUtZ8tC")},
      { label: 'Donate', click: () => shell.openExternal("https://www.buymeacoffee.com/jsbots")},
      { type: 'separator' },
      { role: 'quit' }
    ]},
    {
    label: `Cache`,
    submenu: [
      {
        label: "Open Cache",
        click: () => {
          shell.openExternal(win.webContents.session.storagePath);
        },
      },
      {
        label: "Clear Cache",
        click: () => {
          win.webContents.session.clearStorageData();
          showWarning(win, `Cache Cleared. Application Reload May Be Required`);
        },
      },
      { type: "separator" },
    ],
  },
  ])

  Menu.setApplicationMenu(menu);
  createWindow();
});
