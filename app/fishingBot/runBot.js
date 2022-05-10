const runBot = async (bot, log, state) => {
  const {castFishing, findBobber, checkBobber, isHooked} = bot;

  do {
      log.send(`Casting fishing...`);
      await castFishing(state);

      log.send(`Looking for the bobber...`);
      let bobber = findBobber();
      if(bobber) {
        log.ok(`Found the bobber!`)
      } else {
        log.err(`Can't find the bobber, will try again.`);
        continue;
      }

      log.send(`Checking the hook...`);
      if(bobber = await checkBobber(bobber, state)) {
        if(await isHooked(bobber)) {
          state.caught(log);
          continue;
        }
      }

      state.miss(log);
  } while(state.status == 'working');

  return state.showStats();
}

module.exports = runBot;
