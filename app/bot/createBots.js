const runBot = require("./runBot.js");
const createBot = require("./createBot.js");

const { convertMs } = require('../utils/time.js');
const Stats = require('./stats.js');

const { createIdLog } = require("../utils/logger.js");
const EventLine = require("../utils/eventLine.js");

const createWinSwitch = require("../game/winSwitch.js");

const createBots = (games, settings, config, log) => {
  const winSwitch = createWinSwitch(new EventLine());

  const bots = games.map((game, i) => {
    return {
      bot: createBot(game, { config: config.patch[settings.game], settings }, winSwitch),
      log: createIdLog(log, ++i),
      state: { status: "initial", startTime: Date.now() },
      stats: new Stats()
  }
  });

  return {
    startBots(onError) {
      log.send("Starting the bots...")
      if (settings.timer) {
        setTimeout(() => {
          if(!bots.every(({state}) => state.status == 'stop')) {
            onError();
            if(settings.timerQuit) {
              games.forEach(({workwindow}) => workwindow.close());
              log.ok('Closed all the windows...')
            }
          }
        }, settings.timer * 1000 * 60);
      }

      bots.forEach((bot) => {
        runBot(bot)
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
