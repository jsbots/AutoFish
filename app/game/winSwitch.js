const sleep = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};

const createWinSwitch = (eventLine) => {
  return {
    execute(workwindow) {
      return new Promise((resolve) => {
        eventLine.add(async () => {
          workwindow.setForeground();
          while(!workwindow.isForeground()) {
            await sleep();
          }
          resolve();
        });
      });
    },
    finished() {
      eventLine.remove();
    }
  }
}


module.exports = createWinSwitch;
