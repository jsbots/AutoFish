const createRgb = require("../utils/rgb.js");
const Jimp = require('jimp');

const createNotificationZone = ({ getDataFrom, zone }) => {
  const notifications = {
    isWarning: ([r, g, b]) => r - b > 200 && g - b > 200,
    isError: ([r, g, b]) => r - g > 220 && r - b > 220
  }

  return {
    async check(...type) {
      const colors = type.map((type) => {
        switch (type) {
          case "warning": {
            return notifications.isWarning;
          }
          case "error": {
            return notifications.isError;
          }
        }
      });

      for(const color of colors) {
        let data = await getDataFrom(zone);
        let rgb = createRgb(data);

        if(process.env.NODE_ENV == `dev`) {
          const img = await Jimp.read(rgb.getBitmap());
          const date = new Date()
          const name = `test-notificationZone-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.png`
          img.write(`${__dirname}/../debug/${name}`);
        }

        let foundColor = rgb.findColors({
          isColor: color,
          atFirstMet: true
        });
        if(foundColor) {
          return true;
        }
      }
    },
  };
};

module.exports = createNotificationZone;
