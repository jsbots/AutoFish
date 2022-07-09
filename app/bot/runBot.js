const runBot = async ({ bot, log, state, stats }) => {
  const {
    preliminaryChecks,
    findAllBobberColors,
    randomSleep,
    applyLures,
    castFishing,
    findBobber,
    highlightBobber,
    checkBobber,
    hookBobber,
  } = bot;

  let attempts = 0;
  do {
    if (state.status == "initial") {
      log.send(`Preliminary checks...`);
      preliminaryChecks();
      log.ok(`Everything is fine!`);
      if(randomSleep.on) {
        randomSleep.timer.start();
      }
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
      applyLures.timer.start();
    }

    findBobber.memory = findAllBobberColors();

    log.send(`Casting fishing...`);
    await castFishing(state);

    log.send(`Looking for the bobber...`);
    let bobber = findBobber();

    if(bobber) {
      bobber = await highlightBobber(bobber);
    }

    if (bobber) {
      log.ok(`Found the bobber!`);
      attempts = 0;
    } else {
      log.err(`Can't find the bobber, recast.`);
      if (++attempts == findBobber.maxAttempts) {
        throw new Error(
          `Have tried ${findBobber.maxAttempts} attempts to find the bobber and failed: decrease the red color "threshold" value or change the fishing place.`
        );
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
