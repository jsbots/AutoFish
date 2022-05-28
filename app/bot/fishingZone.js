const RgbAdapter = require("../game/rgbAdapter.js");

class FishingZone extends RgbAdapter {
  constructor(workwindow, zone) {
    super(workwindow, zone);
  }

  async checkNotifications(...type) {
    const colors = type.map((type) => {
      switch(type) {
        case "warning": {
          return this.colors.isWarning
        }
        case "error": {
          return this.colors.isError
        }
      }
    });
    return colors.some((color) => super.getRgb().findColor(color));
  }

  findBobber() {
    const looksLikeBobber = (point, rgb) => {
      return point
        .getPointsAround()
        .map((point) => rgb.colorAt(point))
        .every((point) => this.colors.isBobber(point));
    };

    return super.findColor(this.colors.isBobber, looksLikeBobber);
  }

  isBobber(bobberPos) {
      if(this.colors.isBobber(this.colorAt(bobberPos))) {
        return true
      }
  }

  checkAroundBobber(bobberPos) {
    return bobberPos
    .getPointsAround()
    .find((pointPos) => this.colors.isBobber(this.colorAt(pointPos)));
  }

  static from(workwindow, zone) {
    return new FishingZone(workwindow, zone);
  }
}

module.exports = FishingZone;
