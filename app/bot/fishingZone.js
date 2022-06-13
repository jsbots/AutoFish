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
    return super.findColors(this.colors.isBobber);
  }

  findBobber(exception) {
    let reds = super.findColors(this.colors.isBobber, exception);
    if(!reds) return;

    return reds.find(pos => {
      return pos.getPointsAround().every(({ x, y }) => {
        return reds.some(redPoint => redPoint.x == x && redPoint.y == y);
      });
    });
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
