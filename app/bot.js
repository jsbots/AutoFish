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
     log.msg(`Looking for the window of the game...`);
     game = findGame(config.gameName);

     if(game) {
       log.ok(`Found the window!`);
       game.keyboard.keySenderDelay = [75, 250];
     } else {
       log.err(`Can't find the window of the game.`);
       throw new GameError();
     }

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

module.exports = bot;
