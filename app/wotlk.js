const {Virtual, Hardware, getAllWindows} = require('keysender');
const pixels = require('image-pixels');

// GLOBAL //

let w, m, k, options, log;
let state = false;
const delay = 150;
const test = false;

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

  click(repeat = 1, button) {
    m.moveTo(this.x, this.y, delay);
    for(let i = 0; i < repeat; i++) {
      m.click(button, delay, delay)
    }
  }

  get colorNow() {
    return w.colorAt(this.x, this.y, 'array');
  }
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

  async findColor (color, cond) {
    let {data: rgb} = await pixels(w.capture(this).data,
                      {width: this.width, height: this.height});

  for (let y = 0, i = 0; y < this.height; y++) {
    for (let x = 0; x < this.width; x++, i += 4) {
      let r = rgb[i];
      let g = rgb[i + 1];
      let b = rgb[i + 2];
      if(color([r, g, b])) {
        let result = new Vec(this.x + x, this.y + y);
          if(!cond || cond(result)) {
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
      return new Virtual(handle);
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



const castFishing = async (castZone, initial) => {
    log.msg(`Casting...`);

    k.sendKey('enter');
    k.printText('/cast fishing', 0);
    k.sendKey('enter');

    await sleep(1500);

    if(initial && !await castZone.findColor(isGreen)) {
      throw new Error(`Please, find another place for fishing.`);
    }
};

const gotAway = async (fishZone) => {
  return await fishZone.findColor(isYellow);
};

const getFish = (bobber, stats, fishZone) => {
  return new Promise(async (resolve, reject) => {
    bobber.click(1, 'right');
    await sleep(250); // wait 250ms for yellow warning to appear

    if(!await gotAway(fishZone)) {
      log.ok(`Hooked the fish!`)
      stats.caught++
    } else {
      log.warn(`No fish are hooked.`)
      stats.ncaught++
      setTimeout(resolve, 1000); // wait 1s if we didn't catch a fish
    }

    setTimeout(resolve, 2500); // wait 2.5s until bobber fully disappear
  });
};

const timeOut = (timeBefore, timer) => {
  return Date.now() - timeBefore > (timer * 1000);
};

const checkHook = async (feather) => {
    log.msg(`Waiting for fish to be hooked...`)
    let startTime = Date.now();
    for(;state;) {
      if(isRed(feather.colorNow)) {
      } else if(feather = checkAround(feather)) {
      } else {
        return true;
      }

      m.moveTo(feather.x, feather.y);

      if(timeOut(startTime, 30)) {
        log.warn(`30 seconds have passed, but didn't catch the fish. Will /cast fishing again!`);
        return false
      }

      await sleep(100);
    }
}

const checkAround = (center) => {
  for(let y = center.y - 1; y <= center.y + 1; y++) {
    for(let x = center.x - 1; x <= center.x + 1; x++) {
        let point = new Vec(x, y);
        if(point.x != center.x &&
           point.y != center.y &&
           isRed(point.colorNow)) {
          return point;
        }
    }
  }
};

const fullCheckAround = (center) => {
  for(let y = center.y - 2; y <= center.y + 2; y++) {
    for(let x = center.x - 2; x <= center.x + 2; x++) {
        let point = new Vec(x, y);
        if(point.x != center.x &&
           point.y != center.y &&
           !isRed(point.colorNow)) {
          return false;
        }
    }
  }
  return true;
};

const startTheBot = async (opts, logs) => {
  options = opts;
  state = true;
  log = logs;

  const {workwindow, mouse, keyboard} = findTheGame(`World of Warcraft`);
  w = workwindow;
  m = mouse;
  k = keyboard;

  m.buttonTogglerDelay = delay;
  k.keyTogglerDelay = delay;
  k.keySenderDelay = delay

  const display = Display.create(w.getView());



  if(test) {
    setInterval(async () => {
      m.moveTo(testd.x, testd.y);
      await sleep(1000);
      m.moveTo(testd.x + testd.width, testd.y + testd.height);

      let {x, y} = m.getPos();
      m.moveTo(x, y);
      let [r, g, b] = w.colorAt(x, y, 'array');
      console.log(x, y, `color`, r, g, b);
    }, 3000);
  } else {
    const stats = await startFishing(display);
    showStats(stats);
    if(state) {
      return true;
    }
  }
};


const startFishing = async (display) => {
  const stats = { caught: 0, ncaught: 0 };

  const fishZone = display.rel(.359, .018, .260, .416);
  const castZone = display.rel(.438, .845, .046, .020);

  for(;;) {
    const initial = !stats.caught && !stats.ncaught;
    await castFishing(castZone, initial);
    let bobber = await fishZone.findColor(isRed, fullCheckAround);
    if(bobber) {
      let hooked = await checkHook(bobber);
      if(hooked) {
        await getFish(bobber, stats, fishZone);
      } else {
        if(state) { stats.ncaught++; };
      }
    } else {
      log.err("Didn't find bobber, will /cast fishing again!");
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
