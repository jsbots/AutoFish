const elt = require("./utils/elt.js");
const wrapInLabel = require("./utils/wrapInLabel.js");

const renderGameNames = ({game}) => {
  const gameNames = [
    "Retail&Classic",
    "MoP",
    "Cataclysm",
    "WoTLK",
    "TBC",
    "Vanilla",
  ];
  return elt(
    "select",
    { name: "game", className: "option game-option" },
    ...gameNames.map((name) =>
      elt("option", { selected: name == game }, name)
    )
  );
};
const renderTimer = ({timer}) => {
  return elt(
    "input",
    { type: "number", min: "0", value: timer, name: "timer", title: ""},
    `(min)`
  );
};
const renderShiftClick = ({game, shiftClick}) => {
  let dom = elt("input", {
    type: "checkbox",
    className: "option",
    checked: shiftClick,
    name: "shiftClick",
  });

  if(game == "Vanilla") {
      dom.checked = true;
      dom.setAttribute('disabled', 'true');
  }

  return dom;
};
const renderLikeHuman = ({likeHuman}) => {
  return elt("input", {
    type: "checkbox",
    className: "option",
    checked: likeHuman,
    name: "likeHuman",
  });
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
  return elt('input', {type: 'text', value: luresKey, disabled: !lures, name: "luresKey"});
}
const renderLuresDelay = ({lures, luresDelayMin}) => {
  return elt('input', {type: 'number', value: luresDelayMin, disabled: !lures, name: "luresDelayMin"});
};
const renderFishingKey = ({fishingKey}) => {
  return elt('input', {type: 'text', value: fishingKey, name: "fishingKey"});
};
const renderTimerQuit = ({timerQuit}) => {
  return elt('input', {type: 'checkbox', checked: timerQuit, name: "timerQuit"});
};
const renderAdvancedSettings = () => {
  return elt('input', {type: 'button', name:"advancedSettings", value: "Advanced settings", className: "advanced_settings_button"});
}


const renderSettings = (config) => {
return elt(
    "section",
    { className: "settings" },
    elt(
      "div",
      { className: "settings_section" },
      wrapInLabel(
        "Game:",
        renderGameNames(config),
        `Choose the version of the game you want the bot to work on.`
      ),
      wrapInLabel(
        "Timer: ",
        renderTimer(config),
        `The bot will work for the given period of minutes. If it's 0, it will never stop.`
      ),
      wrapInLabel(
        "Fishing Key: ",
        renderFishingKey(config),
        `Write in the same key you use for fishing. If you use /castFishing instead, then you should assign a key for fishing.`
      ),
      wrapInLabel(
        "Lures Key: ",
        renderLuresKey(config),
        `Write in the same key you use for using fishing lures.`
      ),
      wrapInLabel(
        "Reuse lure: ",
        renderLuresDelay(config),
        `Fishing lures expiration time in minutes.`
      )
    ),
    elt(
      "div",
      { className: "settings_section" },
      wrapInLabel(
        "Use shift+click: ",
        renderShiftClick(config),
        `Use shift + click instead of Auto Loot. Check this option if you don't want to turn on Auto Loot option in the game. Your "Loot key" in the game should be assign to shift.`
      ),
      wrapInLabel(
        "Like a human: ",
        renderLikeHuman(config),
        `The bot will move your mouse in a human way: random speed and with a slight random deviation in the movement. Otherwise it will move the mouse instantly, which might be a better option if you use a lot of windows.`
      ),
      wrapInLabel(
        "Use lures: ",
        renderLures(config),
        `Check this option if you want to use fishing lures.`
      ),
      wrapInLabel(
        "Quit after timer: ",
        renderTimerQuit(config),
        `The bot will quit the game after timer elapsed.`
      ),
      wrapInLabel(
        "",
        renderAdvancedSettings(config),
        `Advanced settings that allow you to fine-tune the bot. The settings will be saved under the chosen game version.`
      ),
    )
  );
}

module.exports = renderSettings;
