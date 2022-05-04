let win;

let log = new class {
  constructor() {
    let types = {
                 err: 'red',
                 ok: 'green',
                 warn: 'orange',
                 msg: 'black'
               };

    for(let type of Object.keys(types)) {
      this[type] = (text) => {
        if(win != null) {
          this.send(text, types[type]);
        } else {
          throw new Error(`Electron window wasn't set`);
        }
      };
    }
  }

  send(text, type = 'black') {
    let date = getCurrentTime();
    text = `[${date.hr}:${date.min}:${date.sec}] ${text}`;
    win.webContents.send('log-data', {text, type});
  }

  setWin(electronWin) {
    win = electronWin;
  }
}


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

module.exports = log;
