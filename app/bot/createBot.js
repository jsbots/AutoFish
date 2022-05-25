const Zone = require("../utils/zone.js");
const FishingZone = require("./zone.js");

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const colorConditions = {
  isBobber: ([r, g, b]) => r - g > 20 && r - b > 20 && g < 100 && b < 100,
  isWarning: ([r, g, b]) => r - b > 200 && g - b > 200,
  isError: ([r, g, b]) => r - g > 250 && r - b > 250,
};

const createBot = (game, {config, settings}, winSwitch) => {
  const { keyboard, mouse, workwindow } = game;
  const { delay } = config;
  const { isBobber, isWarning, isError } = colorConditions;

  const zone = Zone.from(workwindow.getView()).toRel(config.relZone);
  const fishingZone = FishingZone.from(workwindow, zone);

  const applyLure = async () => {
    keyboard.sendKey(settings.luresKey, delay);
    return sleep(config.luresDelay);
  };
  applyLure.applied = 0;

  const castFishing = async (state) => {
    if(settings.lures && Date.now() - applyLure.applied > (settings.luresDelayMin * 60 * 1000)) {
      await winSwitch.execute(workwindow);
      await applyLure();
      winSwitch.finished();
      applyLure.applied = Date.now();
    }

    await winSwitch.execute(workwindow);
    keyboard.sendKey(config.fishingKey, delay);
    winSwitch.finished();

    if (state.status == "initial") {
      if(zone.x == -32000 && zone.y == -32000) {
           throw new Error('The window is in fullscreen mode')
        }
      await sleep(250);
      if (await fishingZone.checkNotifications(isError, isWarning)) {
        throw new Error(`This place isn't good for fishing`);
      } else {
        state.status = "working";
      }
    }

    await sleep(config.castDelay);
  };

  const findBobber = async () => {
    let bobber = fishingZone.findBobber(isBobber);
    for(let attempt = 0; !bobber && attempt < 2; attempt++) {
      await sleep(100);
      bobber = fishingZone.findBobber(isBobber);
    }
    return bobber;
  };

  const checkBobber = async (bobberPos, state) => {
    const startCheckingTime = Date.now();
    while (
      state.status == "working" &&
      Date.now() - startCheckingTime < config.maxFishTime
    ) {
      if (!isBobber(fishingZone.colorAt(bobberPos))) {
        const newBobberPos = bobberPos
          .getPointsAround()
          .find((pointPos) => isBobber(fishingZone.colorAt(pointPos)));

        if (!newBobberPos) {
          return bobberPos;
        } else {
          bobberPos = newBobberPos;
        }
      }

      await sleep(config.checkingDelay);
    }
  };

  const hookBobber = async (bobber) => {
    await winSwitch.execute(workwindow);
    if (settings.likeHuman) {
      mouse.moveCurveTo(
        bobber.x,
        bobber.y,
        config.mouseMoveSpeed + Math.random() * 3,
        config.mouseCurvatureStrength + Math.random() * 100
      );
    } else {
      mouse.moveTo(bobber.x, bobber.y, delay);
    }

    if (settings.shiftClick) {
      keyboard.toggleKey("shift", true, delay);
      mouse.click("right", delay);
      keyboard.toggleKey("shift", false, delay);
    } else {
      mouse.click("right", delay);
    }
    winSwitch.finished();

    await sleep(250);
    if (!(await fishingZone.checkNotifications(isWarning))) {
      await sleep(config.afterHookDelay.caught + Math.random() * 500);
      return true;
    } else {
      await sleep(config.afterHookDelay.miss + Math.random() * 500);
    }
  };

  return {
    castFishing,
    findBobber,
    checkBobber,
    hookBobber
  };
};

module.exports = createBot;
