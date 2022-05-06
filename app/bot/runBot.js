const runBot = async (bot, log, state) => {
  const {castFishing, findBobber, checkBobber, hookBobber} = bot;

  do {
      log.msg(`Casting fishing...`);
      await castFishing(state);

      log.msg(`Looking for the bobber...`);
      let bobber = findBobber();
      if(bobber) {
        log.msg(`Found the bobber!`)
      } else {
        log.err(`Can't find the bobber, will try again.`);
        continue;
      }

      log.msg(`Checking the hook...`);
      if(bobber = await checkBobber(bobber, state)) {
        if(await hookBobber(bobber)) {
          state.caught(log);
          continue;
        }
      }

      state.miss(log);
  } while(state.status == 'working');

  return state.showStats();
}

module.exports = runBot; 
