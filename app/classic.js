const {Virtual, Hardware, getAllWindows} = require('keysender');
const pixels = require('image-pixels');

// GLOBAL //

let w, m, k, options, log;
let state = false;
const delay = [75, 250];
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

  async click(repeat = 1, button) {
    await m.moveCurveToAsync(this.x, this.y, 2, 150);
    for(let i = 0; i < repeat; i++) {
      m.click(button, delay)
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



const castFishing = async () => {
    log.msg(`Casting...`);
    k.sendKey('2');
    await sleep(1500);
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
      setTimeout(resolve, 1000 + Math.random() * 1000); // wait 1s if we didn't catch a fish
    }

    setTimeout(resolve, 2000 + Math.random() * 1000); // wait 2.5s until bobber fully disappear
  });
};

const timeOut = (timeBefore, timer) => {
  return Date.now() - timeBefore > (timer * 1000);
};

const checkHook = async (feather, zone) => {
    log.msg(`Waiting for fish to be hooked...`)
    let startTime = Date.now();
    let random = false;
    for(;state;) {
      if(isRed(feather.colorNow)) {
      } else if(feather = checkAround(feather)) {
      } else {
        return true;
      }

      if(!random) {
        let time = 1000 + Math.random() * 1000;
        await randomAction(zone, time);
        setTimeout(() => {
          random = false;
        }, time);
        random = true;
      }


      if(timeOut(startTime, 30)) {
        log.warn(`30 seconds have passed, but didn't catch the fish. Will /cast fishing again!`);
        return false
      }

      await sleep(50);
    }
}

const randomAction = async (zone, time) => {
  let randX = (Math.random() * zone.width) + zone.x;
  let randY = (Math.random() * zone.height) + zone.y;
  let randomKeys = ['b', 'c', 'k'];
  if(Math.random() > .5) {
    let chosenKey = randomKeys[Math.floor(Math.random() * randomKeys.length)];
    k.sendKey(chosenKey);
    setTimeout(() => {
      k.sendKey(chosenKey);
    }, time);
  }

  await m.moveCurveToAsync(randX, randY, 2, 70);
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

class RandomMove {
  constructor(time, key) {
      this.timer = time;
      this.key = key;
  }

  check(timeNow) {
    console.log(timeNow, this.timer);
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

const startFishing = async (display) => {
  const stats = { caught: 0, ncaught: 0 };
  const fishZone = display.rel(.359, .018, .260, .416);
  let random = RandomMove.create(1, 'd');

  for(;;) {
    const initial = !stats.caught && !stats.ncaught;
    await castFishing();
    let bobber = await fishZone.findColor(isRed, fullCheckAround);
    if(bobber) {
      let hooked = await checkHook(bobber, fishZone);
      if(hooked) {
        await getFish(bobber, stats, fishZone);
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
