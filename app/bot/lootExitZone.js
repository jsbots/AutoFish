const createRgb = require('../utils/rgb.js');
const Jimp = require('jimp');

const createLootExitZone = ({ getDataFrom, lootWindow, size }) => {
  const isYellow = ([r, g, b]) => r - b > 135 && g - b > 135;
  return {
    async isLootOpened(cursorPos) {
      const zone = {x: cursorPos.x + lootWindow.exitButton.x - size,
                    y: cursorPos.y - lootWindow.exitButton.y - size,
                    width: size * 2,
                    height: size * 2}

      let rgb = createRgb(await getDataFrom(zone));

      if(process.env.NODE_ENV == `dev`) {
        const img = await Jimp.read(rgb.getBitmap());
        const date = new Date()
        const name = `test-lootExitZone-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.png`
        img.write(`${__dirname}/../debug/${name}`);
      }

      let result = rgb.findColors({
        isColor: isYellow,
        atFirstMet: true
      });

      return result;
    }
  }
};

module.exports = createLootExitZone;
