const {Virtual, Hardware, getAllWindows, GlobalHotkey} = require('keysender');
const pixels = require('image-pixels');
const { ipcRenderer } = require('electron');

// HTML //
const startButton = document.querySelector('#start');

// END HTML//


// GLOBAL //
let w, m, k, options, log;
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
            m.moveTo(result.x, result.y);
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

class Log {
  constructor(node, types) {
    this.node = node;
    this.types = types;
  }

  send(text, type) {
    let date = getCurrentTime();
    let p = document.createElement('p');
    p.innerHTML = `[${date.hr}:${date.min}:${date.sec}] ${text}`;
    p.style.color = this.types[type || 'black'];
    this.node.append(p);
  }

  static create() {
    let node = document.querySelector('.log');
    let types = {warn: 'yellow',
                 msg: 'black',
                 err: 'red',
                 caught: 'green',
                 ncaught: 'orange'};

    return new Log(node, types)
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

const getOptions = (timeNow) => {
  return {
    timer: 5 * 60 * 1000,
    startTime: timeNow,
    fishingZone: {x: 0, y: 0, width: 0, height: 0},
    autoLoot: true,
    close: true
  };
};

const findTheGame = (name) => {
  const {handle, className} = getAllWindows().find(({title}) => new RegExp(name).test(title));
  return new Virtual(handle);
  /*
  if(className == `GxWindowClassD3d` || className == `GxWindowClass`) {

  } else {
    throw Error;
  }
 */
};

const isRed = ([r, g, b]) =>  {
    return r - g > 30 && r - b > 30;
};

const isYellow = ([r, g, b]) => {
  return r - b > 200 && g - b > 200;
}

const isBlue = ([r, g, b]) => {
  return b - r > 20 && b - g > 20;
};


const castFishing = () => {
  return new Promise((resolve, reject) => {
    k.sendKey('enter');
    k.printText('/cast fishing', 0);
    k.sendKey('enter');
    setTimeout(resolve, 1750); // 1750 casting animation
  });
};

const gotAway = async (fishZone) => {
  return await fishZone.findColor(isYellow);
};

const getFish = (bobber, stats, fishZone) => {
  return new Promise(async (resolve, reject) => {
    bobber.click(1, 'right');
    await sleep(250); // wait 250ms for yellow warning to appear

    if(!await gotAway(fishZone)) {
      log.send(`Caught the fish!`, 'caught')
      stats.caught++
    } else {
      log.send(`Didn't catch the fish`, 'ncaught')
      stats.ncaught++
      setTimeout(resolve, 1000); // wait 1s if we didn't catch a fish
    }

    setTimeout(resolve, 3500); // wait 3.5s until bobber fully disappear
  });
};

const checkHook = async (feather) => {
    log.send(`Waiting for fish to hook...`)
    let angleY = Math.PI;
    let angleX = Math.PI * 3 / 2;

    for(;!options.close;) {
      if(isRed(feather.colorNow)) {
        let y = Math.sin(angleY += 0.025) * 2; // 0.025 in WOTLK
        let x = Math.cos(angleX += 0.025);
        m.moveTo(feather.x + x, feather.y + y);
      } else {
        return true;
      }

      await sleep(10);
    }
}

const isBobber = (bobber) => {
  const blueFeather = bobber.plus(new Vec(3, -10)); // -3 -3
  return isBlue(blueFeather.colorNow);
}


const startTheBot = async () => {
  try {
    var game = findTheGame(`World of Warcraft`)
  } catch(e) {
    console.log(e);
    log.send(`Can't find the game window.`, 'err');
    return false;
  }

  const {workwindow, mouse, keyboard} = game;

  w = workwindow;
  m = mouse;
  k = keyboard;

  m.buttonTogglerDelay = delay;
  k.keyTogglerDelay = delay;
  k.keySenderDelay = delay

  const display = Display.create(w.getView());
  let fishZone = display.rel(.26, .1, .48, .4);

  new GlobalHotkey({
    key: 'space',
    action() {
      options.close = true;
    }
  });

  if(test) {
    setInterval(() => {
      let {x, y} = m.getPos();
      let [r, g, b] = w.colorAt(x, y, 'array');
      console.log(x, y, r, g, b);
    }, 500);
  } else {
  //await ipcRenderer.invoke('lose-focus'); // !vitual
  //w.setForeground(); // !virtual
  const stats = await startFishing(fishZone);
  showStats(stats);
  }
};

const startFishing = async (fishZone) => {
  const stats = { caught: 0, ncaught: 0 };
  for(;;) {
    await castFishing();
    let bobber = await fishZone.findColor(isRed, isBobber);
    if(bobber) {
      bobber = bobber.plus(new Vec(0, 3));        // 1,2 in WOTLK
      let hooked = await checkHook(bobber);
      if(hooked) {
        await getFish(bobber, stats, fishZone);
      }
    } else {
      if(!stats.caught && !stats.ncaught) {
        ipcRenderer.send('wrong-place');
        options.close = true;
      };
      log.send("Didn't find bobber, will /cast fishing again!", 'err');
    }

    if(Date.now() - options.startTime > options.timer || options.close) {
      stopTheBot();
      return stats;
     }
  }
}

const showStats = (stats) => {
  let total = stats.caught + stats.ncaught;
  let ncaughtPercent = Math.floor(stats.ncaught / total * 100) || 0;
  log.send(`Done! Caught: ${stats.caught}, Missed: ${ncaughtPercent}%`, 'caught');
};

const stopTheBot = () => {
  log.send(`Stopping the bot...`);
  startButton.innerHTML = `START`;
  startButton.className = 'start_on';
  options.close = true;
  GlobalHotkey.deleteAll();
  };

startButton.addEventListener('click', (event) => {

    options = options || getOptions(Date.now());
    log = Log.create();

    if(options.close) {
      startButton.innerHTML = `STOP`;
      startButton.className = 'start_off';
      startButton.disabled = true;
      options.close = false;

      log.send(`Looking for the game window...`);
      setTimeout(async () => {
        if(!await startTheBot()) {stopTheBot()};
        startButton.disabled = false;
      }, 250);

    } else {
      stopTheBot();
    }
});
