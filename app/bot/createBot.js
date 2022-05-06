const findGame = require('../controls/findGame.js');
const fishingBot = require('./fishingBot.js');
const Display = require('../utils/display.js');
const State = require('./state.js');
const runBot = require('./runBot.js');

const createBot = () => {
  let state;
  return {
    async start(log, config) {

      const game = findGame(config.game);
      if(game) {
        log.ok(`Found the window!`);
        game.keyboard.keySenderDelay = config.bot.delay;
        game.workwindow.setForeground();
      }

      const gameWindowSize = game.workwindow.getView();
      const fishingZone = Display.from(gameWindowSize).getRel(config.bot.relZone);
      const bot = fishingBot(game, fishingZone, config.bot);

      return await runBot(bot, log, state = new State);
    },

    stop(stopApp) {
      state.status = 'stop';
      stopApp();
    }
  }
}


module.exports = createBot;
