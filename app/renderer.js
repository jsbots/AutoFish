const { ipcRenderer } = require("electron");

const Settings = require("./ui/settings.js");
const StartButton = require("./ui/startButton.js");
const AutoFish = require("./ui/autoFish.js");

const runApp = async () => {
  const settings = await ipcRenderer.invoke("get-settings");
  let autoFish = new AutoFish(
    new Settings(settings),
    new StartButton()
  );
  document.body.append(autoFish.dom);
};

runApp();
