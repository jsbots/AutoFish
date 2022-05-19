const getCurrentTime = require('./getCurrentTime.js');

const createLog = (sendToWindow) => {
  return {
    send(text, type = 'black') {
      const {hr, min, sec} = getCurrentTime();
      text = `[${hr}:${min}:${sec}] ${text}`;
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

const createIdLog = (log) => {
  let id = ++createIdLog.id;
  return Object.assign({}, log, {
    send(text, type) {
      log.send(`[WIN${id}] ${text}`, type);
    }
  })
};
createIdLog.id = 0;

module.exports = {
  createLog,
  createIdLog
};
