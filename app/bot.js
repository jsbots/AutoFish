const Rgb = require('./rgb.js');
const Display = require('./display.js');
const log = require('./logger.js');
const findGame require('./findGame.js');

const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

const isRed = ([r, g, b]) =>  {
  return (r - g > 20 && r - b > 20) && (g < 100 && b < 100);
};

const isYellow = ([r, g, b]) => {
  return r - b > 200 && g - b > 200;
};


const checkAround = (point, rgb) => {
  return point.getPointsAround(2)
  .map((point) => rgb.colorAt(point))
  .every((point) => isRed(point));
}

class PlaceError extends Error {
  constructor() {
    super();
    this.message = `This place isn't good for fishing. Change the place and avoid any red and yellow colors in the "fishing zone".`;
  }
};
class BobberError extends Error{
  constructor() {
    super();
    this.message = `Can't find the bobber, will try again...`;
  }
};
class BobberMiss extends Error{
  constructor() {
    super();
    this.message = `Couldn't catch the fish, will try again...`;
  }
};
class GameError extends Error{};

const bot = (() => {
  let game, zone, fishingKey, castDelay, maxFishTime;
  let stats = {caught: 0, miss: 0};
  let status = 'working';
  let isInitial = true;

  const getScreenData = (zone) => {
    return {data: Array.from(game.workwindow.capture(zone).data.values()),
            zone};
  }

  const checkNotification = (zone, colors) => {
    let rgb = Rgb.from(getScreenData(zone));
    return colors.some((color) => rgb.findColor(color));
  };

  const castFishing = async () => {
      log.msg('casting');
      game.keyboard.sendKey(fishingKey);
      if(isInitial) {
        await sleep(100);
        if(checkNotification(zone, [isRed, isYellow])) {
          throw PlaceError;
        } else {
          isInitial = false;
        }
      }
      await sleep(castDelay);
  };

  const findBobber = async () => {
    log.msg(`Looking for the bobber...`);
    let bobber = Rgb.from(getScreenData(zone)).findColor(isRed, checkAround);
    if(!bobber) {
      throw new BobberError();
    } else {
      log.msg(`Found the bobber!`)
      return bobber;
    }
  };

  const checkBobber = async (bobber) => {
    log.msg(`Checking the hook...`);
    let startTime = Date.now();

    while(status == 'working' && Date.now() - startTime < maxFishTime) {
      if(!isRed(game.workwindow.colorAt(bobber.x, bobber.y, 'array'))) {
       let redAround = bobber.getPointsAround()
       .find((point) => isRed(game.workwindow.colorAt(point.x, point.y, 'array')));

        if(!redAround) {
          return bobber;
        } else {
          bobber = redAround;
        }
      }

      await sleep(50);
    }

    throw new BobberMiss();
  };

  const hookBobber = async (bobber) => {
    await game.mouse.moveCurveToAsync(bobber.x, bobber.y, 2, 150);
    game.mouse.click('right', [75, 250]);

    await sleep(250);
    if(!checkNotification(zone, [isYellow])) {
      stats.caught++;
      log.ok('Caught the fish!');
    } else {
      throw new BobberMiss();
    }

    await sleep(1000 + Math.random() * 1000);
  };

  const checkErrors = async (error) => {
    if(!status) return;

    switch(true) {
      case error instanceof PlaceError : {
        log.err(error.message);
        status = null;
        throw new Error();
      }

      case error instanceof BobberError: {
        log.err(error.message);
        return;
      }

      case error instanceof BobberMiss: {
        log.warn(error.message);
        stats.miss++;
        await sleep(2000 + Math.random() * 1000);
        return;
      }
     }

     log.err(error.message);
     throw error;
   };

  const showStats = () => {
     let total = stats.caught + stats.miss;
     log.ok(`Done!
       Total: ${total}
       Caught: ${stats.caught}
       Missed: ${stats.miss}`,
     'caught');
   };


  const start = async (config) => {
     log.setWin(config.win);

     game = findGame(config.gameName, log);
     game.keyboard.keySenderDelay = [75, 250];

     zone = Display.create(game.workwindow.getView()).getRel(...config.zone);
     fishingKey = config.fishingKey;
     castDelay = config.castDelay;
     maxFishTime = config.maxFishTime;

     config.win.blur();
     game.workwindow.setForeground();

     while(status == 'working') {
       try {
         await castFishing();
         await hookBobber(await checkBobber(await findBobber()));
       } catch(e) {
         await checkErrors(e);
       }
     }
     log.msg('Bot was stopped.')
     showStats();
   };

  return { start,
           stop(stopApp) {
             status = null;
             stopApp();
           }};
})();

const checkNotification = (zone, colors) => {
  let rgb = Rgb.from(getScreenData(zone));
  return colors.some((color) => rgb.findColor(color));
};

const getScreenData = (game, zone) => {
  return {data: Array.from(game.workwindow.capture(zone).data.values()),
          zone};
};

const superBot = (game, log, config) => {

  const zone = Display.create(game.workwindow.getView()).getRel(...config.zone);

    const castFishing = async (state) => {
        let {fishingKey, castDelay} = config;
        log.msg('casting');
        game.keyboard.sendKey(fishingKey);
        if(state.status == 'initial') {
          await sleep(100);
          if(checkNotification(zone, [isRed, isYellow])) {
            throw PlaceError;
          } else {
            state.status = 'working';
          }
        }
        await sleep(castDelay);
    };

    const findBobber = async () => {
      log.msg(`Looking for the bobber...`);
      let bobber = Rgb.from(getScreenData(zone)).findColor(isRed, checkAround);
      if(!bobber) {
        throw new BobberError();
      } else {
        log.msg(`Found the bobber!`)
        return bobber;
      }
    };

    const checkBobber = async (bobber, state) => {
      log.msg(`Checking the hook...`);
      let startTime = Date.now();

      while(state.status == 'working' && Date.now() - startTime < maxFishTime) {
        if(!isRed(game.workwindow.colorAt(bobber.x, bobber.y, 'array'))) {
         let redAround = bobber.getPointsAround()
         .find((point) => isRed(game.workwindow.colorAt(point.x, point.y, 'array')));

          if(!redAround) {
            return bobber;
          } else {
            bobber = redAround;
          }
        }

        await sleep(50);
      }

      throw new BobberMiss();
    };

    const hookBobber = async (bobber, state) => {
      await game.mouse.moveCurveToAsync(bobber.x, bobber.y, 2, 150);
      game.mouse.click('right', [75, 250]);

      await sleep(250);
      if(!checkNotification(zone, [isYellow])) {
        state.stats.caught++;
        log.ok('Caught the fish!');
      } else {
        throw new BobberMiss();
      }

      await sleep(1000 + Math.random() * 1000);
    };

    const checkErrors = async (error, state) => {
      if(!status) return;

      switch(true) {
        case error instanceof PlaceError : {
          log.err(error.message);
          status = null;
          throw new Error();
        }

        case error instanceof BobberError: {
          log.err(error.message);
          return;
        }

        case error instanceof BobberMiss: {
          log.warn(error.message);
          state.stats.miss++;
          await sleep(2000 + Math.random() * 1000);
          return;
        }
       }

       log.err(error.message);
       throw error;
     };

     return {
       async runBot(state) {
         do {

         } while(state.status == 'working');
       }
     }
};



const createBot = async (bot, log, config) => {
  const state = {status: 'initial',
                 stats: {caught: 0, miss: 0},
                 showStats() {
                   return `Done!
                     Total: ${this.stats.caught + this.stats.miss}
                     Caught: ${this.stats.caught}
                     Missed: ${this.stats.miss}`,
                   'caught'
                 }
                };
  return {
    async start() {
      const log = Log.setWin(win);
      const game = findGame(config.gameName, log);
      const runBot = bot(game, log, config);

      win.blur();
      game.keyboard.keySenderDelay = [75, 250];
      game.workwindow.setForeground();

      return await runBot(state).then(() => log.ok(state.showStats()));
    },

    stop(stopApp) {
      state.status = 'stopped';
      stopApp();
    }
  }
}



module.exports = bot;
