const Zone = require("../utils/zone.js");
const FishingZone = require("./fishingZone.js");
const NotificationZone = require("./notificationZone.js");

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

  const screenSize = workwindow.getView();
  const fishingZone = FishingZone.from(workwindow, Zone.from(screenSize).toRel(config.relZone));
  const notificationZone = NotificationZone.from(workwindow, Zone.from(screenSize).toRel({
    x: .44,
    y: .12,
    width: .11,
    height: .07
  }));

  fishingZone.registerColors({
      isBobber: ([r, g, b]) => (r - g) > config.redThreshold && (r - b) > config.redThreshold && g < 100 && b < 100
  });

  notificationZone.registerColors({
    isWarning: ([r, g, b]) => r - b > 240 && g - b > 240,
    isError: ([r, g, b]) => r - g > 200 && r - b > 200
  });

  const moveToRandom = ({ pos, range }) => {
        pos.x = pos.x + random(-range, range);
        pos.y = pos.y + random(-range, range);
        if (settings.likeHuman) {
          mouse.moveCurveTo(
            pos.x,
            pos.y,
            random(config.mouseMoveSpeed, 0.6),
            random(config.mouseCurvatureStrength, 80)
          );
        } else {
          mouse.moveTo(pos.x, pos.y, delay);
        }
  };

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
      if(screenSize.x == -32000 && screenSize.y == -32000) {
        throw new Error('The window is in fullscreen mode')
      }

      let redColor = fishingZone.findBobber();
      if(redColor) {
        mouse.moveTo(redColor.x, redColor.y);
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
    findBobber.memory = fishingZone.getBobberPrint(fishingZone.findAllBobberColors(), 5);
    keyboard.sendKey(settings.fishingKey, delay);
    winSwitch.finished();

    if (state.status == "initial") {
      await sleep(250);
      if (notificationZone.check('error')) {
        throw new Error(`Game error notification occured on casting fishing.`);
      } else {
        state.status = "working";
      }
    }

    await sleep(config.castDelay);
  };


  const findBobber = async () => {
    const pos = fishingZone.findBobber(findBobber.memory);
    if(!pos) return;

    if(config.reaction) {
      let reaction = random(config.reactionDelay.from, config.reactionDelay.to);
      await sleep(reaction)
    }

    await winSwitch.execute(workwindow);
    moveToRandom({pos, range: 5});
    winSwitch.finished();
    return fishingZone.findBobber(findBobber.memory);
  };
  findBobber.memory = null;

  const checkBobber = async (pos, state) => {
    checkBobberTimer.start();
    while (state.status == "working") {
      if(checkBobberTimer.isElapsed()) {
        throw new Error(`Something is wrong. The bot sticked to the bobber for more than ${config.maxFishTime} ms.`)
      }

      if (!fishingZone.isBobber(pos)) {
        const newPos = fishingZone.checkAroundBobber(pos);
        if (!newPos) {
          return pos;
        } else {
          pos = newPos;
        }
      }

      await sleep(config.checkingDelay);
    }
  };

  const hookBobber = async (pos) => {
    if(config.reaction) {
      let reaction = random(config.reactionDelay.from, config.reactionDelay.to);
      await sleep(reaction)
    }

    await winSwitch.execute(workwindow);
    moveToRandom({pos, range: 5});

    if (settings.shiftClick) {
      keyboard.toggleKey("shift", true, delay);
      mouse.click("right", delay);
      keyboard.toggleKey("shift", false, delay);
    } else {
      mouse.click("right", delay);
    }

    winSwitch.finished();

    let caught = true;
    await sleep(250);
    if (notificationZone.check('warning')) {
      caught = false;
    }

    await sleep(settings.game == `Retail&Classic` ? 750 : 250); // close loot window

    if(config.sleepAfterHook) {
      await sleep(random(config.afterHookDelay.from, config.afterHookDelay.to));
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
