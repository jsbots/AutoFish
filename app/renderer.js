const { ipcRenderer } = require('electron');

const startButton = document.querySelector('#start');
const timerData = document.querySelector('#timerData');
const logSection = document.querySelector('#log');
const youtubeLink = document.querySelector('#youtube_link');
const gameSelect = document.querySelector('#game_select');
const wotlkInfo = document.querySelector('.wotlk_info');
const classicInfo = document.querySelector('.classic_info');

const getOptions = (timeNow) => {
  return {
    timer: (Math.abs(+timerData.value) || Infinity) * 60 * 1000,
    startTime: timeNow,
    game: gameSelect.value === `Retail & Classic` ? 'classic' : 'wotlk'
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

    startButton.disabled = true;
    setTimeout(() => {
      startButton.disabled = false;
    }, 500);

    state = !state;
});

const stopTheBot = () => {
  startButton.innerHTML = `START`;
  startButton.className = 'start_on';
};


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
  logSection.scrollTop += 30; // not 30 but should be in relation to the size of text
};


youtubeLink.addEventListener('click', (event) => {
  ipcRenderer.send('open-link');
  event.preventDefault();
})

gameSelect.addEventListener('change', (event) => {
  if(gameSelect.value === `Retail & Classic`) {
    classicInfo.style.display = 'block';
    wotlkInfo.style.display = 'none';
  } else {
    wotlkInfo.style.display = 'block';
    classicInfo.style.display = 'none';
  }
});
