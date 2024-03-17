const createRgb = require('../utils/rgb.js');
const Jimp = require('jimp');

const createLootZone = ({ getDataFrom, zone }) => {
  let colors = {
    blue: ([r, g, b]) => b - r > 80 && b - g > 80,
    green: ([r, g, b]) => g - r > 80 && g - b > 80,
    purple: ([r, g, b]) => r - g > 80 && b - g > 80
  };

  return {
    async findItems(...types) {
      let rgb = createRgb(await getDataFrom(zone));

      if(process.env.NODE_ENV == `dev`) {
        const img = await Jimp.read(rgb.getBitmap());
        const date = new Date()
        const name = `test-lootZone-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.png`
        img.write(`${__dirname}/../debug/${name}`);
      }

      return types.some(type => rgb.findColors({
        isColor: colors[type],
        atFirstMet: true
      }));
    }
  }
};

module.exports = createLootZone;
