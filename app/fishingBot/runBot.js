const runBot = async (bot, log, state) => {
  const {castFishing, findBobber, checkBobber, isHooked} = bot;
  let attempts = 0;
  do {
      log.send(`Casting fishing...`);
      await castFishing(state);

      log.send(`Looking for the bobber...`);
      let bobber = findBobber();
      if(bobber) {
        log.ok(`Found the bobber!`);
        attempts = 0;
      } else {
        log.err(`Can't find the bobber, will try again.`);
        if(++attempts == 3) {
          throw new Error(`Have tried 3 attempts to find the bobber and failed: this place isn't good for fishing`);
        }
        continue;
      }

      log.send(`Checking the hook...`);
      if(bobber = await checkBobber(bobber, state)) {
        if(await isHooked(bobber)) {
          state.caught(() => log.ok(`Caught the fish!`));
          continue;
        }
      }

      state.miss(() => log.warn(`Missed the fish!`));
  } while(state.status == 'working');
  return state.showStats();
}

module.exports = runBot;
