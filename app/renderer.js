const {Virtual, Hardware, getAllWindows, GlobalHotkey} = require("keysender");
const pixels = require("image-pixels");

// HTML //
const startButton = document.querySelector('#start');
const stopButton = document.querySelector('#stop');
// END HTML//



// GLOBAL //
let w, m, k;
const delay = 75;
const test = false;
// END OF GLOBALS //



const sleep = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

const getOptions = (timeNow) => {
  const options = {
    timer: 5 * 60 * 1000,
    startTime: timeNow,
    fishingZone: {x: 0, y: 0, width: 0, height: 0},
    autoLoot: true,
    close: false
  };

  return options;
};

const startTheBot = (options) => {

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
  w.setForeground();

  new GlobalHotkey({
    key: 'space',
    action() {
      process.exit();
    }
  });
  const stats = { caught: 0, ncaught: 0 };

if(test) {
  setInterval(() => {
    let {x, y} = m.getPos();
    let [r, g, b] = w.colorAt(x, y, 'array');
    console.log(x, y, `r - g`, r - g, `r - b`, r - b);
  }, 500);
} else {
  startFishing(options, display, center, stats);
}
};

const findTheGame = (name) => {
  const {handle} = getAllWindows().find(({title}) => new RegExp(name).test(title));
  return new Hardware(handle);
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
    setTimeout(resolve, 1000); // Fishpole animation
  });
};

const findFishingZone = (center, display) => {
  let {x, y} = center.plus(new Vec(-(display.width * 0.15),-(display.height * 0.4)));
  return {x, y, width: display.width * 0.3, height: display.height * 0.4};
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

    //
    // Autoloot???
    //

    setTimeout(resolve, 4500);
  });
};

const checkHook = (start) => {
  return new Promise((resolve, reject) => {
    let angle = Math.PI / 2;
    const waveAnimation = () => {
      if(isReddish(start.colorNow)) {
        let y = Math.sin(angle += 0.025) * 2;
        // m.moveTo(start.x, start.y + y);
        setTimeout(waveAnimation, 10);
      } else {
        resolve(true);
      }
    };

    setTimeout(waveAnimation, 10);
  });
}

// TEST MAIN //
const startFishing = async (options, display, center, stats) => {

  await castFishing();

  let fishZone = findFishingZone(center, display);

  let redPos;
  for (let i = 0; !redPos && i < 5; i++) {
    await sleep(100) // TEST to slow down red search
    redPos = await findColor(fishZone, isReddish);
  };

  if(redPos) {
    let bobberPos = redPos.plus(new Vec(1, 2)); // adjust position to the middle of the red feather
    let hooked = await checkHook(bobberPos);
    if(hooked) {
      await getFish(bobberPos, stats, center);
    }
  } else {
    console.log("Didn't find bobber");
  }


  if(Date.now() - options.startTime < options.timer && !options.close) { startFishing(options, display, center, stats); }
  else {
    showStats(stats);
    startButton.disabled = false;
    stopButton.disabled = true;
  }
}

const showStats = (stats) => {
  let total = stats.caught + stats.ncaught;
  let ncaughtPercent = Math.floor(stats.ncaught / total * 100);
  console.log(`Done! Have caught: ${stats.caught} items for you! :) But missed: ${ncaughtPercent}%`);
};


startButton.addEventListener('click', (event) => {
  event.preventDefault();
  startButton.disabled = true;
  stopButton.disabled = false;

  let options = getOptions(Date.now());

  stopButton.addEventListener('click', (event) => {
    options.close = true;
    startButton.disabled = false;
    stopButton.disabled = true;
  });


  setTimeout(() => {
     startTheBot(options);
  }, 3000);
});
