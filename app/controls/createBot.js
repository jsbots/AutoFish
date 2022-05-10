const keysender = require('keysender');
const createGame = require('./createGame.js');
const Zone = require('../utils/zone.js');

const createBot = (bot, state, runBot) => {
  return {
    async startBot(log, config) {
      log.send('Starting the bot...');

      const controls = createGame(keysender).findGame(config.game);
      log.ok(`Found the window of the game!`);

      const zone = Zone.from(controls.workwindow.getView());
      bot = bot(controls, zone, config.patch.mop);

      controls.workwindow.setForeground();
      return await runBot(bot, log, state);
    },
    stopBot() {
      state.status = 'stop';
    }
  }
};

module.exports = createBot;
