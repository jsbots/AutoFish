const createRgb = require('../utils/rgb.js');
const Vec = require('../utils/vec.js');
const Jimp = require('jimp');

const pixelmatch = require('pixelmatch');

const isInLimits = ({ x, y }, { width, height }) => {
  return x >= 0 && y >= 0 && x < width && y < height;
};

const isOverThreshold = ([r, g, b], threshold) => (r - Math.max(g, b)) > threshold;
const isCloseEnough = ([_, g, b], closeness) => Math.abs(g - b) <= closeness;

const isRed = (threshold, closeness = 255, size = 255, upperLimit = 335) => ([r, g, b]) => isOverThreshold([r, g, b], threshold) &&
                                                       isCloseEnough([r, g, b], closeness) &&
                                                       g < size && b < size && r <= upperLimit && g != 0 && b != 0;

const isBlue = (threshold, closeness = 255, size = 255, upperLimit = 335) => ([r, g, b]) => isOverThreshold([b, g, r], threshold) &&
                                                        isCloseEnough([b, g, r], closeness) &&
                                                        r < size && g < size && b <= upperLimit && r != 0 && g != 0;

let imgAroundBobberPrev;
let pixelMatchMax;

const createFishingZone = (getDataFrom, zone, screenSize, { game, checkLogic, autoSens, threshold, bobberColor, autoTh, bobberSensitivity: sensitivity}, {findBobberDirection: direction, splashColor}) => {
  let checkAboveCompensateValue = 0;
  const doubleZoneSize = Math.round((screenSize.height / 1080) * 50); // 25
  sensitivity = (game == `Retail` || game == `Vanilla (splash)` ? 30 - sensitivity[game] : 10 - sensitivity[game]) || 1;

  if(checkLogic == 'pixelmatch') {
    if(autoSens) {
      sensitivity = 0.25;
    } else {
      sensitivity = game == `Retail` || game == `Vanilla (splash)` ? sensitivity / 30 : sensitivity / 10;
    }
  }

  let isBobber = bobberColor == `red` ? isRed(threshold, 50) : isBlue(threshold, 50);
  let saturation = bobberColor == `red` ? [80, 0, 0] : [0, 0, 80];
  const looksLikeBobber = (size) => (pos, color, rgb) => {
    let pointsFound = pos.getPointsAround(Math.round(size * (screenSize.height / 1080)) || 1).filter((pos) => isBobber(rgb.colorAt(pos)));
    if(pointsFound.length >= Math.round(8 * (screenSize.height / 1080))) {
      return true;
    }
  }
  let filledBobber;

  return {
    async findBobber(exception, log, highlight) {

      checkAboveCompensateValue = 0;
      imgAroundBobberPrev = null;
      pixelMatchMax = 0;

      let rgbZone = zone;
      if(highlight && (game == `Classic` || game == `LK Classic` || game == `Retail`)) {
        rgbZone = {x: highlight.x - doubleZoneSize, y: highlight.y - doubleZoneSize, width: doubleZoneSize * 2, height: doubleZoneSize * 2};
        if(rgbZone.x < zone.x) rgbZone.x = zone.x;
        if(rgbZone.y < zone.y) rgbZone.y = zone.y;
        if(rgbZone.x + rgbZone.width > zone.x + zone.width) rgbZone.x = zone.x + zone.width - rgbZone.width;
        if(rgbZone.y + rgbZone.height > zone.y + zone.height) rgbZone.y = zone.y + zone.height - rgbZone.height;
      }

      let rgb = createRgb(await getDataFrom(rgbZone));
      rgb.saturate(...saturation)

      if(exception) {
        rgb.cutOut(exception);
      }

      let bobber;
      if(autoTh) {
        bobber = this._findMost(rgb);
        if(bobber && process.env.NODE_ENV == `dev`) {
          log.err(`[DEBUG] Color Found: ${bobber.color}, at: ${bobber.pos.x},${bobber.pos.y}`);
        }
        if(!bobber) return;
      } else {
        bobber = rgb.findColors({
          isColor: isBobber,
          atFirstMet: true,
          saveColor: true,
          task: looksLikeBobber(1),
          direction
        });
      }

      if(checkLogic == `pixelmatch`) {
        return bobber.pos.plus(rgbZone);
      }

      if(!bobber) return; // In case the bobber wasn't found in either _findMost or manually - recast.

      if(autoTh || direction == `center` || autoSens) {
        const doubleZoneDims = {x: rgbZone.x + bobber.pos.x - doubleZoneSize,
                                y: rgbZone.y + bobber.pos.y - doubleZoneSize,
                                width: doubleZoneSize * 2,
                                height: doubleZoneSize * 2};

        if(doubleZoneDims.x < rgbZone.x) doubleZoneDims.x = rgbZone.x;
        if(doubleZoneDims.y < rgbZone.y) doubleZoneDims.y = rgbZone.y;
        if(doubleZoneDims.x + doubleZoneDims.width > rgbZone.x + rgbZone.width) doubleZoneDims.x = rgbZone.x + rgbZone.width - doubleZoneDims.width;
        if(doubleZoneDims.y + doubleZoneDims.height > rgbZone.y + rgbZone.height) doubleZoneDims.y = rgbZone.y + rgbZone.height - doubleZoneDims.height;

        let doubleZoneData = await getDataFrom(doubleZoneDims);

        if(process.env.NODE_ENV == `dev`) {
          const img = await Jimp.read(doubleZoneData);
          const date = new Date()
          const name = `doubleZoneData-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.png`
          img.write(`${__dirname}/../debug/${name}`);
        }

        let rgbAroundBobber = createRgb(doubleZoneData);
        rgbAroundBobber.saturate(...saturation);

        if(autoTh) {
          let colorPrev = null;
          const mostRedPoints = [];
          let errorStartTime = Date.now();
          for(;Date.now() - errorStartTime < 2000;) {
            let mostRedPoint = this._findMost(rgbAroundBobber);

            if(!mostRedPoint) {
              return;
            }

            let [r, g, b] = mostRedPoint.color;
            let colorNow = r - Math.max(g, b) - (g + b);

            if(colorPrev) {
              if((colorNow / colorPrev) * 100 < 50) {
                break;
              }
              colorPrev = colorNow;
            } else {
              colorPrev = colorNow;
            }

           rgbAroundBobber.cutOut([mostRedPoint.pos]);
            mostRedPoints.push(mostRedPoint);
          }

          if(mostRedPoints.length == 0) {
            return;
          }

          filledBobber = mostRedPoints.map((point) => ({
            color: point.color,
            pos: new Vec(point.pos.x + doubleZoneDims.x - rgbZone.x, point.pos.y + doubleZoneDims.y - rgbZone.y)
          }));

          let mostLeft = mostRedPoints.reduce((a, b) => a.pos.x < b.pos.x ? a : b);
          let mostRight = mostRedPoints.reduce((a, b) => a.pos.x > b.pos.x ? a : b);
          let middleValue = (mostLeft.pos.x + mostRight.pos.x) / (bobberColor == `red` ? 2 : 1.5); // position on the feather
          let mostTop = mostRedPoints.reduce((a, b) => a.pos.y < b.pos.y ? a : b);
          let mostTopMiddle = mostRedPoints.reduce((a, b) => {
            if(
              Math.abs(a.pos.x - middleValue) + (a.pos.y - mostTop.pos.y)
            < Math.abs(b.pos.x - middleValue) + (b.pos.y - mostTop.pos.y)
            ) {
              return a;
            } else {
              return b;
            }
          });

          bobber.color = mostTopMiddle.color;
          bobber.pos = mostTopMiddle.pos.plus({x: doubleZoneDims.x, y: doubleZoneDims.y});
          this._findThreshold(bobber);
        } else {
          /* if direction == center */
          filledBobber = rgbAroundBobber.findColors({isColor: isBobber, saveColor: true});
          bobber = rgbAroundBobber.findColors({
              isColor: isBobber,
              atFirstMet: true,
              saveColor: true,
              direction: `normal`,
              task: game == `Vanilla` ? null : looksLikeBobber(1)
          })

          if(!bobber) {
            return;
          }

          bobber.pos = bobber.pos.plus({x: doubleZoneDims.x, y: doubleZoneDims.y});
        }

        if(autoSens) {
          await this.adjustSensitivity(filledBobber.length);
        }

        return bobber.pos;
      }

      return bobber.pos.plus(rgbZone);
    },

    _findMost(rgb) {
      let initialThColors = rgb.findColors({
        isColor: bobberColor == `red` ? isRed(0) : isBlue(0),
        saveColor: true
      });

      if(!initialThColors) return;

      let bobber = initialThColors.reduce((a, b) => {
        let [rA, gA, bA] = a.color;
        let [rB, gB, bB] = b.color;

        let maxARed = gA + bA;
        let maxBRed = gB + bB;

        let maxABlue = rA + gA;
        let maxBBlue = rB + gB;

        let colorA = bobberColor == `red` ? (rA - Math.max(gA, bA)) - maxARed : (bA - Math.max(gA, rA)) - maxABlue;
        let colorB = bobberColor == `red` ? (rB - Math.max(gB, bB)) - maxBRed : (bB - Math.max(gB, rB)) - maxBBlue;

        if(colorA > colorB) {
          return a;
        } else {
          return b;
        }
      });

      return bobber;
    },

    _findThreshold(bobber, thCoof = .75) { // .5
      let newThreshold = (([r, g, b]) => bobberColor == `red` ? (r - (Math.max(g, b)))  * thCoof : (b - Math.max(g, r))  * thCoof)(bobber.color); // for doubleZoneSearching searching half of the color foundo on threshold
      isBobber = bobberColor == `red` ? isRed(newThreshold, 50) : isBlue(newThreshold, 50); // 50?
    },

    async adjustSensitivity(bobberSize) {
      if(game == `Retail`) {
         let calculatedSens = Math.round(Math.sqrt(bobberSize / (bobberColor == `red` ? 4 : 2.5)));
         if(calculatedSens < 3) calculatedSens = 3;
         sensitivity = calculatedSens;
       } else {
         if(game == `Vanilla`) {
           sensitivity = 2;
         } else {
           sensitivity = Math.max(Math.round((screenSize.height / 1080) * (bobberColor == `red` ? 3 : 2)), 2);
         }
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

    async checkPixelMatch(bobber, startTime) {
      let imgAroundBobber = await getDataFrom({x: bobber.x - doubleZoneSize,
                                               y: bobber.y - doubleZoneSize,
                                               width: doubleZoneSize * 2,
                                               height: doubleZoneSize * 2});

      if(imgAroundBobberPrev) {
        let pixelMatchTh = pixelmatch(imgAroundBobberPrev.data, imgAroundBobber.data, null, imgAroundBobber.width, imgAroundBobber.height,  {threshold: 0.1}); // 0.1 for classic
        if(Date.now() - startTime < 1250) {
          if(pixelMatchTh > pixelMatchMax) {
            pixelMatchMax = pixelMatchTh;
          }

        } else {
          if(pixelMatchTh > pixelMatchMax + (pixelMatchMax * sensitivity)) {
            return true;
          }
        }
      } else {
          imgAroundBobberPrev = imgAroundBobber;
      }
    },

    async checkAroundBobber(bobberPos) {
      for(let pos of bobberPos.getPointsAround()) {
         if(await this.isBobber(pos)) {
           return pos;
         }
       }
    },

    async checkBelow(pos) {
    for(let y = 1; y < sensitivity; y++) {
        let pointsBelow = [pos.plus({x: -1, y}), pos.plus({x: 0, y}), pos.plus({x: 1, y})];
        for(let point of pointsBelow) {
          if(await this.isBobber(point)) {
            checkAboveCompensateValue++;
            return pointsBelow[1];
          }
        }
      }
    },

    async checkAbove(pos) {
      let previous = pos;
      for(let i = 0; i < checkAboveCompensateValue; i++) {
        let posAbove = previous.plus({x: 0, y: -1});
        if(!(await this.isBobber(posAbove))) {
          return previous;
        } else {
          checkAboveCompensateValue--;
          previous = posAbove;
        }
      }
      return previous;
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

    async checkColor() {
      let rgb = createRgb(await getDataFrom(zone));
      let colors = rgb.findColors({
        isColor: bobberColor == `red` ? isRed(0) : isBlue(0),
      });

      return colors ? (colors.length / (zone.width * zone.height)) * 100 : 0;
    },

    async changeColor() {
      bobberColor = bobberColor == `red` ? `blue` : `red`;
      isBobber = bobberColor == `red` ? isRed(threshold, 50) : isBlue(threshold, 50); // 50?
      saturation = bobberColor == `red` ? [80, 0, 0] : [0, 0, 80];
    },

    async getBobberPrint(wobble) {
      let rest = [];
      if(autoTh) {
        if(!filledBobber) {
          return;
        }
        rest = filledBobber.map(({pos}) => pos);
      } else {
        let rgb = createRgb(await getDataFrom(zone));
        rgb.saturate(...saturation);
        rest = rgb.findColors({ isColor: isBobber, limit: 5000});
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
