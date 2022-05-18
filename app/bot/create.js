const keysender = require("keysender");
const createGame = require("../game/create.js");
const createWinSwitch = require('../game/winSwitch.js');

const { createLog, bindLogToID } = require("../utils/logger.js");
const Zone = require("../utils/zone.js");
const EventLine = require('../utils/eventLine.js');

const bot = require("./bot.js");
const runBot = require("./run.js");


const createBot = () => {
  let state = {
    status: 'initial',
    startTime: null
  };
  return {
    async startBot(win, config, onError) {
      const log = createLog((data) => {
        win.webContents.send("log-data", data);
      });

      log.send("Starting the bot...");
      const games = createGame(keysender).findWindows(config.game);
      if (!games) {
        log.err(`Can't find any window of the game!`);
        onError();
        throw new Error;
      } else {
        log.ok(`Found ${games.length} window${games.length > 1 ? `s` : ``} of the game!`)
      }

      const winSwitch = createWinSwitch(new EventLine());

      win.blur();

      let id = 0;
      for (const game of games) {
        const zone = Zone.from(game.workwindow.getView());
        runBot(bot(game, zone, config.patch, winSwitch), bindLogToID(log, ++id), state)
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
