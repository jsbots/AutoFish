const {Virtual, Hardware, getAllWindows} = require('keysender');

// GLOBALS //

let w, m, k, options, log;
let state = false;
const delay = [75, 250];

// END OF GLOBALS //


class Vec{
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  plus(vec) {
    return new Vec(this.x + vec.x, this.y + vec.y);
  }

  get dist() {
    return Math.sqrt(Math.pow(Math.abs(this.x), 2) + Math.pow(Math.abs(this.y), 2));
  }

  checkAround(size) {
    let aroundPoint = [];
    for(let y = this.y - size; y <= this.y + size; y++) {
      for(let x = this.x - size; x <= this.x + size; x++) {
          let point = new Vec(x, y);
          if(point.x != this.x && point.y != this.y) {
            aroundPoint.push(point);
          }
      }
    }
    return aroundPoint;
  };
}


class Display {
  constructor({x, y, width, height}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  rel(x, y, width, height) {
    return new Display({
      x: Math.floor(this.width * x),
      y: Math.floor(this.height * y),
      width: Math.floor(this.width * width),
      height: Math.floor(this.height * height)
    });
  }

  findColor (color, task) {
  let rgb = Array.from(w.capture(this).data.values());
  for (let y = 0, i = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++, i += 4) {
      let r = rgb[i];
      let g = rgb[i + 1];
      let b = rgb[i + 2];
      if(color([r, g, b])) {
          let result = new Vec(this.x + x, this.y + y);
          if(!task || task(result)) {
            return result;
          }
        }
      }
    }
  }

  static create(scr) {
    return new Display(scr);
  }
}


const getCurrentTime = () => {
  let date = new Date();
  let times = {hr: date.getHours(),min: date.getMinutes(), sec: date.getSeconds()};
  for(let time of Object.keys(times)) {
    times[time] = times[time].toString();
    if(times[time].length < 2) {
      times[time] = times[time].padStart(2, `0`);
    }
  }

  return times;
};

const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

const findTheGame = (name) => {
  log.msg(`Looking for the window of the game...`);

  try {
    const {handle, className} = getAllWindows().find(({title, className}) => {
      if(new RegExp(name).test(title) &&
        (className == `GxWindowClass` || className == `GxWindowClassD3d`)) {
          return true;
        }
      });

      log.ok(`Found the window!`);
      return new Hardware(handle);
    } catch(e) {
      throw new Error(`Can't find the window of the game.`);
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



const castFishing = async (fishingKey, castDelay) => {
    log.msg(`Casting...`);
    k.sendKey(fishingKey);
    await sleep(castDelay);
};


const getFish = async (bobber, fishZone) => {
    await m.moveCurveToAsync(bobber.x, bobber.y, 2, 150);
    m.click('right', delay);

    await sleep(250); // wait 250ms for yellow warning to appear

    let isGotAway = fishZone.findColor(isYellow);
    let waitTime = isGotAway ? 1000 : 2000;
    await sleep(waitTime + Math.random() * 1000);
    return !isGotAway;
};

const timeOut = (timeBefore, timer) => {
  return Date.now() - timeBefore > (timer * 1000);
};

const checkHook = async (feather, zone) => {
    log.msg(`Checking the hook...`)
    let startTime = Date.now();

    while(state) {
      let featherColor = w.colorAt(feather.x, feather.y, 'array');
      if(!isRed(featherColor)) {
       feather = feather.checkAround(2)
       .find((point) => isRed(w.colorAt(point.x, point.y, 'array')));

       if(!feather) {
         return true;
       }
      }

      if(timeOut(startTime, 30)) {
        log.warn(`30 seconds have passed, casting again!`);
        return false
      }

      await sleep(50);
    }
}


const startTheBot = async (mainOptions, mainLog) => {
  options = mainOptions;
  log = mainLog;

  state = true;

  const {workwindow, mouse, keyboard} = findTheGame(`World of Warcraft`);
  w = workwindow;
  m = mouse;
  k = keyboard;

  m.buttonTogglerDelay = delay;
  k.keyTogglerDelay = delay;
  k.keySenderDelay = delay

  const display = Display.create(w.getView());

  w.setForeground();
  const stats = await startFishing(display);
  showStats(stats);
  if(state) {
    return true;
  }
};

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

const colorsAround = (point) => {
  return point.checkAround(2)
  .map((point) => w.colorAt(point.x, point.y))
  .some((point) => !isRed(point));
}

const startFishing = async (display) => {
  const stats = { caught: 0, ncaught: 0 };
  const fishZone = display.rel(.300, .010, .400, .416);
  let fishingKey = '2';
  let castDelay = 1500;

  let random = RandomMove.create(1, 'd');

  for(;;) {
    const initial = !stats.caught && !stats.ncaught;

    await castFishing(fishingKey, castDelay);
    let bobber = fishZone.findColor(isRed, colorsAround);
    if(bobber) {
      let hooked = await checkHook(bobber, fishZone);
      if(hooked) {
        let caught = await getFish(bobber, fishZone);
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

const showStats = (stats) => {
  let total = stats.caught + stats.ncaught;
  log.ok(`Done!
    Total: ${total}
    Caught: ${stats.caught}
    Missed: ${stats.ncaught}`,
  'caught');
};

const stopTheBot = () => {
  state = false;
};

module.exports = {
  startTheBot,
  stopTheBot
};
