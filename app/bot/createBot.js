const Zone = require("../utils/zone.js");
const createFishingZone = require("./fishingZone.js");
const createNotificationZone = require("./notificationZone.js");
const createLootZone = require("./lootZone.js");
const createLootExitZone = require("./lootExitZone.js");
const createRedButtonZone = require("./redButtonZone.js");
const {app} = require(`electron`);
const Vec = require('../utils/vec.js');
const nutMouse = require("../game/nut.js").mouse;

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

  switch(true) {
    case config.libraryType == 'nut.js': {
      await actionOnce(() => {});
      let grabbed = await(await screen.grabRegion(new Region(zone.x + screenSize.x, zone.y + screenSize.y, zone.width, zone.height))).toRGB();
      return grabbed;
    }

    case config.libraryType == 'keysender': {
        return workwindow.capture(zone);
    }
  }
  };

  let fishingZone = createFishingZone(getDataFrom, Zone.from(screenSize).toRel(config.relZone), screenSize, settings, config);
  const notificationZoneRel = Zone.from({
    x: Math.round((screenSize.width / 2) - (screenSize.width * config.notificationPos.width)),
    y: Math.round(screenSize.height * config.notificationPos.y),
    width: Math.round((screenSize.width * config.notificationPos.width) * 2),
    height: Math.round(screenSize.height * config.notificationPos.height)
  });
  const notificationZone = createNotificationZone({
      getDataFrom,
      zone: notificationZoneRel,
    });

    let lootWinResType;
    switch(true) {
      case screenSize.height <= 768: {
        lootWinResType = `1536`
        break;
      }

      case screenSize.height > 768 && screenSize.height <= 1080: {
        lootWinResType = `1920`;
        break;
      }

      case screenSize.height > 1080 && screenSize.height <= 1440: {
        lootWinResType = `2560`;
        break;
      }

      case screenSize.height > 1440: {
        lootWinResType = `3840`;
      }
    }
  let ultrawide = (screenSize.width / screenSize.height) > 2;

  const lootWindowPatch = config.lootWindow[lootWinResType] ? config.lootWindow[lootWinResType] : config.lootWindow[`1920`];

  const confirmationWindowPatch =
    config.confirmationWindow[screenSize.width <= 1536 ? `1536` : `1920`];

  let ignoreInterruptedPatch;
  if(config.ignoreInterrupted) {
    ignoreInterruptedPatch = config.ignoreInterrupted[screenSize.width <= 1536 ? `1536` : `1920`];
  }

  const lootWindow = {
    upperLimit: lootWindowPatch.upperLimit * screenSize.height,
    toItemX: lootWindowPatch.toItemX * (ultrawide ? Number(lootWinResType) : screenSize.width),
    toItemY: lootWindowPatch.toItemY * screenSize.height,
    width: lootWindowPatch.width * (ultrawide ? Number(lootWinResType) : screenSize.width),
    height: lootWindowPatch.height * screenSize.height,
    itemHeight: lootWindowPatch.itemHeight * screenSize.height,
  };

  if(lootWindowPatch.itemHeightAdd) {
    lootWindow.itemHeightAdd = lootWindowPatch.itemHeightAdd * screenSize.height;
  }

  const confirmationWindow = {
    x: (screenSize.width / 2) - (confirmationWindowPatch.x * screenSize.width),
    y: confirmationWindowPatch.y * screenSize.height,
    width: confirmationWindowPatch.width * screenSize.width,
    height: confirmationWindowPatch.height * screenSize.height
  };

  if(lootWindowPatch.cursorPos) {
    lootWindow.cursorPos = {
      x: lootWindowPatch.cursorPos.x * (ultrawide ? Number(lootWinResType) : screenSize.width),
      y: lootWindowPatch.cursorPos.y * screenSize.height
    }
  }

  if(lootWindowPatch.exitButton) {
    lootWindow.exitButton = {
      x: lootWindowPatch.exitButton.x * (ultrawide ? Number(lootWinResType) : screenSize.width),
      y: lootWindowPatch.exitButton.y * screenSize.height
    }
  }

  const lootExitZone = createLootExitZone({getDataFrom, lootWindow, size: 10 * (screenSize.width / 1920)});

  const whitelist = config.whitelistWords
    .split(",")
    .map((word) => word.trim());


    const generateMovePastPos = (pos) => {
      let posFromCurrent = {x: pos.x - mouse.getPos().x, y: pos.y - mouse.getPos().y};
      let movePastDir =  {x: posFromCurrent.x > 0 ? 1 : -1, y: posFromCurrent.y > 0 ? 1 : -1};
      let movePastMaxMain = Math.abs(posFromCurrent.x) > Math.abs(posFromCurrent.y) ? "x" : "y";
      let movePastMaxSub = Math.abs(posFromCurrent.x) < Math.abs(posFromCurrent.y) ? "x" : "y";

      const movePastDist = Math.sqrt(Math.pow(Math.abs(posFromCurrent.x), 2) + Math.pow(Math.abs(posFromCurrent.y), 2)) * .5;

      posFromCurrent[movePastMaxMain] += (movePastDist * random(0.25, 0.35)) * movePastDir[movePastMaxMain];
      posFromCurrent[movePastMaxSub] += (movePastDist * random(0.05, 0.10)) * movePastDir[movePastMaxSub];

      return {x: posFromCurrent.x + mouse.getPos().x, y: posFromCurrent.y + mouse.getPos().y};
    }

    const moveTo = async ({ pos, randomRange, fineTune = {offset: randomRange || 5, steps: [1, 3]}, forcedNutMouse}) => {
      if (randomRange) {
        pos.x = pos.x + random(-randomRange, randomRange);
        pos.y = pos.y + random(-randomRange, randomRange);
      }

      if (config.likeHuman) {
        let convertedSpeed = config.mouseMoveSpeed / 100;
        let speedByRes =  convertedSpeed * (screenSize.width / 1920);
        let speedCoofByRes = 0.15 * (screenSize.width / 1920);
        let randomSpeed = {from: speedByRes - speedCoofByRes, to: speedByRes + speedCoofByRes}
        if(randomSpeed.from < 0) {
          randomSpeed.from = 0;
        }

        let deviationCoof = config.libraryTypeInput === 'nut.js' ? 30 : 15;
        let randomDeviation = {from: config.mouseCurvatureStrength - deviationCoof, to: config.mouseCurvatureStrength + deviationCoof};
        if(randomDeviation.from < 0) {
          randomDeviation.from = 0;
        }

        if(config.libraryTypeInput === 'nut.js' || forcedNutMouse) {
          if(!(pos instanceof Vec)) {
            pos = new Vec(pos.x, pos.y);
          }
          let curPos = mouse.getPos();
          curPos = new Vec(curPos.x, curPos.y);
          await nutMouse.humanMoveTo({
            from: curPos.plus(screenSize),
            to: pos.plus(screenSize),
            speed: random(randomSpeed.from, randomSpeed.to),
            deviation: random(randomDeviation.from, randomDeviation.to),
            fishingZone: Zone.from(screenSize).toRel(config.relZone)
          });
        } else {
          await mouse.humanMoveTo(pos.x, pos.y, random(randomSpeed.from, randomSpeed.to), random(randomDeviation.from, randomDeviation.to));
        }

        if(config.likeHumanFineTune && fineTune && state.status != "stop") {
          let times = random(fineTune.steps[0], fineTune.steps[1]);
          for(let i = 1; i <= times; i++) {
            await mouse.humanMoveTo(
              pos.x + random(-fineTune.offset / i, fineTune.offset / i),
              pos.y + random(-fineTune.offset / i, fineTune.offset / i),
              random(randomSpeed.from / 3, randomSpeed.to / 3),
              random(randomDeviation.from, randomDeviation.to)
            );
            await sleep(random(25, 150));
          }
        }
      } else {
        await mouse.moveTo(pos.x, pos.y, delay);
      }
    };

    const checkRedButton = async (buttonPos) => {
        const redButtonZone = createRedButtonZone({getDataFrom, zone: buttonPos});
        const colorPositions = await redButtonZone.isOn(mouse.getPos());
        if(colorPositions){
          let colorPos = colorPositions.yellow || colorPositions.red;
          await action(async () => {
            await moveTo({pos: {
              x: buttonPos.x + colorPos.x,
              y: buttonPos.y + colorPos.y},
              randomRange: 2,
              });
          });

          return await redButtonZone.isOnAfterHighlight()
        }
    };

  const checkBobberTimer = createTimer(() => config.maxFishTime * 1000);
  const missOnPurposeTimer = createTimer(() => random(config.missOnPurposeRandomDelay.from, config.missOnPurposeRandomDelay.to) * 1000);
  const logOutTimer = createTimer(() => random(config.logOutEvery.from * 1000 * 60, config.logOutEvery.to * 1000 * 60));

  const logOut = async (state) => {
    await action(async () => {
      if(config.logOutUseMacro) {
        await keyboard.toggleKey(config.logOutMacroKey, true, delay);
        await keyboard.toggleKey(config.logOutMacroKey, false, delay);
      } else {
        await keyboard.toggleKey(`enter`, true, delay);
        await keyboard.toggleKey(`enter`, false, delay);
        await keyboard.printText(`/logout`, delay);
        await keyboard.toggleKey(`enter`, true, delay);
        await keyboard.toggleKey(`enter`, false, delay);
      }
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

    if(config.lures) {
      applyLures.timer.update(() => addTime);
    }

  };
  logOut.timer = logOutTimer;
  logOut.on = config.logOut > 0;


  const preliminaryChecks = async (log) => {
      if(config.ignorePreliminary) return;

      if (screenSize.x == -32000 && screenSize.y == -32000) {
        throw new Error("The window is either in fullscreen mode or minimized. Switch to windowed or windowed(maximized).");
      }

      if(settings.autoColor) {
        if(await fishingZone.changeColor()) {
          log.warn(`Switched to ${settings.bobberColor == `red` ? `blue` : `red`} color.`);
        }
      }

      if(!settings.autoTh) {
        let bobber = await fishingZone.findBobber(null, log);
        if (bobber) {
          screen.config.highlightOpacity = 1;
          screen.config.highlightDurationMs = 1000;
          const highlightRegion = new Region(screenSize.x + (bobber.x - 30), screenSize.y + (bobber.y - 30), 30, 30);
          await screen.highlight(highlightRegion);

          throw new Error(
            `Found ${settings.bobberColor == `red` ? `red` : `blue`} colors before casting. Change your Fishing Zone or increase the intensity value or change the fishing place.`
          );
        }
      }
    };

  const applyLures = async () => {
    await action(async () => {
      await keyboard.sendKey(config.luresKey, delay);
    });

    if(config.confirmLures) {
      if (config.reaction) {
        await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
      } else {
        await sleep(250) // wait for the window to appear
      }
      const needsConfirm = await checkRedButton(confirmationWindow);
      if(needsConfirm) {
        await action(async () => {
          await mouse.toggle('left', true, delay);
          await mouse.toggle('left', false, delay);
        });
      }
    }

    await sleep(config.luresDelay);
  };

  applyLures.on = config.lures;
  applyLures.timer = createTimer(() => {
    return config.luresDelayMin * 60 * 1000;
  });

  if(config.luresOmitInitial) {
    applyLures.timer.start();
  }

  const randomSleep = async () => {
    let sleepFor = random(
      config.randomSleepDelay.from * 1000,
      config.randomSleepDelay.to * 1000
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

  const cutOutNotification = (zone) => {
    let noteZone = Zone.from(screenSize).toRel(zone);
    let fZone = Zone.from(screenSize).toRel(config.relZone)
    let result = [];
    for(let y = noteZone.y - fZone.y; y < (noteZone.y - fZone.y) + noteZone.height; y++) {
      for(let x = noteZone.x - fZone.x; x < (noteZone.x - fZone.x) + noteZone.width; x++) {
        result.push(new Vec(x, y));
      }
    }
    return result;
  }

  const findAllBobberColors = async () => {
    if(settings.game != `Retail` && settings.game != `LK Classic` && settings.game != `Classic`) {
      let bobber = await fishingZone.getBobberPrint(7);

      if(!bobber) {
        return;
      }

      if(config.ignoreInterrupted) {
        let interruptedArea = cutOutNotification(ignoreInterruptedPatch);
        bobber = [...bobber, ...interruptedArea];
      }

      return bobber;
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

    if(settings.checkLogic == `pixelmatch`) {
      await sleep(2500);
    } else {
      await sleep(config.castDelay)
    }
  };

  const highlightBobber = async (pos, log) => {

    if (settings.checkLogic == `pixelmatch` ||
        settings.useInt ||
        settings.afkmode ||
        (config.likeHuman && random(0, 100) > config.highlightPercent)) {
        return pos;
    }

    if (config.reaction) {
      await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
    }

    await action(async () => {

      if(config.likeHumanFineTune) {
        let pastPost = generateMovePastPos(pos);
        await moveTo({pos: pastPost, fineTune: null})
      }

      await moveTo({ pos, randomRange: 5, fineTune: {offset: 10, steps: [1, 5]}});
    });

   return await findBobber(log);
  };

  const findBobber = async (log) => {
    if(settings.useInt && settings.soundDetection) {
      return true;
    }
    const pos = await fishingZone.findBobber(findBobber.memory, log);

    if(pos && process.env.NODE_ENV == `dev`) {
      screen.config.highlightOpacity = 1;
      screen.config.highlightDurationMs = 250;
      const highlightRegion = new Region(screenSize.x + (pos.x - 5), screenSize.y + (pos.y - 5), 10, 10);
      await screen.highlight(highlightRegion);
    }

    return pos;
  };

  findBobber.memory = null;
  findBobber.maxAttempts = config.maxAttempts;

  const checkBobber = async (pos, state) => {
    checkBobberTimer.start();
    const startTime = Date.now();
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
        pos.missedIntentionally = true;
        return pos;
      }

  if(settings.checkLogic == `pixelmatch`) {
    if(await fishingZone.checkPixelMatch(pos, startTime)) {
      return pos;
    };
  } else if(settings.game == `Retail`) {
   if(!(await fishingZone.checkBobberPrint(pos))) {
     return pos;
   }
  } else if (settings.game == `Vanilla (splash)`) {
  if(await fishingZone.checkBobberPrintSplash(pos)) {
    return pos;
    }
  } else {
  if (!(await fishingZone.isBobber(pos))) {
    const newPos = settings.autoTh ? await fishingZone.checkBelow(pos) : await fishingZone.checkAroundBobber(pos);
    if (!newPos) {
      return pos;
    } else {
      pos = newPos;
    }
  }

    if(settings.autoTh) {
      pos = await fishingZone.checkAbove(pos);
    }
  }
    await sleep(config.checkingDelay);
  }

  };

  const pickLoot = async () => {
    let cursorPos = config.atMouse || !lootWindow.cursorPos ? mouse.getPos() : lootWindow.cursorPos;
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
        x: cursorPos.x + random(-(lootWindow.width * .25), lootWindow.width * .25),
        y: cursorPos.y - lootWindow.toItemY - 10,
      };
      await moveTo({ pos, randomRange: 5 });
    }

    if (config.reaction) {
      await sleep(random(config.reactionDelay.from, config.reactionDelay.to)); // hint disappearing and smooth text analyzing time with random value
    } else {
      await sleep(150); // hint dissappearing
    }

    if(lootWindow.exitButton) {
      for(let times = 0; times <= 20; times++) { // Wait for 2 seconds max until loot appears
        await sleep(100);
        if(await lootExitZone.isLootOpened(cursorPos)) {
          break;
        }

        if(times == 20) {
          return [];
        }
      }
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

      if(config.filterType == `blacklist`) {
        if(isInList) {
          isInList = false;
        } else {
          isInList = true;
        }
      }

      if (!isInList && config.whiteListBlueGreen) {
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

        if(typeof isInList == `boolean` && config.confirmSoulbound) {
          if (config.reaction) {
            await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
          } else {
            await sleep(250) // wait for the window to appear
          }
          const needsConfirm = await checkRedButton(confirmationWindow);
          if(needsConfirm) {
            await action(async () => {
              await mouse.toggle('left', true, delay);
              await mouse.toggle('left', false, delay);
            });
          }
        }

        itemsPicked.push(item);
      }

      itemPos += settings.game == `Retail` ? lootWindow.itemHeight + lootWindow.itemHeightAdd : lootWindow.itemHeight;
    }

    if(settings.useInt && itemsPicked.length > 1) {
      await moveTo({pos: cursorPos, randomRange: 5});
    }

    await sleep(350); // disappearing loot window delay
    if (settings.game == 'Leg' ? items.length != itemsPicked.length : await lootExitZone.isLootOpened(cursorPos)) {

      if (config.reaction) {
        await sleep(random(config.reactionDelay.from, config.reactionDelay.to));
      }

      if((config.closeLoot == `mouse` || config.closeLoot == `mouse+esc`) && lootWindow.exitButton) {
        if(config.closeLoot == `mouse`) {
          await moveTo({ pos: {
            x: cursorPos.x + lootWindow.exitButton.x,
            y: cursorPos.y - lootWindow.exitButton.y
          }, randomRange: 2});
          await mouse.toggle("left", true, delay);
          await mouse.toggle("left", false, delay);

          if(settings.useInt) {
            await moveTo({ pos: cursorPos, randomRange: 2 });
          }
        }

        if(config.closeLoot == `mouse+esc`) {
          if(random(0, 100) > 50) {
            await keyboard.sendKey("escape", delay);
          } else {
            await moveTo({ pos: {
              x: cursorPos.x + lootWindow.exitButton.x,
              y: cursorPos.y - lootWindow.exitButton.y
            }, randomRange: 2});
            await mouse.toggle("left", true, delay);
            await mouse.toggle("left", false, delay);

            if(settings.useInt) {
              await moveTo({ pos: cursorPos, randomRange: 2 });
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

  dynamicThreshold.on = config.dynamicThreshold && !settings.autoTh;
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
        await moveTo({ pos, randomRange: 5});

        if (config.shiftClick) {
          await keyboard.toggleKey("shift", true, delay);
          await mouse.toggle(config.catchFishButton, true, delay);
          await mouse.toggle(config.catchFishButton, false, delay);
          await keyboard.toggleKey("shift", false, delay);
        } else {
          await mouse.toggle(config.catchFishButton, true, delay);
          await mouse.toggle(config.catchFishButton, false, delay);
        }
      }

    await sleep(250);
    if (!(await notificationZone.check("warning")) && !pos.missedIntentionally) {
      caught = true;
      if (config.whitelist) {
          let itemsPicked = await pickLoot();
            if(itemsPicked.length > 0) {
              caught = itemsPicked.toString();
            }
      }
    }
    });
    if(!config.whitelist) {
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
      await sleep(config.hsKeyDelay * 1000);
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

  doAfterTimer.on = config.timer;
  doAfterTimer.timer = createTimer(() => config.timerTime * 1000 * 60);

  const checkConfirm = async () => {
    if(config.checkConfirm && !config.whitelist) {
      await sleep(250) // wait for the window to appear
      const needsConfirm = await checkRedButton(confirmationWindow);
      if(needsConfirm) {
        await action(async () => {
          await mouse.toggle('left', true, delay);
          await mouse.toggle('left', false, delay);
        });
      }
    }
  }

  return {
    checkConfirm,
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
    hookBobber
  };
};

module.exports = createBot;
