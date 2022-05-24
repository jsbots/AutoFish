const runBot = require("./runBot.js");

const minToMs = (min) => {
  return min * 1000 * 60;
};

const createStates = () => {
  let states;
  return {
    async startStates(bots, settings, onError) {
      states = [];
      if (settings.timer) {
        setTimeout(() => {
          if(!states.every(({status}) => status == 'stop')) {
            onError();
          }
        }, minToMs(settings.timer));
      }

      bots.forEach(({bot, log, state}) => {
        states.push(state);
        runBot(bot, log, state).catch((error) => {
            log.err(`${error.message}`);
            state.status = "stop";
            if (states.every((state) => state.status == "stop")) {
              onError();
            }
        });
      })
    },
    stopStates() {
      states.forEach((state) => state.status = "stop");
    },
  };
};

module.exports = createStates;
