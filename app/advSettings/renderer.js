const { ipcRenderer } = require("electron");
const elt = require("../ui/utils/elt.js");
const wrapInLabel = require("../ui/utils/wrapInLabel.js");

const renderDelay = ({delay}) => {
  return elt(`div`, {"data-collection": `delay`}, `from`,
     elt('input', {type: `number`, name: `from`, value: delay.from}), `to`,
     elt('input', {type: `number`, name: `to`, value: delay.to}));
};

const renderCastDelay = ({castDelay}) => {
  return elt('input', {type: `number`, name: `castDelay`, value: castDelay})
};

const renderAfterHookDelay = ({afterHookDelay}) => {
  return elt(`div`, {"data-collection": `afterHookDelay`}, `caught`,
  elt('input', {type: `number`, name: `caught`, value: afterHookDelay.caught}), `miss`,
  elt('input', {type: `number`, name: `miss`, value: afterHookDelay.miss})
  );
};

const renderMaxFishTime = ({maxFishTime}) => {
  return elt(`input`, {type: `number`, name: `maxFishTime`, value: maxFishTime});
};

const renderRelZone = ({relZone}) => {
  return elt(`div`, {"data-collection": `relZone`},
      `x`, elt(`input`, {type: `number`, name: `x`, value: relZone.x}),
      `y`, elt(`input`, {type: `number`, name: `y`, value: relZone.y}),
      `w`, elt(`input`, {type: `number`, name: `width`, value: relZone.width}),
      `h`, elt(`input`, {type: `number`, name: `height`, value: relZone.height})
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


const renderSettings = (config) => {
  return elt('section', {className: "settings"},
  elt('div', {className: "settings_section advanced"},
  wrapInLabel(`Random Delay: `, renderDelay(config), `Delay Options`),
  wrapInLabel(`Cast Delay: `, renderCastDelay(config), `Cast delay Options`),
  wrapInLabel(`After Delay: `, renderAfterHookDelay(config), `After hook delay`),
  wrapInLabel(`Max check time: `, renderMaxFishTime(config, `Check time`)),
  wrapInLabel(`Fishing zone: `, renderRelZone(config), `fishing zone`),
  wrapInLabel(`Checking delay: `, renderCheckingDelay(config), `checking delay`),
  wrapInLabel(`Base Mouse speed: `, renderMouseMoveSpeed(config), `mouseMoveSpeed`),
  wrapInLabel(`Base Mouse curve: `, renderMouseCurvature(config), `mouse curvature`),
  wrapInLabel(`Lures cast delay: `, renderLuresDelay(config), `lures delay`)
  )
  );
}

const runApp = async () => {
  let config = await ipcRenderer.invoke("get-game-config");
  const settings = elt(`form`, null, renderSettings(config));
  const buttons = elt(`div`, {className: `buttons`}, elt('input', {type: `button`, value: `Ok`}),
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

  const advancedSettings = elt('div', {className: `advanced_settings`},
  elt('p', {className: 'advanced_warning'}, `Warning! Changing any of these options might break the bot.`),
  settings, buttons);
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
  });
};

runApp();
