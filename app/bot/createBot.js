const State = require('./state.js');
const findGame = require('../controls/findGame.js');
const runBot = require('./runBot.js');

const createBot = (bot) => {
  const state = new State;
  return {
    startBot(log, config) {
      log.send('Starting the bot...');

      const controls = findGame(config.game);
      log.ok(`Found the window of the game!`);

      controls.workwindow.setForeground();

      return runBot(bot(controls, config.patch.mop), log, state)
    },
    stopBot() {
      state.status = 'stop';
    }
  }
};

module.exports = createBot;
