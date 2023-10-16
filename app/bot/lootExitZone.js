const createRgb = require('../utils/rgb.js');

const createLootExitZone = ({ getDataFrom, lootWindow, size }) => {
  const isYellow = ([r, g, b]) => r - b > 135 && g - b > 135;
  return {
    async isLootOpened(cursorPos) {
      const zone = {x: cursorPos.x + lootWindow.exitButton.x - size,
                    y: cursorPos.y - lootWindow.exitButton.y - size,
                    width: size * 2,
                    height: size * 2}

      let rgb = createRgb(await getDataFrom(zone));
      let result = rgb.findColors({
        isColor: isYellow,
        atFirstMet: true
      });

      return result;
    }
  }
};

module.exports = createLootExitZone;
