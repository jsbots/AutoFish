const createRgb = require('../utils/rgb.js');

const isInLimits = ({ x, y }, { width, height }) => {
  return x >= 0 && y >= 0 && x < width && y < height;
};

const isOverThreshold = ([r, g, b], threshold) => r - ((g + b) / 2) > threshold;
const isCloseEnough = ([r, g, b], closeness) => Math.abs(g - b) <= closeness;

const isRed = (threshold, closeness) => ([r, g, b]) => isOverThreshold([r, g, b], threshold) && isCloseEnough([r, g, b], closeness);

const isBlue = (threshold, closeness) => ([r, g, b]) => isOverThreshold([b, g, r], threshold) && isCloseEnough([b, g, r], closeness);

const createFishingZone = ({ getDataFrom , zone, threshold, bobberColor }) => {
  const isBobber = bobberColor == `red` ? isRed(threshold, 50) : isBlue(threshold, 50);
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
