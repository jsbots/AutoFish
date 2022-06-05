const Zone = require("../utils/zone.js");
const FishingZone = require("./fishingZone.js");

const { createTimer } = require('../utils/time.js');

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const random = (from, to) => {
  return from + Math.random() * (to - from);
};

const createBot = (game, {config, settings}, winSwitch) => {
  const { keyboard, mouse, workwindow } = game;
  const delay = [config.delay.from, config.delay.to];

  const zone = Zone.from(workwindow.getView()).toRel(config.relZone);
  const fishingZone = FishingZone.from(workwindow, zone);
  fishingZone.registerColors({
      isBobber: ([r, g, b]) => r - g > 20 && r - b > 20 && g < 100 && b < 100,
      isWarning: ([r, g, b]) => r - b > 200 && g - b > 200,
      isError: ([r, g, b]) => r - g > 200 && r - b > 200,
  });

  const randomSleepTimer = createTimer(() => {
    return random(config.randomSleepEvery.from, config.randomSleepEvery.to) * 60 * 1000;
  });

  const luresAppliedTimer = createTimer(() => {
    return settings.luresDelayMin * 60 * 1000;
  });

  const checkBobberTimer = createTimer(() => {
    return config.maxFishTime;
  })

  const applyLure = async () => {
    keyboard.sendKey(settings.luresKey, delay);
    return sleep(config.luresDelay);
  };

  const castFishing = async (state) => {
    if(state.status == "initial") {
      if(zone.x == -32000 && zone.y == -32000) {
        throw new Error('The window is in fullscreen mode')
      }

      if(fishingZone.findBobber()) {
        throw new Error(`Found red colors before casting. Change the fishing place.`);
      }

      randomSleepTimer.start();
    }

    if(config.randomSleep && randomSleepTimer.isElapsed()) {
      let sleepFor = random(config.randomSleepDelay.from,
                            config.randomSleepDelay.to);
      await sleep(sleepFor);
      if(state == 'stop') return;
      randomSleepTimer.update();
    }

    if(settings.lures && luresAppliedTimer.isElapsed()) {
      await winSwitch.execute(workwindow);
      await applyLure();
      winSwitch.finished();
      luresAppliedTimer.start();
    }

    await winSwitch.execute(workwindow);
    keyboard.sendKey(settings.fishingKey, delay);
    winSwitch.finished();

    if (state.status == "initial") {
      await sleep(250);
      if (fishingZone.checkNotifications('error')) {
        throw new Error(`Game error notification occured on casting fishing.`);
      } else {
        state.status = "working";
      }
    }

    await sleep(config.castDelay);
  };


  const findBobber = async () => {
    let bobber = fishingZone.findBobber(findBobber.previousBobber);
    for(let attempt = 0; !bobber && attempt < 3; attempt++) {
      await sleep(150);
      bobber = fishingZone.findBobber(findBobber.previousBobber);
    }
    if(bobber) {
      findBobber.previousBobber = [bobber, ...fishingZone.getBobberPrint(bobber).map(printPoint => bobber.plus(printPoint))];
    }
    return bobber;
  };
  findBobber.previousBobber = null;

  const checkBobber = async (bobberPos, state) => {
    checkBobberTimer.start();
    while (state.status == "working") {
      if(checkBobberTimer.isElapsed()) {
        throw new Error(`Something is wrong. The bot sticked to the bobber for more than ${config.maxFishTime} ms.`)
      }

      if (!fishingZone.isBobber(bobberPos)) {
        const newBobberPos = fishingZone.checkAroundBobber(bobberPos);
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
    if(config.reaction) {
      let reaction = random(config.reactionDelay.from, config.reactionDelay.to);
      await sleep(reaction)
    }

    await winSwitch.execute(workwindow);
    if (settings.likeHuman) {
      mouse.moveCurveTo(
        bobber.x,
        bobber.y,
        config.mouseMoveSpeed + Math.random() * 5,
        config.mouseCurvatureStrength + Math.random() * 60
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

    let caught = null;
    await sleep(250);
    if (!fishingZone.checkNotifications('warning')) {
      caught = true;
    }
    if(config.sleepAfterHook) {
      await sleep(config.afterHookDelay.from + Math.random() * (config.afterHookDelay.to - config.afterHookDelay.from));
    }
    return caught;
  };

  return {
    castFishing,
    findBobber,
    checkBobber,
    hookBobber
  };
};


module.exports = createBot;
