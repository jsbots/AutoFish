const keysender = require("keysender");
const createGame = require("./createGame.js");
const Zone = require("../utils/zone.js");

const createState = (createBot, runBot) => {
  let state;
  return {
    async startBot(State, log, config) {
      log.send("Starting the bot...");

      const controls = createGame(keysender).findGame(config.game);
      log.ok(`Found the window of the game!`);

      const zone = Zone.from(controls.workwindow.getView());
      controls.workwindow.setForeground();

      return await runBot(
        createBot(controls, zone, config.patch.mop),
        log,
        state = new State()
      );
    },
    stopBot() {
      state.status = "stop";
    },
  };
};

module.exports = createState;
