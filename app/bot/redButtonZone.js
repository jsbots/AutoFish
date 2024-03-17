const createRgb = require("../utils/rgb.js");
const Jimp = require('jimp');

const mouseWithinZone = (mouse, zone) => {
  return (
    mouse.x - zone.x > 0 &&
    mouse.y - zone.y > 0 &&
    mouse.x < zone.x + zone.width &&
    mouse.y < zone.y + zone.height
  );
};


const createRedButtonZone = ({getDataFrom, zone}) => {
  const isRed = ([r, g, b]) => r - g > 125 && r - b > 125;
  const isYellow = ([r, g, b]) => r - b > 175 && g - b > 175;
  const isWhite = ([r, g, b]) => r > 220 && g > 220 && b > 220;
  return {
    async isOn(mousePos) {
      const rgb = createRgb(await getDataFrom(zone));

      if(process.env.NODE_ENV == `dev`) {
        const img = await Jimp.read(rgb.getBitmap());
        const date = new Date()
        const name = `test-redButtonZone-before-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.png`
        img.write(`${__dirname}/../debug/${name}`);
      }

      let red = rgb.findColors({isColor: isRed, atFirstMet: true});
      let yellow = mouseWithinZone(mousePos, zone) || rgb.findColors({isColor: isYellow, atFirstMet: true});
      if(red && yellow) {
        return {red, yellow};
      }
    },

    async isOnAfterHighlight() {
      const rgb = createRgb(await getDataFrom(zone));

      if(process.env.NODE_ENV == `dev`) {
        const img = await Jimp.read(rgb.getBitmap());
        const date = new Date()
        const name = `test-redButtonZone-after-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.png`
        img.write(`${__dirname}/../debug/${name}`);
      }

      return rgb.findColors({isColor: isWhite, atFirstMet: true})
    }
  }
};

module.exports = createRedButtonZone;
