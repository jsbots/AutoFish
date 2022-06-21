const createRgb = require("../utils/rgb.js");

const createNotificationZone = ({ getDataFrom, zone }) => {
  const notifications = {
    isWarning: ([r, g, b]) => r - b > 240 && g - b > 240,
    isError: ([r, g, b]) => r - g > 200 && r - b > 200
  }

  const stopAtFirst = true;
  return {
    check(...type) {
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

      return colors.some(color => createRgb(getDataFrom(zone)).findColors(color, stopAtFirst));
    },
  };
};

module.exports = createNotificationZone;
