const RgbAdapter = require("../game/rgbAdapter.js");

class FishingZone extends RgbAdapter {
  constructor(workwindow, zone) {
    super(workwindow, zone);
  }

  checkNotifications(...type) {
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
    return colors.some((color) => super.getRgb().findColors(color));
  }

  findBobber(exception) {
    let reds = super.findColors(this.colors.isBobber, exception);
    if (!reds) return;

    reds = reds.filter(({ pos }) => {
      return pos.getPointsAround().every(({ x, y }) => {
        return reds.some(redPoint => redPoint.pos.x == x && redPoint.pos.y == y);
      });
    });

    if(reds.length == 0) return;

    let { pos } = reds
      .map(({ pos, color }) => {
        let [r, g, b] = color;
        return { pos, redness: (r - g) + (r - b) };
      })
      .reduce((a, b) => {
        if (a.redness > b.redness) {
          return a;
        } else {
          return b;
        }
      });

    return {
      pos,
      rest: reds.map(({ pos }) => pos),
    };
  }

  isBobber(bobberPos) {
    if (this.colors.isBobber(this.colorAt(bobberPos))) {
      return true;
    }
  }

  getBobberPrint(rest, wobble) {
    let result = [];

    let highest = rest.reduce((a, b) => (a.y < b.y ? a : b)).y - wobble;
    let leftest = rest.reduce((a, b) => (a.x < b.x ? a : b)).x - wobble;
    let lowest = rest.reduce((a, b) => (a.y > b.y ? a : b)).y + wobble;
    let rightest = rest.reduce((a, b) => (a.x > b.x ? a : b)).x + wobble;

    for (let y = highest; y <= lowest; y++) {
      for (let x = leftest; x <= rightest; x++) {
        result.push({ x, y });
      }
    }

    return result;
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
