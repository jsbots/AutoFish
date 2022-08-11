const Zone = require("../utils/zone.js");
const createFishingZone = require("./fishingZone.js");
const createNotificationZone = require("./notificationZone.js");
const createLootZone = require("./lootZone.js");

const {
  percentComparison,
  readTextFrom,
  sortWordsByItem,
} = require("../utils/textReader.js");

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

  const getDataFrom = (zone) => {
    return workwindow.capture(zone);
  };

  const fishingZone = createFishingZone({
    getDataFrom,
    zone: Zone.from(screenSize).toRel(config.relZone),
    redThreshold: settings.threshold,
  });

  const notificationZone = createNotificationZone({
    getDataFrom,
    zone: Zone.from(screenSize).toRel({
      x: 0.44,
      y: 0.12,
      width: 0.11,
      height: 0.07,
    }),
  });

  const lootWindowPatch =
    config.lootWindow[screenSize.width <= 1536 ? `1536` : `1920`];

  const confirmationWindowPatch =
    config.confirmationWindow[screenSize.width <= 1536 ? `1536` : `1920`];

  const lootWindow = {
    upperLimit: lootWindowPatch.upperLimit * screenSize.height,
    toItemX: lootWindowPatch.toItemX * screenSize.width,
    toItemY: lootWindowPatch.toItemY * screenSize.height,
    width: lootWindowPatch.width * screenSize.width,
    height: lootWindowPatch.height * screenSize.height,
    itemHeight: lootWindowPatch.itemHeight * screenSize.height,
  };

  const confirmationWindow = {
    x: confirmationWindowPatch.x * screenSize.width,
    y: confirmationWindowPatch.y * screenSize.height,
    width: confirmationWindowPatch.width * screenSize.width,
    height: confirmationWindowPatch.height * screenSize.height
  };

  if(lootWindowPatch.cursorPos) {
    lootWindow.cursorPos = {
      x: lootWindowPatch.cursorPos.x * screenSize.width,
      y: lootWindowPatch.cursorPos.y * screenSize.height
    }
  }

  if(lootWindowPatch.exitButton) {
    lootWindow.exitButton = {
      x: lootWindowPatch.exitButton.x * screenSize.width,
      y: lootWindowPatch.exitButton.y * screenSize.height
    }
  }

  const whitelist = settings.whitelistWords
    .split(",")
    .map((word) => word.trim());

  const moveTo = ({ pos, randomRange }) => {
    if (randomRange) {
      pos.x = pos.x + random(-randomRange, randomRange);
      pos.y = pos.y + random(-randomRange, randomRange);
    }

    if (settings.likeHuman) {
      mouse.moveCurveTo(
        pos.x,
        pos.y,
        random(config.mouseMoveSpeed.from, config.mouseMoveSpeed.to),
        random(
          config.mouseCurvatureStrength.from,
          config.mouseCurvatureStrength.to
        )
      );
    } else {
      mouse.moveTo(pos.x, pos.y, delay);
    }
  };

  const checkBobberTimer = createTimer(() => config.maxFishTime);
  const missOnPurposeTimer = createTimer(() => random(1000, 8000));
  const logOutTimer = createTimer(() => config.logOut * 1000 * 60);

  const logOut = async (state) => {
    await action(async () => {
      keyboard.sendKey(`enter`, delay);
      keyboard.printText(`/logout`, delay);
      keyboard.sendKey(`enter`, delay);
    });
    await sleep(20000);
    await sleep(random(30000, 60000));
    if(state.status == 'stop') {
      return;
    }
    await action(() => {
      keyboard.sendKey(`enter`);
    });
    await sleep(random(30000, 60000));
  };
  logOut.timer = logOutTimer;
  logOut.on = config.logOut > 0;

  const preliminaryChecks = () => {
    if (screenSize.x == -32000 && screenSize.y == -32000) {
      throw new Error("The window is either in fullscreen mode or minimized. Switch to windowed or windowed(maximized).");
    }

    if(fishingZone.isVoid()) {
      throw new Error(`Can't get colors from the window. Switch to lower DirectX.`);
    }

    if (fishingZone.findBobber()) {
      throw new Error(
        `Found red colors before casting. Increase the red color "threshold" value or change the fishing place.`
      );
    }
  };

  const applyLures = async () => {
    await action(() => {
      keyboard.sendKey(settings.luresKey, delay);
      if (
        settings.game == `Vanilla` ||
        settings.game == `Classic&TBCC` ||
        settings.game == `TBC`
      ) {
        keyboard.sendKey(`c`, delay);
        moveTo({
          pos: {
            x:
              screenSize.width <= 1536
                ? screenSize.width * 0.10395
                : screenSize.width * 0.09375,
            y:
              screenSize.height <= 864
                ? screenSize.height * 0.66666
                : screenSize.height * 0.59537,
          },
          randomRange: 5,
        });
        mouse.toggle(true, "left", delay);
        mouse.toggle(false, "left", delay);
        keyboard.sendKey(`c`, delay);
      }
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
    return (
      random(config.randomSleepEvery.from, config.randomSleepEvery.to) *
      60 *
      1000
    );
  });

  const findAllBobberColors = () => {
    return fishingZone.getBobberPrint(7);
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
    if (settings.likeHuman && random(0, 100) > 85) {
        return pos;
    }

    if (config.reaction) {
      await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
    }

    await action(() => {
      moveTo({ pos, randomRange: 5 });
    });

    return findBobber();
  };

  const findBobber = () => {
    return fishingZone.findBobber(findBobber.memory);
  };
  findBobber.memory = null;
  findBobber.maxAttempts = config.maxAttempts;

  const checkBobber = async (pos, state) => {
    checkBobberTimer.start();
    const missOnPurpose = random(0, 100) < config.missOnPurpose;

    if(missOnPurpose) {
      missOnPurposeTimer.update();
    }

    while (state.status == "working") {
      if (checkBobberTimer.isElapsed()) {
        throw new Error(
          `Something is wrong. The bot sticked to the bobber for more than ${config.maxFishTime} ms.`
        );
      }

      if(missOnPurpose && missOnPurposeTimer.isElapsed()) {
        return pos;
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

  const pickLoot = async () => {
    let cursorPos = lootWindow.cursorPos ? lootWindow.cursorPos : mouse.getPos();
    if (cursorPos.y - lootWindow.upperLimit < 0) {
      cursorPos.y = lootWindow.upperLimit;
    }

    if (config.reaction) {
      await sleep(random(config.reactionDelay.from, config.reactionDelay.to)); // react to opening loot win
    } else {
      await sleep(150); // open loot window
    }

      let pos = {
        x: cursorPos.x + lootWindow.toItemX,
        y: cursorPos.y - lootWindow.toItemY - 10,
      };
      moveTo({ pos, randomRange: 5 });

    if (config.reaction) {
      await sleep(random(config.reactionDelay.from, config.reactionDelay.to)); // hint disappearing and smooth text analyzing time with random value
    } else {
      await sleep(150); // hint dissappearing
    }

    const lootWindowDim = {
      x: cursorPos.x + lootWindow.toItemX,
      y: cursorPos.y - lootWindow.toItemY,
      width: lootWindow.width,
      height: lootWindow.height,
    };

    let recognizedWords = await readTextFrom(getDataFrom(lootWindowDim), screenSize.width <= 1536 ? 3 : 2);
    let items = sortWordsByItem(recognizedWords, lootWindow.itemHeight);
    let itemPos = 0;

    let itemsPicked = [];
    for (let item of items) {
      let isInList = whitelist.find((word) => percentComparison(word, item) > 90);

      if (!isInList && settings.whiteListBlueGreen) {
        isInList = createLootZone({
          getDataFrom,
          zone: {
            x: lootWindowDim.x,
            y: lootWindowDim.y + itemPos,
            width: lootWindow.width,
            height: lootWindow.itemHeight,
          },
        }).findItems("blue", "green");
      }

      if (isInList) {
          moveTo({
            pos: {
              x: cursorPos.x,
              y: cursorPos.y + itemPos,
            },
            randomRange: 5,
          });

        if (config.reaction && random(0, 10) > 8) { // sometimes we think
          await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
        } else {
          await sleep(random(50, 150));
        }

        mouse.toggle(true, "right", delay);
        mouse.toggle(false, "right", delay);

        if(typeof isInList == `boolean` && settings.confirmSoulbound) {
          await sleep(250); // wait for the confirmation to appear
          let recognizedWords = await readTextFrom(
           getDataFrom(confirmationWindow),
           screenSize.width <= 1536 ? 3 : 2
         );


          if(recognizedWords.some(item => percentComparison(`Okay`, item.text) > 75)) {
            moveTo({
              pos: {
                     x: confirmationWindow.x + confirmationWindow.width / 2,
                     y: confirmationWindow.y + confirmationWindow.height / 2
                   }
            });

            mouse.toggle(true, "left", delay);
            mouse.toggle(false, "left", delay);
          }
        }

        itemsPicked.push(item);
      }

      itemPos += lootWindow.itemHeight;
    }

    if (items.length != itemsPicked.length) {
      if (config.reaction) {
        await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
      }
      if(lootWindow.exitButton) {
        moveTo({ pos: {
          x: cursorPos.x + lootWindow.exitButton.x,
          y: cursorPos.y - lootWindow.exitButton.y
        }});
        mouse.toggle(true, "left", delay);
        mouse.toggle(false, "left", delay);
      } else {
        keyboard.sendKey("escape", delay);
      }
    }

    return itemsPicked;
  };

  const hookBobber = async (pos) => {
    if (config.reaction) {
      await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
    }
    let caught = false;

    await action(async () => {
      moveTo({ pos, randomRange: 5 });

      if (settings.shiftClick) {
        keyboard.toggleKey("shift", true, delay);
        mouse.toggle(true, "right", delay);
        mouse.toggle(false, "right", delay);
        keyboard.toggleKey("shift", false, delay);
      } else {
        mouse.toggle(true, "right", delay);
        mouse.toggle(false, "right", delay);
      }

    await sleep(250);
    if (!notificationZone.check("warning")) {
      caught = true;
      if (settings.whitelist) {
          let itemsPicked = await pickLoot();
            if(itemsPicked.length > 0) {
              caught = itemsPicked.toString();
            }
      }
    }
    });
    await sleep(settings.game == `Retail` || settings.game == `Classic&TBCC` ? 750 : 250); // close loot window delay

    if (config.sleepAfterHook) {
      await sleep(random(config.afterHookDelay.from, config.afterHookDelay.to));
    }

    return caught;
  };

  return {
    logOut,
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
