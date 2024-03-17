const createRgb = require('../utils/rgb.js');
const Vec = require('../utils/vec.js');
const Jimp = require('jimp');

const isInLimits = ({ x, y }, { width, height }) => {
  return x >= 0 && y >= 0 && x < width && y < height;
};

const isOverThreshold = ([r, g, b], threshold) => (r - Math.max(g, b)) > threshold;
const isCloseEnough = ([_, g, b], closeness) => Math.abs(g - b) <= closeness;

const isRed = (threshold, closeness, size = 295, upperLimit = 295) => ([r, g, b]) => isOverThreshold([r, g, b], threshold) &&
                                                       isCloseEnough([r, g, b], closeness) &&
                                                       g < size && b < size && r <= upperLimit;

const isBlue = (threshold, closeness, size = 295, upperLimit = 295) => ([r, g, b]) => isOverThreshold([b, g, r], threshold) &&
                                                        isCloseEnough([b, g, r], closeness) &&
                                                        r < size && g < size && b <= upperLimit;

const createFishingZone = (getDataFrom, zone, screenSize, { game, threshold, bobberColor, autoTh: autoThreshold, bobberSensitivity: sensitivity, autoColor: colorSwitchOn}, {findBobberDirection: direction, splashColor}) => {
  sensitivity = (game == `Retail` || game == `Vanilla (splash)` ? 30 - sensitivity[game] : 10 - sensitivity[game]) || 1;
  let isBobber = bobberColor == `red` ? isRed(threshold, 50) : isBlue(threshold, 50);
  let saturation = bobberColor == `red` ? [40, 0, 0] : [0, 0, 40];
  const looksLikeBobber = (pos, color, rgb) => pos.getPointsAround().every((pos) => isBobber(rgb.colorAt(pos)));
  let filledBobberForPrint = [];
  let colorSwitchesCount = 0;
  return {

    async findBobber(exception, detectSens, log) {
      let rgb = createRgb(await getDataFrom(zone));
      rgb.saturate(...saturation)
      if(exception) {
        rgb.cutOut(exception);
      }

      let bobber;
      if(autoThreshold) {
        bobber = this._findMost(rgb);
        if(bobber && process.env.NODE_ENV == `dev`) {
          log.err(`[DEBUG] Color Found: ${bobber.color}, at: ${bobber.pos.x},${bobber.pos.y}`);
        }
        let thCoof;
        if(game != `Retail` && game != `Classic` && game != `LK Classic`) {
            thCoof = .75;
        }

        this._findThreshold(bobber, thCoof);
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
          filledBobber = await this.getBobberPointsAround(rgb, bobber.pos);
          filledBobberForPrint = filledBobber.points;
          if(process.env.NODE_ENV == `dev`) {
            log.err(`[DEBUG] Points found: ${filledBobber.points.length}`);
          }
        } catch(e) {
          if(e.message == `color` && colorSwitchOn && ++colorSwitchesCount < 2) {
            log.warn(`Too much ${bobberColor} color! Changing the color...`)
            bobberColor = bobberColor == `red` ? `blue` : `red`;
            isBobber = bobberColor == `red` ? isRed(threshold, 50) : isBlue(threshold, 50);
            saturation = bobberColor == `red` ? [40, 0, 0] : [0, 0, 40];
            return await this.findBobber(exception, detectSens, log)
          } else if(e.message == `color`) {
            log.err(`Too much ${bobberColor} color! Change the color!`);
            return;
          } else {
            throw e;
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
        filledBobber.bobber.pos.x = mostLeft.x + Math.round((mostRight.x - mostLeft.x) /  2);
        this._findThreshold(filledBobber.bobber, .5); // reapply colors for the most middle top position
        for(let step = 0; step < (screenSize.height / 1080) * 15; step++) {
          let pos = new Vec(filledBobber.bobber.pos.x, filledBobber.bobber.pos.y + step);
          if(isBobber(rgb.colorAt(pos.plus(new Vec(0, -1))))) {
            filledBobber.bobber.pos = pos;
            break;
          }
        }

     if(process.env.NODE_ENV == `dev` && !filledBobber.bobber.pos) {
        log.err(`[DEBUG] Can't find bobber after _findMost`);
      }
     if(!filledBobber.bobber.pos) return;
      this._findThreshold({color: rgb.colorAt(filledBobber.bobber.pos)}, .5); // reapply for the last one
      return filledBobber.bobber.pos.plus(zone);
    }
      return bobber.plus(zone);
    },

    _findMost(rgb) {
      isBobber = bobberColor == `red` ? isRed(0, 50, 100) : isBlue(0, 50, 100);
      let initialThColors = rgb.findColors({
        isColor: isBobber,
        saveColor: true
      });

      if(!initialThColors) return;
      let bobber = initialThColors.reduce((a, b) => {
        let [rA, gA, bA] = a.color;
        let [rB, gB, bB] = b.color;

        let colorA = bobberColor == `red` ? (rA - Math.max(gA, bA)) : (bA - Math.max(gA, rA));
        let colorB = bobberColor == `red` ? (rB - Math.max(gB, bB)) : (bB - Math.max(gB, rB));

        if(colorA > colorB) {
          return a;
        } else {
          return b;
        }
      });
        return bobber;
    },

    _findThreshold(bobber, thCoof = .5, llCoof = 2.5) {
      if(!bobber) return;
      let newThreshold = (([r, g, b]) => bobberColor == `red` ? (r - (Math.max(g, b)))  * thCoof : (b - Math.max(g, r))  * thCoof)(bobber.color); // for doubleZoneSearching searching half of the color foundo on threshold
      let lowerLimit = (([r, g, b]) => bobberColor == `red` ? Math.max(g, b) : Math.max(r, g))(bobber.color) || 25; // 150 because of puprple
      isBobber = bobberColor == `red` ? isRed(newThreshold, 50, lowerLimit * llCoof) : isBlue(newThreshold, 50, lowerLimit * llCoof); // 150
    },

    async getBobberPointsAround(rgb, bobber) {
      let memory = [bobber];
      for(let point of memory) {
        if(memory.length > ((screenSize.height / 1080) * 3000)) {
          if(process.env.NODE_ENV == `dev`) {
            let myrgb = createRgb(await getDataFrom(zone));
            myrgb.cutOut(memory);
            let resultRgb = myrgb.getBitmap();
            const img = await Jimp.read(resultRgb);
            const date = new Date()
            const name = `test-filledBobber-CHANGING-COLOR-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.png`
            img.write(`${__dirname}/../debug/${name}`);
          }

          throw new Error(`color`);
        }
        for(let pointAround of point.getPointsAround()) {
          let color = rgb.colorAt(pointAround);
          if(isBobber(color) && !memory.some(mPoint => mPoint.isEqual(pointAround))) {
              memory.push(pointAround);
          }
        }
      }

      if(process.env.NODE_ENV == `dev`) {
        let myrgb = createRgb(await getDataFrom(zone));
        myrgb.cutOut(memory);
        let resultRgb = myrgb.getBitmap();
        const img = await Jimp.read(resultRgb);
        const date = new Date()
        const name = `test-filledBobber-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}.png`
        img.write(`${__dirname}/../debug/${name}`);
      }

      let mostTop = memory.reduce((a, b) => a.y < b.y ? a : b);
      return {length: memory.length, bobber: {pos: mostTop, color: rgb.colorAt(mostTop)}, points: memory};
    },

    async adjustSensitivity(bobberSize, detectSens) {
      if(detectSens == `sensitivity`) {
         let calculatedSens = Math.round(Math.sqrt(bobberSize / (bobberColor == `red` ? 4 : 3.5)));
         if(calculatedSens < 3) calculatedSens = 3;
         sensitivity = calculatedSens;
       }

      if(detectSens == `density`) {
        if(game == `Vanilla`){
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

    async checkAroundBobber(bobberPos) {
      for(let pos of bobberPos.getPointsAround()) {
         if(await this.isBobber(pos)) {
           return pos;
         }
       }
    },

    async checkBelow(pos) {
    for(let y = 1; y < sensitivity; y++) { // sensitivity
        let posBelow = pos.plus({x: 0, y});
          if(await this.isBobber(posBelow)) {
            return posBelow;
          }
      }
    },

    async checkAbove(pos) {
      let previous = pos;
      for(;;) {
        let posAbove = previous.plus({x: 0, y: -1});
        if(!(await this.isBobber(posAbove))) {
          return previous;
        } else {
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
