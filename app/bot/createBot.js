const Zone = require("../utils/zone.js");
const createFishingZone = require("./fishingZone.js");
const createNotificationZone = require("./notificationZone.js");
const createLootZone = require("./lootZone.js");
const createChatZone = require('./chatZone');
const Jimp = require(`jimp`);

const { screen, Region, Point } = require("@nut-tree/nut-js");

let once = (fn, done) => (...args) => {
  if(!done) {
    done = true;
    return fn(...args);
  }
}

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

let chatMsgs = [];

const createBot = (game, { config, settings }, winSwitch) => {
  const { keyboard, mouse, workwindow } = game;
  const delay = [config.delay.from, config.delay.to];

  const action = async (callback) => {
    await winSwitch.execute(workwindow);
    await callback();
    winSwitch.finished();
  };

  const screenSize = workwindow.getView();

  const actionOnce = once(action);

  const missOnPurposeValue = config.missOnPurpose ? random(config.missOnPurposeRandom.from, config.missOnPurposeRandom.to) : 0;
  const getDataFrom = async (zone) => {
    if(zone.x < 0) zone.x = 0;
    if(zone.y < 0) zone.y = 0;
    if(zone.width > screenSize.width) zone.width = screenSize.width;
    if(zone.height > screenSize.height) zone.height = screenSize.height;

    if(!settings.multipleWindows) {
      await actionOnce(() => {});
      let grabbed = await(await screen.grabRegion(new Region(zone.x + screenSize.x, zone.y + screenSize.y, zone.width, zone.height))).toRGB();
      return grabbed;
    } else {
      return workwindow.capture(zone);
    }
  };

  const fishingZone = createFishingZone({
    getDataFrom,
    zone: Zone.from(screenSize).toRel(config.relZone),
    threshold: settings.threshold,
    bobberColor: settings.bobberColor,
    sensitivity: config.bobberSensitivity,
    density: config.bobberDensity
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

  if(lootWindowPatch.itemHeightAdd) {
    lootWindow.itemHeightAdd = lootWindowPatch.itemHeightAdd * screenSize.height;
  }

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

  const moveTo = async ({ pos, randomRange }) => {
    if (randomRange) {
      pos.x = pos.x + random(-randomRange, randomRange);
      pos.y = pos.y + random(-randomRange, randomRange);
    }

    if (settings.likeHuman) {
      await mouse.humanMoveTo(
        pos.x,
        pos.y,
        random(config.mouseMoveSpeed.from, config.mouseMoveSpeed.to),
        random(
          config.mouseCurvatureStrength.from,
          config.mouseCurvatureStrength.to
        )
      );
    } else {
      await mouse.moveTo(pos.x, pos.y, delay);
    }
  };

  const checkBobberTimer = createTimer(() => config.maxFishTime);
  const missOnPurposeTimer = createTimer(() => random(1000, 8000));
  const logOutTimer = createTimer(() => random(config.logOutEvery.from * 1000 * 60, config.logOutEvery.to * 1000 * 60));

  const logOut = async (state) => {
    await action(async () => {
      await keyboard.toggleKey(`enter`, true, delay);
      await keyboard.toggleKey(`enter`, false, delay);
      await keyboard.printText(`/logout`, delay);
      await keyboard.toggleKey(`enter`, true, delay);
      await keyboard.toggleKey(`enter`, false, delay);
    });
    await sleep(20000);

    const addTime = applyLures.timer.timeRemains();

    await sleep(random(config.logOutFor.from * 1000, config.logOutFor.to * 1000));
    if(state.status == 'stop') {
      return;
    }
    await action(async () => {
      await keyboard.sendKey(`enter`);
    });
    await sleep(random(config.logOutAfter.from * 1000, config.logOutAfter.from * 1000));

    if(settings.lures) {
      applyLures.timer.update(() => addTime);
    }

  };
  logOut.timer = logOutTimer;
  logOut.on = config.logOut > 0;

  const preliminaryChecks = async () => {
    if(config.ignorePreliminary) return;
    if (screenSize.x == -32000 && screenSize.y == -32000) {
      throw new Error("The window is either in fullscreen mode or minimized. Switch to windowed or windowed(maximized).");
    }

    let bobber = await fishingZone.findBobber();
    if (bobber) {
      screen.config.highlightOpacity = 1;
      screen.config.highlightDurationMs = 1000;
      const highlightRegion = new Region(screenSize.x + (bobber.x - 30), screenSize.y + (bobber.y - 30), 30, 30);
      await screen.highlight(highlightRegion);

      throw new Error(
        `Found ${settings.bobberColor == `red` ? `red` : `blue`} colors before casting. Change your Fishing Zone or increase the Threshold value or change the fishing place.`
      );
    }
  };

  const applyLures = async () => {
    await action(async () => {
      await keyboard.sendKey(settings.luresKey, delay);
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

  const findAllBobberColors = async () => {
    return await fishingZone.getBobberPrint(7);
  };

  const castFishing = async (state) => {
    await action(async () => {
      await keyboard.sendKey(settings.fishingKey, delay);
    });

    if (state.status == "initial") {
      await sleep(250);
      if (!config.ignorePreliminary && await notificationZone.check("error")) {
        throw new Error(`Game error notification occured on casting fishing.`);
      } else {
        state.status = "working";
      }
    }

    await sleep(config.castDelay);
  };

  const highlightBobber = async (pos) => {
    if (settings.useInt || (settings.likeHuman && random(0, 100) > 85)) {
        return pos;
    }

    if (config.reaction) {
      await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
    }

    await action(async () => {
      await moveTo({ pos, randomRange: 5 });
    });

    return await findBobber();
  };

  const findBobber = async () => {
    return await fishingZone.findBobber(findBobber.memory);
  };
  findBobber.memory = null;
  findBobber.maxAttempts = config.maxAttempts;

  const checkBobber = async (pos, state) => {
    checkBobberTimer.start();
    const missOnPurpose = random(0, 100) < missOnPurposeValue;
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

      if(settings.game == `Dragonflight`) {
        if(!(await fishingZone.checkBobberPrint(pos))) {
          return pos;
        }
      } else {
        if(!(await fishingZone.isBobber(pos))) {
          const newPos = await fishingZone.checkAroundBobber(pos);
          if (!newPos) {
            return pos;
          } else {
            pos = newPos;
          }
        }
      }

      await sleep(config.checkingDelay);
    }
  };

  const isYellow = ([r, g, b]) => r - b > 135 && g - b > 135;

  const isLootOpened = async (cursorPos) => {
    await sleep(250);
    let x = cursorPos.x + lootWindow.exitButton.x;
    let y = cursorPos.y - lootWindow.exitButton.y;
    if(settings.multipleWindows) {
      return isYellow(workwindow.colorAt(x, y, "array"));
    } else {
      let color = await screen.colorAt(new Point(x + screenSize.x, y + screenSize.y));
      return isYellow([color.R, color.G, color.B]);
    }
  };

  const pickLoot = async () => {
    let cursorPos = settings.atMouse || !lootWindow.cursorPos ? mouse.getPos() : lootWindow.cursorPos;
    if (cursorPos.y - lootWindow.upperLimit < 0) {
      cursorPos.y = lootWindow.upperLimit;
    }

    if (config.reaction) {
      await sleep(random(config.reactionDelay.from, config.reactionDelay.to)); // react to opening loot win
    } else {
      await sleep(150); // open loot window
    }

    if(settings.game != `Dragonflight`) {
      let pos = {
        x: cursorPos.x + lootWindow.toItemX,
        y: cursorPos.y - lootWindow.toItemY - 10,
      };
      await moveTo({ pos, randomRange: 5 });
    }

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

    let recognizedWords = await readTextFrom(await getDataFrom(lootWindowDim), screenSize.width <= 1536 ? 3 : 2);
    let items = sortWordsByItem(recognizedWords, lootWindow, settings.game == `Dragonflight`);
    let itemPos = 0;

    let itemsPicked = [];
    for (let item of items) {
      let isInList = whitelist.find((word) => percentComparison(word, item) > 90);

      if(settings.filterType == `blacklist`) {
        if(isInList) {
          isInList = false;
        } else {
          isInList = true;
        }
      }

      if (!isInList && settings.whiteListBlueGreen) {
        let lootZone = createLootZone({
          getDataFrom,
          zone: {
            x: lootWindowDim.x,
            y: lootWindowDim.y + itemPos,
            width: lootWindow.width,
            height: lootWindow.itemHeight,
          },
        });

        isInList = await lootZone.findItems("blue", "green", "purple");
      }

      if (isInList) {
          await moveTo({
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

        await mouse.toggle("right", true, delay);
        await mouse.toggle("right", false, delay);

        if(typeof isInList == `boolean` && settings.confirmSoulbound) {
          await sleep(250); // wait for the confirmation to appear
          let recognizedWords = await readTextFrom(
           await getDataFrom(confirmationWindow),
           screenSize.width <= 1536 ? 3 : 2
         );


          if(recognizedWords.some(item => percentComparison(`Okay`, item.text) > 75)) {
            await moveTo({
              pos: {
                     x: confirmationWindow.x + confirmationWindow.width / 2,
                     y: confirmationWindow.y + confirmationWindow.height / 2
                   },
              randomRange: 5
            });

            await mouse.toggle("right", true, delay);
            await mouse.toggle("right", false, delay);

          }
        }

        itemsPicked.push(item);
      }

      itemPos += settings.game == `Dragonflight` ? lootWindow.itemHeight + lootWindow.itemHeightAdd : lootWindow.itemHeight;
    }

    if(settings.useInt && itemsPicked.length > 1) {
      await moveTo({pos: cursorPos, randomRange: 5});
    }

    if ((settings.game == `WotLK Classic` || settings.game == `Classic`|| settings.game == `Dragonflight`) ? await isLootOpened(cursorPos) : items.length != itemsPicked.length) {

            if (config.reaction) {
              await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
            }

            if((config.closeLoot == `mouse` || config.closeLoot == `mouse+esc`) && lootWindow.exitButton) {

              if(config.closeLoot == `mouse`) {
                await moveTo({ pos: {
                  x: cursorPos.x + lootWindow.exitButton.x,
                  y: cursorPos.y - lootWindow.exitButton.y
                }, randomRange: 5});
                await mouse.toggle("left", true, delay);
                await mouse.toggle("left", false, delay);

                if(settings.useInt) {
                  await moveTo({ pos: cursorPos, randomRange: 5});
                }
              }

              if(config.closeLoot == `mouse+esc`) {
                if(random(0, 100) > 50) {
                  await keyboard.sendKey("escape", delay);
                } else {
                  await moveTo({ pos: {
                    x: cursorPos.x + lootWindow.exitButton.x,
                    y: cursorPos.y - lootWindow.exitButton.y
                  }, randomRange: 5});
                  await mouse.toggle("left", true, delay);
                  await mouse.toggle("left", false, delay);

                  if(settings.useInt) {
                    await moveTo({ pos: cursorPos, randomRange: 5});
                  }
                }
              }
            } else {
              await keyboard.sendKey("escape", delay);
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
      if(settings.useInt) {
        await keyboard.toggleKey(settings.intKey, true, delay);
        await keyboard.toggleKey(settings.intKey, false, delay);
      } else {
        await moveTo({ pos, randomRange: 5 });

        if (config.shiftClick) {
          await keyboard.toggleKey("shift", true, delay);
          await mouse.toggle("right", true, delay);
          await mouse.toggle("right", false, delay);
          await keyboard.toggleKey("shift", false, delay);
        } else {
          await mouse.toggle("right", true, delay);
          await mouse.toggle("right", false, delay);
        }
      }

    await sleep(250);
    if (!(await notificationZone.check("warning"))) {
      caught = true;
      if (settings.whitelist) {
          let itemsPicked = await pickLoot();
            if(itemsPicked.length > 0) {
              caught = itemsPicked.toString();
            }
      }
    }
    });
    if(!settings.whitelist) {
      await sleep(config.closeLootDelay);
    } else {
      await sleep(150);
    }

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
    hookBobber
  };
};

module.exports = createBot;
