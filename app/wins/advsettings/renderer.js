const { ipcRenderer, shell } = require("electron");
const elt = require("../../ui/utils/elt.js");
const wrapInLabel = require("../../ui/utils/wrapInLabel.js");
const keySupport = require("./../../utils/keySupport.js");

const convertValue = (node) => {
  let value = node.value;
  if (node.type == "checkbox") {
    value = node.checked;
  }

  if (node.type == "number" || node.type == "range") {
    value = Number(node.value) || 0;
  }

  return value;
};

const renderHideWin = ({hideWin}) => elt(`input`, {type: `checkbox`, checked: hideWin, name: `hideWin`});

const renderLuresOmitInitial = ({luresOmitInitial, lures}) => elt('input', {type: 'checkbox', name: "luresOmitInitial", disabled: !lures, checked: luresOmitInitial})

const renderHighlightPercent = ({highlightPercent}) => {
  const winRange = elt(`input`, {type: `number`, value: highlightPercent, name: "highlightPercent"})
  const range = elt('input', {type: `range`, max: 100, value: highlightPercent, oninput: function() {winRange.value = this.value}, name: "highlightPercent"});
  return elt(`div`, null, range, winRange);
};

const renderColorSwitchOn = ({colorSwitchOn}) => elt('input', {type: `checkbox`, checked: colorSwitchOn, name: "colorSwitchOn"});

const renderMissOnPurposeRandomDelay = ({missOnPurposeRandomDelay, missOnPurpose}) => {
  return elt(`div`, {"data-collection": `missOnPurposeRandomDelay`}, elt(`span`, {className: `option_text`}, `from:`),
     elt('input', {type: `number`, name: `from`, value: missOnPurposeRandomDelay.from, disabled: !missOnPurpose}), elt(`span`, {className: `option_text`}, `to:`),
     elt('input', {type: `number`, name: `to`, value: missOnPurposeRandomDelay.to, disabled: !missOnPurpose}));
};

const renderLikeHumanFineTune = ({likeHumanFineTune}) => {
  let dom = elt("input", {
    type: "checkbox",
    className: "option",
    checked: likeHumanFineTune,
    name: "likeHumanFineTune",
  });
  return dom;
}

const renderDelay = ({delay}) => {
  return elt(`div`, {"data-collection": `delay`}, elt(`span`, {className: `option_text`}, `from:`),
     elt('input', {type: `number`, name: `from`, value: delay.from}), elt(`span`, {className: `option_text`}, `to:`),
     elt('input', {type: `number`, name: `to`, value: delay.to}));
};

const renderDynamicThreshold = ({dynamicThreshold, dynamicThresholdValue}) => {
  let checkbox = elt(`input`, {type: `checkbox`, name: `dynamicThreshold`, checked: dynamicThreshold});
  let input = elt(`input`, {type: `number`, name: `dynamicThresholdValue`, disabled: !dynamicThreshold, value: dynamicThresholdValue});
  return elt(`div`, null, checkbox, input);
};


const renderBobberDensity = ({bobberDensity, autoSensDens, game}) => {

  if(bobberDensity > 10) bobberDensity = 10;
  if(bobberDensity < 1) bobberDensity = 1;
  let bobberDensityWin = elt(`input`, {type: `number`, name: `bobberDensity`, disabled: autoSensDens || game == "Turtle WoW" || game == "Retail", value: bobberDensity});

  return elt(`div`, null, elt('input', {type: `range`, min: 1, max: 10, disabled: autoSensDens || game == "Turtle WoW" || game == "Retail", className: `${autoSensDens || game == "Turtle WoW" || game == "Retail" ? `threshold_disabled` : ``}`, value: bobberDensity, oninput: function() {bobberDensityWin.value = this.value}, name: `bobberDensity`}),
   bobberDensityWin);
};

const renderLogOutFor = ({logOutFor, logOut}) => {
  return elt(`div`, {"data-collection": `logOutFor`}, elt(`span`, {className: `option_text`}, `from:`),
     elt('input', {type: `number`, name: `from`, value: logOutFor.from, disabled: !logOut}), elt(`span`, {className: `option_text`}, `to:`),
     elt('input', {type: `number`, name: `to`, value: logOutFor.to, disabled: !logOut}));
};

const renderLogOutAfter = ({logOutAfter, logOut}) => {
  return elt(`div`, {"data-collection": `logOutAfter`}, elt(`span`, {className: `option_text`}, `from:`),
     elt('input', {type: `number`, name: `from`, value: logOutAfter.from, disabled: !logOut}), elt(`span`, {className: `option_text`}, `to:`),
     elt('input', {type: `number`, name: `to`, value: logOutAfter.to, disabled: !logOut}));
};


const renderCloseLootDelay = ({closeLootDelay}) => {
  return elt('input', {type: `number`, name: `closeLootDelay`, value: closeLootDelay});
};

const renderCloseLoot = ({ closeLoot, whitelist }) => {
  return elt(`select`, {className: `closeLoot`, disabled: !whitelist, value: closeLoot, name: `closeLoot`},
    elt(`option`, {selected: closeLoot == `mouse`, value: `mouse`}, `Mouse`),
    elt(`option`, {selected: closeLoot == `esc`, value: `esc`}, `Escape`),
    elt(`option`, {selected: closeLoot == `mouse+esc`, value: `mouse+esc`}, `Random: Mouse + Escape`),
  );
};

const renderShiftClick = ({shiftClick}) => {
  let dom = elt("input", {
    type: "checkbox",
    className: "option",
    checked: shiftClick,
    name: "shiftClick",
  });
  return dom;
};


const renderCastDelay = ({castDelay}) => {
  return elt('input', {type: `number`, name: `castDelay`, value: castDelay})
};

const renderLogOut = ({logOut}) => {
  return elt('input', {type: `checkbox`, name: `logOut`, checked: logOut})
};

const renderLogOutEvery = ({logOutEvery, logOut}) => {
  return elt(`div`, {"data-collection": `logOutEvery`}, elt(`span`, {className: `option_text`}, `from:`),
     elt('input', {type: `number`, name: `from`, value: logOutEvery.from, disabled: !logOut}), elt(`span`, {className: `option_text`}, `to:`),
     elt('input', {type: `number`, name: `to`, value: logOutEvery.to, disabled: !logOut}));
};

const renderMaxAttempts = ({ maxAttempts }) => {
  return elt('input', {type: 'number', name:"maxAttempts", value: maxAttempts})
};

const renderAfterHookDelay = ({sleepAfterHook, afterHookDelay}) => {
  return elt(`div`, {"data-collection": `afterHookDelay`}, elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`, name: `from`, value: afterHookDelay.from, disabled: !sleepAfterHook}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`, name: `to`, value: afterHookDelay.to, disabled: !sleepAfterHook})
  );
};

const renderMaxFishTime = ({maxFishTime}) => {
  return elt(`input`, {type: `number`, name: `maxFishTime`, value: maxFishTime});
};

const renderCheckingDelay = ({checkingDelay}) => {
  return elt(`input`, {type: `number`, name:`checkingDelay`, value: checkingDelay});
};

const renderMouseMoveSpeed = ({mouseMoveSpeed, likeHuman}) => {
  const winRange = elt(`input`, {type: `number`, value: mouseMoveSpeed, name: "mouseMoveSpeed", disabled: !likeHuman})
  const range = elt('input', {type: `range`, min: 0, className: !likeHuman ? `threshold_disabled` : ``, max: 100, value: mouseMoveSpeed, disabled: !likeHuman, oninput: function() {winRange.value = this.value}, name: "mouseMoveSpeed"});
  return elt(`div`, null, range, winRange);
};

const renderMouseCurvature = ({mouseCurvatureStrength, likeHuman}) => {
  const winRange = elt(`input`, {type: `number`, value: mouseCurvatureStrength, disabled: !likeHuman, name: "mouseCurvatureStrength"})
  const range = elt('input', {type: `range`, className: !likeHuman ? `threshold_disabled` : ``, min: 0, max: 150, value: mouseCurvatureStrength, disabled: !likeHuman, oninput: function() {winRange.value = this.value}, name: "mouseCurvatureStrength"});
  return elt(`div`, null, range, winRange);
};

const renderLuresDelay = ({lures, luresDelay}) => {
  return elt(`input`, {type: `number`, disabled: !lures, name: `luresDelay`, value: luresDelay});
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

const renderMissOnPurpose = ({missOnPurpose}) => {
  return elt(`input`, { type: `checkbox`, name:`missOnPurpose`, checked: missOnPurpose });
};

const renderMaxFishTimeAfter = ({ maxFishTimeAfter }) => {
  return elt(`select`, {className: `maxFishTimeAfter`, name: `maxFishTimeAfter`},
    elt(`option`, {selected: maxFishTimeAfter == `stop`, value: `stop`}, `Stop`),
    elt(`option`, {selected: maxFishTimeAfter == `recast`, value: `recast`}, `Recast`),
  );
}

const renderMissOnPurposeRandom = ({missOnPurpose, missOnPurposeRandom}) => {

  if(missOnPurposeRandom.from > 100) missOnPurposeRandom.from = 100;
  if(missOnPurposeRandom.to > 100) missOnPurposeRandom.to = 100;
  if(missOnPurposeRandom.from < 0) missOnPurposeRandom.from = 0;
  if(missOnPurposeRandom.to < 0) missOnPurposeRandom.to = 0;

  return elt(`div`, {"data-collection": `missOnPurposeRandom`}, elt(`span`, {className: `option_text`}, `from:`),
     elt('input', {type: `number`, name: `from`, value: missOnPurposeRandom.from, disabled: !missOnPurpose}), elt(`span`, {className: `option_text`}, `to:`),
     elt('input', {type: `number`, name: `to`, value: missOnPurposeRandom.to, disabled: !missOnPurpose}));
}

const renderReactionDelay = ({reaction, reactionDelay}) => {
  return elt(`div`, {"data-collection": `reactionDelay`}, elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`, name: `from`, value: reactionDelay.from, disabled: !reaction}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`, name: `to`, value: reactionDelay.to, disabled: !reaction})
  );
};

const renderSleepAfterHook = ({sleepAfterHook}) => {
  return elt(`input`, {type: `checkbox`, name: `sleepAfterHook`, checked: sleepAfterHook});
};

const renderBobberSensitivity = ({bobberSensitivity, bobberSensitivityPrint, autoSensDens}) => {
  let min = 1;
  let max = 3;
  if(bobberSensitivityPrint) {
    min = 1;
    max = 100;
  }

  if(bobberSensitivity > max) bobberSensitivity = max;
  if(bobberSensitivity < min) bobberSensitivity = min;
  let bobberSensitivityWin = elt(`input`, {type: `number`, name: `bobberSensitivity`, value: bobberSensitivity, disabled: autoSensDens});

  return elt(`div`, null, elt('input', {type: `range`, min, max, value: bobberSensitivity, disabled: autoSensDens, className: `${autoSensDens ? `threshold_disabled` : ``}`, oninput: function() {bobberSensitivityWin.value = this.value}, name: `bobberSensitivity`}),
   bobberSensitivityWin);
};


const renderCustomWindow = ({useCustomWindow, customWindow}) => {
  const select = elt(`select`, {name: `customWindow`, disabled: !useCustomWindow, value: customWindow});
  const renderUseCustomWindow = elt(`input`, {name: `useCustomWindow`, type: `checkbox`, checked: useCustomWindow});

  if(useCustomWindow) {
    ipcRenderer.invoke('get-all-windows')
    .then((windows) => {
      windows.forEach(({title}) => {
        select.append(elt(`option`, { selected: title == customWindow }, title));
      })
    });
  }
  return elt(`div`, null, renderUseCustomWindow, select);

};

const renderSplashColor = ({splashColor}) => {
let min = 100;
let max = 255;
if (splashColor < min) splashColor = min;
if (splashColor > max) splashColor = max;

  let splashColorWin = elt(`input`, {type: `number`, name: `splashColor`, value: splashColor });
  return elt(`div`, null, elt('input', {type: `range`, min, max, value: splashColor, oninput: function() {splashColorWin.value = this.value}, name: `splashColor`}),
   splashColorWin);
};

const renderIgnorePreliminary = ({ignorePreliminary}) => {
  return elt(`input`, {type: `checkbox`, checked: ignorePreliminary, name: `ignorePreliminary`});
}


const renderMammoth = () => {
  return elt('input', {type: `checkbox`, checked: false, disabled: true});
};

const renderMammothKey = () => {
  const key = elt('input', {type: `text`, disabled: true, value: `F4`});
  key.setAttribute(`readonly`, `true`);
  return key;
};

const renderMammothKeyDelay = () => {
  return elt('input', {type: `number`, disabled: true, value: 3000});
};

const renderMammothSellDelay = () => {
  return elt(`div`, null, elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`, value: 2000, disabled: true}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`,  value: 5000, disabled: true})
  );
};

const renderMammothApplyEvery= () => {
  return elt(`div`, null, elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`, value: 5, disabled: true}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`, value: 10, disabled: true})
  );
};

const renderMammothTraderName = () => {
    return elt('input', {type: `text`, disabled: true, value: `Trader`});
};

const renderSoundDetection = () => {
    return elt(`input`, {type: `checkbox`, disabled: true, checked: false});
};

const renderSoundDetectionRange = () => {
    let soundDetectionRangeWin = elt(`input`, {type: `number`, value: 800, disabled: true});

    return elt(`div`, null, elt('input', {type: `range`, min: 128, max: 1100, value: 800, disabled: true, className: `threshold_disabled`}),
     soundDetectionRangeWin);
};


const renderTmApiKey = () => {
  return elt('div', null, elt('input', {type: `text`, disabled: true, value: ``, className: `tmApiKey`}), elt('input', {type: `button`, className: "dummy_button", value: `Connect`}));
};

const renderDetectWhisper = () => {
  return elt('input', {type: `checkbox`, disabled: true, checked: false});
};

const renderWhisperThreshold = () => {
  let colorWin = elt(`div`, {className: `whisperColorBox`, disabled: true});
  let range = elt('input', {type: `range`, min: 0, max: 255, value: 0, className: `whisperRange`, disabled: true, className: `threshold_disabled`});
  return elt(`div`, null, range, colorWin);
};

const renderQuitAtWhisper = () => {
  return elt(`input`, {type: `checkbox`, checked: false, disabled: true});
}

const renderRngMove = () => {
  return elt(`input`, {type: `checkbox`, disabled: true,  checked: false});
};

const renderRngMoveTimer = () => {
  return elt(`div`, null, elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`, className: `rngMoveTimer_from`, value: 2, disabled: true}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`, value: 5, disabled: true})
  );
}

const renderRngMoveRadiusMax = () => {
  return elt(`div`, null, elt(`span`, {className: `option_text`}, `x:`),
  elt('input', {type: `number`, value: 150, disabled: true}), elt(`span`, {className: `option_text`}, `y:`),
  elt('input', {type: `number`, value: 15, disabled: true})
  );
};

const renderRngMoveRadiusStep = () => {
  return elt(`div`, null, elt(`span`, {className: `option_text`}, `x:`),
  elt('input', {type: `number`, value: 100, disabled: true}), elt(`span`, {className: `option_text`}, `y:`),
  elt('input', {type: `number`, value: 15, disabled: true})
  );
};

const renderRngMoveDirLengthMax = () => {
  return elt(`div`, null,
      elt(`span`, {className: `option_text`}, `w:`), elt(`input`, {disabled: true, type: `number`, step: 1, value: 50}),
      elt(`span`, {className: `option_text`}, `s:`), elt(`input`, {disabled: true, type: `number`, step: 1, value: 50}),
      elt(`span`, {className: `option_text`}, `a:`), elt(`input`, {disabled: true, type: `number`, step: 1, value: 200}),
      elt(`span`, {className: `option_text`}, `d:`), elt(`input`, {disabled: true, type: `number`, step: 1, value: 200})
    );
};

const renderRngMoveDirLength = () => {
  return elt(`div`, null, elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`, className: `rngMoveTimer_from`, value: 100, disabled: true}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`, value: 100, disabled: true})
  );
};

const renderRngMoveBalanceTime = () => {
  return elt(`input`, {disabled: true, type: `number`, value: 5});
};

const renderArduino = () => {
    return elt(`input`, {type: `checkbox`, disabled: true, checked: false});
};

const renderArduinoPort = () => {
    let select = elt(`select`, {disabled: true}, elt(`option`, null, 'COM1'));
    return elt(`div`, null, select, elt(`input`, {type: `button`, className: "dummy_button",  value: `Connect`}));
};

const renderArduinoRate = () => {
  return elt(`select`, {disabled: true, className: `arduino_rate`}, ...[9600, 14400, 19200, 38400, 57600, 115200].map((rate) => elt(`option`, null, `${rate}`)))
}


const renderLikeHuman = ({likeHuman}) => {
  return elt("input", {
    type: "checkbox",
    className: "option",
    checked: likeHuman,
    name: "likeHuman",
  });
};

const renderAutoSensDens = ({autoSensDens, game}) => {
  return elt(`input`, {type: `checkbox`, disabled: game == `Vanilla (splash)`, checked: autoSensDens, name: `autoSensDens`});
};

const renderFindBobberDirection = ({findBobberDirection, game}) => {
  return elt(`select`, {name: `findBobberDirection`, disabled: game == `Vanilla (splash)`}, ...([`normal`, `reverse`, `center`].map(dir => elt(`option`, {value: dir, selected: findBobberDirection == dir}, dir.slice(0, 1).toUpperCase() + dir.slice(1)))))
};


const renderAfterTimer = ({afterTimer, timer}) => {
  let options = [
    `Stop`,
    `HS`,
    `Quit`,
    `HS + Quit`
  ]
  return elt('select', {value: afterTimer, name: "afterTimer", disabled: !timer}, ...options.map(option => elt(`option`, {value: option, selected: option == afterTimer}, option)));
};

const renderHsKey = ({hsKey, afterTimer}) => {
  const key = elt('input', {type: `text`, name: `hsKey`, disabled: afterTimer != `HS` && afterTimer != `HS + Quit`, value: hsKey});
  key.setAttribute(`readonly`, `true`);
  return key;
};

const renderHsKeyDelay = ({hsKeyDelay, afterTimer}) => {
  return elt(`input`, {type: `number`, value: hsKeyDelay, disabled: afterTimer != `HS` && afterTimer != `HS + Quit`, name: `hsKeyDelay`})
}

const renderShutDown = ({timerShutDown, afterTimer}) => {
  return elt(`input`, {type: `checkbox`, checked: timerShutDown, disabled: afterTimer != `Quit` && afterTimer != `HS + Quit`, name: `timerShutDown`});
};

const renderTimer = ({timer}) => elt('input', {type: 'checkbox', checked: timer, name: "timer"});

const renderTimerTime = ({timerTime, timer}) => {
  return elt(
    "input",
    { type: "number", min: "0", value: timerTime, disabled: !timer, name: "timerTime", title: "Minutes"},
    `(min)`
  );
};

const renderLures = ({lures}) => {
  return elt("input", {
    type: "checkbox",
    className: "option",
    checked: lures,
    name: "lures",
  });
};

const renderLuresKey = ({lures, luresKey}) => {
  let key = elt('input', {type: 'text', value: luresKey, disabled: !lures, name: "luresKey"});
  key.setAttribute(`readonly`, `true`);
  return key;
};

const renderLuresApplyDelay = ({lures, luresDelayMin}) => {
  return elt('input', {type: 'number', value: luresDelayMin, disabled: !lures, name: "luresDelayMin"});
};


const renderFilterType = ({whitelist, filterType}) => {
  return elt(`select`, {name: `filterType`, className: `filterType`, disabled: !whitelist},
    elt(`option`, {selected: filterType == `whitelist`, value: "whitelist"}, `Whitelist`),
    elt(`option`, {selected: filterType == `blacklist`, value: "blacklist"}, `Blacklist`)
  );
}

const renderFilterAtMouse = ({game, whitelist, atMouse}) => {
  if(game != `Retail` && game != `Vanilla` && game != `Vanilla (splash)` && game != `Turtle WoW`) {
    atMouse = true;
  }
  return elt(`input`, {name: `atMouse`, type:`checkbox`, checked: atMouse, className: `atMouse`, disabled: !whitelist || game != `Retail`});
}

const renderWhitelistLanguage = ({whitelist, whitelistLanguage}) => {
  let languages = [`eng`, `spa`, `spa_old`, `por`, `fra`, `deu`, `ita`, `chi_sim`, `chi_tra`, `kor`, `rus`];
  let properLanguages = {eng: `English`, spa: "Spanish", spa_old: "Spanish Old", deu: "Deutsch", por: "Português", fra: "Français", ita: "Italiano", chi_sim: "Simplified Chinese", chi_tra: "Traditional Chinese", kor: "Korean", rus: "Russian"};
  return elt('select', {name: `whitelistLanguage`, className: `whitelistLanguage` , disabled: !whitelist}, ...languages.map(language => elt(`option`, {selected: whitelistLanguage == language, value: language}, `${properLanguages[language]}`)));
}

const renderWhitelistWords = ({whitelist, whitelistWords}) => {
  return elt('textarea', {name:"whitelistWords", placeholder: `Red Salmon, Curcian Carp, Dragon Goby`, className: "whitelist_input", value: whitelistWords, disabled: !whitelist})
}

const renderWhitelist = ({whitelist}) => {
 return elt('input', {type: 'checkbox', name: "whitelist", onclick: () => { if(!whitelist) {ipcRenderer.send("whitelist-warn")}}, checked: whitelist})
};

const renderSpares = () => {
  return elt('input', {type: 'button', className: "dummy_button spares-addButton" });
}
const renderSparesOmitInitial = () => elt('input', {type: 'checkbox', disabled: true, checked: true})
const renderCatchFishButton = ({catchFishButton}) => elt("select", {name: "catchFishButton"}, ...["right", "left", "middle"].map(button => elt('option', {selected: catchFishButton == button}, button)))

const renderCheckChanges = ({checkChanges}) => elt('input', {type: 'checkbox', disabled: true, checked: false});
const renderCheckChangesSens = ({checkChanges, checkChangesSens}) => {
  const winRange = elt(`input`, {type: `number`, value: 900, disabled: !checkChanges})
  const range = elt('input', {type: `range`, max: 1000, min: 1, step: 1, value: checkChangesSens, className: `${!checkChanges ? `threshold_disabled` : ``}`, disabled: !checkChanges,  oninput: function() {winRange.value = this.value}});
  return elt(`div`, null, range, winRange);
}
const renderCheckChangesInterval = ({checkChanges, checkChangesInterval}) => elt('input', {type: "number",  value: 1, disabled: !checkChanges});
const renderCheckChangesIntervalAfter = ({checkChanges, checkChangesIntervalAfter}) => elt('input', {type: "number",  value: 3, disabled: !checkChanges});
const renderCheckChangesSendImg = ({checkChanges, checkChangesSendImg}) => elt('input', {type: 'checkbox',  checked: true, disabled: !checkChanges});
const renderCheckChangesDoAfter = ({checkChanges, checkChangesDoAfter}) => elt('select', { disabled: !checkChanges}, ...['nothing', 'stop', 'quit'].map(type => elt('option', {value: type, selected: true}, `${type[0].toUpperCase()}${type.slice(1)}`)))
const renderCheckChangesIgnoreActions = ({checkChanges, checkChangesIgnoreActions}) => elt('input', {type: 'checkbox', disabled: !checkChanges, checked: true});
const renderLibraryType = ({libraryType}) => elt('select', { name: "libraryType" }, ...['nut.js', 'keysender'].map(lib => elt('option', {selected: lib == libraryType}, lib)));


const renderApplyFatigue = ({applyFatigue = false}) => elt('input', {name: "applyFatigue", type: "checkbox", checked: applyFatigue, disabled: true});
const renderApplyFatigueEvery = ({applyFatigue = false, applyFatigueEvery = {from: 1, to: 5}}) => {
  return elt(`div`, null , elt(`span`, {className: `option_text`}, `from:`),
  elt('input', {type: `number`,  value: applyFatigueEvery.from, disabled: true}), elt(`span`, {className: `option_text`}, `to:`),
  elt('input', {type: `number`,  value: applyFatigueEvery.to, disabled: true})
  );
};
const renderApplyFatigueRate = ({applyFatigue = false, applyFatigueRate = 0.5}) => {
  const winRange = elt(`input`, {type: `number`, disabled: true, value: applyFatigueRate, name: "applyFatigueRate"})
  const range = elt('input', {type: `range`, step: 0.1, max: 10, disabled: true,  className: applyFatigue ? `` : `threshold_disabled`, value: applyFatigueRate, oninput: function() {winRange.value = this.value}, name: "applyFatigueRate"});
  return elt(`div`, null, range, winRange);
}

const renderLibraryTypeInput = ({libraryTypeInput}) => {
  const libs = ['nut.js', 'keysender'];
  return elt('select', {name: 'libraryTypeInput'}, ...libs.map(lib => elt('option', {value: lib, selected: lib == libraryTypeInput}, lib)))
};

const renderSettings = (config) => {
  return elt('section', {className: `settings settings_advSettings`},
    elt(`p`, {className: `settings_header advanced_settings_header`}, `🛠️`), elt(`span`, {className: `advanced_settings_header_text`}, `General`),
  elt('div', {className: "settings_section"},
  wrapInLabel(
    "Human-like Movement: ",
    renderLikeHuman(config),
    `The bot will move your mouse in a human way: random speed and with a slight random deviation in the movement. Otherwise it will move the mouse instantly, which might be a better option if you use a lot of windows.`
  ),
  wrapInLabel(`Human-like Accuracy: `, renderLikeHumanFineTune(config), `The bot will "fine-tune" the mouse position after moving to the bobber, imitating a human-like way of reaching the mouse-movement target position.`),
  wrapInLabel(
    "Use Shift + Click: ",
    renderShiftClick(config),
    `Use shift + click instead of Auto Loot. Check this option if you don't want to turn on Auto Loot option in the game. Your "Loot key" in the game should be assigned to shift.`
  ),
wrapInLabel(`Attempts Limit: `, renderMaxAttempts(config), `How many times the bot will fail finding bobber before stopping.`),
  wrapInLabel(`Dynamic Threshold: `, renderDynamicThreshold(config), `ONLY FOR MANUAL MODE. After attempts limit the bot will dynamically change threshold by the provided value.`),
  wrapInLabel(`Catch With Mouse Button: `, renderCatchFishButton(config), `Choose the button you want the bot to click when it wants to catch the fish.`),
  ),

  elt(`p`, {className: `settings_header advanced_settings_header`}, `🖱️`), elt(`span`, {className: `advanced_settings_header_text`}, `Mouse & Keyboard`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Random Mouse Speed: `, renderMouseMoveSpeed(config), `The bot will generate a random speed within the provided value. The higher the value the faster the bot moves the cursor. Works only if Like a human option is on.`),
  wrapInLabel(`Random Mouse Curvature: `, renderMouseCurvature(config), `The bot will generate a random number within the provided value. The higher the value the stronger is the deviation of the movement. Works only if Like a human option is on.`),
  wrapInLabel(`Highlight Bobber (%): `, renderHighlightPercent(config), `How often the bot should highlight the bobber before checking on it (if in your game the bobber become brigther or more colourfull after highlighting, then change this value to 100% if you don't care for randomness)`),
  wrapInLabel(`Input Library: `, renderLibraryTypeInput(config), `Different ways of simulating keyboard and mouse actions.`),
  wrapInLabel(`Mouse/Keyboard random delay (ms): `, renderDelay(config), `The bot will generate a random number between the provided values. The number is generated every time bot utilizes your mouse or keyboard and represents the delay between pressing/releasing of mouse/keyboard clicks and pressing.`),
  ),

  elt("p", {className: 'settings_header advanced_settings_header'}, "🔎"),  elt(`span`, {className: `advanced_settings_header_text`}, `Filter`),
  elt(
    "div",
    { className: "settings_section" },
    wrapInLabel("Use Filter: ",
      renderWhitelist(config),
      `The bot will loot only items in the whitelist. Before using, turn off AutoLoot in the game and set UI Scale to default. The names of the items must be exactly the same as in the game, separated by comma. `
    ),
    wrapInLabel("Mode: ", renderFilterType(config), `Filter Mode will decide whether to pick or to ignore items in the list.`),
    wrapInLabel("Language: ", renderWhitelistLanguage(config), `If it's the first time you using a language from the list, wait until the bot downloads the tesseract data for your language. `),
    wrapInLabel(`Close Loot Window With: `, renderCloseLoot(config), `The bot will use mouse/esc or randomly one of them to close the loot window while filtering the loot.`),
    wrapInLabel("Loot Window At Mouse: ", renderFilterAtMouse(config), `Loot window at mouse will tell the bot whether it should check the loot window at mouse or the default loot window at the left side of the screen.`),
    wrapInLabel("", renderWhitelistWords(config))
  ),

  elt(`p`, {className: `settings_header`}, `🖥️`), elt(`span`, {className: `advanced_settings_header_text`}, `Window`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Custom Window: `, renderCustomWindow(config), `If for some reason your game window isn't "World of Warcraft" you can choose a custom window from all the windows opened on your computer.`),
  wrapInLabel(`Hide Bot After Start: `, renderHideWin(config), `The window of the bot will be hidden and you will be able to stop it only by using the stop key.`),
  ),

  elt(`p`, {className: `settings_header`}, `🎣`), elt(`span`, {className: `advanced_settings_header_text`}, `Lures`), elt(`a`, {href: `#`, style: `margin-left: 3px`, onclick: () => {shell.openExternal("https://github.com/jsbots/AutoFish#applying-lures-pushpin")}}, `(Guide)`),
elt('div', {className: "settings_section"},
wrapInLabel(
      "Use Lures: ",
      renderLures(config),
      `Check this option if you want to use fishing lures. If your game requires manual application of lures, use a macros for that and assign that macro to Lures Key option.`
    ),
wrapInLabel(
  "Lures Key: ",
  renderLuresKey(config),
  `Assign the same key you use for using fishing lures.`
),
wrapInLabel(
  "Reuse Lure (min): ",
  renderLuresApplyDelay(config),
  `Fishing lures expiration time in minutes.`
),
wrapInLabel(`Applying lures delay (ms):`, renderLuresDelay(config), `How much it takes the bot to apply the lure.`),
wrapInLabel(`Omit Initial Application`, renderLuresOmitInitial(config), `Don't apply lures at the beggining, wait until timer elapses.`),
),

elt(`p`, {className: `settings_header`}, `⏲️`), elt(`span`, {className: `advanced_settings_header_text`}, `Timer`),
elt('div', {className: "settings_section"},
wrapInLabel("Use Timer: ", renderTimer(config),`It's timer. It's too dificult to explain here, so you can ask AI what is it exactly.`),
wrapInLabel("Time (min): ", renderTimerTime(config),`The bot will work for the given period of minutes.`),
wrapInLabel("Do After Timer: ", renderAfterTimer(config),`What the bot should do after the timer elapses (you can set it in the main window)`),
wrapInLabel("HS Key: ", renderHsKey(config), `A key your HS is assigned.`),
wrapInLabel("HS Delay (sec): ", renderHsKeyDelay(config), `How long it take to use HS`),
wrapInLabel("Shut Down Computer After Quitting: ", renderShutDown(config), `The bot will press Left Windows Key and launch command line, after that it will write shutdown -s -t 10 command which will shut down your computer in 10 seconds. `),
),


elt(`p`, {className: `settings_header`}, `🎯`), elt(`span`, {className: `advanced_settings_header_text`}, `Miss On Purpose`),
elt('div', {className: "settings_section"},
  wrapInLabel(`Miss On Purpose: `, renderMissOnPurpose(config), `The bot will miss fish on purpose to simulate a human mistake. The value is % chance per cast that the bot will miss (it's not % of the whole session, so it might be drastically different).`),
  wrapInLabel(`Random Miss On Purpose (per throw): (%)`, renderMissOnPurposeRandom(config), `The bot will generate a random number from the provided values. The number is generated every fishing session: so the next time you start the bot, it will be always different (randomly generated) between the given values.`),
  wrapInLabel(`Miss On Purpose Delay: (sec) `, renderMissOnPurposeRandomDelay(config), `Random delay after which the bot will miss on purpuse. The bot will generate a random number from the provided values. The number is generated every fishing session: so the next time you start the bot, it will be always different (randomly generated) between the given values.`)
  ),
  elt(`p`, {className: `settings_header`}, `🚪`),elt(`span`, {className: `advanced_settings_header_text`}, `Logging Out`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Log Out/Log In:`, renderLogOut(config), `The bot will log out from the game after the given time, wait for a couple of minutes and log back to the game.`),
  wrapInLabel(`Random Log Out Every: (min)`, renderLogOutEvery(config), `The bot will generate a random number from the provided values. The number is generated every time the bot logs out: so the next time the bot logs out, it will be always different (randomly generated).`),
  wrapInLabel(`Random Log Out For: (sec)`, renderLogOutFor(config), `How long the bot should be stayed logged out. The bot will generate a random number from the provided values. The number is generated every time the bot logs out: so the next time the bot logs out, it will be always different (randomly generated).`),
  wrapInLabel(`Random Log Out After: (sec)`, renderLogOutAfter(config), `How long the bot should wait before starting fishing again. The bot will generate a random number from the provided values. The number is generated every time the bot logs out: so the next time the bot logs out, it will be always different (randomly generated).`),
  ),
  elt(`p`, {className: `settings_header`}, `💤`), elt(`span`, {className: `advanced_settings_header_text`}, `Random Sleep`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Random Sleep:`, renderRandomSleep(config), `The bot will sleep randomly from time to time for the random duration.`),
  wrapInLabel(`Random Sleep Every (min):`, renderRandomSleepEvery(config), `The bot will generate a random number from the provided values. The number is generated every time the bot goes to sleep: so the next time the bot goes to sleep it will be always different (randomly generated).`),
  wrapInLabel(`Random Sleep For (sec):`, renderRandomSleepDelay(config), `The bot will generate a random number from the provided values. The number is generated every time the bot goes to sleep: so the next time the bot goes to sleep it will be always different(randomly generated).`)
  ),
  elt(`p`, {className: `settings_header`}, `💤`), elt(`span`, {className: `advanced_settings_header_text`}, `Reaction Time`),
elt('div', {className: "settings_section"},
  wrapInLabel(`Random Reaction:`, renderReaction(config), `Randomise reaction time before any action.`),
  wrapInLabel(`Random Reaction delay (ms):`, renderReactionDelay(config), `The bot will generate a random number from the provided values. The number is generated every time the bot needs to move/press/click something: so the next time the bot uses your mouse/keyboard the reaction time will be always different(randomly generated)`)),
  elt(`p`, {className: `settings_header`}, `💤`), elt(`span`, {className: `advanced_settings_header_text`}, `Sleep After Catch`),
  elt('div', {className: "settings_section"},
  wrapInLabel(`Sleep After Catch:`, renderSleepAfterHook(config), `The bot will sleep after it hooked the fish for the random duration.`),
  wrapInLabel(`After Catch Random Delay (ms): `, renderAfterHookDelay(config), `The bot will generate a random number from the provided values. The number is generated every time the bot hooked the fish.`),
  ),

  elt(`p`, {className: `settings_header settings_header_premium`}, `🥱`), elt(`span`, {className: `advanced_settings_header_text`}, `Fatigue`),
  elt('div', {className: "settings_section settings_premium"},
  wrapInLabel(`Apply Fatigue:`, renderApplyFatigue(config), `The bot will simulate fatigueness by decreasing all the delay values by given rate.`),
  wrapInLabel(`Apply Fatigue Every (min):`, renderApplyFatigueEvery(config), `The bot will randomly apply fatigueness between the provided interval`),
  wrapInLabel(`Fatigue Rate (%):`, renderApplyFatigueRate(config), `The rate value of fatigueness which will make all the delay values increase in geometric progression.`),
  ),


elt(`p`, {className: `settings_header settings_header_premium`}, `🧙`),elt(`span`, {className: `advanced_settings_header_text`}, `Additional Actions`),
elt(`div`, {className: `settings_section settings_premium`},
    wrapInLabel(`Omit Initial Application`, renderSparesOmitInitial(config), `Don't apply additional actions at the beggining, wait until timer elapses.`),
  renderSpares(config)
),

elt(`p`, {className: `settings_header settings_header_premium`}, `📲`),  elt(`span`, {className: `advanced_settings_header_text`}, `Remote Control`), elt(`span`, {className: `premium_lock`, id:`link`, url: `https://youtu.be/aKulvFK6ubg`}),
elt(`div`, {className: `settings_section settings_premium`},
  wrapInLabel(`Telegram Token:`, renderTmApiKey(config), `Provide telegram token created by t.me/BotFather and press connect.`),
  wrapInLabel(`Detect Whisper:`, renderDetectWhisper(config), `The bot will analyze Chat Zone for Whisper Threshold purple colors, if it finds any it will notifiy telegram bot you connected through token.`),
  wrapInLabel(`Stop Bot And Quit At Whisper:`, renderQuitAtWhisper(config), `The bot will stop and quit when being whispered.`),
  wrapInLabel(`Whisper Threshold:`, renderWhisperThreshold(config), `The intensity of purple color the bot will recognize as whispering.`),
),

elt(`p`, {className: `settings_header settings_header_premium`}, `🏃`), elt(`span`, {className: `advanced_settings_header_text`}, `Motion Detection`), elt(`span`, {className: `premium_lock`, id:`link`, url: `https://youtu.be/0FCvm75yl5U`}),
elt(`div`, {className: `settings_section settings_premium`},
wrapInLabel('Use Motion Detection: ', renderCheckChanges(config), `The bot will detect changes within Detection Zone. The bot will notify you in Telegram if some movement happens within Detection Zone.`),
wrapInLabel('Send Screenshot Of The Event To Telegram:', renderCheckChangesSendImg(config), `The bot will send a screenshot of what exactly triggered the event.`),
wrapInLabel('Ignore My Actions:', renderCheckChangesIgnoreActions(config), `The bot will try to ignore time when you do something: cast, catch, move camera, log out and so on.`),
wrapInLabel('Interval (sec): ', renderCheckChangesInterval(config), `The bot will check for motion every given interval value.`),
wrapInLabel('Ignore Time After Event Occured (sec): ', renderCheckChangesIntervalAfter(config), `After some event happened how long to ignore all the events after. `),
wrapInLabel('Do After Event: ', renderCheckChangesDoAfter(config), `What to do after the event occured.`),
wrapInLabel('Sensitivity: ', renderCheckChangesSens(config), `Old good sensitivity value for a typical motion detection. Doesn't need an explanation, right?`),
),

  elt(`p`, {className: `settings_header settings_header_premium`}, `🔊`), elt(`span`, {className: `advanced_settings_header_text`}, `Sound Detection`), elt(`span`, {className: `premium_lock`, id:`link`, url: `https://youtu.be/ZggOy8tA32A`}),
  elt('div', {className: "settings_section settings_premium"},
  wrapInLabel(`Sound Detection: `, renderSoundDetection(config), `The bot will check the change of sound instead of the change of pixels when it should catch the fish.`),
  wrapInLabel(`Sound Detection Range: `, renderSoundDetectionRange(config), `The strength of the noise created by jerking of the bobber`),
  ),

    elt(`p`, {className: `settings_header settings_header_premium`}, `🎮`), elt(`span`, {className: `advanced_settings_header_text`}, `Arduino Control`), elt(`span`, {className: `premium_lock`, id:`link`, url:`https://youtu.be/yE-qARS73oo`}),
      elt('div', {className: "settings_section settings_premium"},
      wrapInLabel(`Use Arduino Board: `, renderArduino(config), `Using an Arduino Board will allow you to emulate a device in 100% hardware way: it will look like a real keyboard or mouse to the OS and the game. Check the guide on how to use an Arduino Board with AutoFish (Help -> Arduino Guide)`),
      wrapInLabel(`COM Port: `, renderArduinoPort(config), `Choose the COM port of the Arduino Board connected to your computer and press Connect button.`),
      wrapInLabel(`Bits Per Second: `, renderArduinoRate(config), `Don't change this value if you don't know what you are doing. The value should be the same as in Arduino Sketch provided in the guide (you can find it in the top of the sketch)`)
      ),

  elt(`p`, {className: `settings_header settings_header_premium`}, `🐘`), elt(`span`, {className: `advanced_settings_header_text`}, `Mount Selling`), elt(`span`, {className: `premium_lock`, id:`link`, url:`https://youtu.be/zY2LqAPszdg`}),
  elt('div', {className: "settings_section settings_premium"},
  wrapInLabel(`Use Mount for selling: `, renderMammoth(config), `You can summon a mammoth carrying traders during the fishing and then sell all the scrap to one of them using any addon for selling such scrap.`),
  wrapInLabel(`Mount Key: `, renderMammothKey(config), `A key that will be used to summon a mammoth mount.`),
  wrapInLabel(`Mount Key Delay(ms): `, renderMammothKeyDelay(config), `How long the bot will wait after summoning a mammoth mount.`),
  wrapInLabel(`Mount Sell Delay(ms): `, renderMammothSellDelay(config), `How long it will take to sell all the scrap to a trader. The bot will generate a random number from the provided values. The number is generated every time the bot interacts with the trader: so the next time the bot interacts with the trader it will be always different (randomly generated).`),
  wrapInLabel(`Mount Apply Every(min): `, renderMammothApplyEvery(config), `A randomly generated interval of summoning a mammoth mount. The bot will summon a mammoth and then generate a new random value between the provided ones.`),
  wrapInLabel(`Mount Trader Name: `, renderMammothTraderName(config), `The bot will use /target trader_name command to target one of your traders. Check the name of one you want to use for trading and write it here. The bot will use interaction key for interaction with a trader, you can assign it in them main settings.`),
  ),
  elt(`p`, {className: `settings_header settings_header_premium`}, `🤖`),elt(`span`, {className: `advanced_settings_header_text`}, `Random Movement`), elt(`span`, {className: `premium_lock`, id:`link`, url:`https://youtu.be/o1hU3fNn4uk`}),
  elt('div', {className: "settings_section settings_premium"},
  wrapInLabel(`Use Random Movement`, renderRngMove(config), `The bot will move your camera view and the character within the given x and y radius and within w, a, s, d keys (press/release) delay.`),
  wrapInLabel(`Camera Movement Max (px):`, renderRngMoveRadiusMax(config), `Maximum radius the bot will randomly move your camera.`),
  wrapInLabel(`Camera Movement Step (px):`, renderRngMoveRadiusStep(config), `Size of the step the bot will move your camera. The bot wil choose a random value between -value and +value and move your camera by the given value.`),
  wrapInLabel(`Keys Moves Max:`, renderRngMoveDirLengthMax(config), `Maximum delay of how long the bot will press w, s, a, d keys.`),
  wrapInLabel(`Balancing Time Every (min):`, renderRngMoveBalanceTime(config), `How often the bot should balance its position and camera direction to default values.`),
  wrapInLabel(`Keys Moves Step:`, renderRngMoveDirLength(config), `Step delay of how long the bot will press w, s, a, d keys.`),
  wrapInLabel(`Use Random Camera Every (min): `, renderRngMoveTimer(config), `How often the bot should use random camera view and character position.`),
  ),

  elt(`p`, {className: `settings_header settings_header_critical`}, `⚠️`), elt(`span`, {className: `advanced_settings_header_text`}, `Critical`),
  elt('div', {className: "settings_section settings_critical"},
  wrapInLabel(`Visual Library: `, renderLibraryType(config), `If something doesn't work with default library you can choose another one. Mind that keysender works only with dx11.`),
  wrapInLabel(`Looking For Bobber Direction:`, renderFindBobberDirection(config), `The direction how the bot will look for the bobber in the fishing zone. Normal means from left to right and from top to bottom, Reverse means from left to right and from bottom to top, Center means from the very center of the Fishing Zone to its borders.`),
  wrapInLabel(`Ignore Preliminary Checks:`, renderIgnorePreliminary(config), `The bot will ignore all the preliminary checks including notification errors.`),
  wrapInLabel(`Max Check Time (sec):`, renderMaxFishTime(config), `Maximum time the bot will wait for the bobber to jerk before casting again.`),
  wrapInLabel(`Do After Max Check Time:`, renderMaxFishTimeAfter(config), `What the bot should do if it reaches the maximum checking time.`),
  wrapInLabel(`Loot Window Closing Delay (ms):`, renderCloseLootDelay(config), `How long does it take for the loot window to disappear after looting. If you use some special addons which turn off loot window completely, you can set this value to 0 to make the bot work faster.`),
  wrapInLabel(`Bobber Check Time (ms):`, renderCheckingDelay(config), `How often the bot checks the bobber for any movements. Use this option in addition to Bobber Sensativity to find an optimal sensitivity.`),
  wrapInLabel(`Cast Animation Delay (ms):`, renderCastDelay(config), `How long the bot will wait before starting to look for the bobber in the fishing zone. This value is related to appearing and casting animations.`),
  wrapInLabel(`Auto Color: `, renderColorSwitchOn(config), `If there is a lot of colors of your switch in the environment the bot will automatically switch to the other color.`),
  wrapInLabel(`Auto Density and Sensitivity:`, renderAutoSensDens(config), `The bot will auto-adjust both Sensitivity and Density values per each cast.`),
  wrapInLabel(`${config.game == `Vanilla (splash)` ? `Splash` : `Bobber`} Sensitivity (px):`,
   renderBobberSensitivity(config), config.game == `Vanilla (splash)` ?
    `The size of the zone which will be checked for splash, if the bot doesn't react to "plunging" animation - increase this value.`
    : `How sensitive the bot is to any movements of the bobber. If the bot often clicks too early, increase this value (don't confuse it with when the bot missclicks on purpose). If the bot often doesn't react to bobber (it might look like it clicks with delay), decrease this value.`),
  config.game == `Vanilla (splash)` ? wrapInLabel(`Splash color: `, renderSplashColor(config), `Whitness of the splash effect: should be smaller at night and higher during the day. `) : ``,
  wrapInLabel(`Bobber Density (px):`, renderBobberDensity(config), `Density decides where exactly the bot sticks on the feather. The larger the feather the larger the value should be. Increase this value if the bot clicks too early.`),

),
)
}

const runApp = async () => {
  let config = await ipcRenderer.invoke("get-game-config");
  const settings = elt(`form`, {className: `advSettings_settings`}, renderSettings(config));
  const buttons = elt(`div`, {className: `buttons`},
     elt('input', {type: `button`, value: `Ok`}),
     elt('input', {type: `button`, value: `Cancel`}),
     elt('input', {type: `button`, value: `Defaults`}))

  buttons.addEventListener(`click`, async (event) => {
    if(event.target.value == 'Ok') {
      gatherConfig();
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

  const keyAssigning = (event) => {
    if(event.key == ` `) {
      event.target.value = `space`;
    } else {
      let firstChar = event.key[0].toLowerCase();
      let resultKey = firstChar + event.key.slice(1);
      if(keySupport.isSupported(resultKey)) {
        event.target.value = resultKey;
      } else {
        ipcRenderer.send(`unsupported-key-win`);
      }
    }
    gatherConfig();
    document.removeEventListener(`keydown`, keyAssigning);
    event.target.blur();
    event.preventDefault();
  }

  settings.addEventListener('click', (event) => {
    if(event.target.name == 'lures' && event.target.checked) {
      ipcRenderer.send(`lures-warn`);
    }
  })

  settings.addEventListener('mousedown', (event) => {
    if(event.target.id == `link`) {
      ipcRenderer.send(`open-link`, event.target.url);
    }

    if((event.target.name == `hsKey` || event.target.name == 'luresKey') && !event.target.disabled) {
      event.target.style.backgroundColor = `rgb(255, 104, 101)`;
      event.target.style.border = `1px solid grey`;

      event.target.addEventListener(`blur`, function bluring(event) {
        event.target.style.backgroundColor = `white`;
        event.target.style.border = `1px solid grey`;
        event.target.removeEventListener(`blur`, bluring);
        event.target.removeEventListener(`keydown`, keyAssigning);
      });

      event.target.addEventListener(`keydown`, keyAssigning);
    }
  });

  const advancedSettings = elt('div', {className: `advSettings`},
  settings,
  buttons);
  document.body.append(advancedSettings);

  const gatherConfig = () => {
    [...settings.elements].forEach(option => {
      if(!option.name) return;

      let value = convertValue(option);
      let collection = option.parentNode["data-collection"];
      if(collection) {
        config[collection][option.name] = value;
      } else {
        config[option.name] = value;
      }
    });
  };

  settings.addEventListener('change', () => {
    gatherConfig();
    settings.innerHTML = ``;
    settings.append(renderSettings(config));
  });
};

runApp();
