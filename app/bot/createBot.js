const Zone = require("../utils/zone.js");
const FishingZone = require("./fishingZone.js");
const NotificationZone = require("./notificationZone.js");

const { createTimer } = require("../utils/time.js");
const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
const random = (from, to) => {
  return from + Math.random() * (to - from);
};

const createBot = (game, { config, settings }, winSwitch) => {
  const { keyboard, mouse, workwindow } = game;
  const delay = [config.delay.from, config.delay.to];

  const action = async (callback) => {
    await winSwitch.execute(workwindow);
    await callback();
    winSwitch.finished();
  };

  const screenSize = workwindow.getView();
  const fishingZone = FishingZone.from(
    workwindow,
    Zone.from(screenSize).toRel(config.relZone)
  );
  const notificationZone = NotificationZone.from(
    workwindow,
    Zone.from(screenSize).toRel({
      x: 0.44,
      y: 0.12,
      width: 0.11,
      height: 0.07,
    })
  );

  fishingZone.registerColors({
    isBobber: ([r, g, b]) =>
      r - g > config.redThreshold &&
      r - b > config.redThreshold &&
      g < 100 &&
      b < 100,
  });

  notificationZone.registerColors({
    isWarning: ([r, g, b]) => r - b > 240 && g - b > 240,
    isError: ([r, g, b]) => r - g > 200 && r - b > 200,
  });

  const moveToRandom = ({ pos, range }) => {
    pos.x = pos.x + random(-range, range);
    pos.y = pos.y + random(-range, range);
    if (settings.likeHuman) {
      mouse.moveCurveTo(
        pos.x,
        pos.y,
        random(config.mouseMoveSpeed.from, config.mouseMoveSpeed.to),
        random(config.mouseCurvatureStrength.from, config.mouseCurvatureStrength.to)
      );
    } else {
      mouse.moveTo(pos.x, pos.y, delay);
    }
  };

  const checkBobberTimer = createTimer(() => {
    return config.maxFishTime;
  });

  const preliminaryChecks = () => {
    if (screenSize.x == -32000 && screenSize.y == -32000) {
      throw new Error("The window is in fullscreen mode");
    }

    let redColor = fishingZone.findBobber();
    if (redColor) {
      mouse.moveTo(redColor.x, redColor.y);
      throw new Error(
        `Found red colors before casting. Change the fishing place.`
      );
    }
  };

  const applyLures = async () => {
    await action(() => {
      keyboard.sendKey(settings.luresKey, delay);
    });
    await sleep(config.luresDelay);
  };

  applyLures.on = settings.lures;
  applyLures.timer = createTimer(() => {
    return settings.luresDelayMin * 60 * 1000;
  });

  const randomSleep = async () => {
    let sleepFor = random(
      config.randomSleepDelay.from,
      config.randomSleepDelay.to
    );
    await sleep(sleepFor);
  };

  randomSleep.on = config.randomSleep;
  randomSleep.timer = createTimer(() => {
    return random(config.randomSleepEvery.from, config.randomSleepEvery.to) * 60 * 1000;
  });

  const findAllBobberColors = () => {
    return fishingZone.getBobberPrint(fishingZone.findAllBobberColors(), 5);
  };

  const castFishing = async (state) => {
    await action(() => {
      keyboard.sendKey(settings.fishingKey, delay);
    });

    if (state.status == "initial") {
      await sleep(250);
      if (notificationZone.check("error")) {
        throw new Error(`Game error notification occured on casting fishing.`);
      } else {
        state.status = "working";
      }
    }

    await sleep(config.castDelay);
  };

  const highlightBobber = async (pos) => {
    if(settings.likeHuman && random(0, 100) > 85) return pos;

    if (config.reaction) {
      let reaction = random(config.reactionDelay.from, config.reactionDelay.to);
      await sleep(reaction);
    }

    await action(() => {
      moveToRandom({ pos, range: 5 });
    });

    return findBobber();
  };

  const findBobber = () => {
    return fishingZone.findBobber(findBobber.memory);
  };

  const checkBobber = async (pos, state) => {
    checkBobberTimer.start();
    while (state.status == "working") {
      if (checkBobberTimer.isElapsed()) {
        throw new Error(
          `Something is wrong. The bot sticked to the bobber for more than ${config.maxFishTime} ms.`
        );
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
    if (config.reaction) {
      let reaction = random(config.reactionDelay.from, config.reactionDelay.to);
      await sleep(reaction);
    }

    await action(() => {
      moveToRandom({ pos, range: 5 });

      if (settings.shiftClick) {
        keyboard.toggleKey("shift", true, delay);
        mouse.click("right", delay);
        keyboard.toggleKey("shift", false, delay);
      } else {
        mouse.click("right", delay);
      }
    });

    let caught = true;
    await sleep(250);
    if (notificationZone.check("warning")) {
      caught = false;
    }

    await sleep(settings.game == `Retail&Classic` ? 750 : 250);

    if (config.sleepAfterHook) {
      await sleep(random(config.afterHookDelay.from, config.afterHookDelay.to));
    }

    return caught;
  };

  return {
    preliminaryChecks,
    findAllBobberColors,
    randomSleep,
    applyLures,
    castFishing,
    findBobber,
    highlightBobber,
    checkBobber,
    hookBobber,
  };
};

module.exports = createBot;
