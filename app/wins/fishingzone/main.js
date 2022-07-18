const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const promisify = fn => (...args) => new Promise((resolve, reject) =>
	fn(...args, (err, data) => (err ? reject(err) : resolve(data))));

const createFishingZone = ({pos, screenSize}, finished) => {
  let win = new BrowserWindow({
		title: `Fishing Zone`,
    x: Math.floor(pos.x),
    y: Math.floor(pos.y),
    width: Math.floor(pos.width),
    height: Math.floor(pos.height),
    show: true,
    resizable: true,
    opacity: 0.5,
    frame: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
		icon: `./img/icon.png`
  });

  win.loadFile(path.join(__dirname, `index.html`));

  win.once("ready-to-show", () => {
    win.show();
  });

  win.once('closed', () => {
    ipcMain.removeAllListeners(`fishingZone-cancel`);
    ipcMain.removeAllListeners(`fishingZone-ok`);
  });

  ipcMain.on(`fishingZone-cancel`, () => {
    finished();
    win.close();
  });

  ipcMain.on(`fishingZone-ok`, () => {
    win.close();
    finished(null, win.getBounds());
  })

  return win;
};


module.exports = promisify(createFishingZone);
