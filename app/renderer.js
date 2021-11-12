const {Virtual, Hardware, getAllWindows, GlobalHotkey} = require("keysender");
const pixels = require("image-pixels");

// HTML //
const startButton = document.querySelector('#start');

// END HTML//


// GLOBAL //
let w, m, k, options;
const delay = 75;
const test = false;
// END OF GLOBALS //


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
    close: false
  };
};


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
        if(!cond || cond(result))
          return result;
        }
      }
    }
  }
}

const findTheGame = (name) => {
  const {handle} = getAllWindows().find(({title}) => new RegExp(name).test(title));
  return new Hardware(handle);
};

const isRed = ([r, g, b]) =>  {
    return r - g > 50 && r - b > 50;
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
    setTimeout(resolve, 1750); // 1000 in wotlk
  });
};

const gotAway = async (fishZone) => {
  return await fishZone.findColor(isYellow);
};

const getFish = (bobberPos, stats, fishZone) => {
  return new Promise(async (resolve, reject) => {

    bobberPos.click(1, 'right');
    await sleep(250) // wait 250ms for yellow text to appear
    if(!await gotAway(fishZone)) {
      stats.caught++
    } else {
      stats.ncaught++
      setTimeout(resolve, 1000);
    }

    setTimeout(resolve, 4500);
  });
};

const checkHook = (start) => {
  return new Promise((resolve, reject) => {
    let angleY = Math.PI;
    let angleX = Math.PI / 4;
    const waveAnimation = () => {
      if(isRed(start.colorNow) && !options.close) {
        let y = Math.sin(angleY += 0.025) * 3; // 0.025 in WOTLK
        let x = Math.cos(angleX += 0.025);
        m.moveTo(start.x + x, start.y + y);
        setTimeout(waveAnimation, 10);
      } else {
        resolve(true);
      }
    };

    setTimeout(waveAnimation, 10);
  });
}


const startTheBot = async () => {
  try {
    var game = findTheGame(`World of Warcraft`)
  } catch(e) {
    console.log(`Can't find the game`);
    return;
  }

  const {workwindow, mouse, keyboard} = game;

  w = workwindow;
  m = mouse;
  k = keyboard;

  m.buttonTogglerDelay = delay;
  k.keyTogglerDelay = delay;
  k.keySenderDelay = delay

  const display = new Display(w.getView());
  let fishZone = display.rel(.26, 0, .48, .48);

  let stopEvent = new GlobalHotkey({
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
  w.setForeground();
  const stats = await startFishing(fishZone);
  showStats(stats);
  }
};

const isBobber = (bobber) => {
  console.log(`here`);
  blueFeatherPos = new Vec(-3, -3);
  const {x, y} = bobber.plus(blueFeatherPos);
  const color = w.colorAt(x, y, 'array');
  console.log(`color`, color);
  return isBlue(color);
}

// TEST MAIN //
const startFishing = async (fishZone) => {

  const stats = { caught: 0, ncaught: 0 };

  for(;;) {
    await castFishing();

    let bobber = await fishZone.findColor(isRed, isBobber);

    if(bobber) {
      bobber = bobber.plus(new Vec(2, 4));        // 1,2 in WOTLK
      let hooked = await checkHook(bobber);
      if(hooked) {
        await getFish(bobber, stats, fishZone);
      }
    } else {
      console.log("Didn't find bobber, will /cast fishing again!");
    }

    if(Date.now() - options.startTime > options.timer || options.close) {
      return stats;
     }
  }
}

const showStats = (stats) => {
  let total = stats.caught + stats.ncaught;
  let ncaughtPercent = Math.floor(stats.ncaught / total * 100);
  console.log(`Done! Have caught: ${stats.caught} items for you! :) But missed: ${ncaughtPercent}%`);
};


(() => {
  let started = false;

  startButton.addEventListener('click', (event) => {
      options = getOptions(Date.now());
      if(!started) {
        startButton.innerHTML = `STOP`;
        startButton.className = 'start_off';
        startButton.disabled = true;

        setTimeout(() => {
          startTheBot();
          startButton.disabled = false;
        }, 3000);
      } else {
        event.target.innerHTML = `START`;
        startButton.className = 'start_on';
        options.close = true;
      }
      started = !started;
  });
})(); // Start button event
