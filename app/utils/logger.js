const getCurrentTime = require('./getCurrentTime.js');

const createLog = (sendToWindow) => {
  return {
    send(text, type = 'black') {
      const date = getCurrentTime();
      text = `[${date.hr}:${date.min}:${date.sec}] ${text}`;
      sendToWindow({text, type});
    },

    ok(text) {
      this.send(text, 'green');
    },

    warn(text) {
      this.send(text, 'orange');
    },

    err(text) {
      this.send(text, 'red')
    }
  }
}


module.exports = createLog;
