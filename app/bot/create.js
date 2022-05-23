const keysender = require("keysender");
const createGame = require("../game/create.js");
const createWinSwitch = require("../game/winSwitch.js");

const { createLog, createIdLog } = require("../utils/logger.js");
const Zone = require("../utils/zone.js");
const EventLine = require("../utils/eventLine.js");

const bot = require("./bot.js");
const runBot = require("./run.js");


const createBot = () => {
  let states;
  return {
    async startBot(win, config, onError) {
      const log = createLog((data) => {
        win.webContents.send("log-data", data);
      });

      if (config.patch.timer) {
        setTimeout(() => {
          if(!states.every(({status}) => status == 'stop')) {
            onError();
          }
        }, config.patch.timer * 1000 * 60);
      }

      log.send("Starting the bot...");
      const games = createGame(keysender).findWindows(
        config.game,
        config.patch.control
      );
      if (!games) {
        log.err(`Can't find any window of the game!`);
        onError();
        return;
      } else {
        log.ok(
          `Found ${games.length} window${
            games.length > 1 ? `s` : ``
          } of the game!`
        );
      }

      states = [];
      const winSwitch = createWinSwitch(new EventLine());

      win.blur();
      for (const game of games) {

        const state = {
          status: "initial",
          startTime: Date.now(),
        };
        states.push(state);

        const logId = createIdLog(log);
        const zone = Zone.from(game.workwindow.getView());
        runBot(bot(game, zone, config.patch, winSwitch), logId, state).catch(
          (error) => {
            logId.err(`${error.message}`);
            state.status = "stop";
            if (states.every((state) => state.status == "stop")) {
              onError();
            }
          }
        );
      }
    },
    stopBot() {
      if (states) {
        states.forEach((state) => (state.status = "stop"));
      }
    },
  };
};

module.exports = createBot;
