const { createTimer } = require('../utils/time.js');

const windowStuck = createTimer(() => 5000);

const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const createWinSwitch = (eventLine) => {
  return {
    execute(workwindow) {
      return new Promise((resolve, reject) => {
        eventLine.add(async () => {
          workwindow.setForeground();
          windowStuck.start();
          while (!workwindow.isForeground()) {
            if(windowStuck.isElapsed()) {
              this.finished();
              reject(new Error(`Can't set the window to foreground`));
            }
            await sleep();
          }
          resolve();
        });
      });
    },
    finished() {
      eventLine.remove();
    },
  };
};

module.exports = createWinSwitch;
