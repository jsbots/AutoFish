const getGameControls = require('../controls/getGameControls.js');
const fishingBot = require('./fishingBot.js');


class State {
  constructor() {
    this.status = 'initial';
    this.stats = {caught: 0, miss: 0};
    this.time = Date.now();
  }

  showStats() {
    return `
      Total: ${this.stats.caught + this.stats.miss},
      Caught: ${this.stats.caught},
      Missed: ${this.stats.miss},
      Time Passed: ${(Date.now() - this.time) / 1000} sec
      `
  }
}


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
        log.err(`Can't find the bobber, will try again...`);
        continue;
      }

      log.msg(`Checking the hook...`);
      if(bobber = await checkBobber(bobber, state)) {
        if(await hookBobber(bobber)) {
          state.stats.caught++
          log.ok('Caught the fish!');
          continue;
        }
      }

      if(state.status == 'working') {
        state.stats.miss++
        log.warn(`Missed the fish!`)
      }

  } while(state.status == 'working');

  return state.showStats();
}


const createBot = () => {
  let state;
  return {
    async start(log, config) {

      const game = getGameControls(config.game.name);
      if(game) log.ok(`Found the window!`);
      const bot = fishingBot(game, config.bot);

      game.keyboard.keySenderDelay = config.bot.delay;
      game.workwindow.setForeground();

      return await runBot(bot, log, state = new State);
    },

    stop(stopApp) {
      state.status = 'stop';
      stopApp();
    }
  }
}


module.exports = createBot;
