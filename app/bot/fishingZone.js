const createRgb = require('../utils/rgb.js');

const isInLimits = ({ x, y }, { width, height }) => {
  return x >= 0 && y >= 0 && x < width && y < height;
};

const getPosWithin = ({points, pos, size, dir}) => {
  let found = null
  let startPos = {...{}, ...pos};
    for(let i = 0; i < size && !found; i++) {
      found = points.find((point) => point.x == startPos.x && point.y == startPos.y);
      startPos.x = startPos.x + dir.x;
      startPos.y = startPos.y + dir.y;
    }
    return found;
  }

const isOverThreshold = ([r, g, b], threshold) => (r - Math.max(g, b)) > threshold;
const isCloseEnough = ([_, g, b], closeness) => Math.abs(g - b) <= closeness;

const isRed = (threshold, closeness, size = 255, upperLimit = 295) => ([r, g, b]) => isOverThreshold([r, g, b], threshold) &&
                                                       isCloseEnough([r, g, b], closeness) &&
                                                       g < size && b < size && r <= upperLimit;

const isBlue = (threshold, closeness, size = 255, upperLimit = 295) => ([r, g, b]) => isOverThreshold([b, g, r], threshold) &&
                                                        isCloseEnough([b, g, r], closeness) &&
                                                        r < size && g < size && b <= upperLimit;

const createFishingZone = (getDataFrom , zone, screenSize, { threshold, bobberColor, autoTh: autoThreshold }, {bobberSensitivity: sensitivity, bobberDensity: density, findBobberDirection: direction, splashColor}) => {
  let isBobber = bobberColor == `red` ? isRed(threshold, 50) : isBlue(threshold, 50);
  let saturation = bobberColor == `red` ? [40, 0, 0] : [0, 0, 40];
  const looksLikeBobber = (pos, color, rgb) => pos.getPointsAround(density).every((pos) => isBobber(rgb.colorAt(pos)));
  let filledBobberForPrint = [];
  let colorSwitchesCount = 0;
  return {

    async findBobber(exception, detectSens) {
      let rgb = createRgb(await getDataFrom(zone));
      rgb.saturate(...saturation)
      if(exception) {
        rgb.cutOut(exception);
      }

      let bobber;
      if(autoThreshold) {
        bobber = this.adjustThreshold(rgb);
      } else {
        bobber = rgb.findColors({
          isColor: isBobber,
          atFirstMet: true,
          task: looksLikeBobber,
          direction
        });
      }

      if(!bobber) return;

      let filledBobber;

      if(autoThreshold) {
        try {
          filledBobber = await this.getBobberPointsAround(rgb, bobber);
          filledBobberForPrint = filledBobber.points;
        } catch(e) {
          if(e.message == `color` && colorSwitchesCount++ < 2) {
            bobberColor = bobberColor == `red` ? `blue` : `red`;
            isBobber = bobberColor == `red` ? isRed(threshold, 50) : isBlue(threshold, 50);
            saturation = bobberColor == `red` ? [40, 0, 0] : [0, 0, 40];
            return await this.findBobber(exception, detectSens)
          } else {
            throw new Error(`The bot can't figure out the background color. Resize or reposition your Fishing Zone or try manual mode.`);
          }
        }
        colorSwitchesCount = 0; // reset recursive
      } else if(direction == `center` || detectSens) {
        const doubleZoneSize = screenSize.height > 1080 ? 100 : 50;

        let rgbAroundBobber = createRgb(await getDataFrom({x: zone.x + bobber.x - doubleZoneSize,
                                                          y: zone.y + bobber.y - doubleZoneSize,
                                                          width: doubleZoneSize * 2,
                                                          height: doubleZoneSize * 2}));

        rgbAroundBobber.saturate(...saturation);
        let doubleZoneLength = rgbAroundBobber.findColors({
            isColor: isBobber
        });

        if(doubleZoneLength) {
          filledBobber = {};
          filledBobber.length = doubleZoneLength.length;
        } else {
          return;
        }

        let doubleZoneBobber = rgbAroundBobber.findColors({
            isColor: isBobber,
            atFirstMet: true,
            task: looksLikeBobber
        });

        if(!doubleZoneBobber) return;

        bobber = doubleZoneBobber.plus({x: bobber.x - doubleZoneSize, y: bobber.y - doubleZoneSize});
      }

      if(detectSens) {
        await this.adjustSensitivity(filledBobber.length, detectSens);
      }

      if(autoThreshold) {
        let mostLeft = filledBobber.points.reduce((a, b) => a.x < b.x ? a : b);
        let mostRight = filledBobber.points.reduce((a, b) => a.x > b.x ? a : b);
        let center = mostLeft.x + Math.round((mostRight.x - mostLeft.x) /  2);

        filledBobber.pos = getPosWithin({
          points: filledBobber.points,
          pos: {x: center, y: filledBobber.pos.y + density},
          size: 10,
          dir: {x: 0, y: 1}
        });

      if(!filledBobber.pos) return;

      return filledBobber.pos.plus(zone);
    }
      return bobber.plus(zone);
    },

    adjustThreshold(rgb) {
      isBobber = bobberColor == `red` ? isRed(0, 50, 100, 275) : isBlue(0, 50, 100, 275); // or all colors?

      let initialThColors = rgb.findColors({
        isColor: isBobber,
        saveColor: true
      });

      if(!initialThColors) return;

      let center = {x: zone.width / 2, y: zone.height / 2};
      let bobber = initialThColors.reduce((a, b) => {
        let [rA, gA, bA] = a.color;
        let [rB, gB, bB] = b.color;

        let closenessARed = Math.abs(gA - bA);
        let closenessBRed = Math.abs(gB - bB);

        let closenessABlue = Math.abs(rA - gA);
        let closenessBBlue = Math.abs(rB - gB);

        let colorA = bobberColor == `red` ? (rA - Math.max(gA, bA)) - closenessARed : (bA - Math.max(gA, rA)) - closenessABlue;
        let colorB = bobberColor == `red` ? (rB - Math.max(gB, bB)) - closenessBRed : (bB - Math.max(gB, rB)) - closenessBBlue;

        if(colorA > colorB) {
          return a;
        } else {
          return b;
        }
      });

      let newThreshold = Math.round((
        ([r, g, b]) => bobberColor == `red` ? r - Math.max(g, b) : b - Math.max(g, r))(bobber.color) * .75); // for doubleZoneSearching searching half of the color foundo on threshold

      isBobber = bobberColor == `red` ? isRed(newThreshold, 50) : isBlue(newThreshold, 50); // 50
      return bobber.pos;
    },

    async getBobberPointsAround(rgb, bobber) {
      let memory = [bobber];
      for(let point of memory) {
        if(memory.length > 10000) throw new Error(`color`);
        for(let pointAround of point.getPointsAround()) {
          if(isBobber(rgb.colorAt(pointAround)) && !memory.some(mPoint => mPoint.isEqual(pointAround))) {
              memory.push(pointAround);
          }
        }
      }

      let mostTop = memory.reduce((a, b) => a.y < b.y ? a : b);
      return {length: memory.length, pos: mostTop, points: memory};
    },

    async adjustSensitivity(bobberSize, detectSens) {
      if(detectSens == `sensitivity`) {
         let calculatedSens = Math.round(Math.sqrt(bobberSize / (bobberColor == `red` ? 2 : 1.5)));
         if(calculatedSens < 3) calculatedSens = 3;
         sensitivity = calculatedSens;
       }

       if(detectSens == `density`) {
         let calculatedDens = Math.round((bobberSize / 1000) * 12.5);
         if(calculatedDens > 10) calculatedDens = 10;
         if(calculatedDens < 1) calculatedDens = 1;
         density = calculatedDens;
       }

       if(detectSens == `densityHighRes`) {
         return density = 4;
       }
    },

    async checkBobberPrint(pos) {
      let rgb = createRgb(await getDataFrom({x: pos.x - sensitivity, y: pos.y - sensitivity, width: sensitivity * 2, height: sensitivity * 2}));
      rgb.saturate(...saturation);
      let bobber = rgb.findColors({
        isColor: isBobber,
        atFirstMet: true
      });
      if(bobber) {
        return true;
      }
    },

    async checkBobberPrintSplash(pos) {
      let rgb = createRgb(await getDataFrom({x: pos.x - sensitivity, y: pos.y - sensitivity, width: sensitivity * 2, height: sensitivity * 2}));
      rgb.saturate(...saturation);
      let whiteColors = rgb.findColors({
        isColor: ([r, g, b]) => r > splashColor && g > splashColor && b > splashColor,
      });
      if((whiteColors && whiteColors.length > 10) || !(await this.checkBobberPrint(pos))) {
        return true;
      }
    },

    async checkAroundBobber(bobberPos) {
      for(let pos of bobberPos.getPointsAround(sensitivity)) {
         if(await this.isBobber(pos)) {
           return pos;
         }
      }
    },

    async isBobber(pos) {
      if(!isInLimits({ x: pos.x - zone.x, y: pos.y - zone.y }, zone)) {
        return;
      }
      let pointRgb = createRgb(await getDataFrom({x: pos.x, y: pos.y, width: 1, height: 1}));
      pointRgb.saturate(...saturation)
      if(isBobber(pointRgb.colorAt({ x: 0, y: 0 }))) {
        return true;
      }
    },

    async getBobberPrint(wobble) {
      let rest = [];
      if(!autoThreshold) {
        let rgb = createRgb(await getDataFrom(zone));
        rgb.saturate(...saturation);
        rest = rgb.findColors({ isColor: isBobber, limit: 5000});
      } else {
        rest = filledBobberForPrint;
      }

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
