const runBot = require("./runBot.js");
const createBot = require("./createBot.js");

const { convertMs } = require('../utils/time.js');
const Stats = require('./stats.js');

const { createIdLog } = require("../utils/logger.js");
const EventLine = require("../utils/eventLine.js");
const { setWorker } = require("../utils/textReader.js");

const createWinSwitch = require("../game/winSwitch.js");
const { app } = require("electron");

const createBots = async (games, settings, config, log) => {
  const winSwitch = createWinSwitch(new EventLine());

  if(settings.whitelist) {
    log.send(`Downloading data for ${settings.whitelistLanguage} language, it might take a while...`)
    await setWorker(settings.whitelistLanguage);
  }

  if(true) {
    games = [games[0]];
  }

  const bots = games.map((game, i) => {
    let state = { status: "initial", startTime: Date.now() };
    return {
      bot: createBot(game, {config: config.patch[settings.game], settings}, winSwitch, state),
      log: createIdLog(log, ++i),
      state,
      stats: new Stats()
  }
  });

  return {
    startBots(onError) {
      log.send("Starting the bots...")

      bots.forEach((bot) => {
        runBot(bot, onError, bots)
        .then(() => {
            log.setState(true);
            bot.stats.show().forEach((stat) => bot.log.ok(stat));
            bot.log.ok(`Time Passed: ${convertMs(Date.now() - bot.state.startTime)}`);
        })
        .catch((error) => {
            bot.state.status = "stop";
            if (bots.every(({state}) => state.status == "stop")) {
              onError();
            }
            log.setState(true);
            bot.log.err(`${error.message}`);

            bot.stats.show().forEach((stat) => bot.log.ok(stat));
            bot.log.ok(`Time Passed: ${convertMs(Date.now() - bot.state.startTime)}`);
        });
      })
    },
    stopBots() {
      log.send('Stopping the bots...')
      log.setState(false);
      bots.forEach(({state}) => state.status = "stop");
    },
  };
};

module.exports = createBots;
