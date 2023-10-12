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

const fishQuotes = [
  `"A bad day of fishing is better than a good day at work." - Unknown`,
  `"Fishing is a passion that can never be fully explained." - Unknown `,
  `"Fishing provides that connection with the whole living world. It gives you the opportunity of being totally immersed, turning back into yourself in a good way." - Ted Hughes`,
  `"The solution to any problem—work, love, money, whatever—is to go fishing, and the worse the problem, the longer the trip should be." - John Gierach`,
  `"There are always new places to go fishing. For any fisherman, there's always a new place, always a new horizon." - Jack Nicklaus`,
  `"Fishing is not just a hobby; it's a state of mind." - Mariano Rivera`,
  `"Fishing is an affirmation of life's richness and our profound interconnectedness to the natural world." - Carl Safina`,
  `"Fishing is not just about catching fish; it's about understanding the delicate balance of nature." - Aldo Leopold`,
  `"Angling is a way of calming the soul and setting the spirit free." - Dave Hughes`,
  `"The act of fishing takes us to the hidden corners of the world, revealing the beauty that lies beneath the surface." - James Prosek`,
  `"The wise fisherman knows that satisfaction is not always measured in the size of the catch." - Lao Tzu`,
  `"There's certainly something in fishing that makes a man feel he is doing right; I can't explain it, but it's very pleasant." - Norman Maclean`,
  `"They say there are plenty of fish in the sea, but for me, you're the only catch." - Unknown`,
  `"To fish is to hold a mirror to nature." - Paul Schullery`,
  `"Fishing is like dating; it's all catch and release until you find a keeper." - Unknown`,
  `"The best way to catch a fish is to let him think he's escaping." - Unknown`,
  `"There is no such thing as too much equipment." - Unknown (Every fisherman's mantra!)`,
  `"Every time I cast my line, I hope to catch a moment with you." - Lila Monroe`,
  `"There he stands, draped in more equipment than a telephone lineman, trying to outwit an organism with a brain no bigger than a breadcrumb, and getting licked in the process." - Paul O'Neil`,
  `"The best time to go fishing is when you can get away." - Robert Traver`,
  `"Give a man a fish, and he has food for a day; teach him how to fish, and you can get rid of him for the entire weekend." - Zenna Schaffer`,
  `"Fishing is a quest for knowledge and wonder as much as a pursuit of fish; it is as much an acquaintance with beavers, dippers, and other fishermen as it is a challenge of trout." - Paul Schullery`,
  `"If you wish to fish, you must venture your bait." - Latin Proverb`,
  `"The fisherman is the biggest liar in the world. Except for writers, of course." - Unknown`,
  `"A bad day fishing still beats a good day working." - Unknown`,
  `"If wishes were fishes, we'd all cast nets." - Scottish Proverb`,
  `"A woman who has never seen her husband fishing doesn't know what a patient man she married!" - Unknown`,
  `"Fish or cut bait." - American Proverb`,
  `"A fish and a guest smell after three days." - English Proverb`,
  `"The fish trap exists because of the fish. Once you've gotten the fish you can forget the trap." - Chinese Proverb`
]

/* Squirrel */
const handleSquirrelEvent = require(`./utils/handleSquirrel.js`);
if (require("electron-squirrel-startup")) return app.quit();
if (handleSquirrelEvent(app)) {
  // squirrel event handled and app will exit in 1000ms, so don't do anything else
  return;
}
/* Squirrel end */


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

const createWindow = async () => {
  let win = new BrowserWindow({
    title: generateName(Math.floor(random(5, 15))),
    width: 340,
    height: 720,
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

      if(showChoiceWarning(win, `Copyright (c) 2023 jsbots

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`,
 `MIT License`, `Accept`, `Decline`)) {
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

  ipcMain.on("whitelist-warn", () => {
    showWarning(win, `Turn off AutoLoot.\n\nTurn off UI addons and UI scaling.\n\nTurn on Open Loot Window at Mouse option (optional for Retail and Vanilla/Vanilla(splash)).\n\nBest works with standard resolutions like: 1366x768, 1920x1080, 2560x1440 and 3840x2160.`);
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
      { label: `AutoFish ver. 2.2.1 Public` },
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
