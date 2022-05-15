const keysender = require("keysender");
const createGame = require("../game/create.js");

const { createLog, bindLogToID } = require("../utils/logger.js");
const createWinSwitch = require('../utils/createWinSwitch.js');

const bot = require("./bot.js");
const runBot = require("./run.js");
const State = require("./state.js");

const Zone = require("../utils/zone.js");
const EventLine = require('../utils/eventLine.js');

const createBot = () => {
  let state;
  return {
    async startBot(win, config, onError) {
      const log = createLog((data) => {
        win.webContents.send("log-data", data);
      });

      log.send("Starting the bot...");
      const games = createGame(keysender).findWindows(config.game);
      if (!games) {
        log.err(`Can't find any window of the game!`);
        return onError();
      } else {
        log.ok(`Found ${games.length} window${games.length > 1 ? `s` : ``} of the game!`)
      }

      const winSwitch = createWinSwitch(new EventLine());
      state = new State();

      win.blur();

      let id = 0;
      for (const game of games) {
        const zone = Zone.from(game.workwindow.getView());
        runBot(bot(game, zone, config.patch.mop), bindLogToID(log, ++id), state, winSwitch)
          .then((stats) => log.ok(stats))
          .catch((error) => {
            log.err(`${(error.message, error.stack)}`);
            onError();
          });
      }
    },
    stopBot() {
      if (state) {
        state.status = "stop";
      }
    },
  };
};

module.exports = createBot;
