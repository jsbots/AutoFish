const createRgb = require('../utils/rgb.js');

const isInLimits = ({ x, y }, { width, height }) => {
  return x >= 0 && y >= 0 && x < width && y < height;
};

const createFishingZone = ({ getDataFrom , zone, redThreshold }) => {
  const isBobber = ([r, g, b]) => ( r - g > redThreshold &&
                                    r - b > redThreshold &&
                                    g < 100 &&
                                    b < 100 );
  const isVoidColor = ([r, g, b]) => r == 0 && g == 0 && b == 0;

  const looksLikeBobber = (pos, color, rgb) => pos.getPointsAround().every((pos) => isBobber(rgb.colorAt(pos)));

  return {

    findBobber(exception) {
      let rgb = createRgb(getDataFrom(zone));
      rgb.saturate(40, 0, 0);
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
      pointRgb.saturate(40, 0, 0);
      if(isBobber(pointRgb.colorAt({ x: 0, y: 0 }))) {
        return true;
      }
    },

    isVoid() {
      const rgb = createRgb(getDataFrom(zone));
      const randomPos = new Array(10).fill(true).map((i) => ({x: zone.x + Math.floor(Math.random() * (zone.x + zone.width)),
                                                            y: zone.y + Math.floor(Math.random() * (zone.y + zone.height))}));
      return randomPos.every(pixel => {
        let pointRgb = createRgb(getDataFrom({...pixel, width: 1, height: 1}));
        return isVoidColor(pointRgb.colorAt({ x: 0, y: 0 }))
      })
    },

    getBobberPrint(wobble) {
      let rgb = createRgb(getDataFrom(zone));
      rgb.saturate(40, 0, 0);
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
