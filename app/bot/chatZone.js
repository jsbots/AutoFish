const createRgb = require('../utils/rgb.js');
const Jimp = require("jimp");

const closeEnough = value => (v1, v2) => Math.abs(v1 - v2) < value;
const closeBy10 = closeEnough(10);

const createLootZone = ({ getDataFrom, zone, threshold }) => {
  let whisperColor = ([r, g, b]) => r - g > threshold && b - g > threshold;
  let previousMsg = [];

  return {
    async checkNewMessages() {
      const rgb = createRgb(await getDataFrom(zone));
      const whisperMsg = rgb.findColors({ isColor: whisperColor });
      if(whisperMsg) {
        if(!closeBy10(previousMsg.length, whisperMsg.length)) {
          previousMsg = whisperMsg;
          return true;
        }
      }
    },

    async getImage() {
      const img = await Jimp.read(await getDataFrom(zone));
      return await img.getBufferAsync(Jimp.MIME_JPEG)
    }
  }
};

module.exports = createLootZone;
