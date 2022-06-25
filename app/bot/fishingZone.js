const createRgb = require('../utils/rgb.js');

const isInLimits = ({ x, y }, { width, height }) => {
  return x >= 0 && y >= 0 && x < width && y < height;
};

const createFishingZone = ({ getDataFrom , zone, redThreshold }) => {
  const isBobber = ([r, g, b]) => ( r - g > redThreshold &&
                                    r - b > redThreshold &&
                                    g < 100 &&
                                    b < 100 );

  const looksLikeBobber = (pos, color, rgb) => pos.getPointsAround().every((pos) => isBobber(rgb.colorAt(pos)));

  return {

    findBobber(exception) {
      let rgb = createRgb(getDataFrom(zone));
      if(exception) {
        rgb.cutOut(exception);
      }
      let bobber = rgb.findColors({
        isColor: isBobber,
        atFirstMet: true,
        task: looksLikeBobber
      });
      if(!bobber) return;
      return bobber.plus({ x: zone.x, y: zone.y });
    },

    checkAroundBobber(bobberPos) {
      return bobberPos
      .getPointsAround()
      .find((pos) => this.isBobber(pos));
    },

    isBobber(pos) {
      if(!isInLimits({ x: pos.x - zone.x, y: pos.y - zone.y }, zone)) {
        return;
      }
      let pointRgb = createRgb(getDataFrom({x: pos.x, y: pos.y, width: 1, height: 1}));
      if(isBobber(pointRgb.colorAt({ x: 0, y: 0 }))) {
        return true;
      }
    },

    getBobberPrint(wobble) {
      let rgb = createRgb(getDataFrom(zone));
      let rest = rgb.findColors({ isColor: isBobber });
      if(!rest) return;
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

  }
};

module.exports = createFishingZone;
