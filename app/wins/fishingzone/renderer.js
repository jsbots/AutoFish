const elt = require("../../ui/utils/elt.js");
const { ipcRenderer } = require('electron');
const buttonOk = elt(`div`, {className: `buttonOk`});
const buttonCancel = elt(`div`, {className: `buttonCancel`});

buttonOk.addEventListener(`click`, () => {
  ipcRenderer.send(`fishingZone-ok`);
});

buttonCancel.addEventListener(`click`, () => {
  ipcRenderer.send(`fishingZone-cancel`);
})

document.body.append(buttonOk);
document.body.append(buttonCancel);
