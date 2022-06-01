const { ipcRenderer } = require("electron");
const elt = require("../ui/utils/elt.js");
const wrapInLabel = require("../ui/utils/wrapInLabel.js");

const renderDelay = ({delay}) => {
  return elt(`div`, {"data-collection": `delay`}, elt(`span`, {className: `option_text`}, `from:`),
     elt('input', {type: `number`, name: `from`, value: delay.from}), elt(`span`, {className: `option_text`}, `to:`),
     elt('input', {type: `number`, name: `to`, value: delay.to}));
};

const renderCastDelay = ({castDelay}) => {
  return elt('input', {type: `number`, name: `castDelay`, value: castDelay})
};

const renderAfterHookDelay = ({afterHookDelay}) => {
  return elt(`div`, {"data-collection": `afterHookDelay`}, elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`, name: `from`, value: afterHookDelay.from}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`, name: `to`, value: afterHookDelay.to})
  );
};

const renderMaxFishTime = ({maxFishTime}) => {
  return elt(`input`, {type: `number`, name: `maxFishTime`, value: maxFishTime});
};

const renderRelZone = ({relZone}) => {
  return elt(`div`, {"data-collection": `relZone`},
      elt(`span`, {className: `option_text`}, `x:`), elt(`input`, {type: `number`, name: `x`, value: relZone.x}),
      elt(`span`, {className: `option_text`}, `y:`), elt(`input`, {type: `number`, name: `y`, value: relZone.y}),
      elt(`span`, {className: `option_text`}, `w:`), elt(`input`, {type: `number`, name: `width`, value: relZone.width}),
      elt(`span`, {className: `option_text`}, `h:`), elt(`input`, {type: `number`, name: `height`, value: relZone.height})
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

const renderCustomName = ({customName}) => {
  return elt(`input`, {type: `text`, name: `customName`, value: customName});
};

const renderRandomSleep = ({randomSleep}) => {
  return elt(`input`, {type: `checkbox`, name: `randomSleep`, checked: randomSleep});
};

const renderRandomSleepEvery = ({randomSleepEvery, randomSleep}) => {
  return elt(`div`, {"data-collection": `randomSleepEvery`}, elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`, name: `from`, value: randomSleepEvery.from, disabled: !randomSleep}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`, name: `to`, value: randomSleepEvery.to, disabled: !randomSleep})
  );
};

const renderRandomSleepDelay = ({randomSleepDelay, randomSleep}) => {
  return elt(`div`, {"data-collection": `randomSleepDelay`}, elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`, name: `from`, value: randomSleepDelay.from, disabled: !randomSleep}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`, name: `to`, value: randomSleepDelay.to, disabled: !randomSleep})
  );
};

const renderReaction = ({reaction}) => {
  return elt(`input`, {type: `checkbox`, name:`reaction`, checked: reaction});
};

const renderReactionDelay = ({reaction, reactionDelay}) => {
  return elt(`div`, {"data-collection": `reactionDelay`}, elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`, name: `from`, value: reactionDelay.from, disabled: !reaction}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`, name: `to`, value: reactionDelay.to, disabled: !reaction})
  );
};


const renderSettings = (config) => {
  return elt('section', {className: `settings`},
  elt(`p`, {className: `settings_header`}, `Random sleep`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Random sleep`, renderRandomSleep(config), `The bot will sleep randomly from time to time for the random duration.`),
  wrapInLabel(`Random sleep every (min)`, renderRandomSleepEvery(config), `The bot will generate a random number from the provided values. The number is generated every time the bot goes to sleep: so the next time the bot goes to sleep it will be always different (randomly generated).`),
  wrapInLabel(`Random sleep for (ms)`, renderRandomSleepDelay(config), `The bot will generate a random number from the provided values. The number is generated every time the bot goes to sleep: so the next time the bot goes to sleep it will be always different(randomly generated).`)
  ),
  elt(`p`, {className: `settings_header`}, `Random reaction`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Reaction`, renderReaction(config), `Randomise reaction time after the bobber was jerked. It might prevent the bots from working properly when used on multiple windows.`),
  wrapInLabel(`Reaction random delay (ms)`, renderReactionDelay(config), `The bot will generate a random number from the provided values. The number is generated every time the bot notice the bobber jerking: so the next time the bot notice the bobber jerking the reaction time will be always different(randomly generated)`)),
  elt(`p`, {className: `settings_header`}, `General`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Custom window name: `, renderCustomName(config), `If for some reason the name of the window of the game isn't "World of Warcraft" you can write a custom name here.`),
  wrapInLabel(`Mouse/keyboard random delay (ms) `, renderDelay(config), `The bot will generate a random number from the provided values. The number is generated every time bot utilizes your mouse or keyboard and represents the delay between pressing/releasing of mouse/keyboard clicks and pressing.`),
  wrapInLabel(`After hook random delay (ms): `, renderAfterHookDelay(config), `The bot will generate a random number from the provided values. The number is generated every time the bot hooked the fish.`),
  wrapInLabel(`Base mouse speed: `, renderMouseMoveSpeed(config), `The bot will generate a random number between this value and 4. The higher the value the faster the bot moves the cursor.`),
  wrapInLabel(`Base mouse curvature: `, renderMouseCurvature(config), `The bot will generate a random number between this value and 100. The higher the value the stronger is the curvature of the movement.`),
  wrapInLabel(`Applying lures delay: `, renderLuresDelay(config), `Applying lures delay.`)),
  elt(`p`, {className: `settings_header`}, `Critical (might break the bot)`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Max check time (ms)`, renderMaxFishTime(config), `Maximum time the bot will wait for the bobber to jerk before casting again.`),
  wrapInLabel(`Checking delay: (ms)`, renderCheckingDelay(config), `How often the bot needs to check the hook for changes.`),
  wrapInLabel(`Fishing zone (%)`, renderRelZone(config), `A zone in which the bot looks for the bobber. The values are percentages of the dimensions of the window: 0.3 = 30%, 0.4 = 40% etc.`),
  wrapInLabel(`Cast animation delay (ms)`, renderCastDelay(config), `How long the bot will wait before starting to look for the bobber in the fishing zone. This value is related to appearing and casting animations.`),
  ));
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
