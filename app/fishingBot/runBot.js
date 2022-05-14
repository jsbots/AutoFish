const runBot = async (bot, log, state, winSwitch) => {
  const {castFishing, findBobber, checkBobber, hookBobber, gameWindow} = bot;
  findBobber.attempts = 0;
  do {
      log.send(`Casting fishing...`);

      await winSwitch.reg(() => {
        gameWindow.setForeground();
      })
      await castFishing(state);
      winSwitch.unreg();

      log.send(`Looking for the bobber in...`);
      let bobber = findBobber();
      if(bobber) {
        log.ok(`Found the bobber!`);
        findBobber.attempts = 0;
      } else {
        log.err(`Can't find the bobber, will try again.`);
        if(++findBobber.attempts == 3) {
          throw new Error(`Have tried 3 attempts to find the bobber and failed: this place isn't good for fishing`);
        }
        continue;
      }

      log.send(`Checking the hook...`);
      if(bobber = await checkBobber(bobber, state)) {

        await winSwitch.reg(() => {
          gameWindow.setForeground();
        })
        let isHooked = await hookBobber(bobber);
        winSwitch.unreg();

        if(isHooked) {
          state.caught(() => log.ok(`Caught the fish!`));
          continue;
        }
      }

      state.miss(() => log.warn(`Missed the fish!`));
  } while(state.status == 'working');
  return state.showStats();
}

module.exports = runBot;
