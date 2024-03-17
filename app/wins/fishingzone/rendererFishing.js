const elt = require("../../ui/utils/elt.js");
const { ipcRenderer } = require('electron');
const buttonOk = elt(`div`, {className: `buttonOk`},  `Save`);
const buttonCancel = elt(`div`, {className: `buttonCancel`}, `Cancel`);
const buttonCheck = elt(`div`, {className: `buttonCheck`}, `Check`);

ipcRenderer.invoke(`fishingZone-bobberColor`)
.then((color) => document.body.append(elt('p', {style: `font-size: 6vw`}, `Avoid ${color} colors!`)))

buttonOk.addEventListener(`click`, () => {
  ipcRenderer.send(`fishingZone-ok`);
});

buttonCancel.addEventListener(`click`, () => {
  ipcRenderer.send(`fishingZone-cancel`);
});

buttonCheck.addEventListener(`click`, async () => {
  let result = await ipcRenderer.invoke(`fishingZone-check`);
  document.body.style.backgroundColor = result;
  setTimeout(() => {
    document.body.style.backgroundColor = `white`;
  }, 1000);
})

document.body.append(buttonOk);
document.body.append(buttonCancel);
document.body.append(buttonCheck);
