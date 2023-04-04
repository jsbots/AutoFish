const { BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { screen, Region } = require("@nut-tree/nut-js");
const fishZone = require("../../bot/fishingZone.js");

const promisify = fn => (...args) => new Promise((resolve, reject) =>
	fn(...args, (err, data) => (err ? reject(err) : resolve(data))));

const getDataFrom = async (zone) => {
	let grabbed = await(await screen.grabRegion(new Region(zone.x, zone.y, zone.width, zone.height))).toRGB();
	return grabbed;
};

const createFishingZone = ({pos, screenSize, type, config, settings, scale}, finished) => {
  let win = new BrowserWindow({
		title: `Fishing Zone`,
    x: Math.floor(pos.x),
    y: Math.floor(pos.y),
    width: Math.floor(pos.width),
    height: Math.floor(pos.height),
    show: true,
    resizable: true,
    opacity: 0.3,
    frame: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
		icon: `./img/icon.png`
  });

  win.loadFile(path.join(__dirname, `${type == `relZone` ? `fishing.html` : `chat.html`}`));

  win.once("ready-to-show", () => {
    win.show();
  });

  win.once('closed', () => {
    ipcMain.removeAllListeners(`fishingZone-cancel`);
    ipcMain.removeAllListeners(`fishingZone-ok`);
		ipcMain.removeHandler(`fishingZone-check`);
  });

  ipcMain.on(`fishingZone-cancel`, () => {
    finished();
    win.close();
  });

	ipcMain.handle(`fishingZone-check`, async () => {
		let pos = win.getBounds();

		pos.x = pos.x * scale;
		pos.y = pos.y * scale;
		pos.width = pos.width * scale;
		pos.height = pos.height * scale;

		if(pos.x < 0) pos.x = 0;
		if(pos.y < 0) pos.y = 0;
		if(pos.x + pos.width > screenSize.width) pos.width = screenSize.width - pos.x;
		if(pos.y + pos.height > screenSize.height) pos.height = screenSize.height - pos.y;

		if(type != `relZone`) return;
		win.setOpacity(0);
		let zone = fishZone({
			 getDataFrom,
			 zone: pos, threshold: settings.threshold,
			 bobberColor: settings.bobberColor,
			 sensitivity:  config.bobberSensitivity,
			 density: config.bobberDensity
		 });
		let bobber = await zone.findBobber();
		win.setOpacity(0.3);
		if(bobber) {
			return `rgb(255, 70, 68)`;
		} else {
			return `rgb(70, 255, 68)`;
		}
	});

  ipcMain.on(`fishingZone-ok`, () => {
    win.close();
    finished(null, win.getBounds());
  })

  return win;
};


module.exports = promisify(createFishingZone);
