const { ipcRenderer } = require("electron");

const Settings = require("./ui/settings.js");
const renderSettings = require("./ui/renderSettings.js");
const StartButton = require("./ui/startButton.js");
const AutoFish = require("./ui/autoFish.js");

const runApp = async () => {
  const { settings, instructions } = await ipcRenderer.invoke("get-settings");
  let autoFish = new AutoFish(
    instructions,
    new Settings(settings, renderSettings),
    new StartButton()
  );
  document.body.append(autoFish.dom);
};

runApp();
