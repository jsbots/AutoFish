const runBot = async ({ bot, log, state, stats }, onError, wins) => {
  const {
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
    doAfterTimer,
  } = bot;

  const sleep = (time) => {
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  };

  const random = (from, to) => {
    return from + Math.random() * (to - from);
  };

  let failedCast = false;
  let attempts = 0;
  do {
    if (state.status == "initial") {
      log.send(`Preliminary checks...`);
      await preliminaryChecks();
      log.ok(`Everything is fine!`);
      if(randomSleep.on) {
        randomSleep.timer.start();
      }

      if(logOut.on) {
        logOut.timer.start();
      }

      if(doAfterTimer.on) {
        doAfterTimer.timer.start();
      }
    }

    if(doAfterTimer.on && state.status == "working" && doAfterTimer.timer.isElapsed()) {
     await doAfterTimer(onError, wins);
    }

    if(logOut.on && logOut.timer.isElapsed()) {
      log.send(`Logging out...`)
      await logOut(state);
      if(state.status == 'stop') {
        return;
      }
      log.send(`Logged back!`);
      logOut.timer.update();
    }

    if (randomSleep.on && randomSleep.timer.isElapsed()) {
      log.send(`Sleeping...`);
      await randomSleep();
      if(state.status == 'stop') {
        return;
      }
      randomSleep.timer.update();
    }

    if (applyLures.on && applyLures.timer.isElapsed()) {
      log.send(`Applying lures...`);
      await applyLures();
      applyLures.timer.update();
    }

    findBobber.memory = await findAllBobberColors();


    if(failedCast) {
      let randomFailed = random(500, 5000);
      log.warn(`Sleeping for ${Math.floor(randomFailed)} ms.`)
      await sleep(randomFailed);
    }
    log.send(`Casting fishing...`);
    await castFishing(state);

    log.send(`Looking for the bobber...`);
    let bobber = await findBobber();

    if(bobber) {
      bobber = await highlightBobber(bobber);
    }

    if (bobber) {
      failedCast = false;
      log.ok(`Found the bobber!`);
      attempts = 0;
    } else {
      failedCast = true;
      log.err(`Can't find the bobber, recast.`);
      if (++attempts == findBobber.maxAttempts) {
        if(dynamicThreshold.on && !dynamicThreshold.limit()) {
          dynamicThreshold();
          attempts = 0;
        } else {
          throw new Error(
            `Have tried ${findBobber.maxAttempts} attempts to find the bobber and failed: decrease the red color "threshold" value or change the fishing place.`
          );
        }
      }
      continue;
    }

    log.send(`Checking the hook...`);
    if ((bobber = await checkBobber(bobber, state))) {
      let isHooked = await hookBobber(bobber);
      if (isHooked) {
        stats.caught++;
        log.ok(`Caught ${typeof isHooked == `boolean` ? `the fish!` : isHooked}`);
        continue;
      }
    }

    if (state.status == "working") {
      stats.miss++;
      log.warn(`Missed the fish!`);
    }
  } while (state.status == "working");
};

module.exports = runBot;
