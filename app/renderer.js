const { ipcRenderer } = require("electron");

const Settings = require("./ui/settings.js");
const StartButton = require("./ui/startButton.js");
const AutoFish = require("./ui/autoFish.js");

const runApp = async () => {
  const { settings, instructions } = await ipcRenderer.invoke("get-settings");
  let autoFish = new AutoFish(
    instructions,
    new Settings(settings),
    new StartButton()
  );
  document.querySelector(".AutoFish").append(autoFish.dom);
};

runApp();
