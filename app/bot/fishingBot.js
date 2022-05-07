const Rgb = require('../utils/rgb.js');
const Display = require('../utils/display.js');

const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
};

const colorConditions = {
  isRed: ([r, g, b]) => (r - g > 20 && r - b > 20) && (g < 100 && b < 100),
  isYellow: ([r, g, b]) => r - b > 200 && g - b > 200,
  isBrightRed: ([r, g, b]) => r - g > 250 && r - b > 250
}

const checkNotifications = async (rgb, ...colors) => {
  await sleep(250);
  return colors.some((color) => rgb.findColor(color));
};

class PlaceError extends Error {
  constructor() {
    super();
    this.message = `This place isn't good for fishing. Change the place and avoid any red and yellow colors in the "fishing zone".`;
  }
};

const fishingBot = ({keyboard, mouse, workwindow}, config) => {
  const {fishingKey, castDelay, delay, maxFishTime, afterHookDelay, relZone, autoLoot} = config;
  const {isRed, isYellow, isBrightRed} = colorConditions;

  const zone = Display.from(workwindow.getView()).getRel(relZone);
  Rgb.setWorkwindowTo(workwindow);

  const castFishing = async (state) => {
      keyboard.sendKey(fishingKey, delay);
      if(state.status == 'initial') {
        if(await checkNotifications(Rgb.from(zone), isBrightRed, isYellow)) {
          throw new PlaceError();
        } else {
          state.status = 'working';
        }
      }
      await sleep(castDelay + Math.random() * 500);
  };

    const findBobber = () => {
      const looksLikeBobber = (point, rgb) => {
        return point.getPointsAround(2)
        .map((point) => rgb.colorAt(point))
        .every((point) => isRed(point));
      };

      return Rgb.from(zone).findColor(isRed, looksLikeBobber);
    };

    const checkBobber = async (bobber, state) => {
      const startTime = Date.now();
      while(state.status == 'working' && Date.now() - startTime < maxFishTime) {
        let bobberColor = Rgb.from({...bobber, width: 1, height: 1}).colorAt(bobber);
        if(!isRed(bobberColor)) {
         const newBobberPos = bobber.getPointsAround()
         .find((point) =>  {
           let pointColor = Rgb.from({...point, width: 1, height: 1}).colorAt(point);
           return isRed(pointColor);
         });

          if(!newBobberPos) {
            return bobber;
          } else {
            bobber = newBobberPos;
          }
        }

        await sleep(50);
      }
    };

    const isHooked = async (bobber) => {
      const mouseMoveSpeed = 1 + Math.random() * 3;
      const mouseCurvatureStrength = 50 + Math.random() * 100;
      await mouse.moveCurveToAsync(bobber.x, bobber.y,
                                   mouseMoveSpeed,
                                   mouseCurvatureStrength);
      if(!autoLoot) {
        keyboard.toggleKey('shift', true, delay);
        mouse.click('right', delay);
        keyboard.toggleKey('shift', false, delay);
      } else {
        mouse.click('right', delay);
      }

      if(!(await checkNotifications(Rgb.from(zone), isYellow))) {
        await sleep(afterHookDelay.caught + Math.random() * 500);
        return true;
      } else {
        await sleep(afterHookDelay.miss + Math.random() * 500);
      }
    };

     return {
       castFishing,
       findBobber,
       checkBobber,
       isHooked
     }
};

module.exports = fishingBot;
