const { ipcRenderer } = require("electron");

const Settings = require('./ui/settings.js');
const StartButton = require('./ui/startButton.js');
const AutoFish = require('./ui/autoFish.js');
const getSettings = require('./ui/getSettings.js');

const runApp = async () => {
  const config = await getSettings();
  let autoFish = new AutoFish(config, new Settings(config), new StartButton);
  document.querySelector('.AutoFish').append(autoFish.dom);
  ipcRenderer.on('log-data', (event, data) => {
    autoFish.log(data);
  })
};

runApp();
