const createRgb = require('../utils/rgb.js');

const createLootZone = ({ getDataFrom, zone }) => {
  let colors = {
    blue: ([r, g, b]) => b - r > 80 && b - g > 80,
    green: ([r, g, b]) => g - r > 80 && g - b > 80
  };

  return {
    async findItems(...types) {
      let rgb = createRgb(await getDataFrom(zone));
      return types.some(type => rgb.findColors({
        isColor: colors[type],
        atFirstMet: true
      }));
    }
  }
};

module.exports = createLootZone;
