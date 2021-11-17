const { ipcRenderer } = require('electron');

// HTML //
const startButton = document.querySelector('#start');
const timerData = document.querySelector('#timerData');
const timerCheck = document.querySelector('#timerCheck')
const logSection = document.querySelector('#log');
// END HTML//

// Listeners //



const getOptions = (timeNow) => {
  return {
    timer: ((!timerData.disabled && Math.abs(+timerData.value)) || Infinity) * 60 * 1000,
    startTime: timeNow,
    fishingZone: {x: 0, y: 0, width: 0, height: 0},
    autoLoot: true,
    close: true
  };
};

let state = false;
startButton.addEventListener('click', (event) => {

    if(!state) {
      startButton.innerHTML = `STOP`;
      startButton.className = 'start_off';
      ipcRenderer.send('start-bot', getOptions(Date.now()));
    } else {
      stopTheBot();
      ipcRenderer.send('stop-bot');
    }

    state = !state;
});

const stopTheBot = () => {
  startButton.innerHTML = `START`;
  startButton.className = 'start_on';
};

timerCheck.addEventListener('click', () => {timerData.disabled = !timerData.disabled});

ipcRenderer.on('log-data', (event, data) => {
  renderLog(data);
});

ipcRenderer.on('stop-bot', (event) => {
  state = false;
  stopTheBot();
});

const renderLog = ({text, type}) => {
  let p = document.createElement('p');
  p.innerHTML = text;
  p.style.color = type;
  logSection.append(p)
  logSection.scrollTop += 30;
};
