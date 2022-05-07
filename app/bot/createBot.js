const State = require('./state.js');
const findGame = require('../controls/findGame.js');
const fishingBot = require('./fishingBot.js');
const runBot = require('./runBot.js');

const createBot = () => {
  let state;
  return {
    async start(log, config) {
      const controls = findGame(config.game);
      log.ok(`Found the window!`);
      controls.workwindow.setForeground();

      return await runBot(
        fishingBot(controls, config.patch.vanilla),
        log,
        state = new State
      );
    },

    stop(stopApp) {
      state.status = 'stop';
      stopApp();
    }
  }
}

module.exports = createBot;
