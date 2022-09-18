const createRgb = require('../utils/rgb.js');
const Jimp = require("jimp");

const closeEnough = value => (v1, v2) => Math.abs(v1 - v2) < value;
const closeBy10 = closeEnough(10);

const createLootZone = ({ getDataFrom, zone }) => {
  let whisperColor = ([r, g, b]) => r - g > 60 && b - g > 60;
  let previousMsg = [];

  return {
    checkNewMessages() {
      const rgb = createRgb(getDataFrom(zone));
      const whisperMsg = rgb.findColors({ isColor: whisperColor });
      if(whisperMsg) {
        console.log(previousMsg.length, whisperMsg.length)
        if(!closeBy10(previousMsg.length, whisperMsg.length)) {
          previousMsg = whisperMsg;
          return true;
        }
      }
    },

    async getImage() {
      const img = await Jimp.read(getDataFrom(zone));
      return await img.getBufferAsync(Jimp.MIME_JPEG)
    }
  }
};

module.exports = createLootZone;
