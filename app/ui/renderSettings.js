const elt = require("./utils/elt.js");
const wrapInLabel = require("./utils/wrapInLabel.js");
const renderBobber = require('./renderBobber.js');

const once = (fn) => {
  let result;
  return (...args) => {
    if (!result) {
      return (result = fn(...args));
    } else {
      return result;
    }
  };
};

const renderCanvas = (threshold) => {
	let canvas = elt(`canvas`, { className: `threshold_canvas`, width: 80, height: 50 });
	renderBobber(canvas.getContext(`2d`), threshold)
	return canvas
}

const renderCanvasOnce = once(renderCanvas);

const renderThreshold = ({ threshold }) => {

	if(threshold < 10) threshold = 10;
	else if(threshold > 150) threshold = 150;

  const range = elt(`input`, { type: `range`, min: 10, max: 150, value: threshold, name: `threshold` });
  const number = elt(`input`, { type: `number`, value: threshold, name: `threshold` });

	const canvas = renderCanvasOnce(threshold);

  const bobberContainer = elt(`div`, { className: `bobberContainer` }, canvas, number);
  return elt(`div`, { className: `thresholdRange` }, range, bobberContainer);
};

const renderGameNames = ({game}) => {
  const gameNames = [
    "Retail",
    "Classic",
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
  return elt('input', {type: 'button', name:"advancedSettings", value: "Advanced Settings", className: "advanced_settings_button"});
};

const renderWhitelist = ({game, whitelist, whitelistWords, whitelistLanguage}) => {
  let disabled = !whitelist;
  let checked = whitelist;
  let allDisabled;
  if(game == 'Cataclysm' || game == "TBC" || game == "Vanilla") {
    disabled = true;
    allDisabled = true;
    checked = false;
  }
  let languages = [`eng`, `spa`, `por`, `fra`, `deu`, `ita`, `rus`, `chi_sim`];
  return elt('div', null,
  elt('select', {name: `whitelistLanguage`, className: `whitelistLanguage` , disabled: !whitelist}, ...languages.map( language => elt(`option`, {selected: whitelistLanguage == language}, language))),
  elt('input', {type: 'text', name:"whitelistWords", placeholder: `e.g. Glacial Salmon, Pygmy Suckerfish`, className: "whitelist_input", value: whitelistWords, disabled}),
  elt('input', {type: 'checkbox', name: "whitelist", checked, disabled: allDisabled}))
};

const renderWhiteListGreenBlue = ({whitelist, whiteListBlueGreen}) => {
  return elt('input', {type: `checkbox`, checked: whitelist && whiteListBlueGreen, name: `whiteListBlueGreen`, disabled: !whitelist });
};



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
    ),
    elt("p", {className: 'settings_header'}, "Whitelist:"),
    elt(
      "div",
      { className: "settings_section" },
      wrapInLabel("",
        renderWhitelist(config),
        `Works only with English language and only in Retail, Classic, MoP and WoTLK. The bot will loot only items in the whitelist. Before using, turn off AutoLoot in the game and set UI Scale to default. The names of the items must be exactly the same as in the game, separated by comma.`
      ),
      wrapInLabel(elt('span', null, "Loot all ", elt('span', {style: `color:#4DDF3F; font-weight: bold`}, `Uncommon `), `and `, elt(`span`, {style: `color: #015CB4; font-weight: bold`}, `Rare `), `items:`), renderWhiteListGreenBlue(config), `If you use whitelist, you can check this option to loot every green and blue item in addition to the items in the whitelist.`)
    ),
    elt("p", {className: 'settings_header'}, "Threshold:"),
    elt(
      "div",
      { className: "settings_section threshold_settings" },
      wrapInLabel("",
        renderThreshold(config),
        `The bot will ignore all reddish colors below this value. The higher the value the more red colors the bot will ignore. The lower the value the more red colors the bot will find. Min value: 10, max value: 150.  Increase this value if the bot can't pass the preliminary checks for red colors in the fishing zone and there's nothing except the bobber there (e.g. red bottom in Durotar). Decrease this value, if the bobber is very dark and the bot can't find it (e.g. bad lighting, bad weather).`
      ),
    )
  );
}

module.exports = renderSettings;
