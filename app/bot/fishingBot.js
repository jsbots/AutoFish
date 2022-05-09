const Rgb = require('../utils/rgb.js');
const Zone = require('../utils/zone.js');

const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
};

const colorConditions = {
  isBobber: ([r, g, b]) => (r - g > 20 && r - b > 20) && (g < 100 && b < 100),
  isWarning: ([r, g, b]) => r - b > 200 && g - b > 200,
  isError: ([r, g, b]) => r - g > 250 && r - b > 250
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
  const { delay, relZone} = config;
  const { isBobber, isWarning, isError } = colorConditions;

  const zone = Zone.from(workwindow.getView()).getRel(relZone);
  Rgb.setWorkwindowTo(workwindow);

  const castFishing = async (state) => {
      const { fishingKey, castDelay } = config;
      keyboard.sendKey(fishingKey, delay);
      if(state.status == 'initial') {
        if(await checkNotifications(Rgb.from(zone), isError, isWarning)) {
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
        .every((point) => isBobber(point));
      };

      return Rgb.from(zone).findColor(isBobber, looksLikeBobber);
    };

    const checkBobber = async (bobber, state) => {
      const { maxFishTime, checkingDelay } = config;
      const startTime = Date.now();
      while(state.status == 'working' && Date.now() - startTime < maxFishTime) {
        let bobberColor = Rgb.from({...bobber, width: 1, height: 1}).colorAt(bobber);
        if(!isBobber(bobberColor)) {
         const newBobberPos = bobber.getPointsAround()
         .find((point) =>  {
           let pointColor = Rgb.from({...point, width: 1, height: 1}).colorAt(point);
           return isBobber(pointColor);
         });

          if(!newBobberPos) {
            return bobber;
          } else {
            bobber = newBobberPos;
          }
        }

        await sleep(checkingDelay);
      }
    };

    const isHooked = async (bobber) => {
      const{ afterHookDelay, autoLoot, mouseMoveSpeed, mouseCurvatureStrength } = config;

      await mouse.moveCurveToAsync(bobber.x, bobber.y,
                                   mouseMoveSpeed + Math.random() * 3,
                                   mouseCurvatureStrength + Math.random() * 100);
      if(!autoLoot) {
        keyboard.toggleKey('shift', true, delay);
        mouse.click('right', delay);
        keyboard.toggleKey('shift', false, delay);
      } else {
        mouse.click('right', delay);
      }

      if(!(await checkNotifications(Rgb.from(zone), isWarning))) {
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
