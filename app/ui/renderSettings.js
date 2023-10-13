const elt = require("./utils/elt.js");
const wrapInLabel = require("./utils/wrapInLabel.js");

const renderBobberImg = (bobberColor, autoTh) => {
  return elt(`img`, {className: `threshold_canvas ${autoTh ? `bobberColorSwitch_disabled` : ``}`, src:`img/bobber_${bobberColor}.png`, height: 49});
};

const renderThreshold = ({ threshold, bobberColor, autoTh, game }) => {
	if(threshold < 1) threshold = 1;
	else if(threshold > 150) threshold = 150;
  const bobberColorSwitch = elt(`radio`, { className: `bobberColorSwitch ${autoTh ? `bobberColorSwitch_disabled` : ``}`,
                                name: `bobberColor`,
                                title: `Switch between blue and red feathers.`,
                                value: bobberColor,
                                style: `background-image: linear-gradient(to right, ${bobberColor == `red` ? `rgb(100, 0, 0), red` : `rgb(0, 90, 200), rgb(0, 0, 100)`});`
                              }, elt(`div`, {className: `switch_thumb ${bobberColor == `red` ? `switch_thumb_left` : `switch_thumb_right`}`}), elt(`span`, {className: `bobberColorSwitchText`}, `${bobberColor == `red` ? `Red Feather` : `Blue Feather`}`));
if(game == `Vanilla (splash)`) autoTh = false;
const autoThSwitch = elt(`radio`, { className: `autoTh`,
                              name: `autoTh`,
                              title: `Switch between auto and manual modes.`,
                              value: autoTh,
                              disabled: game == `Vanilla (splash)`,
                              style: `background-image: linear-gradient(to right, ${autoTh ? `#663c20, #fe954d` : `#a8a8a8, #4b4b4b`});`
                            }, elt(`div`, {className: `switch_thumb ${autoTh ? `switch_thumb_left` : `switch_thumb_right`}`}), elt(`span`, {className: `bobberColorSwitchText`},  `${autoTh ? `Auto` : `Manual`}`));

  const range = elt(`input`, { type: `range`, min: 1, max: 150, value: threshold, name: `threshold`, disabled: autoTh, className: `${autoTh ? `threshold_disabled` : ``}` });
  if(bobberColor == `blue`) {
    document.styleSheets[0].rules[79].style.backgroundImage = "linear-gradient(to right, rgb(0, 0, 100), rgb(0, 90, 200))"
  } else {
    document.styleSheets[0].rules[79].style.backgroundImage = "linear-gradient(to right, rgb(100, 0, 0), rgb(250, 0, 0))"
  }

  const number = elt(`input`, { type: `number`, className: `threshold_number_input`, value: threshold, disabled: autoTh, name: `threshold` });

  let bobberImg = elt(`div`, {id: `bobber`, style: `background-color: ${bobberColor == `blue` ? `rgb(0, 0, ${150 + Number(threshold)})` : `rgb(${150 + Number(threshold)}, 0, 0)`}`}, elt(`div`, {id: `bobberHandle`, style: `background-color: ${bobberColor == `blue` ? `rgb(0, 0, ${150 + Number(threshold)})` : `rgb(${150 + Number(threshold)}, 0, 0)`}`}));
  let waterImg = elt(`div`, {id: "water"}, bobberImg);

  const bobberContainer = elt(`div`, { className: `bobberContainer` }, waterImg, number, elt(`div`, {id: `grass`}));
  return elt(`div`, { className: `thresholdRange` }, bobberColorSwitch, range, autoThSwitch, bobberContainer);
};

const renderGameNames = ({game}) => {
  const gamesOfficial = [
    `Retail`,
    `LK Classic`,
    `Classic`
  ];

  const gamesPrivate = [
    "Leg",
    "MoP",
    "Cata",
    "LK Private",
    "TBC",
    "Vanilla",
    "Vanilla (splash)"
  ];


  return elt(
    "select",
    { name: "game", className: "option game-option" },
    elt(`optgroup`, {label: `Official-like`}, ...gamesOfficial.map((name) =>
          elt("option", { selected: name == game }, name)
        )),
    elt(`optgroup`, {label: `Private-like`}, ...gamesPrivate.map((name) =>
          elt("option", { selected: name == game }, name)
        ))
  );
};

const renderTimer = ({timer}) => {
  return elt(
    "input",
    { type: "number", min: "0", value: timer, name: "timer", title: ""},
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

const renderStopKey = ({stopKey}) => {
  let key = elt('input', {type: 'text', value: stopKey, name: "stopKey"});
  key.setAttribute(`readonly`, `true`);
  return key;
};

const renderPoleKey = ({ game, intKey, useInt}) => {
  let key = elt('input', {type: 'text', value: intKey, disabled: !useInt || game != `Retail`, name: "intKey"});
  key.setAttribute(`readonly`, `true`);
  const checkbox = elt(`input`, {type: `checkbox`, disabled: game != `Retail`, checked: game != `Retail` ? false : useInt, style: `margin-right: 7px`, name: "useInt"});
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
  return elt('input', {type: 'button', name:"fishingZone", value: "Fishing Zone", className: "advanced_settings_button"});
};


const renderFilterType = ({game, whitelist, filterType, atMouse}) => {

  if(game != `Retail` && game != `Vanilla` && game != `Vanilla (splash)`) {
    atMouse = true;
  }

  const atMouseContainer = elt(`input`, {name: `atMouse`, type:`checkbox`, checked: atMouse, className: `atMouse`, disabled: !whitelist || (game != `Retail` && game != `Vanilla` && game != `Vanilla (splash)`)});
  const modeContainer =  elt(`select`, {name: `filterType`, className: `filterType`, disabled: !whitelist},
    elt(`option`, {selected: filterType == `whitelist`}, `whitelist`),
    elt(`option`, {selected: filterType == `blacklist`}, `blacklist`)
  );

  return elt(`div`, null, `Mode: `, modeContainer, `Loot window at mouse:`, atMouseContainer);
}

const renderWhitelist = ({whitelist, whitelistWords, whitelistLanguage}) => {
  let languages = [`eng`, `spa`, `spa_old`, `por`, `fra`, `deu`, `ita`, `chi_sim`, `chi_tra`, `kor`, `rus`];

  const langContainer = elt('select', {name: `whitelistLanguage`, className: `whitelistLanguage` , disabled: !whitelist}, ...languages.map( language => elt(`option`, {selected: whitelistLanguage == language}, language)));

  let disabled = !whitelist;
  let checked = whitelist;

  return elt('div', null,
  langContainer,
  elt('input', {type: 'text', name:"whitelistWords", placeholder: `Red Salmon, Curcian Carp, Dragon Goby`, className: "whitelist_input", value: whitelistWords, disabled}),
  elt('input', {type: 'checkbox', name: "whitelist", checked}))
};

const renderMultipleWindows = () => {
  return elt(`div`, {className: `premium_lock premium_lock_main`, id: `link`, url: `https://youtu.be/ih-xoQcByz8`})
};

const renderAfkmode = () => {
  return elt(`div`, {className: `premium_lock premium_lock_main`, id: `link`, url: `https://youtu.be/lQi6fSxMyL0`})
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
        "Fishing Key: ",
        renderFishingKey(config),
        `Assign the same key you use for fishing. If you use /castFishing instead, then you should assign a key for fishing.`
      ),
      wrapInLabel(
        "Int. Key: ",
        renderPoleKey(config),
        `Exclusively for Retail. Use interaction key instead of mouse for catching.`
      ),
      wrapInLabel(
        "Stop Key: ",
        renderStopKey(config),
        `Assign a key that you will use to stop the bot.`
      ),
    ),
    elt(
      "div",
      { className: "settings_section" },
      wrapInLabel(
  "Alt-Tab Fishing: ",
  elt(`div`, {className: `premium_option`}, renderAfkmode()),
  `ONLY ON DIRECTX 11. The bot will automatically alt+tab after it casts (bringing back the previous window) and automatically focus the window of the game when it needs to catch. If you use your mouse too much during Alt-Tab Fishing the whitelist feature might be unstable. `
),
wrapInLabel(
  "Multiple Fishing: ",
  elt(`div`, {className: `premium_option`}, renderMultipleWindows()),
  `ONLY ON DIRECTX 11. If you want to use multiple windows check this option. You need to launch every window and configure them properly, make sure every window is in DirectX 11 mode. This option uses a different library to analyze your screen, you can check it even for one window if for some reason the default way doesn't work for you.`
),

      wrapInLabel(
        "",
        renderFishingZone(config)),
      wrapInLabel(
        "",
        renderAdvancedSettings(config)),
    ),
    elt("p", {className: 'settings_header settings_header_main'}, "Filter"),
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
    ),
    elt("p", {className: 'settings_header'}, "Threshold"),
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
