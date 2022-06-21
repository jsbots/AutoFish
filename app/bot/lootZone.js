const createRgb = require('../utils/rgb.js');

const createLootZone = ({ getDataFrom, zone }) => {
  let colors = {
    blue: ([r, g, b]) => b - r > 200 && b - g > 200,
    green: ([r, g, b]) => g - r > 200 && g - b > 200
  };

  return {
    findItems(...types) {
      let rgb = createRgb(getDataFrom(zone));
      return types.some(type => rgb.findColors(colors[type]));
    }
  }
};

module.exports = createLootZone;
