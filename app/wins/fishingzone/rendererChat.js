const elt = require("../../ui/utils/elt.js");
const { ipcRenderer } = require('electron');
const buttonOk = elt(`div`, {className: `buttonOk`},  `Save`);
const buttonCancel = elt(`div`, {className: `buttonCancel`}, `Cancel`);

buttonOk.addEventListener(`click`, () => {
  ipcRenderer.send(`fishingZone-ok`);
});

buttonCancel.addEventListener(`click`, () => {
  ipcRenderer.send(`fishingZone-cancel`);
});

document.body.append(buttonOk);
document.body.append(buttonCancel);
