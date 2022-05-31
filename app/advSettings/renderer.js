const { ipcRenderer } = require("electron");
const elt = require("../ui/utils/elt.js");
const wrapInLabel = require("../ui/utils/wrapInLabel.js");

const renderDelay = ({delay}) => {
  return elt(`div`, {"data-collection": `delay`}, `from:`,
     elt('input', {type: `number`, name: `from`, value: delay.from}), `to:`,
     elt('input', {type: `number`, name: `to`, value: delay.to}));
};

const renderCastDelay = ({castDelay}) => {
  return elt('input', {type: `number`, name: `castDelay`, value: castDelay})
};

const renderAfterHookDelay = ({afterHookDelay}) => {
  return elt(`div`, {"data-collection": `afterHookDelay`}, `from:`,
  elt('input', {type: `number`, name: `from`, value: afterHookDelay.from}), `to:`,
  elt('input', {type: `number`, name: `to`, value: afterHookDelay.to})
  );
};

const renderMaxFishTime = ({maxFishTime}) => {
  return elt(`input`, {type: `number`, name: `maxFishTime`, value: maxFishTime});
};

const renderRelZone = ({relZone}) => {
  return elt(`div`, {"data-collection": `relZone`},
      `x:`, elt(`input`, {type: `number`, name: `x`, value: relZone.x}),
      `y:`, elt(`input`, {type: `number`, name: `y`, value: relZone.y}),
      `w:`, elt(`input`, {type: `number`, name: `width`, value: relZone.width}),
      `h:`, elt(`input`, {type: `number`, name: `height`, value: relZone.height})
    );
};

const renderCheckingDelay = ({checkingDelay}) => {
  return elt(`input`, {type: `number`, name:`checkingDelay`, value: checkingDelay});
};

const renderMouseMoveSpeed = ({mouseMoveSpeed}) => {
  return elt(`input`, {type: `number`, name: `mouseMoveSpeed`, value: mouseMoveSpeed});
};

const renderMouseCurvature = ({mouseCurvatureStrength}) => {
  return elt(`input`, {type: `number`, name: `mouseCurvatureStrength`, value: mouseCurvatureStrength});
};

const renderLuresDelay = ({luresDelay}) => {
  return elt(`input`, {type: `number`, name: `luresDelay`, value: luresDelay});
};

const rednerCustomName = ({customName}) => {
  return elt(`input`, {type: `text`, name: `customName`, value: customName});
};

const renderRandomSleep = ({randomSleep}) => {
  return elt(`input`, {type: `checkbox`, name: `randomSleep`, checked: randomSleep});
};

const renderRandomSleepEvery = ({randomSleepEvery, randomSleep}) => {
  return elt(`div`, {"data-collection": `randomSleepEvery`}, `from:`,
  elt('input', {type: `number`, name: `from`, value: randomSleepEvery.from, disabled: !randomSleep}), `to:`,
  elt('input', {type: `number`, name: `to`, value: randomSleepEvery.to, disabled: !randomSleep})
  );
};

const renderRandomSleepDelay = ({randomSleepDelay, randomSleep}) => {
  return elt(`div`, {"data-collection": `randomSleepDelay`}, `from:`,
  elt('input', {type: `number`, name: `from`, value: randomSleepDelay.from, disabled: !randomSleep}), `to:`,
  elt('input', {type: `number`, name: `to`, value: randomSleepDelay.to, disabled: !randomSleep})
  );
};

const renderReaction = ({reaction}) => {
  return elt(`input`, {type: `checkbox`, name:`reaction`, checked: reaction});
};

const renderReactionDelay = ({reaction, reactionDelay}) => {
  return elt(`div`, {"data-collection": `reactionDelay`}, `from:`,
  elt('input', {type: `number`, name: `from`, value: reactionDelay.from, disabled: !reaction}), `to:`,
  elt('input', {type: `number`, name: `to`, value: reactionDelay.to, disabled: !reaction})
  );
};


const renderSettings = (config) => {
  return elt('section', {className: `settings`},
  elt(`p`, {className: `settings_header`}, `Random sleep`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Random sleep`, renderRandomSleep(config), `random sleep`),
  wrapInLabel(`Random sleep every (min)`, renderRandomSleepEvery(config), `random sleep every`),
  wrapInLabel(`Random sleep for (ms)`, renderRandomSleepDelay(config), `random sleep for`)
  ),
  elt(`p`, {className: `settings_header`}, `Random reaction`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Reaction`, renderReaction(config), `reaction time`),
  wrapInLabel(`Reaction random delay`, renderReactionDelay(config), `reaction delay config`)),
  elt(`p`, {className: `settings_header`}, `General`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Custom window name: `, rednerCustomName(config), `Custom name`),
  wrapInLabel(`Mouse/keyboard random delay: `, renderDelay(config), `Delay Options`),
  wrapInLabel(`Cast animation delay: `, renderCastDelay(config), `Cast delay Options`),
  wrapInLabel(`After hook random delay: `, renderAfterHookDelay(config), `After hook delay`),
  wrapInLabel(`Max check time: `, renderMaxFishTime(config, `Check time`)),
  wrapInLabel(`Fishing zone: `, renderRelZone(config), `fishing zone`),
  wrapInLabel(`Checking delay: `, renderCheckingDelay(config), `checking delay`),
  wrapInLabel(`Base Mouse speed: `, renderMouseMoveSpeed(config), `mouseMoveSpeed`),
  wrapInLabel(`Base Mouse curve: `, renderMouseCurvature(config), `mouse curvature`),
  wrapInLabel(`Lures cast delay: `, renderLuresDelay(config), `lures delay`)),
  );
}

const runApp = async () => {
  let config = await ipcRenderer.invoke("get-game-config");
  const settings = elt(`form`, null, renderSettings(config));
  const buttons = elt(`div`, {className: `buttons`},
     elt('input', {type: `button`, value: `Ok`}),
     elt('input', {type: `button`, value: `Cancel`}),
      elt('input', {type: `button`, value: `Defaults`}))

  buttons.addEventListener(`click`, async (event) => {
    if(event.target.value == 'Ok') {
      ipcRenderer.send('advanced-click', config);
    }

    if(event.target.value == 'Cancel') {
      ipcRenderer.send('advanced-click');
    }

    if(event.target.value == 'Defaults') {
      let defaultConfig = await ipcRenderer.invoke('advanced-defaults');
      settings.innerHTML = ``;
      config = defaultConfig;
      settings.append(renderSettings(config));
    }
  });

  const advancedSettings = elt('div', {className: `advSettings`},
  settings,
  buttons);
  document.body.append(advancedSettings);

  settings.addEventListener('change', (event) => {
    [...settings.elements].forEach(option => {
      let value = option.value;
      if (option.type == "checkbox") {
        value = option.checked;
      }

      if (option.type == "number") {
        value = Number(option.value);
      }

      let collection = option.parentNode["data-collection"];
      if(collection) {
        config[collection][option.name] = value;
      } else {
        config[option.name] = value;
      }
    });
    settings.innerHTML = ``;
    settings.append(renderSettings(config));
  });
};

runApp();
