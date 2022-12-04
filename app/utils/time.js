const convertMs = (ms) => {
  let sec = Math.floor(ms / 1000);
  let min = Math.floor(sec / 60);
  let hour = Math.floor(min / 60);

  switch (true) {
    case sec < 1: {
      return `${ms} ms`;
    }

    case min < 1: {
      return `${sec} sec`;
    }

    case hour < 1: {
      return `${min} min ${sec % 60} sec`;
    }
  }

  return `${hour} hour ${min % 60} min ${sec % 60} sec`;
};

const getCurrentTime = () => {
  let date = new Date();
  let times = {
    hr: date.getHours(),
    min: date.getMinutes(),
    sec: date.getSeconds(),
  };
  for (let time of Object.keys(times)) {
    times[time] = times[time].toString();
    if (times[time].length < 2) {
      times[time] = times[time].padStart(2, `0`);
    }
  }

  return times;
};


const createTimer = (callback) => {
  let time = 0;
  let interval = callback();
  return {
    start() {
      time = Date.now();
    },
    isElapsed() {
      return Date.now() - time > interval;
    },
    update(cb) {
      interval = cb ? cb() : callback();
      this.start();
    },
    timeRemains() {
      return interval - (Date.now() - time);
    }
  }
};


module.exports = {
  convertMs,
  getCurrentTime,
  createTimer
};
