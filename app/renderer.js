const {Virtual, Hardware, getAllWindows} = require('keysender');
const pixels = require('image-pixels');
const { ipcRenderer } = require('electron');

// HTML //
const startButton = document.querySelector('#start');
const timerData = document.querySelector('#timerData');
const timerCheck = document.querySelector('#timerCheck')
// END HTML//


// GLOBAL //
let w, m, k, options, log, state;
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
        // m.moveTo(result.x, result.y); // lighten up the bobber
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
  constructor() {
    let types = {
                 err: 'red',
                 ok: 'green',
                 warn: 'orange',
                 msg: 'black'
               };

    for(let type of Object.keys(types)) {
      this[type] = (text) => {
          this.send(text, types[type]);
      };
    }

    this.node = document.querySelector('.log');
  }

  send(text, type) {
    let date = getCurrentTime();
    let p = document.createElement('p');
    p.innerHTML = `[${date.hr}:${date.min}:${date.sec}] ${text}`;
    p.style.color = type || 'black';
    this.node.append(p);
    this.node.scrollTop += 30;
  }
}

log = new Log();



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
    timer: ((!timerData.disabled && Math.abs(+timerData.value)) || Infinity) * 60 * 1000,
    startTime: timeNow,
    fishingZone: {x: 0, y: 0, width: 0, height: 0},
    autoLoot: true,
    close: true
  };
};

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

const isBlue = ([r, g, b]) => {
  return b - r > 20 && b - g > 20;
};

const isYellow = ([r, g, b]) => {
  return r - b > 200 && g - b > 200;
};

const isGreen = ([r, g, b]) => {
  return g - r > 150 && g - b > 150;
};

const isBlack = ([r, g, b]) => {
  return r < 30 && g < 30 && b < 30;
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
      log.ok(`Caught the fish!`)
      stats.caught++
    } else {
      log.warn(`Didn't catch the fish`)
      stats.ncaught++
      setTimeout(resolve, 1000); // wait 1s if we didn't catch a fish
    }

    setTimeout(resolve, 3500); // wait 3.5s until bobber fully disappear
  });
};

const timeOut = (timeBefore, timer) => {
  return Date.now() - timeBefore > (timer * 1000);
};

const checkHook = async (feather) => {
    log.msg(`Waiting for fish to hook...`)
    let startTime = Date.now();
    for(;state;) {
      if(isRed(feather.colorNow)) {
      } else if(feather = checkAround(feather, feather.colorNow)) {
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
  let movedTo;
  for(let y = center.y - 1; y <= center.y + 1; y++) {
    for(let x = center.x - 1; x <= center.x + 1; x++) {
        let point = new Vec(x, y);
        if(isRed(point.colorNow)) {
          movedTo = point;
          break;
        }
    }
  }
  return movedTo;
};

const isBobber = (bobber) => {
  /*
  const blueFeather = bobber.plus(new Vec(0, -3)); // -3 -3
  return isBlue(blueFeather.colorNow);
  */
}


const startTheBot = async () => {
  const {workwindow, mouse, keyboard} = findTheGame(`World of Warcraft`);
  w = workwindow;
  m = mouse;
  k = keyboard;

  m.buttonTogglerDelay = delay;
  k.keyTogglerDelay = delay;
  k.keySenderDelay = delay

  const display = Display.create(w.getView());

  if(test) {
    setInterval(() => {
      let {x, y} = m.getPos();
      let [r, g, b] = w.colorAt(x, y, 'array');
      console.log(x, y, `color`, r, g, b);
    }, 500);
  } else {
    //await ipcRenderer.invoke('lose-focus'); // !vitual
    //w.setForeground(); // !virtual
    const stats = await startFishing(display);
    showStats(stats);
    ipcRenderer.send('sound');
    if(state) {
      stopTheBot();
    }
  }
};



const startFishing = async (display) => {
  const stats = { caught: 0, ncaught: 0 };

  const fishZone = display.rel(.343, .018, .312, .416);
  const castZone = display.rel(.438, .840, .046, .020);

  for(;;) {
    const initial = !stats.caught && !stats.ncaught;
    await castFishing(castZone, initial);
    let bobber = await fishZone.findColor(isRed);
    if(bobber) {
      let hooked = await checkHook(bobber);
      if(hooked) {
        await getFish(bobber, stats, fishZone);
      } else {
        stats.ncaught++;
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
  log.msg(`Stopping the bot...`);
  startButton.innerHTML = `START`;
  startButton.className = 'start_on';
  state = !state;
  };


// Listeners //

startButton.addEventListener('click', (event) => {
    options = getOptions(Date.now());

    if(!state) {
      startButton.innerHTML = `STOP`;
      startButton.className = 'start_off';
      startButton.disabled = true;
      state = !state;

      log.msg(`Starting the bot...`);
      setTimeout(() => {
        startButton.disabled = false;
        startTheBot()
         .catch(e => {
           log.err(`ERROR: ${e.message}`, 'err');
           ipcRenderer.send('sound');
           stopTheBot();
         });
       }, 275);
    } else {
      stopTheBot();
    }
});

timerCheck.addEventListener('click', () => {timerData.disabled = !timerData.disabled});
