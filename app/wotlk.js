const {Virtual, Hardware, getAllWindows} = require('keysender');
const Rgb = require('./rgb.js');
const Display = require('./display.js');
const log = require('./logger.js');

let options;
const delay = [75, 250];


const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

const findGame = (name) => {
      const win = getAllWindows().find(({title, className}) => {
      if(new RegExp(name).test(title) &&
        (className == `GxWindowClass` || className == `GxWindowClassD3d`)) {
          return true;
        }
      });

      if(win) {
        return new Hardware(win.handle);
      }
};

const isRed = ([r, g, b]) =>  {
  return (r - g > 20 && r - b > 20) && (g < 100 && b < 100);
};
const isYellow = ([r, g, b]) => {
  return r - b > 200 && g - b > 200;
};
const isGreen = ([r, g, b]) => {
  return g - r > 150 && g - b > 150;
};

/*

const getFish = async (bobber, fishZone) => {
    await m.moveCurveToAsync(bobber.x, bobber.y, 2, 150);
    m.click('right', delay);

    await sleep(250); // wait 250ms for yellow warning to appear

    let isGotAway = fishZone.findColor(isYellow);
    let waitTime = isGotAway ? 1000 : 2000;
    await sleep(waitTime + Math.random() * 1000);
    return !isGotAway;
};

const checkBobber = async (bobber, rgb) => {
    log.msg(`Checking the hook...`)
    let startTime = Date.now();

    while(state) {
      rgb = rgb.update();
      let bobberColor = rgb.colorAt(bobber.x, bobber.y);
      if(!isRed(bobberColor)) {
       bobber = bobber.getAround(2)
       .find((point) => isRed(rgb.colorAt(point.x, point.y)));

        if(!bobber) {
          return true;
        }
      }

      if(timeOut(startTime, 30)) {
        log.warn(`30 seconds have passed, casting again!`);
        return false;
      }

      await sleep(50);
    }
}

*/


class RandomMove {
  constructor(time, key) {
      this.timer = time;
      this.key = key;
  }

  check(timeNow) {
    if(timeNow >= this.timer) {
      return true;
    }
  }

  async move() {
    m.toggle(true, "right");
    await sleep(100);
    k.toggleKey(this.key, true);
    await sleep(100);
    k.toggleKey(this.key, false);
    await sleep(100);
    m.toggle(false, "right");
  }

  static create(timer, key) {
    timer = (Math.random() * timer) * 60 * 1000;
    return new RandomMove(Date.now() + timer, key);
  }
}


const aroundToo = (point, rgb) => {
  return point.getAround(2)
  .map((point) => rgb.colorAt(point))
  .every((point) => isRed(point));
}

class PlaceError extends Error{};
class BobberError extends Error{};
class BobberMiss extends Error{};
class GameError extends Error{};

let maxFishTime = 30000;

const bot = (game, log, {fishingKey, castDelay}) => {
  let {workwindow, mouse, keyboard} = game;
  let zone = Display.create(workwindow.getView()).rel(.300, .010, .400, .416);

  let stats = {caught: 0, miss: 0};
  let status = 'working';
  let isInitial = true;

  const getScreenData = (zone) => {
    return {data: Array.from(workwindow.capture(zone).data.values()),
            zone};
  }

  const castFishing = async () => {
      keyboard.sendKey(fishingKey);
      log.msg(`Casting...`);

      if(isInitial) {
        await sleep(250);
        let rgb = Rgb.from(getScreenData(zone));
        if(rgb.findColor(isRed) || rgb.findColor(isYellow)) {
          throw new PlaceError();
        }
        isInitial = false;
      }

      await sleep(castDelay);
  };

  const findBobber = async () => {
    log.msg(`Looking for the bobber...`);
    let bobber = Rgb.from(getScreenData(zone)).findColor(isRed, aroundToo);
    if(!bobber) {
      throw new BobberError();
    } else {
      log.ok(`Found the bobber!`)
      return bobber;
    }
  };

  const checkBobber = async (bobber) => {
    log.msg(`Checking the hook...`);
    let startTime = Date.now();

    while(status == 'working' && Date.now() - startTime < maxFishTime) {
      if(!isRed(workwindow.colorAt(bobber.x, bobber.y, 'array'))) {
       let redAround = bobber.getAround()
       .find((point) => isRed(workwindow.colorAt(point.x, point.y, 'array')));

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
    await mouse.moveCurveToAsync(bobber.x, bobber.y, 2, 150);
    mouse.click('right', delay);

    await sleep(250);
    if(!Rgb.from(getScreenData(zone)).findColor(isYellow)) {
      stats.caught++;
      log.ok('Caught the fish!');
    } else {
      throw new BobberMiss();
    }

    await sleep(1000 + Math.random() * 1000);
  };

  const checkErrors = async (error) => {
    switch(true) {
      case error instanceof PlaceError : {
        log.err(`This place isn't good for fishing. Change the place and avoid any red and yellow colors in the "fishing zone".`);
        status = null;
      }

      case error instanceof BobberError: {
        log.err(`Can't find the bobber, will try again...`);
        return;
      }

      case error instanceof BobberMiss: {
        log.warn(`Couldn't catch the fish, will try again...`);
        stats.miss++;
        await sleep(2000 + Math.random() * 1000);
        return;
      }
     }

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


  const start = async () => {
     while(status == 'working') {
       try {
         await castFishing();
         await hookBobber(await checkBobber(await findBobber()));
       } catch(e) {
         await checkErrors(e);
       }
     }
     showStats();
   };

  return { start,
           stop() { status = null } };
};

class Bot {
  constructor() {
    this.bot = null;
  }

  async start(win) {
    log.setWin(win);
    log.msg(`Looking for the window of the game...`);
    const game = findGame('World of Warcraft');

    if(game) {
      log.ok(`Found the window!`);
    } else {
      log.err(`Can't find the window of the game.`);
      throw new GameError();
    }

    game.mouse.buttonTogglerDelay = delay; // ?
    game.keyboard.keyTogglerDelay = delay; // ?
    game.keyboard.keySenderDelay = delay; // ?

    let fishingKey = '2';
    let castDelay = 1500;

    let config = {
      fishingKey,
      castDelay
    }

    this.bot = bot(game, log, config);

    win.blur();
    game.workwindow.setForeground();
    return await this.bot.start();
  }

  stop(stopApp) {
      this.bot.stop();
      stopApp();
  }
}


module.exports = new Bot();


/*
const startTheBot = exports.startTheBot = async (options) => {

  const {workwindow, mouse, keyboard} = findTheGame(`World of Warcraft`);
  w = workwindow;
  m = mouse;
  k = keyboard;

  m.buttonTogglerDelay = delay;
  k.keyTogglerDelay = delay;
  k.keySenderDelay = delay

  const display = Display.create(w.getView());
  log = Log.bindTo(electronWin);

  w.setForeground();

  let fishingKey = '2';
  let castDelay = 1500;
  let fishZone =  display.rel(.300, .010, .400, .416);

  let config = {
    fishingKey,
    castDelay,
    fishZone
  }

  const stats = await startFishingNew(config);


  showStats(stats);
  if(state) {
    return true;
  }


  return true;
};
*/


/*
const startFishing = async ({fishingKey, castDelay, fishZone}) => {
  const stats = { caught: 0, ncaught: 0 };

  let random = RandomMove.create(1, 'd');

  for(;state;) {

    await castFishing(fishingKey, castDelay);
    let fishZoneRgb = Rgb.from(fishZone);
    let bobber = fishZoneRgb.findColor(isRed, aroundToo);

    if(bobber) {
      let hooked = await checkBobber(bobber, fishZoneRgb);
      if(hooked) {
        let caught = await getFish(bobber.plus(fishZone), fishZoneRgb);
        if(caught) {
          log.ok(`Hooked the fish!`);
          stats.caught++;
        } else {
          log.warn(`No fish are hooked.`);
          stats.ncaught++;
        }
      } else {
        if(state) { stats.ncaught++; };
      }
    } else {
      log.err("Didn't find bobber, will /cast fishing again!");
    }

    if(random.check(Date.now())) {
      await random.move()
      random = RandomMove.create(1, random.key == 'd' ? 'a' : 'd')
    }

    if(Date.now() - options.startTime > options.timer || !state) { return stats; }
  }
}
*/
