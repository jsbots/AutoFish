const RgbAdapter = require("../game/rgbAdapter.js");

class FishingZone extends RgbAdapter {
  constructor(workwindow, zone) {
    super(workwindow, zone);
  }

  checkNotifications(...type) {
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

  findBobber(exception) {
    const looksLikeBobber = (point, rgb) => {
      return point
        .getPointsAround()
        .map((point) => rgb.colorAt(point))
        .every((point) => this.colors.isBobber(point));
    };

    return super.findColor(this.colors.isBobber, looksLikeBobber, exception);
  }

  isBobber(bobberPos) {
      if(this.colors.isBobber(this.colorAt(bobberPos))) {
        return true
      }
  }

  getBobberPrint(bobber) {
    let zone = {x: bobber.x - 30,
                y: bobber.y - 30,
                width: 60,
                height: 60};
    let rgb = super.getRgb(zone);
    let print = [];
    for(let y = zone.y; y < zone.y + zone.height; y++) {
      for(let x = zone.x; x < zone.x + zone.width; x++) {
        if(this.colors.isBobber(rgb.colorAt({x, y}))) {
          print.push({x: x - bobber.x, y: y - bobber.y});
        }
      }
    }

    return print;
  };

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
