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

const findTheGame = (name) => {
  const {handle} = getAllWindows().find(({title}) => new RegExp(name).test(title));
  return new Hardware(handle);
};


const findColor = async (start, color) => {
  let {data: rgb} = await pixels(w.capture(start).data,
                    {width: start.width, height: start.height});

for (let y = 0, i = 0; y < start.height; y++) {
  for (let x = 0; x < start.width; x++, i += 4) {
    let r = rgb[i];
    let g = rgb[i + 1];
    let b = rgb[i + 2];
    if(color([r, g, b])) {
      return new Vec(start.x + x, start.y + y);
      }
    }
  }
};

const isReddish = ([r, g, b]) =>  {
    return r - g > 50 && r - b > 50;
};

const isYellow = ([r, g, b]) => {
  return r - b > 200 && g - b > 200;
}

const castFishing = () => {
  return new Promise((resolve, reject) => {
    k.sendKey('enter');
    k.printText('/cast fishing', 0);
    k.sendKey('enter');
    setTimeout(resolve, 1750); // 1000 in wotlk
  });
};

const findFishingZone = (center, display) => {
  let {x, y} = center.plus(new Vec(-(display.width * 0.2),-(display.height * 0.4)));
  return {x, y, width: display.width * 0.4, height: display.height * 0.3};
};

const gotAway = async (center) => {
  let start = {x: center.x - 100, y: 150, width: 200, height: 30};
  return await findColor(start, isYellow);
};

const getFish = (bobberPos, stats, center) => {
  return new Promise(async (resolve, reject) => {

    bobberPos.click(1, 'right');
    await sleep(250) // wait 250ms for yellow text to appear
    if(!await gotAway(center)) {
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
      if(isReddish(start.colorNow) && !options.close) {
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

  const display = w.getView();
  const center = new Vec(display.width / 2, display.height / 2);
  new GlobalHotkey({
    key: 'space',
    action() {
      options.close = true;
    }
  });
  const stats = { caught: 0, ncaught: 0};

  if(test) {
    setInterval(() => {
      let {x, y} = m.getPos();
      let [r, g, b] = w.colorAt(x, y, 'array');
      console.log(x, y, `r - g`, r - g, `r - b`, r - b);
    }, 500);
  } else {
  w.setForeground();
  startFishing(display, center, stats);
  }
};


// TEST MAIN //
const startFishing = async (display, center, stats) => {

  await castFishing();

  let fishZone = findFishingZone(center, display);

  let redPos;
  for (let i = 0; !redPos && i < 10; i++) {
    await sleep(100);
    redPos = await findColor(fishZone, isReddish);
  };

  if(redPos) {
    let bobberPos = redPos.plus(new Vec(2, 4)); // 1,2 in WOTLK
    let hooked = await checkHook(bobberPos);
    if(hooked) {
      await getFish(bobberPos, stats, center);
    }
  } else {
    console.log("Didn't find bobber, will /cast fishing again!");
  }

  if(Date.now() - options.startTime < options.timer && !options.close) { startFishing(display, center, stats); }
  else {
    showStats(stats);
    options.close = false;
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
