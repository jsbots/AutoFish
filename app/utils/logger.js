const { getCurrentTime } = require("./time.js");
const { createWriteStream } = require('fs');

const createLog = (sendToWindow) => {
  let state = true;
  return {
    send(text, type = "black") {
      if(state) {
        const { hr, min, sec } = getCurrentTime();
        text = `[${hr}:${min}:${sec}] ${text}`;
        sendToWindow({ text, type });
      }
    },

    msg(text) {
      sendToWindow({ text, type: "green" });
    },

    ok(text) {
      this.send(text, "green");
    },

    warn(text) {
      this.send(text, "orange");
    },

    err(text) {
      this.send(text, "red");
    },

    setState(value) {
      state = value;
    }
  };
};

const createIdLog = (log, id) => {
  let logData;
  if(process.env.NODE_ENV == `dev`) {
    logData = createWriteStream(`${__dirname}/../debug/log.txt`);
  }

  return Object.assign({}, log, {
    send(text, type) {
        if(process.env.NODE_ENV == `dev`) {
          const { hr, min, sec } = getCurrentTime();
          logData.write(`[${hr}:${min}:${sec}] ${text}\n`);
        }
        log.send(`[WIN${id}] ${text}`, type);
      }
  });
};


module.exports = {
  createLog,
  createIdLog,
};
