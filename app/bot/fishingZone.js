const createRgb = require('../utils/rgb.js');

const isInLimits = ({ x, y }, { width, height }) => {
  return x >= 0 && y >= 0 && x < width && y < height;
};

const isRed = (threshold) => ([r, g, b]) => (r - g > threshold &&
                                        r - b > threshold &&
                                        g < 100 && b < 100);

const isBlue = (threshold) => ([r, g, b]) => (b - g > threshold &&
                                              b - r > threshold);

const createFishingZone = ({ getDataFrom , zone, threshold, bobberColor }) => {

  const isBobber = bobberColor == `red` ? isRed(threshold) : isBlue(threshold);
  const saturation = bobberColor == `red` ? [40, 0, 0] : [0, 0, 40];

  const looksLikeBobber = (pos, color, rgb) => pos.getPointsAround().every((pos) => isBobber(rgb.colorAt(pos)));
  return {

    findBobber(exception) {
      let rgb = createRgb(getDataFrom(zone));
      rgb.saturate(...saturation)
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
      pointRgb.saturate(...saturation)
      if(isBobber(pointRgb.colorAt({ x: 0, y: 0 }))) {
        return true;
      }
    },

    getBobberPrint(wobble) {
      let rgb = createRgb(getDataFrom(zone));
      rgb.saturate(...saturation)
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
