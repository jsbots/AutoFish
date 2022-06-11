const RgbAdapter = require("../game/rgbAdapter.js");

class NotificationZone extends RgbAdapter {
  constructor(workwindow, zone) {
    super(workwindow, zone);
  }

  check(...type) {
    const colors = type.map((type) => {
      switch (type) {
        case "warning": {
          return this.colors.isWarning;
        }
        case "error": {
          return this.colors.isError;
        }
      }
    });
    return colors.some((color) => super.getRgb().findColors(color, true));
  }

  static from(workwindow, zone) {
    return new NotificationZone(workwindow, zone);
  }
}

module.exports = NotificationZone;
