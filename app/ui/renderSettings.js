const elt = require("./utils/elt.js");
const wrapInLabel = require("./utils/wrapInLabel.js");

const renderBobberImg = (bobberColor) => {
  return elt(`img`, {className: `threshold_canvas`, src:`img/bobber_${bobberColor}.png`, width: 80, height: 49});
};

const renderThreshold = ({ threshold, bobberColor }) => {

	if(threshold < 1) threshold = 1;
	else if(threshold > 150) threshold = 150;

  const bobberColorSwitch = elt(`radio`, { className: `bobberColorSwitch`,
                                type: `text`,
                                name: `bobberColor`,
                                title: `Switch between blue and red feathers.`,
                                value: bobberColor,
                                style: `background-image: url("./img/switch_${bobberColor == `red` ? `red` : `blue`}_new.png")`,
                               });

  const range = elt(`input`, { type: `range`, min: 1, max: 150, value: threshold, name: `threshold` });
  if(bobberColor == `blue`) {
    document.styleSheets[0].rules[74].style.backgroundImage = "linear-gradient(to right, rgb(0, 0, 40), rgb(0, 90, 200))"
  } else {
    document.styleSheets[0].rules[74].style.backgroundImage = "linear-gradient(to right, rgb(40, 0, 0), rgb(250, 0, 0))"
  }

  const number = elt(`input`, { type: `number`, value: threshold, name: `threshold` });

	const canvas = renderBobberImg(bobberColor);

  const bobberContainer = elt(`div`, { className: `bobberContainer` }, canvas, number);
  return elt(`div`, { className: `thresholdRange` }, bobberColorSwitch, range, bobberContainer);
};

const renderGameNames = ({game}) => {
  const gamesOfficial = [
    `Dragonflight`,
    `WotLK Classic`,
    `Classic`
  ];

  const gamesPrivate = [
    "Legion",
    "MoP",
    "Cataclysm",
    "WotLK Private",
    "TBC",
    "Vanilla",
  ];

  return elt(
    "select",
    { name: "game", className: "option game-option" },
    elt(`optgroup`, {label: `Official`}, ...gamesOfficial.map((name) =>
          elt("option", { selected: name == game }, name)
        )),
    elt(`optgroup`, {label: `Private`}, ...gamesPrivate.map((name) =>
          elt("option", { selected: name == game }, name)
        )),
  );
};

const renderTimer = ({timer}) => {
  return elt(
    "input",
    { type: "number", min: "0", value: timer, name: "timer", title: ""},
    `(min)`
  );
};


const renderLikeHuman = ({likeHuman}) => {
  return elt("input", {
    type: "checkbox",
    className: "option",
    checked: likeHuman,
    name: "likeHuman",
  });
};

const renderMultipleWindows = ({multipleWindows}) => {
  return elt("input", {
    type: "checkbox",
    className: "option",
    checked: multipleWindows,
    name: "multipleWindows",
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
  let key = elt('input', {type: 'text', value: luresKey, disabled: !lures, name: "luresKey"});
  key.setAttribute(`readonly`, `true`);
  return key;
};

const renderStopKey = ({stopKey}) => {
  let key = elt('input', {type: 'text', value: stopKey, name: "stopKey"});
  key.setAttribute(`readonly`, `true`);
  return key;
};

const renderPoleKey = ({lures, game, intKey, useInt}) => {
  let key = elt('input', {type: 'text', value: intKey, disabled: !useInt, name: "intKey"});
  key.setAttribute(`readonly`, `true`);
  const checkbox = elt(`input`, {type: `checkbox`, checked: useInt, style: `margin-right: 7px`, name: "useInt"});
  const container = elt(`div`, null, checkbox, key)
  return container;
};

const renderLuresDelay = ({lures, luresDelayMin}) => {
  return elt('input', {type: 'number', value: luresDelayMin, disabled: !lures, name: "luresDelayMin"});
};
const renderFishingKey = ({fishingKey}) => {
  let key = elt('input', {type: 'text', value: fishingKey, name: "fishingKey"});
  key.setAttribute(`readonly`, `true`);
  return key;
};

const renderAdvancedSettings = () => {
  return elt('input', {type: 'button', name:"advancedSettings", value: "Advanced Settings", className: "advanced_settings_button"});
};

const renderFishingZone = () => {
  return elt('input', {type: 'button', name:"fishingZone", value: "Set Fishing Zone", className: "advanced_settings_button"});
};


const renderFilterType = ({game, whitelist, filterType, atMouse}) => {

  if(game != `Dragonflight` && game != `Vanilla`) {
    atMouse = true;
  }

  const atMouseContainer = elt(`input`, {name: `atMouse`, type:`checkbox`, checked: atMouse, className: `atMouse`, disabled: !whitelist || (game != `Dragonflight` && game != `Vanilla`)});
  const modeContainer =  elt(`select`, {name: `filterType`, className: `filterType`, disabled: !whitelist},
    elt(`option`, {selected: filterType == `whitelist`}, `whitelist`),
    elt(`option`, {selected: filterType == `blacklist`}, `blacklist`)
  );

  return elt(`div`, null, `Filter Mode: `, modeContainer, `Loot win at mouse:`, atMouseContainer);
}

const renderWhitelist = ({game, whitelist, whitelistWords, whitelistLanguage}) => {
  let languages = [`eng`, `spa`, `spa_old`, `por`, `fra`, `deu`, `ita`, `chi_sim`, `chi_tra`, `kor`, `rus`];

  const langContainer = elt('select', {name: `whitelistLanguage`, className: `whitelistLanguage` , disabled: !whitelist}, ...languages.map( language => elt(`option`, {selected: whitelistLanguage == language}, language)));

  let disabled = !whitelist;
  let checked = whitelist;

  return elt('div', null,
  langContainer,
  elt('input', {type: 'text', name:"whitelistWords", placeholder: `e.g. Glacial Salmon, Pygmy Suckerfish`, className: "whitelist_input", value: whitelistWords, disabled}),
  elt('input', {type: 'checkbox', name: "whitelist", checked}))
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
        "",
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
        `Assign the same key you use for fishing. If you use /castFishing instead, then you should assign a key for fishing.`
      ),
      wrapInLabel(
        "Lures Key: ",
        renderLuresKey(config),
        `Assign the same key you use for using fishing lures.`
      ),
      wrapInLabel(
        "Int. key: ",
        renderPoleKey(config),
        `Exclusively for Dragonflight. Use interaction key instead of mouse for catching.`
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
        "Like a human: ",
        renderLikeHuman(config),
        `The bot will move your mouse in a human way: random speed and with a slight random deviation in the movement. Otherwise it will move the mouse instantly, which might be a better option if you use a lot of windows.`
      ),
      wrapInLabel(
        "Use DirectX 11: ",
        renderMultipleWindows(config),
        `If for some reason something doesn't work, you can use this option and the bot will use a different library to analyze your screen.`
      ),
      wrapInLabel(
        "Use lures: ",
        renderLures(config),
        `Check this option if you want to use fishing lures. If your game requires manual application of lures, use a macros for that and assign that macro to Lures Key option.`
      ),
      wrapInLabel(
        "Stop Key: ",
        renderStopKey(config),
        `Assign a key that you will use to stop the bot.`
      ),

      wrapInLabel(
        "",
        renderFishingZone(config),
        `The application will open the window of your game and show you the Fishing Zone, you can change it as you like. You can reset the fishing zone to default values in Advanced Settings.`
      ),
      wrapInLabel(
        "",
        renderAdvancedSettings(config),
        `Advanced settings that allow you to fine-tune the bot. The settings will be saved under the chosen game version.`
      ),
    ),
    elt("p", {className: 'settings_header'}, "Filter:"),
    elt(
      "div",
      { className: "settings_section" },
      wrapInLabel("",
        renderWhitelist(config),
        `The bot will loot only items in the whitelist. Before using, turn off AutoLoot in the game and set UI Scale to default. The names of the items must be exactly the same as in the game, separated by comma. If it's the first time you using a language from the list, wait until the bot downloads the tesseract data for your language. `
      ),
      wrapInLabel("",
        renderFilterType(config),
        `Filter Mode will decide whether to pick or to ignore items in the list. Loot window at mouse will tell the bot whether it should check the loot window at mouse or the default loot window at the left side of the screen.`
      ),
      wrapInLabel(elt('span', null, "Loot all ", elt('span', {style: `color:#4DDF3F; font-weight: bold`}, `Uncommon `), `and `, elt(`span`, {style: `color: #015CB4; font-weight: bold`}, `Rare `), `and `, elt('span', {style: `color:#950c95; font-weight: bold`}, `Epic `), `items:`), renderWhiteListGreenBlue(config), `If you use whitelist, you can check this option to loot every green, blue and purple items in addition to the items in the whitelist.`)
    ),
    elt("p", {className: 'settings_header'}, "Threshold:"),
    elt(
      "div",
      { className: "settings_section threshold_settings" },
      wrapInLabel("",
        renderThreshold(config),
        `The bot will ignore all red/blue colors below this value. The higher the value the more red/blue colors the bot will ignore. The lower the value the more red/blue colors the bot will find. Min value: 10, max value: 150.  Increase this value if the bot can't pass the preliminary checks for red/blue colors in the fishing zone and there's nothing except the bobber there (e.g. red bottom in Durotar). Decrease this value, if the bobber is very dark and the bot can't find it (e.g. bad lighting, bad weather).`
      ),
    )
  );
}

module.exports = renderSettings;
