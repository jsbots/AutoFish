const FishingZone = require('./zone.js');

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

class PlaceError extends Error {
  constructor() {
    super();
    this.message = `This place isn't good for fishing. Change the place and avoid any red and yellow colors in the "fishing zone".`;
  }
};

const fishingBot = (controls, zone, config) => {
  const { keyboard, mouse, workwindow } = controls;
  const { delay, relZone } = config;
  const { isBobber, isWarning, isError } = colorConditions;

  zone = zone.toRel(relZone)
  const fishingZone = FishingZone.from(workwindow, zone);

  const castFishing = async (state) => {
      const { fishingKey, castDelay } = config;
      keyboard.sendKey(fishingKey, delay);
      if(state.status == 'initial') {
        await sleep(250);
        if(await fishingZone.checkNotifications(isError, isWarning)) {
          throw new PlaceError();
        } else {
          state.status = 'working';
        }
      }
      await sleep(castDelay + Math.random() * 500);
  };

    const findBobber = () => fishingZone.findBobber(isBobber);

    const checkBobber = async (bobberPos, state) => {
      const { maxFishTime, checkingDelay } = config;
      const startCheckingTime = Date.now();
      while(state.status == 'working' && Date.now() - startCheckingTime < maxFishTime) {

        if(!isBobber(fishingZone.colorAt(bobberPos))) {
         const newBobberPos = bobberPos.getPointsAround()
         .find((pointPos) => isBobber(fishingZone.colorAt(pointPos)));

          if(!newBobberPos) {
            return bobberPos;
          } else {
            bobberPos = newBobberPos;
          }
        }

        await sleep(checkingDelay);
      }
    };

    const isHooked = async (bobber) => {
      const{ afterHookDelay,
             autoLoot,
             mouseMoveSpeed,
             mouseCurvatureStrength } = config;

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

      await sleep(250);
      if(!(await fishingZone.checkNotifications(isWarning))) {
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
