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
    return colors.some((color) => super.getRgb().findColors(color, true));
  }


  findAllBobberColors() {
    let colors = super.findColors(this.colors.isBobber);
    return colors ? colors.map(({pos}) => pos) : null;
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

    return pos;
  }

  isBobber(bobberPos) {
    if (this.colors.isBobber(this.colorAt(bobberPos))) {
      return true;
    }
  }

  getBobberPrint(rest, wobble) {
    if(!rest) return

    let result = [...rest];
    rest.forEach(restPoint => {
      restPoint.getPointsAround(wobble).forEach(aroundPoint => {
        if(!result.some(resultPoint => resultPoint.x == aroundPoint.x && resultPoint.y == aroundPoint.y)) {
          result.push(aroundPoint);
        }
      })
    });
    return result;
  }

  checkAroundBobber(bobberPos) {
    return bobberPos
      .getPointsAround()
      .find((pointPos) => this.isBobber(pointPos));
  }

  static from(workwindow, zone) {
    return new FishingZone(workwindow, zone);
  }
}

module.exports = FishingZone;
