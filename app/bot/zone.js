const RgbAdapter = require("../game/rgbAdapter.js");

class FishingZone extends RgbAdapter {
  constructor(workwindow, zone) {
    super(workwindow, zone);
  }

  async checkNotifications(...colors) {
    return colors.some((color) => super.getRgb().findColor(color));
  }

  findBobber(color) {
    const looksLikeBobber = (point, rgb) => {
      return point
        .getPointsAround()
        .map((point) => rgb.colorAt(point))
        .every((point) => color(point));
    };

    return super.findColor(color, looksLikeBobber);
  }

  static from(workwindow, zone) {
    return new FishingZone(workwindow, zone);
  }
}

module.exports = FishingZone;
