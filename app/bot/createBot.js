const Zone = require("../utils/zone.js");
const createFishingZone = require("./fishingZone.js");
const createNotificationZone = require("./notificationZone.js");
const createLootZone = require("./lootZone.js");
const {app} = require(`electron`);

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

const createBot = (game, { config, settings }, winSwitch, state) => {

  if(settings.game == `Vanilla (splash)` && settings.autoTh == true) {
    settings.autoTh = false;
  };

  console.log(settings.autoTh);

  const { keyboard, mouse, workwindow } = game;
  const delay = [config.delay.from, config.delay.to];

  const action = async (callback) => {
    if(state.status == `stop`) return;

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

    if(!config.multipleWindows) {
      await actionOnce(() => {});
      let grabbed = await(await screen.grabRegion(new Region(zone.x + screenSize.x, zone.y + screenSize.y, zone.width, zone.height))).toRGB();
      return grabbed;
    } else {
      return workwindow.capture(zone);
    }
  };

  let fishingZone = createFishingZone(getDataFrom, Zone.from(screenSize).toRel(config.relZone), screenSize, settings, config);
    const notificationZone = createNotificationZone({
      getDataFrom,
      zone: Zone.from({
        x: Math.round((screenSize.width / 2) - (screenSize.width * config.notificationPos.width)),
        y: Math.round(screenSize.height * config.notificationPos.y),
        width: Math.round((screenSize.width * config.notificationPos.width) * 2),
        height: Math.round(screenSize.height * config.notificationPos.height)
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

    if (config.likeHuman) {
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
      if(!settings.autoTh) {
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
    if(settings.game != `Retail` && settings.game != `LK Classic` && settings.game != `Classic` && settings.game != `Vanilla (splash)`) {
      return await fishingZone.getBobberPrint(7);
    } else {
      return null;
    }
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
    if (settings.useInt || (config.likeHuman && random(0, 100) > Number(config.highlightPercent))) {
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

  const detectSens = () => {
    if(!config.autoSensDens || settings.game == `Vanilla (splash)`) return;

    if(settings.game == `Retail`) {
      return `sensitivity`;
    } else {
      return `density`;
    }
  }

  const findBobber = async () => {
    return await fishingZone.findBobber(findBobber.memory, detectSens());
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
        switch(config.maxFishTimeAfter) {
          case `stop`: {
            throw new Error(
              `Something is wrong. The bot had been checking the bobber for more than ${config.maxFishTime} ms. The server might be down or your character is dead.`
            );
          }
          case `recast`: {
            return false;
          }
        }
      }

      if(missOnPurpose && missOnPurposeTimer.isElapsed()) {
        return pos;
      }

      if(settings.game == `Retail`) {
        if(!(await fishingZone.checkBobberPrint(pos))) {
          return pos;
        }
      } else if(settings.game == `Vanilla (splash)`) {
        if(await fishingZone.checkBobberPrintSplash(pos)) {
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
    if(config.multipleWindows) {
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

    if(settings.game != `Retail`) {
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
    let items = sortWordsByItem(recognizedWords, lootWindow, settings.game == `Retail`);
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

      itemPos += settings.game == `Retail` ? lootWindow.itemHeight + lootWindow.itemHeightAdd : lootWindow.itemHeight;
    }

    if(settings.useInt && itemsPicked.length > 1) {
      await moveTo({pos: cursorPos, randomRange: 5});
    }

    if ((settings.game == `LK Classic` || settings.game == `Classic`|| settings.game == `Retail`) ? await isLootOpened(cursorPos) : items.length != itemsPicked.length) {

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

  const dynamicThreshold = () => {
    settings.threshold = settings.threshold - config.dynamicThresholdValue;
    fishingZone = createFishingZone(getDataFrom, Zone.from(screenSize).toRel(config.relZone), screenSize, settings, config);
  }

  dynamicThreshold.on = config.dynamicThreshold;
  dynamicThreshold.limit = () => settings.threshold < 20;

  const hookBobber = async (pos) => {
    if (config.reaction) {
      await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
    }
    let caught = false;

    if(!pos) { // in case recasting if it's stated in maxFishTimeAfter
      return caught;
    }

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


  const doAfterTimer = async (onError, wins) => {
    if(config.afterTimer == `HS` || config.afterTimer == `HS + Quit`) {
      await action(async () => {
        await keyboard.sendKey(config.hsKey, delay);
      }, true);
      await sleep(config.hsKeyDelay);
    }

    state.status = `stop`;

    if(config.afterTimer == `HS + Quit` || config.afterTimer == `Quit`) {
      if(wins.every(win => win.state.status == `stop`)) {
        if(config.timerShutDown) {
            await keyboard.sendKey(`lWin`, delay);
            await sleep(random(1000, 2000));
            await keyboard.printText(`cmd`, delay);
            await sleep(random(1000, 2000));
            await keyboard.sendKey(`enter`, delay);
            await sleep(random(1000, 2000));
            await keyboard.printText(`shutdown -s -t 10`, delay);
            await keyboard.sendKey(`enter`, delay);
        }
        app.quit();
      }
      workwindow.close();
    }

    if(wins.every(win => win.state.status == `stop`)) {
      onError();
    }
  }

  const stopAllCurrentActions = async () => {
    await mouse.humanMoveTo.cancelCurrent();
    await keyboard.sendKeys.cancelCurrent();
    await keyboard.printText.cancelCurrent();
};

  doAfterTimer.on = settings.timer;
  doAfterTimer.timer = createTimer(() => settings.timer * 1000 * 60);

  return {
    doAfterTimer,
    dynamicThreshold,
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
    stopAllCurrentActions
  };
};

module.exports = createBot;
